// https://adventofcode.com/%year%/day/%day%

import { readFileSync } from "node:fs";

function part1(input: string): string {
  return "";
}

function part2(input: string): string {
  return "";
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
