// https://adventofcode.com/2022/day/25

import { readFileSync } from "node:fs";

const SnafuDigits: Record<string, number> = {
  "0": 0,
  "1": 1,
  "2": 2,
  "-": -1,
  "=": -2,
};

function snafuToDecimal(n: string): number {
  let decimal = 0;

  for (let i = n.length - 1; i >= 0; i--) {
    decimal += SnafuDigits[n[i]] * 5 ** (n.length - 1 - i);
  }

  return decimal;
}

function decimalToSnafu(n: number): string {
  let snafu = "";
  const digits = Math.round(Math.log(n) / Math.log(5)) + 1;

  for (let power = digits - 1; power >= 0; power--) {
    const closest = Object.entries(SnafuDigits).reduce((closest, current) => {
      return Math.abs(n - current[1] * 5 ** power) <
        Math.abs(n - closest[1] * 5 ** power)
        ? current
        : closest;
    });

    snafu += closest[0];
    n -= closest[1] * 5 ** power;
  }

  return snafu;
}

function part1(input: string): string {
  return decimalToSnafu(
    input
      .split("\n")
      .map((snafu) => snafuToDecimal(snafu))
      .reduce((sum, current) => sum + current)
  );
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
