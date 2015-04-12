# Wordament-solver

This is wordament solver allows you to solve the wordament game. It
heavily relies on a dictionary of words that can be found in
config/english.json

If the wordament board looks as follows:



| **o** | **l** | **h** | **g** |
| ----- | ----- | ----- | ----- |
| **t** | **o** | **o** | **p** |
| **t** | **r** | **d** | **s** |
| **s** | **i** | **n** | **t** |

You can solve it using:

```ruby
require 'wordament'
game = Wordament::Wordament.new
game.solve('olhg toop trds sint')
```
Resulting in something like this:

["ooh", "lot", "lotto", "loo", "loot", "loots", "loop", "loops", "lots", "lord", "lords", "log", "lop", "lost", "hoot", "hot", "hotrod", "hoop", "hoops", "hood", "hoods", "horn", "horns", "hod", "hog", "hoots", "hop", "hops", "host", "ghost", "goo", "good", "goods", "god", "gods", "too", "tool", "toot", "tot", "tots", "torts", "tori", "torn", "troop", "troops", "trot", "trots", "trod", "oops", "odin", "photo", "polo", "pool", "pooh", "poor", "port", "ports", "porn", "porns", "pod", "pods", "post", "tiro", "tin", "tins", "tint", "tints", "roo", "root", "rot", "roost", "rots", "rod", "rods", "roots", "rid", "rids", "rind", "rinds", "dolt", "doh", "dot", "door", "doors", "dots", "dor", "dog", "drool", "droop", "droops", "drop", "drops", "ditto", "dirt", "dirts", "distort", "din", "dint", "dints", "solo", "soh", "soot", "soots", "sop", "sort", "sorts", "sod", "spool", "spoor", "sport", "sports", "snits", "stool", "stoop", "stoops", "stood", "strop", "strops", "stir", "stint", "stints", "sit", "sir", "sin", "sins", "its", "idol", "ids", "indoor", "indoors", "ins", "nit", "nits"]

Notice that the words are ordered by the corner letter onwards.

*TODO: There are still some things missing that need improvement:*

* Add more words mn the dictionary.
* Add support for or tiles
* Add support for ending tiles
* Add support for starting tiles
* Add support for multi letter tiles

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
