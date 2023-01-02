# https://adventofcode.com/2021/day/1

import os
from pathlib import Path
from typing import Dict, List


def parse_input(input: str) -> List[List[int]]:
    matrix: List[List[int]] = []

    for row in input.splitlines():
        matrix.append([])
        for s in row:
            matrix[-1].append(int(s))

    return matrix


def increment_all(matrix: List[List[int]]):
    for row, _ in enumerate(matrix):
        for col, _ in enumerate(matrix[row]):
            matrix[row][col] += 1


def increment_surrounding(matrix: List[List[int]], row: int, col: int):
    # top
    if row > 0:
        matrix[row - 1][col] += 1

        # top-left
        if col > 0:
            matrix[row-1][col-1] += 1

        # top-right
        if col < len(matrix[row - 1]) - 1:
            matrix[row - 1][col + 1] += 1

    # bottom
    if row < len(matrix) - 1:
        matrix[row + 1][col] += 1

        # bottom-left
        if col > 0:
            matrix[row + 1][col - 1] += 1

        # bottom-right
        if col < len(matrix[row - 1]) - 1:
            matrix[row + 1][col + 1] += 1

    # left
    if col > 0:
        matrix[row][col - 1] += 1

    # right
    if col < len(matrix[row]) - 1:
        matrix[row][col + 1] += 1


def handle_flashing(matrix: List[List[int]]):
    flashes = 0
    flashed_coords: Dict[int, Dict[int, bool]] = {}

    while True:
        new_flashes = 0

        for row, _ in enumerate(matrix):
            for col, _ in enumerate(matrix[row]):
                if matrix[row][col] > 9 and (row not in flashed_coords or col not in flashed_coords[row]):
                    flashes += 1
                    new_flashes += 1

                    if row not in flashed_coords:
                        flashed_coords[row] = {}

                    flashed_coords[row][col] = True
                    increment_surrounding(matrix, row, col)

        if new_flashes == 0:
            break

    return flashes


def cap(matrix: List[List[int]]):
    for row, _ in enumerate(matrix):
        for col, _ in enumerate(matrix[row]):
            if matrix[row][col] > 9:
                matrix[row][col] = 0


def part1(input: str) -> str:
    matrix = parse_input(input)
    flashes = 0

    for _ in range(0, 100):
        increment_all(matrix)
        flashes += handle_flashing(matrix)
        cap(matrix)

    return str(flashes)


def part2(input: str) -> str:
    matrix = parse_input(input)
    step = 0

    while True:
        step += 1
        increment_all(matrix)
        flashes = handle_flashing(matrix)

        if flashes == len(matrix) ** 2:
            return str(step)

        cap(matrix)


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
