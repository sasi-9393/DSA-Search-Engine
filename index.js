//server is created and expose the api /search
import cors from "cors";
import express from "express";
import fs from "fs/promises"; // used for reading and writing files
import pkg from "natural";
import preprocess from "./utils/preprocess.js";
const { TfIdf } = pkg;


const app = express();
// now to use the data stored on env files (process.env.varname)
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static("."));
app.use(cors());
// tf-idf code from docs
let docVectors = [];
let docMagnitudes = [];
let problems = [];
let tfidf = new TfIdf();
async function loadProblemsAndBuild() {
    try {
        const data = await fs.readFile("./corpus/all_problems.json", "utf-8");
        problems = JSON.parse(data);

        tfidf = new TfIdf();
        problems.forEach((problem, index) => {
            const text = preprocess(`${problem.title} ${problem.description || ""}`);
            tfidf.addDocument(text, index.toString());
        });

        docVectors = [];
        docMagnitudes = [];

        problems.forEach((_, idx) => {
            const vector = {};
            let sumSquares = 0;
            tfidf.listTerms(idx).forEach(({ term, tfidf: weight }) => {
                vector[term] = weight;
                sumSquares += weight * weight;
            });
            docVectors[idx] = vector;
            docMagnitudes[idx] = Math.sqrt(sumSquares);
        });
    } catch (err) {
        console.error("Error loading problems:", err);
    }
}

//expose api
app.post("/search", async (req, res) => {
    const rawQuery = req.body.query;
    console.log("Received query:", req.body);
    if (!rawQuery || typeof rawQuery !== "string") {
        return res.status(400).json({ error: "Invalid query" });
    }

    const processedQuery = preprocess(rawQuery);
    const tokens = processedQuery.split(" ").filter(Boolean);

    const termFreq = {};
    tokens.forEach((t) => {
        termFreq[t] = (termFreq[t] || 0) + 1;
    });

    const queryVector = {};
    let sumSq = 0;
    const N = tokens.length;
    Object.entries(termFreq).forEach(([term, count]) => {
        const tf = count / N;
        const idf = tfidf.idf(term);
        const w = tf * idf;
        queryVector[term] = w;
        sumSq += w * w;
    });
    const queryMag = Math.sqrt(sumSq) || 1;

    const scores = problems.map((_, idx) => {
        const docVec = docVectors[idx];
        const docMag = docMagnitudes[idx] || 1;
        let dot = 0;
        for (const [term, wq] of Object.entries(queryVector)) {
            if (docVec[term]) {
                dot += wq * docVec[term];
            }
        }
        const cosine = dot / (queryMag * docMag);
        return { idx, score: cosine };
    });

    const top = scores
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(({ idx }) => {
            const p = problems[idx];
            const platform = p.url.includes("leetcode.com") ? "Leetcode" : "Codeforces";
            return { ...p, platform };
        });
    console.log("Top results:", top);

    res.json({ results: top });
});

loadProblemsAndBuild().then(() => {
    app.listen(port, () => { console.log("server is listening on ", port) });
});

