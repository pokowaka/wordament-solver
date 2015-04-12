require 'wordament/version'
require 'trie'
require 'json'

module Wordament
  # A simple wordament solver using trie
  class Wordament
    attr_reader :trie, :words, :points
    DUTCH_SCORE = { 'E' => 1, 'N' => 1, 'A' => 1, 'O' => 1, 'I' => 1,
                    'D' => 2, 'R' => 2, 'S' => 2, 'T' => 2,
                    'G' => 3, 'K' => 3, 'L' => 3, 'M' => 3, 'B' => 3, 'P' => 3,
                    'U' => 4, 'F' => 4, 'H' => 4, 'J' => 4, 'V' => 4, 'Z' => 4,
                    'C' => 5, 'W' => 5,
                    'X' => 8, 'Y' => 8,
                    'Q' => 10 }
    ENGLISH_SCORE = { 'A' => 2, 'B' => 5, 'C' => 3, 'D' => 3, 'E' => 1,
                      'G' => 4, 'F' => 5, 'H' => 4, 'I' => 2, 'J' => 7,
                      'K' => 6, 'L' => 3, 'M' => 4, 'N' => 2, 'O' => 2,
                      'P' => 4, 'Q' => 10, 'R' => 2, 'S' => 2, 'T' => 2,
                      'U' => 4, 'X' => 9, 'V' => 5, 'W' => 6, 'Y' => 5,
                      'Z' => 8 }

    def initialize(file = File.dirname(__FILE__) + '/../config/english.json',
                   points = ENGLISH_SCORE)
      @words = JSON.load(File.read(file))
      @trie = Trie.new
      @points = points
      @words.each do |word|
        @trie.add word.downcase
      end
    end

    def score(word)
      word.upcase.each_char.inject(0) { |a, e| a + @points[e] }
    end

    def children?(node, prefix)
      return true if prefix.empty?
      return false if node.nil?
      children?(node.walk(prefix[0]), prefix[1, prefix.size])
    end

    def path_to_str(matrix, path)
      path.map { |loc| matrix[loc[:row]][loc[:col]] }.join('')
    end

    def seen?(prefix, row, col)
      prefix.any? { |l| l[:row] == row && l[:col] == col }
    end

    def find_words(matrix, prefix, row, col)
      str = path_to_str(matrix, prefix)

      # are we moving of the board?
      # or moving to something we've already seen?
      # or are there no more words.
      if row < 0 || row >= matrix.size || col < 0 || col >= matrix[0].size ||
         seen?(prefix, row, col) || !children?(@trie.root, str)
        return []
      end

      # We need to dupe this array!
      prefix = prefix.dup << { row: row, col: col }
      str += matrix[row][col]
      words = []
      words << str if @trie.has_key?(str)

      # Go around the diagonal
      (-1..1).each do |rw|
        (-1..1).each do |cl|
          words << find_words(matrix, prefix, row + rw, col + cl)
        end
      end

      words.flatten
    end

    # solves a wordament board. a board is basically a series of strings:
    # for example solve("olhg toop trds sint")
    def solve(board)
      list = board.gsub(/\s+/m, ' ').gsub(/^\s+|\s+$/m, '').split(' ')
      matrix = list.map { |line| line.split('') }
      words = []
      (0..matrix.size).each do |row|
        (0..matrix[0].size).each do |col|
          words << find_words(matrix, [], row, col)
        end
      end
      words.flatten.select { |word| word.size > 2 }.uniq
    end
  end
end
