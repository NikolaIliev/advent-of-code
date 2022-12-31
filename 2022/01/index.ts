// https://adventofcode.com/2022/day/01

import { readFileSync } from "node:fs";

type Elf = { calories: number };

function parseInput(input: string): Elf[] {
  return input
    .split("\n\n")
    .map((s) => ({
      calories: s
        .split("\n")
        .reduce((sum, calories) => sum + parseInt(calories), 0),
    }))
    .sort((a, b) => b.calories - a.calories);
}

function part1(input: string): string {
  return parseInput(input)[0].calories.toString();
}

function part2(input: string): string {
  const elves = parseInput(input);

  return (elves[0].calories + elves[1].calories + elves[2].calories).toString();
}

function main() {
  const input = readFileSync(`${__dirname}/input.data`, "utf8");

  console.log("\n=========");
  console.log("\nSolution (Part 1):\n" + part1(input));
  console.log("\n=========");
  console.log("\nSolution (Part 2):\n" + part2(input));
  console.log("\n=========");
}

main();
