"""
This module provides a Trie (Prefix Tree) implementation optimized for prefix
and word search.
"""

class Trie:
    """
    A Trie (Prefix Tree) data structure.

    Used for storing a dictionary of words to allow efficient lookups of words
    and prefix matching.
    """
    def __init__(self):
        """Initializes an empty Trie."""
        self.root = {}

    def insert(self, word: str):
        """
        Inserts a word into the Trie.

        Args:
            word: The word to insert. Should be normalized to lowercase.
        """
        node = self.root
        for char in word:
            if char not in node:
                node[char] = {}
            node = node[char]
        node['$'] = True

    def has_word(self, word: str) -> bool:
        """
        Checks if a complete word exists in the Trie.

        Args:
            word: The word to search for.

        Returns:
            True if the word is in the Trie, False otherwise.
        """
        node = self.root
        for char in word:
            if char not in node:
                return False
            node = node[char]
        return '$' in node

    def is_prefix(self, prefix: str) -> bool:
        """
        Checks if a prefix exists in the Trie.

        A prefix is valid if there is at least one word in the Trie starting with it.

        Args:
            prefix: The prefix to search for.

        Returns:
            True if the prefix exists in the Trie, False otherwise.
        """
        node = self.root
        for char in prefix:
            if char not in node:
                return False
            node = node[char]
        return True
