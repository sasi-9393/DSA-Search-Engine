import fsPromises from "fs/promises";
import puppeteer from "puppeteer";

async function scrapeLeetcode() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--disable-blink-features=AutomationControlled"],
    });

    const problemSetPage = await browser.newPage();
    await problemSetPage.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/114.0.0.0 Safari/537.36"
    );

    await problemSetPage.goto("https://leetcode.com/problemset/", {
        waitUntil: "domcontentloaded"
    });

    const problemUnq = "a.group.flex.flex-col.rounded-\\[8px\\].duration-300";
    let problems = [];
    let count = 0;
    const target = 1000;

    while (problems.length < target) {
        // Scroll to last problem of the page so that lazy loading happens and new problems will be loaded
        // so going to last problem of page then lazy loading happens 
        await problemSetPage.evaluate((sel) => {
            const currentProblems = document.querySelectorAll(sel);
            if (currentProblems.length) {
                currentProblems[currentProblems.length - 1].scrollIntoView({
                    behavior: "auto",
                    block: "end"
                });
            }
        }, problemUnq);

        // Wait until more problems are loaded
        // once lazyloading happens and new problems were displayed then in dom the no of problems increases so if it is greater than prevcount means before lazyloading then new problems are loaded . once it returns true then further code execution happens

        await problemSetPage.waitForFunction((sel, prevCount) => {
            return document.querySelectorAll(sel).length > prevCount
        }, {}, problemUnq, count)

        // problems are loaded so set the problem array with new loaded page problems means problem array is set with all problems of page means prev and after lazyloading

        problems = await problemSetPage.evaluate((sel) => {
            const temp = Array.from(document.querySelectorAll(sel));

            return temp.map((ele) => {
                return {
                    title: ele.querySelector(".ellipsis.line-clamp-1").textContent.trim().split(". ")[1],
                    url: ele.href
                }
            })
        }, problemUnq)

        // extract out the details of problem like title and url of the probelem by using evaluate and returned to nodejs environment using return statement in evaluate

        count = problems.length;
    }

    // now we have the description and url for the problem now we want the description of the problem so scrape the description of problem as well using the problem url
    let leetcodeProblemsWithDescription = []
    for (let i = 0; i < target; ++i) {
        const { title, url } = problems[i];
        const page = await browser.newPage();

        try {
            await page.goto(url, { waitUntil: "domcontentloaded" });

            const descriptionContainerSelector = `div.elfjs[data-track-load="description_content"]`;

            const description = await page.evaluate((sel) => {
                const descriptionContainer = document.querySelector(sel);
                if (!descriptionContainer) return "";

                const paragraphs = Array.from(descriptionContainer.querySelectorAll("p"));
                const descriptionCollected = [];

                for (let p of paragraphs) {
                    if (p.innerText.trim() === "&nbsp;") break;
                    descriptionCollected.push(p.innerText.trim());
                }

                return descriptionCollected.join(" "); // returns to description
            }, descriptionContainerSelector);

            //  push in Node.js
            leetcodeProblemsWithDescription.push({ title, url, description });
        }
        catch (error) {
            console.log("error while fetching the description", error);
        }
        finally {
            await page.close();
        }
    }

    //store this data in a file

    await fsPromises.mkdir("./problems", { recursive: true });
    // recursive true means if exists already a directory with specified name at location dont throw error and continue
    await fsPromises.writeFile("./problems/leetcode_problems.json", JSON.stringify(leetcodeProblemsWithDescription, null, 2));
    await browser.close();


}

//scrapeLeetcode();


async function scrapeCodeforces() {
    let problemLinks = [];
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--disable-blink-features=AutomationControlled"],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/114.0.0.0 Safari/537.36"
    );
    const selector = `table.problems tr td:nth-of-type(2) a`;

    for (let i = 1; i <= 3; ++i) {
        await page.goto(`https://codeforces.com/problemset/page/${i}`, {
            waitUntil: "domcontentloaded"
        });
        console.log(`Navigating to page ${i}`);
        const anchors = await page.evaluate((sel) => {
            const anchorElements = Array.from(document.querySelectorAll(sel));
            return anchorElements.map((ele) => {
                return ele.href;
            })
        }, selector)
        console.log(`Page ${i}: Collected ${anchors.length} links`);
        problemLinks.push(...anchors);
    }
    // collected the links of problems and stored in anchors array

    // now go through each link and extract the details 
    let codeforcesProblemsWithDescription = [];

    for (let link of problemLinks) {
        const problemPage = await browser.newPage();
        try {
            await problemPage.goto(link, {
                waitUntil: "domcontentloaded"
            });
            await problemPage.waitForSelector(".problem-statement", { timeout: 10000 });

            const { title, description } = await problemPage.evaluate(() => {
                const title = document.querySelector(".problem-statement .title").textContent.split(". ")[1];
                const description = document.querySelector(".problem-statement > div:nth-of-type(2)").textContent;
                return { title, description };
            });
            codeforcesProblemsWithDescription.push({
                title: title ? title : "Unknown title",
                url: link,
                description: description ? description : "No description"
            });


        }
        catch (err) {
            console.log("error while fetching the description", err);
        }
        finally {
            await problemPage.close();
        }
    }
    //store this data in a file

    await fsPromises.mkdir("./problems", { recursive: true });
    // recursive true means if exists already a directory with specified name at location dont throw error and continue
    await fsPromises.writeFile("./problems/codeforces_problems.json", JSON.stringify(codeforcesProblemsWithDescription, null, 2));
    await browser.close();
}

//scrapeCodeforces();
