# https://adventofcode.com/2021/day/5

import os
import re
from typing import Dict, List, NamedTuple

Point = NamedTuple('Point', [('x', int), ('y', int)])
Line = NamedTuple('Line', [('start', Point), ('end', Point)])


def parse_input(input: str) -> List[Line]:
    lines: List[Line] = []
    pattern = r'(\d+),(\d+) -> (\d+),(\d+)'

    for strLine in input.splitlines():
        matches = re.findall(pattern, strLine)[0]

        lines.append(Line(Point(int(matches[0]), int(matches[1])), Point(
            int(matches[2]), int(matches[3]))))

    return lines


def part1(input: str) -> str:
    lines = parse_input(input)
    overlaps: Dict[int, Dict[int, int]] = {}

    for line in lines:
        if line.start.x == line.end.x:
            for y in range(min(line.start.y, line.end.y), max(line.start.y, line.end.y) + 1):
                if line.start.x not in overlaps:
                    overlaps[line.start.x] = {}

                if y not in overlaps[line.start.x]:
                    overlaps[line.start.x][y] = 0

                overlaps[line.start.x][y] += 1
        elif line.start.y == line.end.y:
            for x in range(min(line.start.x, line.end.x), max(line.start.x, line.end.x) + 1):
                if x not in overlaps:
                    overlaps[x] = {}

                if line.start.y not in overlaps[x]:
                    overlaps[x][line.start.y] = 0

                overlaps[x][line.start.y] += 1

    answer = 0

    for x in overlaps:
        for y in overlaps[x]:
            if overlaps[x][y] > 1:
                answer += 1

    return str(answer)


def part2(input: str) -> str:
    lines = parse_input(input)
    overlaps: Dict[int, Dict[int, int]] = {}

    for line in lines:
        # horizontal
        if line.start.x == line.end.x:
            for y in range(min(line.start.y, line.end.y), max(line.start.y, line.end.y) + 1):
                if line.start.x not in overlaps:
                    overlaps[line.start.x] = {}

                if y not in overlaps[line.start.x]:
                    overlaps[line.start.x][y] = 0

                overlaps[line.start.x][y] += 1
        # vertical
        elif line.start.y == line.end.y:
            for x in range(min(line.start.x, line.end.x), max(line.start.x, line.end.x) + 1):
                if x not in overlaps:
                    overlaps[x] = {}

                if line.start.y not in overlaps[x]:
                    overlaps[x][line.start.y] = 0

                overlaps[x][line.start.y] += 1
        # diagonal
        elif abs(line.start.x - line.end.x) == abs(line.start.y - line.end.y):
            min_x_point = line.start if line.start.x < line.end.x else line.end
            max_x_point = line.end if line.start.x < line.end.x else line.start

            for x in range(min_x_point.x, max_x_point.x + 1):
                distance = x - min_x_point.x
                y = min_x_point.y + distance * \
                    (1 if max_x_point.y > min_x_point.y else -1)

                if x not in overlaps:
                    overlaps[x] = {}

                if y not in overlaps[x]:
                    overlaps[x][y] = 0

                overlaps[x][y] += 1

    answer = 0

    for x in overlaps:
        for y in overlaps[x]:
            if overlaps[x][y] > 1:
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
