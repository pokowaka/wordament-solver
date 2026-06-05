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

const FREQUENCIES = {
    english: [
        'a','a','a','a','a','a','a','a','a','b','b','c','c','d','d','d','d',
        'e','e','e','e','e','e','e','e','e','e','e','e','f','f','g','g','g',
        'h','h','h','h','h','h','i','i','i','i','i','i','i','i','i','j','k',
        'l','l','l','l','m','m','n','n','n','n','n','n','o','o','o','o','o',
        'o','o','o','p','p','q','r','r','r','r','r','r','s','s','s','s','t',
        't','t','t','t','t','t','t','t','u','u','u','u','v','v','w','w','x',
        'y','y','z'
    ],
    dutch: [
        'e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','n','n',
        'n','n','n','n','n','n','n','a','a','a','a','a','a','a','o','o','o',
        'o','o','o','i','i','i','i','i','i','d','d','d','d','d','r','r','r',
        'r','r','s','s','s','s','s','t','t','t','t','t','g','g','g','g','k',
        'k','k','l','l','l','l','m','m','m','b','b','b','p','p','u','u','u',
        'f','f','h','h','j','j','v','v','z','z','c','w','w','x','y','q'
    ]
};

const SPECIAL_TILES = {
    english: {
        prefix: ['re-', 'de-', 'in-', 'un-', 'con-', 'pro-', 'ex-', 'e-', 'a-', 'co-'],
        suffix: ['-ed', '-ing', '-er', '-es', '-ly', '-tion', '-est', '-y', '-al', '-ment'],
        double: ['ss', 'ee', 'oo', 'll', 'tt', 'ff', 'pp', 'nn', 'cc', 'rr']
    },
    dutch: {
        prefix: ['ge-', 'ver-', 'be-', 'ont-', 'her-', 'in-', 'op-', 'af-', 'a-', 'be-'],
        suffix: ['-en', '-je', '-tje', '-de', '-te', '-er', '-ing', '-elijk', '-t', '-s'],
        double: ['en', 'ee', 'oo', 'aa', 'uu', 'll', 'ss', 'tt', 'nn', 'kk']
    }
};

let solver = null;
let currentLanguage = 'english';
let dictionaries = {
    english: { path: 'config/english.txt', points: ENGLISH_SCORE, loaded: false, text: '', solverInstance: null },
    dutch: { path: 'config/dutch.txt', points: DUTCH_SCORE, loaded: false, text: '', solverInstance: null }
};

let lastSolvedWords = [];
let selectedCellIdx = null;

// DOM Elements
const statusDiv = document.getElementById('status');
const statusText = statusDiv.querySelector('.status-text');
const boardGrid = document.getElementById('board-grid');
const solveBtn = document.getElementById('solve-btn');
const clearBtn = document.getElementById('clear-btn');
const randomBtn = document.getElementById('random-btn');
const langSelect = document.getElementById('lang-select');
const algoSelect = document.getElementById('algo-select');
const sortByScoreCheck = document.getElementById('sort-by-score');
const resultsList = document.getElementById('results-list');
const wordCountBadge = document.getElementById('word-count');
const filterInput = document.getElementById('filter-input');
const metricsRow = document.getElementById('metrics-row');
const pathsCountBadge = document.getElementById('paths-count');
const solveTimeBadge = document.getElementById('solve-time');

// Initialize 4x4 Grid
function initGrid() {
    boardGrid.innerHTML = '';
    // Pre-fill board with a demo grid: morp wcih yago llol
    const defaultLetters = ['m', 'o', 'r', 'p', 'w', 'c', 'i', 'h', 'y', 'a', 'g', 'o', 'l', 'l', 'o', 'l'];
    for (let i = 0; i < 16; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'grid-cell';
        input.dataset.index = i;
        input.value = defaultLetters[i];
        input.maxLength = 10;
        input.autocomplete = 'off';
        input.spellcheck = false;
        boardGrid.appendChild(input);
    }
}

// Randomize board cells
function randomizeBoard() {
    const lang = currentLanguage;
    const freq = FREQUENCIES[lang] || FREQUENCIES.english;
    const specials = SPECIAL_TILES[lang] || SPECIAL_TILES.english;
    
    // Step 1: Generate 16 random letters
    const cells = [];
    for (let i = 0; i < 16; i++) {
        const idx = Math.floor(Math.random() * freq.length);
        cells.push(freq[idx]);
    }
    
    // Step 2: Decide and apply double letters (30% chance)
    if (Math.random() < 0.3) {
        const cellIdx = Math.floor(Math.random() * 16);
        const doubleIdx = Math.floor(Math.random() * specials.double.length);
        cells[cellIdx] = specials.double[doubleIdx];
    }
    
    // Step 3: Decide and apply prefix tile (15% chance)
    if (Math.random() < 0.15) {
        const cellIdx = Math.floor(Math.random() * 16);
        const prefixIdx = Math.floor(Math.random() * specials.prefix.length);
        cells[cellIdx] = specials.prefix[prefixIdx];
    }
    
    // Step 4: Decide and apply suffix tile (15% chance)
    if (Math.random() < 0.15) {
        const cellIdx = Math.floor(Math.random() * 16);
        const suffixIdx = Math.floor(Math.random() * specials.suffix.length);
        cells[cellIdx] = specials.suffix[suffixIdx];
    }
    
    // Step 5: Fill in UI grid
    const inputs = boardGrid.querySelectorAll('.grid-cell');
    inputs.forEach((input, idx) => {
        input.value = cells[idx];
    });
    
    // Clear old results and validate the board
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
    stopHighlightAnimation();
    clearCellSelection();
    metricsRow.style.display = 'none';
    validateBoard();
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
    let cells = [];
    inputs.forEach(input => {
        cells.push(input.value.trim());
    });
    return cells.join(' ');
}

// Load Dictionary
async function loadDictionary(lang) {
    const dict = dictionaries[lang];
    if (dict.loaded) {
        statusDiv.className = 'status-indicator ready';
        statusText.textContent = `${lang.charAt(0).toUpperCase() + lang.slice(1)} dictionary loaded`;
        
        // Swap to the cached solver instance
        solver = dict.solverInstance;
        
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
        
        // Re-initialize and cache the solver instance
        dict.solverInstance = new WordamentSolver(dict.points);
        dict.solverInstance.loadDictionary(dict.text);
        
        // Update the active solver reference
        solver = dict.solverInstance;
        
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

let activeAnimationInterval = null;
let activeAnimationTimeouts = [];

function clearBoardHighlight() {
    const inputs = boardGrid.querySelectorAll('.grid-cell');
    inputs.forEach(input => {
        input.classList.remove('highlight-active');
    });
}

function stopHighlightAnimation() {
    if (activeAnimationInterval) {
        clearInterval(activeAnimationInterval);
        activeAnimationInterval = null;
    }
    activeAnimationTimeouts.forEach(t => clearTimeout(t));
    activeAnimationTimeouts = [];
    clearBoardHighlight();
}

function startHighlightAnimation(path) {
    stopHighlightAnimation();
    
    const inputs = boardGrid.querySelectorAll('.grid-cell');
    const animate = () => {
        clearBoardHighlight();
        
        path.forEach((cellIdx, stepIdx) => {
            const timeout = setTimeout(() => {
                const input = inputs[cellIdx];
                if (input) {
                    input.classList.add('highlight-active');
                }
            }, stepIdx * 250);
            activeAnimationTimeouts.push(timeout);
        });
        
        const totalDuration = path.length * 250;
        const waitTimeout = setTimeout(() => {
            clearBoardHighlight();
        }, totalDuration + 2500); // Keep highlighted for 2.5 seconds
        activeAnimationTimeouts.push(waitTimeout);
    };

    animate();
    
    const cycleDuration = path.length * 250 + 3000; // Total cycle duration (includes 500ms blank gap)
    activeAnimationInterval = setInterval(animate, cycleDuration);
}

function clearCellSelection() {
    selectedCellIdx = null;
    boardGrid.querySelectorAll('.grid-cell.cell-selected').forEach(el => el.classList.remove('cell-selected'));
}

function applyFilters() {
    if (lastSolvedWords.length === 0) return;
    
    const filterText = filterInput.value.toLowerCase().trim();
    const boardStr = getBoardString();
    
    let filtered = lastSolvedWords;
    
    // 1. Filter by selected cell
    if (selectedCellIdx !== null) {
        filtered = filtered.filter(word => {
            const path = solver.findPath(boardStr, word);
            return path && path.includes(selectedCellIdx);
        });
    }
    
    // 2. Filter by search text
    if (filterText !== '') {
        filtered = filtered.filter(word => word.includes(filterText));
    }
    
    // Render
    renderWords(filtered);
    
    // Update count badge
    if (selectedCellIdx !== null || filterText !== '') {
        wordCountBadge.textContent = `${filtered.length} / ${lastSolvedWords.length} words`;
    } else {
        wordCountBadge.textContent = `${lastSolvedWords.length} words`;
    }
}

// Event Listeners setup
function setupEvents() {
    resultsList.addEventListener('click', (e) => {
        const item = e.target;
        if (!item.classList.contains('word-item')) return;
        
        // Remove selection from others
        resultsList.querySelectorAll('.word-item.selected').forEach(el => el.classList.remove('selected'));
        
        item.classList.add('selected');
        
        const word = item.textContent.trim().toLowerCase();
        const boardStr = getBoardString();
        const path = solver.findPath(boardStr, word);
        
        if (path) {
            startHighlightAnimation(path);
        } else {
            stopHighlightAnimation();
        }
    });

    // Click on a grid cell to filter words using that tile
    boardGrid.addEventListener('click', (e) => {
        const input = e.target;
        if (!input.classList.contains('grid-cell')) return;
        
        // Only allow filtering if we have solved words
        if (lastSolvedWords.length === 0) return;
        
        const cellIdx = parseInt(input.dataset.index);
        
        stopHighlightAnimation();
        
        if (selectedCellIdx === cellIdx) {
            input.classList.remove('cell-selected');
            selectedCellIdx = null;
            applyFilters();
        } else {
            boardGrid.querySelectorAll('.grid-cell.cell-selected').forEach(el => el.classList.remove('cell-selected'));
            input.classList.add('cell-selected');
            selectedCellIdx = cellIdx;
            applyFilters();
        }
    });

    // Focus navigation inside grid
    boardGrid.addEventListener('input', (e) => {
        const input = e.target;
        if (!input.classList.contains('grid-cell')) return;

        // Clear highlight and cell selection on user edit
        clearCellSelection();
        stopHighlightAnimation();

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
        const algo = algoSelect.value;
        
        // Show loading in results during search
        resultsList.innerHTML = '<div class="results-placeholder"><p>Solving board...</p></div>';
        stopHighlightAnimation();
        clearCellSelection();
        metricsRow.style.display = 'none';
        
        // Use setTimeout to allow UI to render the placeholder
        setTimeout(() => {
            const t0 = performance.now();
            lastSolvedWords = solver.solve(boardStr, algo);
            const t1 = performance.now();
            const elapsed = t1 - t0;
            
            console.log(`Solved in ${elapsed.toFixed(2)}ms`);
            
            // Show metrics
            metricsRow.style.display = 'flex';
            pathsCountBadge.className = 'metric-badge';
            pathsCountBadge.textContent = `Paths Explored: ${solver.stats.pathsExplored.toLocaleString()}`;
            
            if (solver.stats.timedOut) {
                solveTimeBadge.className = 'metric-badge warning-badge';
                solveTimeBadge.textContent = `Timed Out (>15s)`;
            } else {
                solveTimeBadge.className = 'metric-badge';
                solveTimeBadge.textContent = `Time: ${elapsed.toFixed(2)}ms`;
            }
            
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
        stopHighlightAnimation();
        clearCellSelection();
        metricsRow.style.display = 'none';
        validateBoard();
        
        // Focus first cell
        const firstInput = boardGrid.querySelector('[data-index="0"]');
        if (firstInput) firstInput.focus();
    });

    // Randomize Board
    randomBtn.addEventListener('click', () => {
        randomizeBoard();
    });

    // Language selection
    langSelect.addEventListener('change', (e) => {
        currentLanguage = e.target.value;
        loadDictionary(currentLanguage);
    });

    // Sorting toggle
    sortByScoreCheck.addEventListener('change', () => {
        if (lastSolvedWords.length > 0) {
            applyFilters();
        }
    });

    // Live word filtering
    filterInput.addEventListener('input', () => {
        applyFilters();
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
