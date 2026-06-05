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

NEIGHBORS = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


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
            points: Dict mapping uppercase letters to their point values,
                    or a path to a JSON file containing the mapping.
                    Defaults to ENGLISH_SCORE.
        """
        if dictionary_file is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            dictionary_file = os.path.join(current_dir, '..', 'config', 'english.txt')
        
        if points is None:
            points = ENGLISH_SCORE
        elif isinstance(points, str):
            import json
            with open(points, 'r', encoding='utf-8') as f:
                points = json.load(f)

        self.trie = Trie()
        # Normalize keys to uppercase
        self.points = {k.upper(): v for k, v in points.items()}

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

    def _find_words_dfs(self, matrix, visited, row, col, trie_node, accumulated_str, found_words):
        """
        Internal recursive DFS helper to search the board using Trie transition pruning.
        """
        if (row < 0 or row >= len(matrix) or
            col < 0 or col >= len(matrix[row]) or
            (row, col) in visited):
            return

        char, suffix = matrix[row][col]

        # Prefix tile constraint: e.g., '(v-)' must be the start of the word.
        if char.endswith('-)') and accumulated_str:
            return

        # Trie transition
        next_node = trie_node
        for ch in suffix:
            next_node = next_node.get(ch)
            if not next_node:
                return # Prune!

        new_str = accumulated_str + suffix
        if '$' in next_node:
            found_words.append(new_str)

        # Suffix tile constraint: e.g., '(-ing)' must be the end of the word.
        if char.startswith('(-'):
            return

        visited.add((row, col))
        for dr, dc in NEIGHBORS:
            self._find_words_dfs(matrix, visited, row + dr, col + dc, next_node, new_str, found_words)
        visited.remove((row, col))

    def find_words(self, matrix, path, row, col):
        """
        Recursive helper to perform DFS search starting from a cell.
        Kept for backward compatibility.
        """
        is_pre_cleaned = isinstance(matrix[0][0], tuple) if matrix and matrix[0] else False
        
        if not is_pre_cleaned:
            trans_table = str.maketrans('', '', '()-')
            cleaned_matrix = []
            for r in range(len(matrix)):
                row_tiles = []
                for c in range(len(matrix[r])):
                    tile = matrix[r][c]
                    cleaned = tile.translate(trans_table) if len(tile) > 1 else tile
                    row_tiles.append((tile, cleaned))
                cleaned_matrix.append(row_tiles)
        else:
            cleaned_matrix = matrix

        visited = set(path)
        accumulated_str = "".join(cleaned_matrix[r][c][1] for r, c in path)
        
        trie_node = self.trie.root
        for ch in accumulated_str:
            trie_node = trie_node.get(ch)
            if not trie_node:
                return []
        
        words = []
        self._find_words_dfs(cleaned_matrix, visited, row, col, trie_node, accumulated_str, words)
        return words

    def solve(self, board: str):
        """
        Solves a Wordament board.

        The board string can be:
        - space-separated rows of concatenated tiles (e.g. 'hell aloo' or 'idoo aler lten ad(ss)m')
        - slash-separated rows of space-separated tiles (e.g. 'e- l o o / a l e r / l t e n / a d ss m')
        - space-separated tiles for a 16-cell board (e.g. 'e- l o o a l e r l t e n a d ss m')

        Args:
            board: A string representing the board.

        Returns:
            A list of unique, sorted (by search path), valid words with length > 2.
        """
        if '/' in board:
            rows = board.strip().split('/')
            matrix = []
            for row in rows:
                tiles = row.strip().split()
                if tiles:
                    matrix.append(tiles)
        elif '\n' in board:
            rows = board.strip().split('\n')
            matrix = []
            for row in rows:
                tiles = row.strip().split()
                if tiles:
                    matrix.append(tiles)
        else:
            words_list = board.strip().split()
            if len(words_list) == 16:
                matrix = [words_list[i:i+4] for i in range(0, 16, 4)]
            else:
                matrix = []
                for line in words_list:
                    tiles = re.findall(r'\(-?[a-z]+-?\)|[a-z]', line.lower())
                    if tiles:
                        matrix.append(tiles)

        if not matrix or not matrix[0]:
            return []

        # Normalize and pre-clean matrix tiles
        trans_table = str.maketrans('', '', '()-')
        cleaned_matrix = []
        for r in range(len(matrix)):
            row_tiles = []
            for tile in matrix[r]:
                tile_lower = tile.lower()
                if not (tile_lower.startswith('(') and tile_lower.endswith(')')):
                    if tile_lower.endswith('-') or tile_lower.startswith('-') or len(tile_lower) > 1:
                        tile_lower = f"({tile_lower})"
                cleaned = tile_lower.translate(trans_table)
                row_tiles.append((tile_lower, cleaned))
            cleaned_matrix.append(row_tiles)

        words = []
        visited = set()
        # Start DFS search from every cell on the board
        for row in range(len(cleaned_matrix)):
            for col in range(len(cleaned_matrix[row])):
                self._find_words_dfs(cleaned_matrix, visited, row, col, self.trie.root, "", words)

        # Remove duplicates while preserving insertion order (corresponds to search order)
        unique_words = list(dict.fromkeys(words))
        # Wordament words must be at least 3 letters long
        return [w for w in unique_words if len(w) > 2]
