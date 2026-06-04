# Wordament-solver

This is wordament solver allows you to solve the wordament game. It
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
Resulting in 393 words:

["ido", "idol", "idola", "idolater", "idolet", "ida", "idle", "idler", "idleness", "idled", "ide", "ideo", "ideta", "ilo", "ile", "ill", "dial", "dilo", "dilate", "dilater", "dilated", "dill", "doo", "door", "doored", "doorn", "doli", "dolia", "dola", "dole", "doll", "dolt", "doled", "doless", "doe", "doer", "doen", "dor", "dore", "doree", "dorn", "dail", "dali", "dalo", "dale", "daler", "dalet", "dalt", "dalteen", "daled", "dalle", "date", "dateless", "dater", "dated", "data", "datal", "dataller", "dle", "deli", "deloo", "delate", "delater", "delated", "dell", "della", "delt", "delta", "deltal", "dele", "deled", "dero", "dere", "dered", "dern", "derned", "detail", "detailer", "detailed", "deter", "detd", "dee", "deer", "deet", "deen", "deed", "deess", "deem", "den", "dene", "denet", "oda", "odal", "odaller", "ode", "odel", "odell", "odelet", "oder", "oor", "olid", "old", "older", "olden", "oldened", "ola", "oleo", "olla", "oelet", "oer", "ore", "ored", "oreo", "aid", "aidless", "aide", "aider", "ail", "aile", "ailed", "aillt", "ado", "ador", "adore", "adored", "adorn", "adorned", "adlet", "adless", "ade", "adet", "adeem", "aden", "alder", "aldern", "alden", "alo", "alod", "aloe", "aloed", "ale", "alee", "alen", "all", "alter", "altered", "altern", "alterne", "alem", "allo", "allod", "alloo", "aller", "allen", "allene", "ala", "alate", "alated", "alatern", "atli", "atle", "atlee", "ate", "ated", "atelo", "lid", "lido", "lod", "lode", "loden", "loo", "loor", "loe", "lor", "loro", "lore", "lored", "loren", "lorn", "lai", "laid", "lad", "lade", "lader", "laden", "ladened", "late", "lated", "later", "lateen", "laten", "latened", "lateness", "lata", "led", "leda", "leo", "ler", "lere", "lered", "let", "lete", "lee", "leer", "leet", "leed", "lene", "lld", "less", "lessn", "lem", "edo", "eole", "eli", "eliad", "eld", "elod", "ela", "elate", "elater", "elated", "ell", "elt", "erolia", "ere", "ered", "erne", "erned", "eta", "eten", "eel", "eer", "een", "ene", "ened", "rod", "rodlet", "rodless", "rode", "rodeo", "roo", "role", "roleo", "roll", "roe", "rood", "roodle", "rool", "red", "redia", "redial", "redilate", "redilated", "redo", "redate", "redated", "relaid", "relate", "related", "relata", "relet", "retail", "retailed", "retal", "retled", "rete", "retell", "retem", "ree", "reel", "reet", "reen", "reed", "reem", "renet", "relide", "relade", "reladen", "redtail", "ladle", "ladler", "ladled", "lalo", "ller", "tai", "tail", "tailor", "tailored", "tailoress", "tailed", "tailer", "tad", "tade", "tal", "tali", "tald", "tale", "taled", "taler", "tall", "talli", "taller", "tallero", "tala", "tlo", "ted", "teli", "telia", "telial", "teld", "tela", "tell", "tern", "terne", "terned", "tee", "teel", "teen", "teed", "teem", "ten", "tene", "teredo", "tem", "tss", "elide", "elder", "eldern", "erode", "ess", "ned", "neo", "neolater", "nerodia", "nerol", "neroli", "net", "netless", "nete", "neter", "neeld", "neela", "neet", "need", "neem", "ness", "alai", "allodia", "adelaide", "dess", "dem", "dalai", "sse", "ssed", "mel", "melia", "meld", "melder", "melodia", "melodial", "mela", "mell", "mellate", "melt", "melted", "melter", "mee", "meed", "meer", "meet", "mero", "mere", "mered", "merel", "merell", "met", "meta", "metad", "metal", "metaler", "metall", "metallide", "metaller", "mete", "meted", "meteor", "metel", "meter", "men", "mene", "mened", "medal", "mess"]

Notice that the words are ordered by the corner letter onwards.
Solving this took 1.9 sec, on an MacBook Pro with Intel Core i7@2.3 ghz


* The dictionary is now way too large (thanks
  [scowl](http://wordlist.aspell.net/)!), it finds more words than
wordament will actually accept. I mean what does
[telial](http://www.thefreedictionary.com/telial) even mean?

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

Luckilly we don't have to enumerate all the paths as we can restrict the
number of valid paths in our graph significantly. By making use of a
[trie](https://en.wikipedia.org/wiki/Trie) data structure.

We load the entire dictionary into a a trie. The following will hold for
our trie:

- Every node hold a letter, and a value indicating whether this path to
  the root is a valid word.
- A path to a lead node is always a valid word.

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

1. Fork it ( https://github.com/pokowaka/wordament)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
