# https://adventofcode.com/2021/day/2

import copy
from dataclasses import dataclass
import os
from typing import Dict, List, TypedDict


class Cave:
    id: str
    connections: set['Cave']
    small: bool

    def __init__(self, id: str, small: bool, connections: set['Cave']):
        self.id = id
        self.small = small
        self.connections = connections


def parse_input(input: str) -> Cave:
    caves_by_id: Dict[str, Cave] = {
        "start": Cave("start", True, set([])), "end": Cave("end", True, set([]))}

    for line in input.splitlines():
        parts = line.split('-')
        start_id = parts[0]
        end_id = parts[1]

        if start_id not in caves_by_id:
            caves_by_id[start_id] = Cave(
                start_id, start_id[0].islower(), set([]))

        if end_id not in caves_by_id:
            caves_by_id[end_id] = Cave(end_id, end_id[0].islower(), set([]))

        caves_by_id[start_id].connections.add(caves_by_id[end_id])

        caves_by_id[end_id].connections.add(caves_by_id[start_id])

    return caves_by_id["start"]


Context = TypedDict('Context', {"total_paths": int})
Visited = TypedDict('Visited', {
                    "cave_ids": set[str], "allow_double_visit_of_small_cave_once": bool, "did_double_visit_small_cave": bool})


def traverse(cave: Cave, context: Context, visited: Visited):
    if cave.small:
        if cave.id in visited["cave_ids"]:
            if cave.id != "start" and visited["allow_double_visit_of_small_cave_once"] and not visited["did_double_visit_small_cave"]:
                visited["did_double_visit_small_cave"] = True
            else:
                return

        visited["cave_ids"].add(cave.id)

    if cave.id == "end":
        context["total_paths"] += 1
        return

    for connection in cave.connections:
        traverse(connection, context, copy.deepcopy(visited))


def part1(input: str) -> str:
    start = parse_input(input)
    context: Context = {"total_paths": 0}

    traverse(start, context, {"cave_ids": set(
        []), "allow_double_visit_of_small_cave_once": False, "did_double_visit_small_cave": False})

    return str(context["total_paths"])


def part2(input: str) -> str:
    start = parse_input(input)
    context: Context = {"total_paths": 0}

    traverse(start, context, {"cave_ids": set(
        []), "allow_double_visit_of_small_cave_once": True, "did_double_visit_small_cave": False})

    return str(context["total_paths"])


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
