import argparse
import sys
from .solver import Wordament, ENGLISH_SCORE, DUTCH_SCORE

def main():
    parser = argparse.ArgumentParser(
        description="Solve Wordament boards using a Trie-backed DFS algorithm."
    )
    parser.add_argument(
        'board',
        nargs='+',
        help=(
            "The Wordament board. Specify as space-separated rows "
            "(e.g., 'hell aloo'). You can pass rows as separate arguments."
        )
    )
    parser.add_argument(
        '-d', '--dict',
        dest='dictionary',
        help="Path to a custom dictionary text file (one word per line)."
    )
    parser.add_argument(
        '-l', '--lang',
        choices=['english', 'dutch'],
        default='english',
        help="Language scoring system to use (default: english)."
    )
    parser.add_argument(
        '--sort-by-score',
        action='store_true',
        help="Sort the found words by their score in descending order."
    )

    args = parser.parse_args()

    # Join multiple board arguments if they were passed separately
    board_str = " ".join(args.board)

    # Determine scoring system
    points = DUTCH_SCORE if args.lang == 'dutch' else ENGLISH_SCORE

    try:
        solver = Wordament(dictionary_file=args.dictionary, points=points)
    except Exception as e:
        print(f"Error initializing solver: {e}", file=sys.stderr)
        sys.exit(1)

    print(f"Solving board: {board_str}")
    words = solver.solve(board_str)

    if not words:
        print("No words found.")
        return

    print(f"\nFound {len(words)} words:")

    if args.sort_by_score:
        # Sort by score descending, then by word alphabetically
        word_scores = [(w, solver.score(w)) for w in words]
        word_scores.sort(key=lambda x: (-x[1], x[0]))
        for word, score in word_scores:
            print(f"  {word:<15} (Score: {score})")
    else:
        # Just print in the order found (corner onwards)
        for word in words:
            print(f"  {word}")

if __name__ == '__main__':
    main()
