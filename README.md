# Wordament-solver

This Wordament solver allows you to solve the Wordament game. It
heavily relies on a dictionary of words that can be found in
config/english.txt

If the wordament board looks as follows:



| **i** | **d** | **o** | **o** |
| ----- | ----- | ----- | ----- |
| **a** | **l** | **e** | **r** |
| **l** | **t** | **e** | **n** |
| **a** | **d** | **ss** | **m** |

You can solve it using:

```python
from wordament import Wordament
game = Wordament()
game.solve('idoo aler lten ad(ss)m')
```
Resulting in 297 words:

['idol', 'idola', 'idolater', 'idle', 'idler', 'idleness', 'idled', 'ide', 'idee', 'ill', 'dial', 'dialer', 'dialed', 'dialler', 'dialled', 'dilate', 'dilater', 'dilated', 'dill', 'doo', 'door', 'doorn', 'dol', 'dolia', 'dole', 'doll', 'dolt', 'doled', 'doe', 'doer', 'doen', 'dor', 'dore', 'doree', 'dal', 'dali', 'dale', 'dalt', 'daled', 'dalle', 'date', 'dateless', 'dater', 'dated', 'data', 'datal', 'dataller', 'del', 'deli', 'delo', 'delate', 'delated', 'dell', 'delt', 'delta', 'dele', 'deled', 'dero', 'dere', 'dered', 'dern', 'detail', 'detailer', 'detailed', 'deter', 'dee', 'deer', 'deet', 'deen', 'deed', 'deem', 'den', 'dene', 'denet', 'oda', 'odal', 'odaller', 'ode', 'oor', 'olid', 'old', 'older', 'olden', 'oldened', 'ole', 'oleo', 'olla', 'ore', 'aid', 'aidless', 'aide', 'aider', 'ail', 'ailed', 'ado', 'adore', 'adored', 'adorn', 'adorned', 'adeem', 'alder', 'aldern', 'alod', 'aloe', 'aloed', 'ale', 'alee', 'all', 'alt', 'alter', 'altered', 'altern', 'alterne', 'allod', 'allee', 'ala', 'alate', 'alated', 'ate', 'lid', 'lido', 'lod', 'lode', 'loden', 'loo', 'looed', 'loor', 'lor', 'lore', 'lorn', 'laid', 'lad', 'lade', 'lader', 'laden', 'ladened', 'lat', 'late', 'lated', 'later', 'lateen', 'laten', 'latened', 'lateness', 'led', 'lere', 'lered', 'let', 'lee', 'leer', 'leet', 'leed', 'less', 'edile', 'eliad', 'eld', 'elate', 'elater', 'elated', 'ell', 'elt', 'ere', 'ered', 'ern', 'erne', 'erned', 'eta', 'eten', 'eel', 'een', 'enrol', 'enroll', 'ene', 'rod', 'rodless', 'rode', 'rodeo', 'roo', 'role', 'roll', 'roe', 'roed', 'rood', 'red', 'redia', 'redial', 'redialed', 'redialled', 'redo', 'redate', 'redated', 'reo', 'relaid', 'relate', 'related', 'relata', 'relet', 'ret', 'retail', 'retailed', 'rete', 'retell', 'retem', 'ree', 'reel', 'reen', 'reed', 'ren', 'relide', 'redtail', 'rem', 'ladle', 'ladler', 'ladled', 'tai', 'tail', 'tailor', 'tailored', 'tailoress', 'tailed', 'tailer', 'tad', 'tali', 'tale', 'taler', 'tall', 'taller', 'tala', 'ted', 'tel', 'telia', 'telial', 'teld', 'tela', 'tell', 'tele', 'tern', 'terne', 'terned', 'tee', 'teel', 'teer', 'teen', 'teed', 'teem', 'ten', 'tene', 'teredo', 'elide', 'elder', 'erode', 'ess', 'ned', 'nerol', 'neroli', 'net', 'netless', 'nete', 'nee', 'neeld', 'need', 'neem', 'ness', 'allodia', 'mel', 'meld', 'melder', 'melodia', 'mela', 'mell', 'melt', 'melted', 'melter', 'mee', 'meed', 'meer', 'meet', 'mere', 'mered', 'merel', 'merell', 'met', 'meta', 'metad', 'metal', 'metaler', 'metalled', 'mete', 'meted', 'meteor', 'meter', 'men', 'mene', 'mened', 'med', 'medal', 'medalled', 'mess']

Notice that the words are ordered by the corner letter onwards.
Solving this took **~0.04 sec** in Python (a 50x speedup over the original Ruby version).


* The dictionary is now the official tournament list (SOWPODS) for English, which is much cleaner and removes possessive words like `aal's` and garbage proper nouns.

## On the running complexity

The wordament problem can be understood as a graph where each vertex is
a letter. Where edges exist between neighboring nodes. A word is just a
path between a starting vertex and an ending vertex.
`
If every path would be valid (that is ever path is a word in the
dictionary), then the problem is reduced to finding every path between
every pair of vertices in the graph. Unfortunately the number of these
paths is exponential. Even counting the number of paths is a [Sharp
P](https://en.wikipedia.org/wiki/Sharp-P) [hard
problem](http://jgaa.info/accepted/2007/RobertsKroese2007.11.1.pdf).

Luckily we don't have to enumerate all the paths as we can restrict the
number of valid paths in our graph significantly. By making use of a
[trie](https://en.wikipedia.org/wiki/Trie) data structure.

We load the entire dictionary into a trie. The following will hold for
our trie:

- Every node holds a letter, and a value indicating whether this path to
  the root is a valid word.
- A path to a leaf node is always a valid word.

We can now use our trie to navigate through our graph:

- A path s ~~> t is valid iff the path occurs in the trie.
- If the path s ~~> t is valid, then the path s ~~> t ~> t' is valid iff
  s ~~> t ~> t' occurs in the trie.

The above gives enough infomation to enumerate all possible paths in our
wordament graph We simply start with the first letter, and trie the
neighbors if our trie allows this!

This still leaves the problem NP-hard, because in the worst case
scenario every possible path is also a word in the dictionary. However
in practical terms this is very, very unlikely. Many paths in the graph
are invalid since they will not form valid words.

For example in the matrix above you will see that m-n is a possible
path, however there are no word in the dictionary that contain m
followed by n. Hence those paths will not be explored.

## Installation

Install the package locally:

```bash
pip install .
```

## Usage

### Command Line Interface

You can run the solver directly from the command line:

```bash
python -m wordament "board_string" [options]
```

#### Examples

1. **Solve a basic board:**
   ```bash
   python -m wordament "hell aloo"
   ```

2. **Solve a board and sort results by score:**
   ```bash
   python -m wordament "hell aloo" --sort-by-score
   ```

3. **Use a custom dictionary and Dutch scoring:**
   ```bash
   python -m wordament "hell aloo" -d path/to/dutch.txt -l dutch
   ```

4. **Passing rows as separate arguments:**
   ```bash
   python -m wordament hell aloo
   ```

#### Options

* `board`: The Wordament board. Specify as space-separated rows. You can pass them as a single quoted string or as multiple arguments.
* `-d`, `--dict`: Path to a custom dictionary text file (one word per line).
* `-l`, `--lang`: Language scoring system to use (`english` or `dutch`). Default is `english`.
* `-p`, `--points`: Path to a JSON file containing custom letter point values, or an inline JSON string (e.g., `'{"A": 2, "B": 3}'`).
* `--sort-by-score`: Sort the found words by their score in descending order (highest score first).

### Programmatic Usage

You can also use the solver in your Python code:

```python
from wordament import Wordament

# Initialize with default English dictionary and points
solver = Wordament()

# Or initialize with custom points dict
solver_custom_dict = Wordament(points={'H': 10, 'E': 1, 'L': 1, 'O': 1})

# Or load points from a JSON file
solver_custom_file = Wordament(points='path/to/custom_points.json')

# Solve a board
words = solver.solve("hell aloo")
print(f"Found {len(words)} words.")

# Calculate score of a word
score = solver.score("hello")
print(f"Score of 'hello': {score}")
```

## Development

After checking out the repo, you can run the tests using:

```bash
python -m unittest tests/test_solver.py
```
## Contributing

1. Fork it ( https://github.com/pokowaka/wordament-solver)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
