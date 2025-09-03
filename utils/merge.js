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

mergeProblemData();
