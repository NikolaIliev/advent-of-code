# https://adventofcode.com/2021/day/3

import os
from pathlib import Path
from typing import List, TypedDict


class Point2D:
    x: int
    y: int

    def __init__(self, x: int, y: int):
        self.x = x
        self.y = y

    def __eq__(self, __o: object) -> bool:
        if isinstance(__o, Point2D):
            return self.x == __o.x and self.y == __o.y

        return False

    def __repr__(self) -> str:
        return f"({self.x},{self.y})"

    def __hash__(self) -> int:
        return self.x + 10000 * self.y


Input = TypedDict(
    'Input', {"points": set[Point2D], "folds": List[Point2D]})


def parse_input(input: str) -> Input:
    points: set[Point2D] = set([])
    folds: List[Point2D] = []

    parts = input.split('\n\n')
    pointsStr = parts[0]

    for pointStr in pointsStr.splitlines():
        coordParts = pointStr.split(',')
        points.add(Point2D(int(coordParts[0]), int(coordParts[1])))

    foldsStr = parts[1]

    for foldStr in foldsStr.splitlines():
        foldStr = foldStr.replace("fold along ", "")
        foldParts = foldStr.split('=')

        if foldParts[0] == "x":
            folds.append(Point2D(int(foldParts[1]), 0))
        else:
            folds.append(Point2D(0, int(foldParts[1])))

    return {"points": points, "folds": folds}


def fold(points: set[Point2D], along: Point2D) -> set[Point2D]:
    new_points: set[Point2D] = set([])

    for point in points:
        if along.x > 0:
            if point.x > along.x:
                new_points.add(Point2D(along.x - (point.x - along.x), point.y))
            else:
                new_points.add(point)

        if along.y > 0:
            if point.y > along.y:
                new_points.add(Point2D(point.x, along.y - (point.y - along.y)))
            else:
                new_points.add(point)

    return new_points


def part1(input: str) -> str:
    parsed_input = parse_input(input)

    parsed_input["points"] = fold(
        parsed_input["points"], parsed_input["folds"][0])

    return str(len(parsed_input["points"]))


def points_to_str(points: set[Point2D]) -> str:
    width = 0
    height = 0

    for point in points:
        width = max(width, point.x + 1)
        height = max(height, point.y + 1)

    matrix: List[List[str]] = []

    for row in range(0, height):
        matrix.append([])
        for _ in range(0, width):
            matrix[row].append('.')

    for point in points:
        matrix[point.y][point.x] = '#'

    return '\n'.join(map(lambda row: ''.join(row), matrix))


def part2(input: str) -> str:
    parsed_input = parse_input(input)

    for fold_along in parsed_input["folds"]:
        parsed_input["points"] = fold(parsed_input["points"], fold_along)

    return points_to_str(parsed_input["points"])


def main() -> None:
    with open(os.path.join(os.path.dirname(__file__), './input.data')) as f:
        input = f.read()

        print("\n=========")
        print("\nSolution (Part 1):\n" + part1(input))
        print("\n=========")
        print("\nSolution (Part 2):\n" + part2(input))
        print("\n=========")


if __name__ == "__main__":
    main()
