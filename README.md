# 🚀 DSA Search Engine

> A lightweight search tool that **scrapes DSA problem statements** from multiple public sources using **Puppeteer** and **ranks / lists** the best matching problems for a user query using **TF-IDF scoring**. Implemented in **pure JavaScript (Node.js)** — no frontend framework or backend server required.

---

## Why this project

Preparing for interviews is time-consuming — this project helps by aggregating problems from multiple coding platforms and **listing the most relevant problems** for a specific query (for example: `"binary search medium"`). It’s useful for learners, interview prep, and recruiters who want curated sets of practice problems.

---

## Highlights

- ✅ Pure **JavaScript** implementation (Node.js)  
- ✅ Uses **Puppeteer** for headless scraping of multiple public DSA sites  
- ✅ Uses **TF-IDF** to compute relevance scores and **list** best matches for a query (no vector DB or embedding model required)  
- ✅ Runs locally with JSON output — no backend/web server needed  
- ✅ Small, modular scrapers — easy to extend with more sources

---

## Tech stack

- Node.js (JavaScript)
- Puppeteer (web scraping)
- simple TF-IDF ranking implementation (JS)
- JSON files for data storage

---

## How it works (high level)

1. **Scrape** — Puppeteer scripts visit supported sites and extract problem title, statement, tags, difficulty (if available), and a reference URL.  
2. **Save** — Scraped problems are saved to structured JSON files in `/data`.  
3. **Rank** — For a user query, the project computes TF-IDF scores between the query and each problem's text and sorts problems by relevance.  
4. **List** — The top N problems (configurable) are printed or written to a file for the user to review.

> Note: This project *lists* results using TF-IDF ranking. It does not implement neural embeddings or an online search backend.

---

## Installation

1. Ensure Node.js (v14+) is installed.  
2. Clone the repo and install dependencies:

```bash
git clone https://github.com/your-username/dsa-search-engine.git
cd dsa-search-engine
npm install
```
## 📬 Feedback / Contributions

Contributions, issues, and feature requests are welcome!<br>
Feel free to open a pull request or raise an issue.<br>

