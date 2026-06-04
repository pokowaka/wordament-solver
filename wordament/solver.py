"""
This module implements the Wordament solver logic, modeling the board as a
grid and using a Trie to find valid words.
"""
import os
import re
from .trie import Trie

# Scoring tables for Dutch and English languages in Wordament
DUTCH_SCORE = {
    'E': 1, 'N': 1, 'A': 1, 'O': 1, 'I': 1,
    'D': 2, 'R': 2, 'S': 2, 'T': 2,
    'G': 3, 'K': 3, 'L': 3, 'M': 3, 'B': 3, 'P': 3,
    'U': 4, 'F': 4, 'H': 4, 'J': 4, 'V': 4, 'Z': 4,
    'C': 5, 'W': 5,
    'X': 8, 'Y': 8,
    'Q': 10
}

ENGLISH_SCORE = {
    'A': 2, 'B': 5, 'C': 3, 'D': 3, 'E': 1,
    'G': 4, 'F': 5, 'H': 4, 'I': 2, 'J': 7,
    'K': 6, 'L': 3, 'M': 4, 'N': 2, 'O': 2,
    'P': 4, 'Q': 10, 'R': 2, 'S': 2, 'T': 2,
    'U': 4, 'X': 9, 'V': 5, 'W': 6, 'Y': 5,
    'Z': 8
}

class Wordament:
    """
    Solves Wordament boards using Depth-First Search (DFS) pruned with a Trie.
    """
    def __init__(self, dictionary_file=None, points=None):
        """
        Initializes the Wordament solver.

        Loads the dictionary file into a Trie and sets the point values for letters.

        Args:
            dictionary_file: Path to the dictionary text file (one word per line).
                             Defaults to 'config/english.txt'.
            points: Dict mapping uppercase letters to their point values.
                    Defaults to ENGLISH_SCORE.
        """
        if dictionary_file is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            dictionary_file = os.path.join(current_dir, '..', 'config', 'english.txt')
        if points is None:
            points = ENGLISH_SCORE

        self.trie = Trie()
        self.points = points

        # Load dictionary
        if os.path.exists(dictionary_file):
            with open(dictionary_file, 'r', encoding='utf-8') as f:
                for line in f:
                    self.trie.insert(line.strip().lower())

    def score(self, word: str) -> int:
        """
        Calculates the score of a word based on the letter point table.

        Args:
            word: The word to score.

        Returns:
            The total score of the word.
        """
        return sum(self.points.get(char, 0) for char in word.upper())

    def path_to_str(self, matrix, path) -> str:
        """
        Converts a list of board coordinates (path) to its string representation.

        Args:
            matrix: The parsed board matrix.
            path: List of (row, col) tuples representing the visited cells.

        Returns:
            The string formed by the path on the board.
        """
        return "".join(self.get_chars(matrix, r, c) for r, c in path)

    def get_chars(self, matrix, row, col) -> str:
        """
        Extracts and cleans the characters from a specific tile on the board.
        Removes special tile markers like parenthesis and dashes.

        Args:
            matrix: The board matrix.
            row: Row index.
            col: Col index.

        Returns:
            The cleaned string representing the letter(s) on the tile.
        """
        val = matrix[row][col]
        if len(val) > 1:
            val = val.translate(str.maketrans('', '', '()-'))
        return val

    def find_words(self, matrix, path, row, col):
        """
        Recursive helper to perform DFS search starting from a cell.

        Uses the Trie to prune paths that do not form valid prefixes.
        Handles special tile constraints (prefixes and suffixes).

        Args:
            matrix: The board matrix.
            path: List of (row, col) tuples representing the path traveled so far.
            row: The row index of the current cell to visit.
            col: The col index of the current cell to visit.

        Returns:
            A list of valid words found from this path.
        """
        str_so_far = self.path_to_str(matrix, path)

        # Prune if out of bounds, already visited, or not a valid prefix in Trie.
        if (row < 0 or row >= len(matrix) or
            col < 0 or col >= len(matrix[row]) or
            (row, col) in path or
            not self.trie.is_prefix(str_so_far)):
            return []

        char = matrix[row][col]

        # Prefix tile constraint: e.g., '(v-)' must be the start of the word.
        if char.endswith('-)') and len(path) > 0:
            return []

        new_path = path + [(row, col)]
        new_str = str_so_far + self.get_chars(matrix, row, col)

        words = []
        if self.trie.has_word(new_str):
            words.append(new_str)

        # Suffix tile constraint: e.g., '(-ing)' must be the end of the word.
        # Stop searching deeper from this tile.
        if char.startswith('(-'):
            return words

        # Explore all 8 neighbors (diagonal, vertical, horizontal)
        for rw in range(-1, 2):
            for cl in range(-1, 2):
                if rw == 0 and cl == 0:
                    continue
                words.extend(self.find_words(matrix, new_path, row + rw, col + cl))

        return words

    def solve(self, board: str):
        """
        Solves a Wordament board.

        The board string should be space-separated rows of tiles.
        Example: 'hell aloo' representing:
        h e
        l l
        a l
        o o

        Args:
            board: A string representing the board, rows separated by whitespace.

        Returns:
            A list of unique, sorted (by search path), valid words with length > 2.
        """
        words_list = board.strip().split()
        matrix = []
        for line in words_list:
            # Match either special tiles like '(v-)', '(-ing)', '(co)' or single letters
            tiles = re.findall(r'\(-?[a-z]+-?\)|[a-z]', line.lower())
            if tiles:
                matrix.append(tiles)

        if not matrix or not matrix[0]:
            return []

        words = []
        # Start DFS search from every cell on the board
        for row in range(len(matrix)):
            for col in range(len(matrix[0])):
                words.extend(self.find_words(matrix, [], row, col))

        # Remove duplicates while preserving insertion order (corresponds to search order)
        unique_words = list(dict.fromkeys(words))
        # Wordament words must be at least 3 letters long
        return [w for w in unique_words if len(w) > 2]
