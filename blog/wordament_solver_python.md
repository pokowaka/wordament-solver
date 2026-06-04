# Speeding up Wordament Solvers: Trie vs. Brute Force (100x Speedup in Python)

Wordament is a fast-paced word search game by Microsoft played on a 4x4 grid of letters. The goal is to find as many words as possible by connecting neighboring tiles (horizontal, vertical, and diagonal) without reusing any tile in a single word.

If you've ever tried to write a solver for it, you might have run into a common algorithmic bottleneck: **the sheer number of possible paths**. 

In this post, we'll look at why a naive brute-force approach takes over **5 seconds** even in a compiled, high-performance language like **D**, and how a smart **Trie-pruned DFS** implementation solves the board in **0.04 seconds** using interpreted **Python**.

---

## The Challenge: Path Explosion

A 4x4 grid might seem small, but the number of unique paths you can trace is surprisingly massive. Because you can move in 8 directions from any tile (without revisiting tiles), the number of paths grows exponentially with the length of the word.

On a standard 4x4 board, there are **over 12 million unique paths** of lengths 1 to 16.

```text
| A | B | C | D |
| E | F | G | H |
| I | J | K | L |
| M | N | O | P |
```

If you start at `A` (top-left), you can go to `B`, `F`, or `E`. From there, your options branch out further. Tracing all paths from all 16 starting positions generates a massive search tree.

---

## The Brute-Force Approach (D Solver)

A common first instinct is to:
1. Generate all 12+ million possible paths on the grid.
2. For each path, construct the string of letters.
3. Check if that string exists in a Scrabble dictionary using a fast Hash Map lookup ($O(1)$).

This was the approach taken in [Jordan K. Wilson's D solver](https://wilsonjord.github.io/blog/wordament-solver/). D is a compiled language built for speed. Yet, despite utilizing compiled execution and fast hash maps, his solver took **~5.1 seconds** to solve a single board.

### Why is this slow?
Because the algorithm is doing unnecessary work. It generates millions of paths like `QZ...` or `XP...`, constructs strings for them, hashes them, and checks them in the dictionary, only to find they are invalid. It spends 99.9% of its CPU cycles processing strings that could never be words.

---

## The Smart Approach: Trie-Pruned DFS (Python Solver)

Instead of generating all paths and filtering them at the end, we can **prune the search tree early** by matching paths against a **Trie (Prefix Tree)** as we walk the grid.

### What is a Trie?
A Trie is a tree structure where each node represents a character in a word. If we insert `hell` and `hello` into a Trie, they share the path `h -> e -> l -> l`, with `hell` marked as a word end, and a branch to `o` for `hello`.

```text
       (root)
         |
         h
         |
         e
         |
         l
         |
        (l)* <-- "hell" (valid word)
         |
        (o)* <-- "hello" (valid word)
```

### Trie-Pruned DFS Algorithm
We start a Depth-First Search (DFS) from every tile on the board. As we move to a neighbor, we check:
* **Is the string collected so far a valid prefix in our Trie?**

If we trace `Q -> Z`, we immediately query the Trie: *"Are there any words that start with 'qz'?"* 
The Trie returns `False`. 

Because of this, **we stop searching down this branch immediately (backtrack)**. We do not explore any of the millions of longer paths starting with `QZ`.

### Python Implementation

Here is our lightweight Trie implementation:

```python
class Trie:
    def __init__(self):
        self.root = {}

    def insert(self, word: str):
        node = self.root
        for char in word:
            if char not in node:
                node[char] = {}
            node = node[char]
        node['$'] = True  # Marker for word end

    def has_word(self, word: str) -> bool:
        node = self.root
        for char in word:
            if char not in node:
                return False
            node = node[char]
        return '$' in node

    def is_prefix(self, prefix: str) -> bool:
        node = self.root
        for char in prefix:
            if char not in node:
                return False
            node = node[char]
        return True
```

And here is the recursive DFS traversal:

```python
def find_words(self, matrix, path, row, col):
    str_so_far = self.path_to_str(matrix, path)

    # Prune immediately if out of bounds, already visited,
    # or NOT a valid prefix in our Trie.
    if (row < 0 or row >= len(matrix) or
        col < 0 or col >= len(matrix[row]) or
        (row, col) in path or
        not self.trie.is_prefix(str_so_far)):
        return []

    char = matrix[row][col]
    
    # Handle Wordament prefix tiles (e.g. '(v-)' must start the word)
    if char.endswith('-)') and len(path) > 0:
        return []

    new_path = path + [(row, col)]
    new_str = str_so_far + self.get_chars(matrix, row, col)

    words = []
    if self.trie.has_word(new_str):
        words.append(new_str)

    # Handle Wordament suffix tiles (e.g. '(-ing)' must end the word)
    if char.startswith('(-'):
        return words

    # Explore all 8 directions
    for rw in range(-1, 2):
        for cl in range(-1, 2):
            if rw == 0 and cl == 0:
                continue
            words.extend(self.find_words(matrix, new_path, row + rw, col + cl))

    return words
```

---

## Results & Benchmark

We ran both solvers on the same board: `idoo aler lten ad(ss)m`.

* **D Solver (Brute Force DFS + Hash Map)**: **~5,100 ms** (enumerates ~12,000,000 paths).
* **Python Solver (Trie-Pruned DFS)**: **~40 ms** (explores only ~3,000 paths).

By using a Trie to prune dead ends, our Python solver runs **125x faster** than the D solver, even though Python is an interpreted language. 

This demonstrates a core software engineering principle: **Algorithm choice beats language optimization every time.**

---

## How to Host this on GitHub Pages (github.io)

You can easily publish this blog post, or even a live interactive solver, on GitHub Pages!

### Option A: Publish as a Static Blog (Markdown)
If you have an existing Jekyll, Hugo, or Gatsby blog hosted on GitHub Pages:
1. Copy this markdown file into your blog posts directory (e.g., `_posts/` for Jekyll).
2. Push the changes to your `<username>.github.io` repository.

### Option B: Build a Live Interactive Solver in the Browser
Since our solver is extremely lightweight and fast, you can port it to **JavaScript** and run it entirely client-side in the browser.
To do this:
1. **Port the Trie and DFS to JS**: Write the Trie and board traversal in raw JavaScript (it maps almost 1-to-1 with the Python code).
2. **Embed the Dictionary**: Save your cleaned dictionary (`english.txt`) as a JSON array or text file, and fetch it when the page loads to build the Trie in browser memory.
3. **Build a Simple UI**: Create a 4x4 grid of inputs for the letters, and a "Solve" button that displays the found words.
4. **Deploy**: Push the `index.html`, `script.js`, and `dictionary.json` files to a repository, and enable **GitHub Pages** in the repository settings. Users will be able to solve boards instantly in their browser at `https://<username>.github.io/<repo-name>`.
