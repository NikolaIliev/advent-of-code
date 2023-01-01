# https://adventofcode.com/2021/day/6

from functools import reduce
import os
from math import floor
from pathlib import Path
from typing import Dict, List, NamedTuple

Day = NamedTuple("Day", [("total_fish", int), ("new_fish", int)])


def parse_input(input: str) -> List[int]:
    return list(map(lambda s: int(s), input.split(',')))


def simulate(fish_initial_days_left: List[int], total_days: int) -> int:
    new_fish_by_day: Dict[int, int] = {}
    fish_count_by_7_remainder: Dict[int, int] = {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0
    }

    for days_left in fish_initial_days_left:
        fish_count_by_7_remainder[(days_left + 1) % 7] += 1

    for day in range(0, total_days + 1):
        new_fish_by_day[day] = fish_count_by_7_remainder[day % 7]

        if day >= 8:
            fish_count_by_7_remainder[(day + 8) %
                                      7] += new_fish_by_day[day - 8]

    return len(fish_initial_days_left) + reduce(lambda sum, n: sum + n, new_fish_by_day.values(), 0)


def part1(input: str) -> str:
    return str(simulate(parse_input(input), 80))


def part2(input: str) -> str:
    return str(simulate(parse_input(input), 256))


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
