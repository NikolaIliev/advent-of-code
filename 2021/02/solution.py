# https://adventofcode.com/2021/day/2

import os
from typing import Any, List 
from typing_extensions import Literal, NamedTuple
from dataclasses import dataclass

Direction = Literal['forward', 'down', 'up']
Instruction = NamedTuple('Instruction', [("direction", Direction), ("count", int)])

@dataclass
class Position:
    horizontal: int = 0
    depth: int = 0
    aim: int = 0


def parse_input(input: str) -> List[Instruction]:
    instructions: List[Instruction] = []

    for line in input.splitlines():
        words = line.split(' ')
        direction: Any = words[0]
        count = words[1]

        instructions.append(Instruction(direction, int(count)))

    return instructions

def part1(input: str) -> str:
    position = Position()
    instructions = parse_input(input)

    for instruction in instructions:
        if instruction.direction == "up":
            position.depth -= instruction.count
        elif instruction.direction == "down":
            position.depth += instruction.count
        elif instruction.direction == "forward":
            position.horizontal += instruction.count


    return str(position.horizontal * position.depth)

def part2(input: str) -> str:
    position = Position()
    instructions = parse_input(input)

    for instruction in instructions:
        if instruction.direction == "up":
            position.aim -= instruction.count
        elif instruction.direction == "down":
            position.aim += instruction.count
        elif instruction.direction == "forward":
            position.horizontal += instruction.count
            position.depth += position.aim * instruction.count

    return str(position.horizontal * position.depth)

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