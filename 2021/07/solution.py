# https://adventofcode.com/2021/day/7

from functools import reduce
from math import ceil, floor
import os
from typing import List


def parse_input(input: str) -> List[int]:
    return list(map(lambda s: int(s), input.split(',')))


def part1(input: str) -> str:
    positions = parse_input(input)
    positions.sort()
    align_to = positions[floor(len(positions) / 2)]

    return str(reduce(lambda sum, n: sum + abs(n - align_to), positions, 0))


def part2(input: str) -> str:
    positions = parse_input(input)
    # align to avg, optimise for least movement
    align_to = reduce(lambda sum, n: sum + n,
                      positions, 0) / len(positions)
    align_to_ceiled = ceil(align_to)
    align_to_floored = floor(align_to)

    return str(min(reduce(lambda sum, n: sum + floor(abs(n - align_to_ceiled) * (abs(n - align_to_ceiled) + 1) / 2), positions, 0), (reduce(lambda sum, n: sum + floor(abs(n - align_to_floored) * (abs(n - align_to_floored) + 1) / 2), positions, 0))))


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
