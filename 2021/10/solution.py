# https://adventofcode.com/2021/day/0

from math import floor
import os
from typing import List

openers = ["(", "[", "{", "<"]
closers = [")", "]", "}", ">"]
error_points = [3, 57, 1197, 25137]
autocomplete_points = [1, 2, 3, 4]


def part1(input: str) -> str:
    score = 0

    for line in input.splitlines():
        stack: List[str] = []

        for c in line:
            if c in openers:
                stack.append(c)
            else:
                opener = stack.pop()

                if openers.index(opener) != closers.index(c):
                    score += error_points[closers.index(c)]
                    break

    return str(score)


def part2(input: str) -> str:
    scores: List[int] = []

    for line in input.splitlines():
        stack: List[str] = []
        score = 0
        has_error = False

        for c in line:
            if c in openers:
                stack.append(c)
            else:
                opener = stack.pop()

                if openers.index(opener) != closers.index(c):
                    has_error = True
                    break

        if has_error:
            continue

        while len(stack) > 0:
            opener = stack.pop()
            score *= 5
            score += autocomplete_points[openers.index(opener)]

        scores.append(score)

    scores.sort()

    return str(scores[floor(len(scores) / 2)])


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
