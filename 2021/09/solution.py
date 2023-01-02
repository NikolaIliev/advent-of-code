# https://adventofcode.com/2021/day/9

from functools import reduce
import operator
import os
from typing import Dict, List, Literal, TypedDict, Union

Point2D = TypedDict('Point2D', {"row": int, "col": int})
Direction = Literal['up', 'right', 'down', 'left']


def parse_input(input: str) -> List[List[int]]:
    matrix: List[List[int]] = []

    for line in input.splitlines():
        matrix.append([])
        for c in line:
            matrix[-1].append(int(c))

    return matrix


def get_matrix_point_at_direction(matrix: List[List[int]], point: Point2D, direction: Direction) -> Union[Point2D, None]:
    if direction == 'up':
        return Point2D(row=point["row"] - 1, col=point["col"]) if point["row"] > 0 else None
    elif direction == 'right':
        return Point2D(row=point["row"], col=point["col"] + 1) if point["col"] < len(matrix[0]) - 1 else None
    elif direction == 'down':
        return Point2D(row=point["row"] + 1, col=point["col"]) if point["row"] < len(matrix) - 1 else None
    elif direction == 'left':
        return Point2D(row=point["row"], col=point["col"] - 1) if point["col"] > 0 else None


def is_low_point(matrix: List[List[int]], point: Point2D) -> bool:
    value = matrix[point["row"]][point["col"]]
    up = get_matrix_point_at_direction(matrix, point, "up")
    right = get_matrix_point_at_direction(matrix, point, "right")
    down = get_matrix_point_at_direction(matrix, point, "down")
    left = get_matrix_point_at_direction(matrix, point, "left")

    return ((up is None or value < matrix[up["row"]][up["col"]]) and
            (right is None or value < matrix[right["row"]][right["col"]]) and
            (down is None or value < matrix[down["row"]][down["col"]]) and
            (left is None or value < matrix[left["row"]][left["col"]]))

# returns size of basin


Context = TypedDict(
    'Context', {'count': int, "visited": Dict[int, Dict[int, bool]]})


def discover_basin(matrix: List[List[int]], point: Point2D, context: Context):
    if matrix[point["row"]][point["col"]] == 9:
        return

    if point["row"] in context["visited"] and point["col"] in context["visited"][point["row"]]:
        return

    if point["row"] not in context["visited"]:
        context["visited"][point["row"]] = {}

    context["visited"][point["row"]][point["col"]] = True

    context["count"] += 1

    up = get_matrix_point_at_direction(matrix, point, "up")
    if up is not None:
        discover_basin(matrix, up, context)

    right = get_matrix_point_at_direction(matrix, point, "right")
    if right is not None:
        discover_basin(matrix, right, context)

    down = get_matrix_point_at_direction(matrix, point, "down")

    if down is not None:
        discover_basin(matrix, down, context)

    left = get_matrix_point_at_direction(matrix, point, "left")
    if left is not None:
        discover_basin(matrix, left, context)


def part1(input: str) -> str:
    matrix = parse_input(input)
    risk_levels_sum = 0

    for row in range(0, len(matrix)):
        for col in range(0, len(matrix[row])):
            if is_low_point(matrix, Point2D(row=row, col=col)):
                risk_levels_sum += 1 + matrix[row][col]

    return str(risk_levels_sum)


def part2(input: str) -> str:
    matrix = parse_input(input)
    basin_sizes: List[int] = []

    for row in range(0, len(matrix)):
        for col in range(0, len(matrix[row])):
            point = Point2D(row=row, col=col)
            if is_low_point(matrix, point):
                context: Context = {"count": 0, "visited": {}}
                discover_basin(matrix, point, context)
                basin_sizes.append(context["count"])

    basin_sizes.sort(reverse=True)

    return str(reduce(operator.mul, basin_sizes[0:3]))


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
