# Wordament-solver

This is wordament solver allows you to solve the wordament game. It
heavily relies on a dictionary of words that can be found in
config/english.json

If the wordament board looks as follows:



| **i** | **d** | **o** | **o** |
| ----- | ----- | ----- | ----- |
| **a** | **l** | **e** | **r** |
| **l** | **t** | **e** | **n** |
| **a** | **d** | **ss** | **m** |

You can solve it using:

```ruby
require 'wordament'
game = Wordament::Wordament.new
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

Add this line to your application's Gemfile:

```ruby
gem 'wordament'
```

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install wordament

## Usage

TODO: Write usage instructions here

## Development

After checking out the repo, run `bin/setup` to install dependencies. Then, run `bin/console` for an interactive prompt that will allow you to experiment.

To install this gem onto your local machine, run `bundle exec rake install`. To release a new version, update the version number in `version.rb`, and then run `bundle exec rake release` to create a git tag for the version, push git commits and tags, and push the `.gem` file to [rubygems.org](https://rubygems.org).

## Contributing

1. Fork it ( https://github.com/pokowaka/wordament)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
