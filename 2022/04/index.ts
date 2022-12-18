// https://adventofcode.com/2022/day/4

import { readFileSync } from "node:fs";

type Range = { start: number; end: number };

function getRangeTuples(input: string): [Range, Range][] {
  return input.split("\n").map((s) => {
    const strRanges = s.split(",");

    return [
      {
        start: parseInt(strRanges[0].split("-")[0]),
        end: parseInt(strRanges[0].split("-")[1]),
      },
      {
        start: parseInt(strRanges[1].split("-")[0]),
        end: parseInt(strRanges[1].split("-")[1]),
      },
    ];
  });
}

function checkContain(ranges: [Range, Range]): boolean {
  return (
    (ranges[0].start >= ranges[1].start && ranges[0].end <= ranges[1].end) ||
    (ranges[1].start >= ranges[0].start && ranges[1].end <= ranges[0].end)
  );
}

function checkOverlap(ranges: [Range, Range]): boolean {
  return (
    checkContain(ranges) ||
    (ranges[0].start >= ranges[1].start && ranges[0].start <= ranges[1].end) ||
    (ranges[0].end >= ranges[1].start && ranges[0].end <= ranges[1].end)
  );
}

function part1(input: string): string {
  let count = 0;
  const rangeTuples = getRangeTuples(input);

  for (const ranges of rangeTuples) {
    if (checkContain(ranges)) {
      count++;
    }
  }

  return count.toString();
}

function part2(input: string): string {
  let count = 0;
  const rangeTuples = getRangeTuples(input);

  for (const ranges of rangeTuples) {
    if (checkOverlap(ranges)) {
      count++;
    }
  }

  return count.toString();
}

function main() {
  const input = readFileSync(`${__dirname}/input.data`, "utf8");

  console.log("Solution (Part 1):", part1(input));
  console.log("Solution (Part 2):", part2(input));
}

main();
