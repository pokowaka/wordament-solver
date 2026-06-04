/**
 * Trie and WordamentSolver classes for client-side board solving.
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

class WordamentSolver {
    constructor(points) {
        this.trie = new Trie();
        this.points = points;
    }

    /**
     * Loads a dictionary text file content into the Trie.
     * @param {string} text - Raw content of the dictionary file.
     */
    loadDictionary(text) {
        const words = text.split(/\r?\n/);
        for (let word of words) {
            word = word.trim().toLowerCase();
            if (word.length >= 3) {
                this.trie.insert(word);
            }
        }
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

    pathToStr(matrix, path) {
        return path.map(([r, c]) => this.getChars(matrix, r, c)).join('');
    }

    isSeen(path, row, col) {
        return path.some(([r, c]) => r === row && c === col);
    }

    getChars(matrix, row, col) {
        let val = matrix[row][col];
        if (val.length > 1) {
            val = val.replace(/[()-]/g, '');
        }
        return val;
    }

    findWords(matrix, path, row, col) {
        const strSoFar = this.pathToStr(matrix, path);

        if (row < 0 || row >= matrix.length ||
            col < 0 || col >= matrix[row].length ||
            this.isSeen(path, row, col) ||
            !this.trie.isPrefix(strSoFar)) {
            return [];
        }

        const char = matrix[row][col];

        if (char.endsWith('-)') && path.length > 0) {
            return [];
        }

        const newPath = [...path, [row, col]];
        const newStr = strSoFar + this.getChars(matrix, row, col);

        let words = [];
        if (this.trie.hasWord(newStr)) {
            words.push(newStr);
        }

        if (char.startsWith('(-')) {
            return words;
        }

        for (let rw = -1; rw <= 1; rw++) {
            for (let cl = -1; cl <= 1; cl++) {
                if (rw === 0 && cl === 0) continue;
                words.push(...this.findWords(matrix, newPath, row + rw, col + cl));
            }
        }

        return words;
    }

    /**
     * Solves the given board.
     * @param {string} boardStr - Space-separated rows of letters.
     * @returns {string[]} Unique list of words found.
     */
    solve(boardStr) {
        const wordsList = boardStr.trim().split(/\s+/);
        const matrix = [];
        for (let line of wordsList) {
            const matches = line.toLowerCase().match(/\(-?[a-z]+-?\)|[a-z]/g);
            if (matches) {
                matrix.push(matches);
            }
        }

        if (matrix.length === 0 || matrix[0].length === 0) {
            return [];
        }

        const words = [];
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                words.push(...this.findWords(matrix, [], row, col));
            }
        }

        const unique = [...new Set(words)];
        return unique.filter(w => w.length > 2);
    }
}

// Export for module/browser usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Trie, WordamentSolver };
}
