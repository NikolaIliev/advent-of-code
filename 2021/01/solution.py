# https://adventofcode.com/2021/day/1

import os
from pathlib import Path

def part1(input: str) -> str:
    answer = 0

    lines = input.splitlines()

    for i in range(1, len(lines)):
        if int(lines[i]) > int(lines[i - 1]):
            answer += 1

    return str(answer)

def part2(input: str) -> str:
    answer = 0

    lines = input.splitlines()

    for i in range(3, len(lines)):
        if (int(lines[i]) + int(lines[i - 1]) + int(lines[i - 2]) > int(lines[i - 1]) + int(lines[i - 2]) + int(lines[i - 3])):
            answer += 1

    return str(answer)

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