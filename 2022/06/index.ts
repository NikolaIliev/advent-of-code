// https://adventofcode.com/2022/day/6

import { readFileSync } from "node:fs";

function findDistinctSequenceEndIndex(
  input: string,
  sequenceLength: number
): number {
  const window: Record<string, number> = {};

  for (let i = 0; i < input.length; i++) {
    if (i < sequenceLength) {
      if (!window[input[i]]) {
        window[input[i]] = 1;
      } else {
        window[input[i]] += 1;
      }

      continue;
    }

    window[input[i - sequenceLength]] -= 1;

    if (!window[input[i - sequenceLength]]) {
      delete window[input[i - sequenceLength]];
    }

    if (!window[input[i]]) {
      window[input[i]] = 1;
    } else {
      window[input[i]] += 1;
    }

    if (Object.keys(window).length === sequenceLength) {
      return i;
    }
  }

  return -1;
}

function part1(input: string): string {
  return (findDistinctSequenceEndIndex(input, 4) + 1).toString();
}

function part2(input: string): string {
  return (findDistinctSequenceEndIndex(input, 14) + 1).toString();
}

function main() {
  const input = readFileSync(`${__dirname}/input.data`, "utf8");

  console.log("Solution (Part 1):", part1(input));
  console.log("Solution (Part 2):", part2(input));
}

main();
