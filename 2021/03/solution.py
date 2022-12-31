# https://adventofcode.com/2021/day/3

import os
from pathlib import Path
from typing import Dict, List


def binary_to_decimal(binary: str) -> int:
    n = 0

    for i in range(0, len(binary)):
        n += int(binary[i]) * (2 ** (len(binary) - i - 1))

    return n


def split_by_bit_in_position(binary_numbers: List[str], position: int) -> Dict[str, List[str]]:
    result: Dict[str, List[str]] = {"0": [], "1": []}

    for number in binary_numbers:
        result[number[position]].append(number)

    return result


def part1(input: str) -> str:
    gammaRate = 0
    epsilonRate = 0
    lines = input.splitlines()
    bitsCount = len(lines[0])
    bitOccurences: Dict[int, Dict[str, int]] = {}

    for n in lines:
        for position in range(0, len(n)):
            if position not in bitOccurences:
                bitOccurences[position] = {"0": 0, "1": 0}

            bitOccurences[position][n[position]] += 1

    print(bitOccurences)
    for position in bitOccurences:
        gammaRate += 2 ** (bitsCount - position - 1) * \
            (bitOccurences[position]["1"] >
             bitOccurences[position]["0"] and 1 or 0)
        epsilonRate += 2 ** (bitsCount - position - 1) * (
            bitOccurences[position]["1"] < bitOccurences[position]["0"] and 1 or 0)

    return str(gammaRate * epsilonRate)


def part2(input: str) -> str:
    lines = input.splitlines()
    bitsCount = len(lines[0])
    oxygen_generator_rating_eligible_numbers: List[str] = lines
    co2_scrubber_rating_eligible_numbers: List[str] = lines

    for position in range(0, bitsCount):
        if len(oxygen_generator_rating_eligible_numbers) > 1:
            splits = split_by_bit_in_position(
                oxygen_generator_rating_eligible_numbers, position)
            oxygen_generator_rating_eligible_numbers = len(
                splits["1"]) >= len(splits["0"]) and splits["1"] or splits["0"]

        if len(co2_scrubber_rating_eligible_numbers) > 1:
            splits = split_by_bit_in_position(
                co2_scrubber_rating_eligible_numbers, position)
            co2_scrubber_rating_eligible_numbers = len(
                splits["0"]) <= len(splits["1"]) and splits["0"] or splits["1"]

    print(oxygen_generator_rating_eligible_numbers,
          co2_scrubber_rating_eligible_numbers)

    return str(binary_to_decimal(oxygen_generator_rating_eligible_numbers[0]) * binary_to_decimal(co2_scrubber_rating_eligible_numbers[0]))


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
