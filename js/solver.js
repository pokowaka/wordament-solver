/**
 * Trie and WordamentSolver classes for client-side board solving.
 * Exposes multiple algorithms (Trie, Binary Search, and Brute Force) for benchmarking.
 * Optimized to perform O(1) state transitions during DFS.
 */

class Trie {
    constructor() {
        this.root = {};
    }

    /**
     * Inserts a word into the Trie.
     * @param {string} word - The word to insert (should be lowercase).
     */
    insert(word) {
        let node = this.root;
        for (let char of word) {
            if (!node[char]) {
                node[char] = {};
            }
            node = node[char];
        }
        node['$'] = true; // Marker for word end
    }

    /**
     * Checks if a word exists in the Trie.
     * @param {string} word - The word to look up.
     * @returns {boolean} True if the word is in the Trie.
     */
    hasWord(word) {
        let node = this.root;
        for (let char of word) {
            if (!node[char]) return false;
            node = node[char];
        }
        return node['$'] === true;
    }

    /**
     * Checks if a prefix exists in the Trie.
     * @param {string} prefix - The prefix to look up.
     * @returns {boolean} True if the prefix exists in the Trie.
     */
    isPrefix(prefix) {
        let node = this.root;
        for (let char of prefix) {
            if (!node[char]) return false;
            node = node[char];
        }
        return true;
    }
}
const NEIGHBORS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
];

class WordamentSolver {
    constructor(points) {
        this.trie = new Trie();
        this.points = points;
        this.wordsArray = [];
        this.wordsSet = new Set();
        this.stats = {
            pathsExplored: 0,
            timedOut: false
        };
    }

    /**
     * Loads a dictionary text file content into structures.
     * @param {string} text - Raw content of the dictionary file.
     */
    loadDictionary(text) {
        const words = text.split(/\r?\n/);
        this.wordsArray = [];
        for (let word of words) {
            word = word.trim().toLowerCase();
            if (word.length >= 3) {
                this.trie.insert(word);
                this.wordsArray.push(word);
            }
        }
        // Ensure array is sorted for binary search
        this.wordsArray.sort();
        this.wordsSet = new Set(this.wordsArray);
    }

    /**
     * Calculates the score of a word.
     * @param {string} word - Word to score.
     * @returns {number} Score of the word.
     */
    score(word) {
        let total = 0;
        for (let char of word.toUpperCase()) {
            total += this.points[char] || 0;
        }
        return total;
    }

    /**
     * Binary Search for prefix matching.
     * Returns true if any word in wordsArray starts with the prefix.
     */
    binarySearchPrefix(prefix) {
        let low = 0;
        let high = this.wordsArray.length - 1;
        
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const word = this.wordsArray[mid];
            
            if (word.startsWith(prefix)) {
                return true;
            }
            
            if (word < prefix) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return false;
    }

    /**
     * Algorithm 1: Trie-Pruned DFS (O(1) Trie Transitions)
     */
    findWordsTrie(matrix, visited, row, col, trieNode, accumulatedStr, foundWords) {
        this.stats.pathsExplored++;

        if (row < 0 || row >= matrix.length ||
            col < 0 || col >= matrix[row].length ||
            visited[row][col]) {
            return;
        }

        const cell = matrix[row][col];
        const char = cell.tile;

        // Suffix/Prefix rules
        if (char.endsWith('-)') && accumulatedStr.length > 0) {
            return; // Prefix tile can only be first
        }

        const suffix = cell.cleaned;
        
        // Trie transition
        let nextNode = trieNode;
        for (let i = 0; i < suffix.length; i++) {
            nextNode = nextNode[suffix[i]];
            if (!nextNode) return; // Prune!
        }

        const newStr = accumulatedStr + suffix;
        if (nextNode['$'] === true) {
            foundWords.push(newStr);
        }

        if (char.startsWith('(-')) {
            return; // Suffix tile must be last
        }

        visited[row][col] = true;
        for (let i = 0; i < NEIGHBORS.length; i++) {
            const [dr, dc] = NEIGHBORS[i];
            this.findWordsTrie(matrix, visited, row + dr, col + dc, nextNode, newStr, foundWords);
        }
        visited[row][col] = false;
    }

    /**
     * Algorithm 2: Binary Search Pruned DFS (Optimized string accumulation)
     */
    findWordsBinarySearch(matrix, visited, row, col, accumulatedStr, foundWords) {
        this.stats.pathsExplored++;

        if (row < 0 || row >= matrix.length ||
            col < 0 || col >= matrix[row].length ||
            visited[row][col]) {
            return;
        }

        const cell = matrix[row][col];
        const char = cell.tile;

        if (char.endsWith('-)') && accumulatedStr.length > 0) {
            return;
        }

        const suffix = cell.cleaned;
        const newStr = accumulatedStr + suffix;

        if (!this.binarySearchPrefix(newStr)) {
            return; // Prune!
        }

        if (this.wordsSet.has(newStr)) {
            foundWords.push(newStr);
        }

        if (char.startsWith('(-')) {
            return;
        }

        visited[row][col] = true;
        for (let i = 0; i < NEIGHBORS.length; i++) {
            const [dr, dc] = NEIGHBORS[i];
            this.findWordsBinarySearch(matrix, visited, row + dr, col + dc, newStr, foundWords);
        }
        visited[row][col] = false;
    }

    /**
     * Algorithm 3: Brute Force DFS (No pruning, optimized string accumulation)
     */
    findWordsBruteForce(matrix, visited, row, col, accumulatedStr, startTime, foundWords) {
        this.stats.pathsExplored++;

        // Safety timeout to prevent browser tab freeze (abort after 5 seconds)
        if (performance.now() - startTime > 5000) {
            this.stats.timedOut = true;
            throw new Error("Timeout");
        }

        if (row < 0 || row >= matrix.length ||
            col < 0 || col >= matrix[row].length ||
            visited[row][col]) {
            return;
        }

        const cell = matrix[row][col];
        const char = cell.tile;

        if (char.endsWith('-)') && accumulatedStr.length > 0) {
            return;
        }

        const suffix = cell.cleaned;
        const newStr = accumulatedStr + suffix;

        if (newStr.length >= 3 && this.wordsSet.has(newStr)) {
            foundWords.push(newStr);
        }

        if (char.startsWith('(-')) {
            return;
        }

        visited[row][col] = true;
        for (let i = 0; i < NEIGHBORS.length; i++) {
            const [dr, dc] = NEIGHBORS[i];
            this.findWordsBruteForce(matrix, visited, row + dr, col + dc, newStr, startTime, foundWords);
        }
        visited[row][col] = false;
    }

    /**
     * Solves the given board.
     * @param {string} boardStr - Space-separated rows of letters.
     * @param {string} algorithm - 'trie', 'binary_search', or 'brute_force'
     * @returns {string[]} Unique list of words found.
     */
    solve(boardStr, algorithm = 'trie') {
        this.stats = {
            pathsExplored: 0,
            timedOut: false
        };

        const matrix = [];
        const transRegex = /[()-]/g;
        
        let rows = [];
        if (boardStr.includes('/')) {
            rows = boardStr.trim().split(/\s*\/\s*/);
        } else if (boardStr.includes('\n')) {
            rows = boardStr.trim().split('\n');
        } else {
            const words = boardStr.trim().split(/\s+/);
            if (words.length === 16) {
                for (let i = 0; i < 16; i += 4) {
                    rows.push(words.slice(i, i + 4).join(' '));
                }
            } else {
                rows = words;
            }
        }

        for (let line of rows) {
            let tiles = [];
            if (line.trim().includes(' ')) {
                tiles = line.trim().split(/\s+/);
            } else {
                const matches = line.toLowerCase().match(/\(-?[a-z]+-?\)|[a-z]/g);
                if (matches) tiles = matches;
            }

            if (tiles.length > 0) {
                const row = [];
                for (let tile of tiles) {
                    let tileLower = tile.toLowerCase();
                    if (!(tileLower.startsWith('(') && tileLower.endsWith(')'))) {
                        if (tileLower.endsWith('-') || tileLower.startsWith('-') || tileLower.length > 1) {
                            tileLower = `(${tileLower})`;
                        }
                    }
                    const cleaned = tileLower.length > 1 ? tileLower.replace(transRegex, '') : tileLower;
                    row.push({ tile: tileLower, cleaned });
                }
                matrix.push(row);
            }
        }

        if (matrix.length === 0 || matrix[0].length === 0) {
            return [];
        }

        const words = [];
        const startTime = performance.now();

        // Initialize visited matrix
        const visited = [];
        for (let r = 0; r < matrix.length; r++) {
            visited.push(new Array(matrix[r].length).fill(false));
        }

        try {
            for (let row = 0; row < matrix.length; row++) {
                for (let col = 0; col < matrix[row].length; col++) {
                    if (algorithm === 'trie') {
                        this.findWordsTrie(matrix, visited, row, col, this.trie.root, "", words);
                    } else if (algorithm === 'binary_search') {
                        this.findWordsBinarySearch(matrix, visited, row, col, "", words);
                    } else if (algorithm === 'brute_force') {
                        this.findWordsBruteForce(matrix, visited, row, col, "", startTime, words);
                    }
                }
            }
        } catch (e) {
            if (e.message !== "Timeout") {
                throw e; // Rethrow other errors
            }
            console.warn("Solver execution timed out (safety abort).");
        }

        const unique = [...new Set(words)];
        return unique.filter(w => w.length > 2);
    }
}

// Export for module/browser usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Trie, WordamentSolver };
}
