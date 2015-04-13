require 'spec_helper'
require 'wordament'
require 'matrix'

describe Wordament do
  let(:list) { Wordament::Wordament.new }

  it 'should count the words' do
    expect(list.score('hello')).to eq(13)
  end

  it 'should ignore case' do
    expect(list.score('HeLlO')).to eq(13)
  end

  it 'should have children returns true for substrings of hello' do
    expect(list.children?(list.trie.root, 'hel', 0)).to eq(true)
    expect(list.children?(list.trie.root, 'hello', 0)).to eq(true)
  end

  it 'should have children should not contain helllo' do
    expect(list.children?(list.trie.root, 'helllo', 0)).to eq(false)
  end

  it 'should have visited point' do
    expect(list.seen?([{ row: 1, col: 1 }], 1, 1)).to eq(true)
  end

  it 'should not return special chars' do
    m = [%w((-h) (e-) -l l- o)]
    expect(list.get_chars(m, 0, 0)).to eq('h')
    expect(list.get_chars(m, 0, 1)).to eq('e')
    expect(list.get_chars(m, 0, 2)).to eq('l')
  end
  it 'should find a set of words' do
    m = [%w(h e l l o)]
    expect(list.find_words(m, [], 0, 0)).to eq(%w(h he hel hell hello))
    # Hel - the Norse goddess of the dead and queen of the underworld
  end

  it 'should find a one word that starts with a v' do
    expect(list.solve('mo(v-)ie')).to eq(%w(vie))
  end

  it 'should solve the wordament' do
    words = list.solve('hell aloo')
    res = %w(hel hell hello helo heal hela heo hae hale hall halloo halo
             ell ela lea leal leo loe lolo loo loll ale all allo alloo
             alo aloe lah olea olla ola oleo)
    expect(words).to eq(res)
  end

  it 'should find words that end with ing' do
    words = list.solve("(-ing)abc defs soew chun")
    expect(words.size).to be > 1
    expect(words.select { |l| l.include?('ing') && !l.end_with?('ing') }).to eq([])
  end
end
