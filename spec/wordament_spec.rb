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
    expect(list.children?(list.trie.root, 'hel')).to eq(true)
    expect(list.children?(list.trie.root, 'hello')).to eq(true)
  end

  it 'should have children should not contain helllo' do
    expect(list.children?(list.trie.root, 'helllo')).to eq(false)
  end

  it 'should have visited point' do
    expect(list.seen?([{ row: 1, col: 1 }], 1, 1)).to eq(true)
  end

  it 'should find a set of words' do
    m = [%w(h e l l o)]
    expect(list.find_words(m, [], 0, 0)).to eq(%w(he hell hello))
  end

  it 'should solve the wordament' do
    words = list.solve('hell aloo')
    res = %w(hell hello heal hale hall hallo halo
             ell lea loo loll ale all aloe ole)
    expect(words).to eq(res)
  end
end
