import cors from "cors";
import express from "express";
import fs from "fs/promises";
import natural from "natural";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("."));
app.use(cors());


const tokenizer = new natural.WordTokenizer();
const spellcheck = new natural.Spellcheck(natural.WORDS);
const stemmer = natural.PorterStemmer;


const STOPWORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'can', 'you', 'how', 'what', 'where'
]);


const DSA_SYNONYMS = {
    'dp': ['dynamic', 'programming', 'memoization', 'tabulation'],
    'bfs': ['breadth', 'first', 'search', 'level', 'order'],
    'dfs': ['depth', 'first', 'search', 'preorder', 'postorder'],
    'bst': ['binary', 'search', 'tree'],
    'll': ['linked', 'list'],
    'lca': ['lowest', 'common', 'ancestor'],
    'gcd': ['greatest', 'common', 'divisor'],
    'lcm': ['least', 'common', 'multiple'],
    'mst': ['minimum', 'spanning', 'tree'],
    'dag': ['directed', 'acyclic', 'graph']
};


let problems = [];
let processedDocs = [];
let docFrequency = new Map();
let avgDocLength = 0;
const k1 = 1.5;
const b = 0.75;

function preprocessText(text) {
    if (!text) return [];

    text = text.toLowerCase();


    text = text.replace(/([a-z])([A-Z])/g, '$1 $2');


    text = text.replace(/(\d)([a-z])/gi, '$1 $2');
    text = text.replace(/([a-z])(\d)/gi, '$1 $2');


    text = text.replace(/[^a-z0-9\s]/g, ' ');


    let tokens = tokenizer.tokenize(text) || [];


    tokens = tokens.map(token => {

        if (DSA_SYNONYMS[token]) {
            return DSA_SYNONYMS[token];
        }
        return token;
    }).flat();


    tokens = tokens.filter(token => !STOPWORDS.has(token) && token.length > 1);


    tokens = tokens.map(token => {
        if (token.length > 3 && !/^\d+$/.test(token)) {
            const corrections = spellcheck.getCorrections(token, 1);
            return corrections.length > 0 ? corrections[0] : token;
        }
        return token;
    });


    tokens = tokens.map(token => stemmer.stem(token));

    tokens = tokens.map(token => {
        if (token.endsWith('s') && token.length > 3) {

            return token.slice(0, -1);
        }
        return token;
    });

    return tokens;
}


function calculateIDF(term, totalDocs) {
    const df = docFrequency.get(term) || 0;
    return Math.log((totalDocs - df + 0.5) / (df + 0.5) + 1);
}


function calculateBM25(queryTerms, docIndex) {
    const doc = processedDocs[docIndex];
    const docLength = doc.tokens.length;

    let score = 0;
    const termFreq = new Map();


    doc.tokens.forEach(term => {
        termFreq.set(term, (termFreq.get(term) || 0) + 1);
    });


    queryTerms.forEach(term => {
        const tf = termFreq.get(term) || 0;
        if (tf === 0) return;

        const idf = calculateIDF(term, problems.length);
        const numerator = tf * (k1 + 1);
        const denominator = tf + k1 * (1 - b + b * (docLength / avgDocLength));

        score += idf * (numerator / denominator);
    });

    return score;
}


function calculateTitleBoost(queryTerms, problem) {
    const titleTokens = preprocessText(problem.title);
    let matches = 0;

    queryTerms.forEach(qTerm => {
        if (titleTokens.includes(qTerm)) {
            matches++;
        }
    });

    return matches > 0 ? 1 + (matches / queryTerms.length) : 1;
}


async function loadAndProcessProblems() {
    try {
        const data = await fs.readFile("./corpus/all_problems.json", "utf-8");
        problems = JSON.parse(data);
        console.log(` Loaded ${problems.length} problems`);


        processedDocs = [];
        let totalLength = 0;

        problems.forEach((problem, idx) => {
            const text = `${problem.title} ${problem.description || ''}`;
            const tokens = preprocessText(text);

            processedDocs.push({
                tokens: tokens,
                title: problem.title
            });

            totalLength += tokens.length;


            const uniqueTerms = new Set(tokens);
            uniqueTerms.forEach(term => {
                docFrequency.set(term, (docFrequency.get(term) || 0) + 1);
            });
        });


        avgDocLength = totalLength / problems.length;

        console.log(` Processed documents`);
        console.log(`   Average doc length: ${avgDocLength.toFixed(2)} tokens`);
        console.log(`   Unique terms: ${docFrequency.size}`);


        if (problems.length > 0) {
            console.log(`\n Sample preprocessing:`);
            console.log(`   Original: "${problems[0].title}"`);
            console.log(`   Tokens: [${processedDocs[0].tokens.slice(0, 10).join(', ')}...]`);
        }

    } catch (err) {
        console.error(" Error loading problems:", err);
        throw err;
    }
}

app.post("/search", async (req, res) => {
    try {
        const rawQuery = req.body.query;
        console.log(`\n Query: "${rawQuery}"`);

        if (!rawQuery || typeof rawQuery !== "string") {
            return res.status(400).json({ error: "Invalid query" });
        }

        const startTime = Date.now();


        const queryTerms = preprocessText(rawQuery);
        console.log(` Processed: [${queryTerms.join(', ')}]`);

        if (queryTerms.length === 0) {
            return res.json({ results: [] });
        }


        const scores = problems.map((problem, idx) => {
            const bm25Score = calculateBM25(queryTerms, idx);
            const titleBoost = calculateTitleBoost(queryTerms, problem);
            const finalScore = bm25Score * titleBoost;

            return { idx, score: finalScore, bm25Score, titleBoost };
        });


        scores.sort((a, b) => b.score - a.score);

        const top = scores
            .filter(s => s.score > 0)
            .slice(0, 10)
            .map(({ idx, score, bm25Score, titleBoost }) => {
                const p = problems[idx];
                const platform = p.url?.includes("leetcode.com")
                    ? "Leetcode"
                    : p.url?.includes("codeforces.com")
                        ? "Codeforces"
                        : p.url?.includes("interviewbit.com")
                            ? "InterviewBit"
                            : "Other";

                return {
                    ...p,
                    platform,
                    relevanceScore: score.toFixed(2),
                    bm25Score: bm25Score.toFixed(2),
                    titleBoost: titleBoost.toFixed(2)
                };
            });

        const searchTime = Date.now() - startTime;


        console.log(`\n Top 3 results (${searchTime}ms):`);
        top.slice(0, 3).forEach((r, i) => {
            console.log(`   ${i + 1}. [${r.relevanceScore}] ${r.title}`);
        });

        res.json({
            results: top,
            query: rawQuery,
            processedQuery: queryTerms.join(' '),
            totalResults: scores.filter(s => s.score > 0).length,
            searchTimeMs: searchTime
        });

    } catch (err) {
        console.error(" Search error:", err);
        res.status(500).json({ error: err.message });
    }
});


app.post("/test-preprocess", (req, res) => {
    const { text } = req.body;
    const tokens = preprocessText(text);

    res.json({
        original: text,
        tokens: tokens,
        tokenCount: tokens.length
    });
});


app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        problemsLoaded: problems.length,
        avgDocLength: avgDocLength.toFixed(2),
        uniqueTerms: docFrequency.size
    });
});


app.get("/stats", (req, res) => {
    const platforms = {};
    problems.forEach(p => {
        const platform = p.url?.includes("leetcode.com")
            ? "Leetcode"
            : p.url?.includes("codeforces.com")
                ? "Codeforces"
                : "Other";
        platforms[platform] = (platforms[platform] || 0) + 1;
    });

    res.json({
        totalProblems: problems.length,
        platforms: platforms,
        avgDocLength: avgDocLength.toFixed(2),
        uniqueTerms: docFrequency.size,
        bm25Params: { k1, b }
    });
});


async function startServer() {
    try {
        console.log(" Starting BM25 Search Engine...\n");

        await loadAndProcessProblems();

        app.listen(port, () => {
            console.log(`\n Server running on http://localhost:${port}`);
        });

    } catch (err) {
        console.error(" Failed to start server:", err);
        process.exit(1);
    }
}

startServer();