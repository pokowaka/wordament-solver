/**
 * Web Application Logic for Wordament Solver.
 */

// Default scores
const ENGLISH_SCORE = {
    'A': 2, 'B': 5, 'C': 3, 'D': 3, 'E': 1, 'G': 4, 'F': 5, 'H': 4, 'I': 2, 'J': 7,
    'K': 6, 'L': 3, 'M': 4, 'N': 2, 'O': 2, 'P': 4, 'Q': 10, 'R': 2, 'S': 2, 'T': 2,
    'U': 4, 'X': 9, 'V': 5, 'W': 6, 'Y': 5, 'Z': 8
};

const DUTCH_SCORE = {
    'E': 1, 'N': 1, 'A': 1, 'O': 1, 'I': 1, 'D': 2, 'R': 2, 'S': 2, 'T': 2,
    'G': 3, 'K': 3, 'L': 3, 'M': 3, 'B': 3, 'P': 3, 'U': 4, 'F': 4, 'H': 4, 'J': 4, 'V': 4, 'Z': 4,
    'C': 5, 'W': 5, 'X': 8, 'Y': 8, 'Q': 10
};

let solver = null;
let currentLanguage = 'english';
let dictionaries = {
    english: { path: 'config/english.txt', points: ENGLISH_SCORE, loaded: false, text: '' },
    dutch: { path: 'config/dutch.txt', points: DUTCH_SCORE, loaded: false, text: '' }
};

let lastSolvedWords = [];

// DOM Elements
const statusDiv = document.getElementById('status');
const statusText = statusDiv.querySelector('.status-text');
const boardGrid = document.getElementById('board-grid');
const solveBtn = document.getElementById('solve-btn');
const clearBtn = document.getElementById('clear-btn');
const langSelect = document.getElementById('lang-select');
const sortByScoreCheck = document.getElementById('sort-by-score');
const resultsList = document.getElementById('results-list');
const wordCountBadge = document.getElementById('word-count');
const filterInput = document.getElementById('filter-input');

// Initialize 4x4 Grid
function initGrid() {
    boardGrid.innerHTML = '';
    for (let i = 0; i < 16; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'grid-cell';
        input.dataset.index = i;
        input.maxLength = 10;
        input.autocomplete = 'off';
        input.spellcheck = false;
        boardGrid.appendChild(input);
    }
}

// Check if all cells are filled to enable Solve button
function validateBoard() {
    const inputs = boardGrid.querySelectorAll('.grid-cell');
    let allFilled = true;
    inputs.forEach(input => {
        if (input.value.trim() === '') {
            allFilled = false;
        }
    });

    solveBtn.disabled = !allFilled || !dictionaries[currentLanguage].loaded;
}

// Get the board string formatted for the solver
function getBoardString() {
    const inputs = boardGrid.querySelectorAll('.grid-cell');
    let rows = [];
    let currentRow = '';
    inputs.forEach((input, idx) => {
        currentRow += input.value.trim();
        if ((idx + 1) % 4 === 0) {
            rows.push(currentRow);
            currentRow = '';
        }
    });
    return rows.join(' ');
}

// Load Dictionary
async function loadDictionary(lang) {
    const dict = dictionaries[lang];
    if (dict.loaded) {
        statusDiv.className = 'status-indicator ready';
        statusText.textContent = `${lang.charAt(0).toUpperCase() + lang.slice(1)} dictionary loaded`;
        validateBoard();
        return;
    }

    statusDiv.className = 'status-indicator loading';
    statusText.textContent = `Loading ${lang} dictionary...`;
    solveBtn.disabled = true;

    try {
        const response = await fetch(dict.path);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        dict.text = await response.text();
        dict.loaded = true;
        
        statusDiv.className = 'status-indicator ready';
        statusText.textContent = `${lang.charAt(0).toUpperCase() + lang.slice(1)} dictionary ready`;
        
        // Re-initialize solver for current language
        solver = new WordamentSolver(dict.points);
        solver.loadDictionary(dict.text);
        
        validateBoard();
    } catch (error) {
        console.error('Failed to load dictionary:', error);
        statusDiv.className = 'status-indicator error';
        statusText.textContent = `Failed to load ${lang} dictionary`;
    }
}

// Render word list
function renderWords(words) {
    resultsList.innerHTML = '';
    
    if (words.length === 0) {
        resultsList.innerHTML = '<div class="no-words-msg">No words found.</div>';
        wordCountBadge.textContent = '0 words';
        filterInput.disabled = true;
        return;
    }

    wordCountBadge.textContent = `${words.length} words`;
    filterInput.disabled = false;

    if (sortByScoreCheck.checked) {
        // Group words by score
        const groups = {};
        words.forEach(word => {
            const score = solver.score(word);
            if (!groups[score]) {
                groups[score] = [];
            }
            groups[score].push(word);
        });

        // Sort scores descending
        const sortedScores = Object.keys(groups).map(Number).sort((a, b) => b - a);

        sortedScores.forEach(score => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'score-group';

            const header = document.createElement('div');
            header.className = 'score-group-header';
            header.textContent = `${score} Point${score !== 1 ? 's' : ''}`;
            groupDiv.appendChild(header);

            const gridDiv = document.createElement('div');
            gridDiv.className = 'words-grid';

            // Sort words in the group alphabetically
            groups[score].sort().forEach(word => {
                const item = document.createElement('div');
                item.className = 'word-item';
                item.textContent = word;
                item.title = `Word: ${word} | Score: ${score}`;
                gridDiv.appendChild(item);
            });

            groupDiv.appendChild(gridDiv);
            resultsList.appendChild(groupDiv);
        });
    } else {
        // Render simple flat grid sorted alphabetically
        const gridDiv = document.createElement('div');
        gridDiv.className = 'words-grid';
        
        words.sort().forEach(word => {
            const score = solver.score(word);
            const item = document.createElement('div');
            item.className = 'word-item';
            item.textContent = word;
            item.title = `Word: ${word} | Score: ${score}`;
            gridDiv.appendChild(item);
        });

        resultsList.appendChild(gridDiv);
    }
}

// Event Listeners setup
function setupEvents() {
    // Focus navigation inside grid
    boardGrid.addEventListener('input', (e) => {
        const input = e.target;
        if (!input.classList.contains('grid-cell')) return;

        const val = input.value;
        const index = parseInt(input.dataset.index);

        let shouldAdvance = false;
        if (val.length === 1 && val !== '(') {
            shouldAdvance = true;
        } else if (val.startsWith('(') && val.endsWith(')')) {
            shouldAdvance = true;
        }

        if (shouldAdvance && index < 15) {
            const nextInput = boardGrid.querySelector(`[data-index="${index + 1}"]`);
            if (nextInput) {
                nextInput.focus();
                nextInput.select();
            }
        }
        
        validateBoard();
    });

    boardGrid.addEventListener('keydown', (e) => {
        const input = e.target;
        if (!input.classList.contains('grid-cell')) return;

        const index = parseInt(input.dataset.index);
        const row = Math.floor(index / 4);
        const col = index % 4;

        let targetIndex = null;

        if (e.key === 'Backspace' && input.value === '') {
            if (index > 0) {
                targetIndex = index - 1;
            }
        } else if (e.key === 'ArrowRight') {
            if (col < 3) targetIndex = index + 1;
        } else if (e.key === 'ArrowLeft') {
            if (col > 0) targetIndex = index - 1;
        } else if (e.key === 'ArrowDown') {
            if (row < 3) targetIndex = index + 4;
        } else if (e.key === 'ArrowUp') {
            if (row > 0) targetIndex = index - 4;
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (!solveBtn.disabled) {
                solveBtn.click();
            }
        }

        if (targetIndex !== null) {
            e.preventDefault();
            const targetInput = boardGrid.querySelector(`[data-index="${targetIndex}"]`);
            if (targetInput) {
                targetInput.focus();
                targetInput.select();
            }
        }
    });

    // Solve Board
    solveBtn.addEventListener('click', () => {
        if (!solver) return;
        
        const boardStr = getBoardString();
        
        // Show loading in results during search
        resultsList.innerHTML = '<div class="results-placeholder"><p>Solving board...</p></div>';
        
        // Use setTimeout to allow UI to render the placeholder
        setTimeout(() => {
            const t0 = performance.now();
            lastSolvedWords = solver.solve(boardStr);
            const t1 = performance.now();
            
            console.log(`Solved in ${(t1 - t0).toFixed(2)}ms`);
            renderWords(lastSolvedWords);
        }, 50);
    });

    // Clear Grid
    clearBtn.addEventListener('click', () => {
        const inputs = boardGrid.querySelectorAll('.grid-cell');
        inputs.forEach(input => {
            input.value = '';
        });
        resultsList.innerHTML = `
            <div class="results-placeholder">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>Fill in the board and click Solve to see results.</p>
            </div>
        `;
        wordCountBadge.textContent = '0 words';
        filterInput.value = '';
        filterInput.disabled = true;
        lastSolvedWords = [];
        validateBoard();
        
        // Focus first cell
        const firstInput = boardGrid.querySelector('[data-index="0"]');
        if (firstInput) firstInput.focus();
    });

    // Language selection
    langSelect.addEventListener('change', (e) => {
        currentLanguage = e.target.value;
        loadDictionary(currentLanguage);
    });

    // Sorting toggle
    sortByScoreCheck.addEventListener('change', () => {
        if (lastSolvedWords.length > 0) {
            renderWords(lastSolvedWords);
        }
    });

    // Live word filtering
    filterInput.addEventListener('input', (e) => {
        const filterText = e.target.value.toLowerCase().trim();
        if (filterText === '') {
            renderWords(lastSolvedWords);
        } else {
            const filteredWords = lastSolvedWords.filter(w => w.includes(filterText));
            renderWords(filteredWords);
        }
    });
}

// Bootstrapping
document.addEventListener('DOMContentLoaded', () => {
    initGrid();
    setupEvents();
    loadDictionary(currentLanguage);
    
    // Auto-focus first input
    setTimeout(() => {
        const firstInput = boardGrid.querySelector('[data-index="0"]');
        if (firstInput) firstInput.focus();
    }, 100);
});
