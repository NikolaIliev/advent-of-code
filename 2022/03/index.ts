// https://adventofcode.com/2022/day/3

import { readFileSync } from "node:fs";

function getScore(itemType: string): number {
  const charCode = itemType.charCodeAt(0);
  const isUppercase = itemType === itemType.toUpperCase();

  return isUppercase ? charCode - 38 : charCode - 96;
}

function part1(input: string): string {
  const compartmentalisedRucksacks: [string, string][] = input
    .split("\n")
    .map((s) => [s.slice(0, s.length / 2), s.slice(s.length / 2, s.length)]);

  const score = compartmentalisedRucksacks.reduce<number>(
    (score, compartments) => {
      const seen: Record<string, true> = {};
      let duplicate = "";

      for (const c of compartments[0]) {
        seen[c] = true;
      }

      for (const c of compartments[1]) {
        if (seen[c]) {
          duplicate = c;
          break;
        }
      }

      return score + getScore(duplicate);
    },
    0
  );

  return score.toString();
}

function part2(input: string): string {
  const rucksacks = input.split("\n");
  let score = 0;

  for (let i = 0; i < rucksacks.length; i += 3) {
    let badge = "";
    const seen: Record<string, number> = {};

    for (let j = 0; j < 3; j++) {
      const rucksack = rucksacks[i + j];
      const seenInner: Record<string, true> = {};

      for (const c of rucksack) {
        if (seenInner[c]) {
          continue;
        }

        seenInner[c] = true;

        if (!(c in seen)) {
          seen[c] = 1;
        } else {
          seen[c] += 1;
        }

        if (seen[c] === 3) {
          badge = c;

          break;
        }
      }
    }

    score += getScore(badge);
  }

  return score.toString();
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
