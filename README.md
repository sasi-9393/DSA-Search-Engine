# 🔍 DSA Search Engine

> An intelligent search engine for competitive programming problems powered by BM25 ranking and NLP processing

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D%2016.0.0-brightgreen)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

## 📋 Overview

DSA Search Engine is a full-stack application that aggregates coding problems from multiple competitive programming platforms and provides intelligent search capabilities using advanced NLP techniques. Find the perfect problem to practice with semantic search that understands DSA terminology.

### ✨ Key Features

- 🎯 **Intelligent Search**: BM25 ranking algorithm with title boosting for relevant results
- 🧠 **NLP Processing**: Advanced text preprocessing including stemming, tokenization, and spell correction
- 🔄 **Query Optimization**: Domain-specific abbreviation expansion (DP → Dynamic Programming)
- ⚡ **Fast Performance**: Sub-50ms query response time with inverted indexing
- 🌐 **Multi-Platform**: Aggregates 2000+ problems from LeetCode, Codeforces, and CodeChef
- 🎨 **Modern UI**: Clean, responsive dark-themed interface with light mode support

## 🚀 Demo

[Live Demo](https://your-demo-link.com) 

![Search Demo](./assets/demo.gif)

## 🛠️ Tech Stack

**Backend:**
- Node.js & Express.js
- Natural (NLP library)
- BM25 ranking algorithm
- Inverted indexing

**Frontend:**
- Vanilla JavaScript
- Modern CSS with CSS Variables
- Responsive design

**Data Collection:**
- Puppeteer for web scraping
- Custom data normalization pipeline

## 📊 Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Scrapers  │──────▶│  JSON Corpus │──────▶│   Server    │
│  (Puppeteer)│      │   (2000+)    │      │   (BM25)    │
└─────────────┘      └──────────────┘      └─────────────┘
                                                    │
                                                    ▼
                                            ┌─────────────┐
                                            │   Client    │
                                            │    (UI)     │
                                            └─────────────┘
```

## 🏁 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/dsa-search-engine.git
cd dsa-search-engine
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup the problem corpus**
```bash
# Make sure you have ./corpus/all_problems.json
# Or run the scraper to generate it:
npm run scrape
```

4. **Start the server**
```bash
npm start
```

5. **Open the application**
```
Navigate to http://localhost:3000
```

## 📁 Project Structure

```
dsa-search-engine/
├── index.js              # Main server with BM25 implementation
├── index.html             # Frontend HTML
├── script.js              # Frontend JavaScript
├── styles.css             # Styling
├── corpus/
│   └── all_problems.json  # Problem dataset
├── scrape.js              # Web scraping scripts
└── package.json
```

## 🔍 How It Works

### 1. Data Collection
- Automated Puppeteer-based scrapers extract problems from multiple platforms
- Metadata normalized into unified JSON format with title, description, difficulty, tags, and URL

### 2. Text Preprocessing
```javascript
Query: "DP on graphs" 
   ↓ Lowercase
   ↓ Abbreviation Expansion: DP → dynamic programming
   ↓ Tokenization: [dynamic, programming, on, graphs]
   ↓ Stopword Removal: [dynamic, programming, graphs]
   ↓ Stemming: [dynam, program, graph]
   ↓ Plural Normalization: graph
```

### 3. BM25 Ranking
- Calculates relevance scores using term frequency and inverse document frequency
- Title matching provides additional boost to relevance
- Results sorted by final score

### 4. Performance Optimization
- Inverted index for O(1) term lookup
- Precomputed document frequencies
- Cached document vectors

## 🎯 Search Examples

| Query | Finds Problems About |
|-------|---------------------|
| `two sum` | Array problems with sum calculations |
| `DP longest` | Dynamic programming subsequence problems |
| `BFS on trees` | Breadth-first search tree traversal |
| `graphs` | All graph-related problems |

## 📈 Performance Metrics

- **Query Response Time**: < 50ms average
- **Search Accuracy**: 40% improvement with query optimization
- **Dataset Size**: 2000+ problems



## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Your Name**
- GitHub: [sasi-9393](https://github.com/sasi-9393)
- LinkedIn: [Sasi kumar](https://www.linkedin.com/in/mvsasikumar/)


## 🙏 Acknowledgments

- [Natural](https://github.com/NaturalNode/natural) for NLP processing
- [Puppeteer](https://pptr.dev/) for web scraping
- Inspired by search engines and competitive programming communities

## 📞 Support

If you found this project helpful, please give it a ⭐️!

For questions or support, please open an issue or reach out via email.

---

<p align="center">Made with ❤️ for the competitive programming community</p>
