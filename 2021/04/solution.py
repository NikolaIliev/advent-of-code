# https://adventofcode.com/2021/day/4

import os
from pathlib import Path
from typing import List, Union
from typing_extensions import NamedTuple
from dataclasses import dataclass
from functools import reduce


@dataclass
class BoardNode:
    n: int
    marked: bool


class Board:
    matrix: List[List[BoardNode]]

    def __init__(self, matrix: List[List[int]]):
        self.matrix = list(map(lambda row: list(map(
            lambda n: BoardNode(n, False), row)), matrix))

    def mark(self, number: int):
        for row in self.matrix:
            for node in row:
                if node.n == number:
                    node.marked = True

    def has_bingo(self) -> bool:
        bingo_rows = reduce(lambda sum, row: sum + (
            1 if all(map(lambda node: node.marked, row)) else 0), self.matrix, 0)

        bingo_cols = reduce(lambda sum, col: sum + all(map(lambda row: self.matrix[row][col].marked, range(
            0, len(self.matrix)))), range(0, len(self.matrix[0])), 0)

        return bingo_rows + bingo_cols > 0

    def get_score(self, multiplier: int) -> int:
        sum_of_unmarked = 0

        for row in self.matrix:
            for node in row:
                sum_of_unmarked += node.n if not node.marked else 0

        return sum_of_unmarked * multiplier


@ dataclass
class Input:
    drawn_numbers: List[int]
    boards: List[Board]


def parse_input(input: str) -> Input:
    lines = input.splitlines()
    drawnNumbers: List[int] = list(map(lambda s: int(s), lines[0].split(",")))
    boards: List[Board] = []

    for i in range(1, len(lines)):
        if lines[i] == "":
            boards.append(Board([]))
        else:
            boards[-1].matrix.append(list(map(lambda s: BoardNode(int(s.strip(' ')), False),
                                              filter(lambda s: len(s) > 0, lines[i].split(' ')))))

    return Input(drawnNumbers, boards)


def part1(input: str) -> str:
    parsed_input = parse_input(input)

    for drawn_number in parsed_input.drawn_numbers:
        for board in parsed_input.boards:
            board.mark(drawn_number)
            if board.has_bingo():
                return str(board.get_score(drawn_number))

    return "0"


def part2(input: str) -> str:
    parsed_input = parse_input(input)
    score = 0

    for drawn_number in parsed_input.drawn_numbers:
        for board in parsed_input.boards:
            if not board.has_bingo():
                board.mark(drawn_number)
                if board.has_bingo():
                    score = board.get_score(drawn_number)

    return str(score)


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
