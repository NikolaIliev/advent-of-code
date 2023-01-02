# https://adventofcode.com/2021/day/8

import copy
from functools import reduce
import os
from typing import Dict, List, NamedTuple, Literal, Set, Union
from dataclasses import dataclass

DisplaySegmentPosition = Literal['top', 'bottom', "middle",
                                 'top-left', 'top-right', 'bottom-left', 'bottom-right']


Note = NamedTuple(
    "Note", [("signal_patterns", List[str]), ("output_value_digits", List[str])])


def parse_input(input: str) -> List[Note]:
    notes: List[Note] = []

    for line in input.splitlines():
        parts = line.split(' | ')
        notes.append(Note(list(map(lambda s: ''.join(sorted(list(s))), parts[0].split(' '))),
                     list(map(lambda s: ''.join(sorted(list(s))), parts[1].split(' ')))))

    return notes


def part1(input: str) -> str:
    notes = parse_input(input)
    answer = 0

    for note in notes:
        for digit in note.output_value_digits:
            if len(digit) == 2 or len(digit) == 4 or len(digit) == 3 or len(digit) == 7:
                answer += 1

    return str(answer)


def part2(input: str) -> str:
    notes = parse_input(input)
    answer = 0

    for note in notes:
        segments: Dict[DisplaySegmentPosition, str] = {
            "top-left": "",
            "top-right": "",
            "top": "",
            "middle": "",
            "bottom-left": "",
            "bottom-right": "",
            "bottom": ""
        }
        digit_patterns: Dict[int, Set[str]] = {
            0: set([]),
            1: set([]),
            2: set([]),
            3: set([]),
            4: set([]),
            5: set([]),
            6: set([]),
            7: set([]),
            8: set([]),
            9: set([])
        }

        signal_patterns_by_len: Dict[int, List[Set[str]]] = {}

        for pattern in note.signal_patterns:
            if len(pattern) not in signal_patterns_by_len:
                signal_patterns_by_len[len(pattern)] = []

            signal_patterns_by_len[len(pattern)].append(set(pattern))

        digit_patterns[1] = signal_patterns_by_len[2][0]
        digit_patterns[4] = signal_patterns_by_len[4][0]
        digit_patterns[7] = signal_patterns_by_len[3][0]
        digit_patterns[8] = signal_patterns_by_len[7][0]

        # diff 7 with 1 to get top
        segments["top"] = list(digit_patterns[7].difference(
            digit_patterns[1]))[0]

        # diff 6-length patterns (0, 6, 9) with 8; if the diff is in 1 -> that's the top-right wire id
        # we've also found digit_patterns[6]
        for p in signal_patterns_by_len[6]:
            diff = list(digit_patterns[8].difference(p))[0]

            if diff in digit_patterns[1]:
                segments["top-right"] = diff
                digit_patterns[6] = p

        # get bottom-right by excluding top-right from 1
        segments["bottom-right"] = list(
            digit_patterns[1].difference(set(segments['top-right'])))[0]

        # find 5 by finding the 5-length pattern that does not include our known top-right wire
        digit_patterns[5] = list(filter(
            lambda pattern: segments["top-right"] not in pattern, signal_patterns_by_len[5]))[0]

        # now get bottom-left by diffing 6 and 5
        segments["bottom-left"] = list(
            digit_patterns[6].difference(digit_patterns[5]))[0]

        # now find 9 and 0.
        # 9 is found by diffing with 5. 9 will have only one diff = top-right wire
        # then the other two possibilities are 6 and 0. We already know 6, so by exclusion..
        for p in signal_patterns_by_len[6]:
            difference = list(p.difference(digit_patterns[5]))

            if len(difference) == 1 and difference[0] == segments['top-right']:
                digit_patterns[9] = p
            elif p != digit_patterns[6]:
                digit_patterns[0] = p

        # now get middle by diffing 8 and 0
        segments["middle"] = list(
            digit_patterns[8].difference(digit_patterns[0]))[0]

        # now get top-left by diffing 4 with the known middle, top-right, bottom-right
        segments["top-left"] = list(
            digit_patterns[4].difference(
                set([segments["top-right"], segments["bottom-right"], segments["middle"]]))
        )[0]

        # find 3 and 2.
        # Find 3 by diffing with 9. If there's only one diff -> that's 3
        # Then there's two 5-length patterns left - 5 and 2. We know 5, so by exclusion we find 2..
        for p in signal_patterns_by_len[5]:
            difference = list(digit_patterns[9].difference(p))

            if len(difference) == 1 and p != digit_patterns[5]:
                digit_patterns[3] = p
            elif p != digit_patterns[5]:
                digit_patterns[2] = p

        # finally, get bottom by diffing 8 with everything else we know
        segments["bottom"] = list(
            digit_patterns[8].difference(set(segments.values()))
        )[0]

        # now for the output number..
        output_value_str = ""

        for output_value_digit in note.output_value_digits:
            output_value_digit_charset = set(output_value_digit)

            for digit in digit_patterns:
                if output_value_digit_charset == digit_patterns[digit]:
                    output_value_str += str(digit)
                    break

        answer += int(output_value_str)

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
