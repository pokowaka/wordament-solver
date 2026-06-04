import unittest
import sys
import os

# Add parent directory to path to import wordament
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from wordament import Wordament

class TestWordament(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Load the default english dictionary
        cls.solver = Wordament()

    def test_score(self):
        self.assertEqual(self.solver.score('hello'), 13)

    def test_score_ignore_case(self):
        self.assertEqual(self.solver.score('HeLlO'), 13)

    def test_trie_prefix(self):
        self.assertTrue(self.solver.trie.is_prefix('hel'))
        self.assertTrue(self.solver.trie.is_prefix('hello'))
        self.assertFalse(self.solver.trie.is_prefix('helllo'))

    def test_seen(self):
        path = [(1, 1)]
        self.assertIn((1, 1), path)

    def test_get_chars(self):
        m = [['(-h)', '(e-)', '-l', 'l-', 'o']]
        self.assertEqual(self.solver.get_chars(m, 0, 0), 'h')
        self.assertEqual(self.solver.get_chars(m, 0, 1), 'e')
        self.assertEqual(self.solver.get_chars(m, 0, 2), 'l')

    def test_find_words(self):
        m = [['h', 'e', 'l', 'l', 'o']]
        found = self.solver.find_words(m, [], 0, 0)
        self.assertEqual(found, ['hell', 'hello'])

    def test_solve_prefix_tile(self):
        self.assertEqual(self.solver.solve('mo(v-)ie'), ['vie'])

    def test_solve_simple(self):
        words = self.solver.solve('hell aloo')
        expected = ['hell', 'hello', 'helo', 'heal', 'hae', 'hale', 'hall', 'hallo', 'halloo', 'halo',
                    'ell', 'lea', 'leal', 'loo', 'loll', 'ale', 'all', 'aloe', 'lah', 'ole', 'olea', 'olla', 'oleo']
        self.assertEqual(words, expected)

    def test_solve_suffix_tile(self):
        words = self.solver.solve("(-ing)abc defs soew chun")
        self.assertTrue(len(words) > 1)
        non_end_ing = [w for w in words if 'ing' in w and not w.endswith('ing')]
        self.assertEqual(non_end_ing, [])

    def test_solve_irregular_board(self):
        # This would crash with IndexError before the fix
        words = self.solver.solve('abc de')
        self.assertIsInstance(words, list)

    def test_solve_dutch(self):
        import os
        from wordament import DUTCH_SCORE
        current_dir = os.path.dirname(os.path.abspath(__file__))
        dutch_dict = os.path.join(current_dir, '..', 'config', 'dutch.txt')
        dutch_solver = Wordament(dictionary_file=dutch_dict, points=DUTCH_SCORE)
        words = dutch_solver.solve('wijn fles')
        self.assertIn('wijn', words)
        self.assertIn('fles', words)
        self.assertIn('lijn', words)
        self.assertIn('snel', words)
        self.assertTrue(all(len(w) > 2 for w in words))

if __name__ == '__main__':
    unittest.main()
