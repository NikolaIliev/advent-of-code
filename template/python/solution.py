# https://adventofcode.com/%year%/day/%day%

import os
from pathlib import Path

def part1(input: str) -> str:
    return ""

def part2(input: str) -> str:
    return ""

def main():
    with open(os.path.join(os.path.dirname(__file__), './input.data')) as f:
        input = f.read()

        print("\n=========")
        print("\nSolution (Part 1):\n" + part1(input))
        print("\n=========")
        print("\nSolution (Part 2):\n" + part2(input))
        print("\n=========")

if __name__ == "__main__":
    main()