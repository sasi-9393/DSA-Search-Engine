import fsPromises from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function mergeProblemData() {
    const codeforcesPath = path.resolve(__dirname, "../problems/codeforces_problems.json");
    const leetcodePath = path.resolve(__dirname, "../problems/leetcode_problems.json");
    //parse the data of two files
    const codeforcesData = JSON.parse(await fsPromises.readFile(codeforcesPath, "utf-8"));
    const leetcodeData = JSON.parse(await fsPromises.readFile(leetcodePath, "utf-8"));

    const combinedData = [...codeforcesData, ...leetcodeData];

    const corpusDir = path.resolve(__dirname, "../corpus");
    await fsPromises.mkdir(corpusDir, { recursive: true });

    const corpusFile = path.join(corpusDir, "all_problems.json");
    await fsPromises.writeFile(corpusFile, JSON.stringify(combinedData, null, 2));
}

//mergeProblemData();
async function mergeCSESintoCorpus() {
    const problemsDir = path.resolve(__dirname, "../problems");
    const corpusDir = path.resolve(__dirname, "../corpus");

    const csesPath = path.join(problemsDir, "cses_problems.json");
    const corpusFile = path.join(corpusDir, "all_problems.json");


    let existingData = [];
    try {
        const data = await fsPromises.readFile(corpusFile, "utf-8");
        existingData = JSON.parse(data);
    } catch {
        console.warn("⚠️ No existing corpus found. Starting fresh.");
    }

    const csesData = JSON.parse(await fsPromises.readFile(csesPath, "utf-8"));


    const allData = [...existingData, ...csesData];


    const uniqueData = Array.from(
        new Map(allData.map(p => [p.id || p.title, p])).values()
    );


    await fsPromises.mkdir(corpusDir, { recursive: true });
    await fsPromises.writeFile(corpusFile, JSON.stringify(uniqueData, null, 2));


}
mergeCSESintoCorpus();