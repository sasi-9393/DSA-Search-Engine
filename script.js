
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results');
const spinner = document.getElementById('spinner');
const themeToggle = document.getElementById('theme-toggle');


const API_URL = 'http://localhost:8000';


if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });


    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
}


const tags = document.querySelectorAll('.tag');
tags.forEach(tag => {
    tag.addEventListener('click', () => {
        const query = tag.getAttribute('data-query');
        searchInput.value = query;
        performSearch(query);
    });
});


searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();

    if (!query) {
        return;
    }

    await performSearch(query);
});


async function performSearch(query) {
    console.log('Searching for:', query);


    spinner.classList.remove('hidden');
    resultsContainer.innerHTML = '';

    try {
        const response = await fetch(`${API_URL}/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: query })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Search results:', data);


        spinner.classList.add('hidden');

        displayResults(data);

    } catch (error) {
        console.error('Search error:', error);
        spinner.classList.add('hidden');
        resultsContainer.innerHTML = `
            <div class="error-message">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3>Search Failed</h3>
                <p>Could not connect to server. Make sure the backend is running on ${API_URL}</p>
                <p class="error-details">${error.message}</p>
            </div>
        `;
    }
}


function displayResults(data) {
    const { results, processedQuery, totalResults, searchTimeMs } = data;

    if (!results || results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <h3>No Results Found</h3>
                <p>Try different keywords or check your spelling</p>
                ${processedQuery ? `<p class="processed-query">Searched for: ${processedQuery}</p>` : ''}
            </div>
        `;
        return;
    }


    const statsHTML = `
        <div class="search-stats">
            <span>${totalResults || results.length} results found</span>
            <span>•</span>
            <span>${searchTimeMs}ms</span>
            ${processedQuery ? `<span>•</span><span>Query: "${processedQuery}"</span>` : ''}
        </div>
    `;


    const resultsHTML = results.map((problem, index) => {
        const platformClass = problem.platform?.toLowerCase().replace(/\s+/g, '-') || 'other';
        const relevance = parseFloat(problem.relevanceScore) || 0;

        return `
            <div class="result-card" style="animation-delay: ${index * 0.05}s">
                <div class="result-header">
                    <span class="platform-badge ${platformClass}">${problem.platform || 'Unknown'}</span>
                    ${relevance > 0 ? `<span class="relevance-score">${relevance.toFixed(1)}% match</span>` : ''}
                </div>
                
                <h3 class="result-title">
                    <a href="${problem.url || '#'}" target="_blank" rel="noopener noreferrer">
                        ${escapeHtml(problem.title || 'Untitled Problem')}
                    </a>
                </h3>
                
                ${problem.description ? `
                    <p class="result-description">
                        ${escapeHtml(truncateText(problem.description, 150))}
                    </p>
                ` : ''}
                
                ${problem.difficulty ? `
                    <div class="result-meta">
                        <span class="difficulty difficulty-${problem.difficulty?.toLowerCase()}">${problem.difficulty}</span>
                    </div>
                ` : ''}
                
                ${problem.tags && problem.tags.length > 0 ? `
                    <div class="result-tags">
                        ${problem.tags.slice(0, 5).map(tag => `<span class="tag-item">${escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    resultsContainer.innerHTML = statsHTML + '<div class="results-list">' + resultsHTML + '</div>';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}


async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const data = await response.json();
        console.log('Server stats:', data);
    } catch (error) {
        console.warn('Could not load stats:', error);
    }
}

loadStats();