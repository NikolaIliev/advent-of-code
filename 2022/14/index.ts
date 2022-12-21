// https://adventofcode.com/2022/day/14

import { readFileSync } from "node:fs";

type Point = { x: number; y: number };
type Cave = ("#" | "o" | "." | "+")[][];

const CaveWidth = 700;
const CaveHeight = 1000;
const SandOrigin: Point = { x: 500, y: 0 };

function getCaveLowestPopulatedRowIndex(cave: Cave): number {
  return (
    cave.length - [...cave].reverse().findIndex((row) => row.includes("#")) - 1
  );
}

function printCave(cave: Cave): void {
  const maxRow = getCaveLowestPopulatedRowIndex(cave);
  const minCol = Math.min(
    ...cave.map((row) =>
      row.includes("#") ? row.indexOf("#") : Number.MAX_SAFE_INTEGER
    )
  );
  const maxCol = Math.max(...cave.map((row) => row.lastIndexOf("#")));

  let s = "";

  for (let row = 0; row <= maxRow + 1; row++) {
    for (
      let col = Math.max(0, minCol - 1);
      col <= Math.min(maxCol + 1, CaveWidth - 1);
      col++
    ) {
      s += cave[row][col];
    }

    s += "\n";
  }

  console.log(s);
}

function createAndPopulateCave(input: string, withFloor: boolean): Cave {
  const cave: Cave = new Array(CaveHeight)
    .fill(0)
    .map(() => new Array<".">(CaveWidth).fill("."));

  cave[SandOrigin.y][SandOrigin.x] = "+";

  const rockFormations: Point[][] = input.split("\n").map((row) =>
    row.split(" -> ").map((s) => ({
      x: parseInt(s.split(",")[0]),
      y: parseInt(s.split(",")[1]),
    }))
  );

  for (const rockFormation of rockFormations) {
    let cursor = rockFormation[0];

    for (let i = 1; i < rockFormation.length; i++) {
      const nextPoint = rockFormation[i];

      while (cursor.x !== nextPoint.x || cursor.y !== nextPoint.y) {
        cave[cursor.y][cursor.x] = "#";

        if (cursor.x !== nextPoint.x) {
          cursor.x += nextPoint.x > cursor.x ? 1 : -1;
        } else {
          cursor.y += nextPoint.y > cursor.y ? 1 : -1;
        }
      }

      cave[cursor.y][cursor.x] = "#";
    }
  }

  if (withFloor) {
    const floorIndex = getCaveLowestPopulatedRowIndex(cave) + 2;
    for (let col = 0; col < CaveWidth; col++) {
      cave[floorIndex][col] = "#";
    }
  }

  return cave;
}

function simulateSand(cave: Cave): { sandAtRest: number } {
  let sandAtRest = 0;
  let currentSandLocation = { ...SandOrigin };

  while (currentSandLocation.y < cave.length - 1) {
    if (cave[currentSandLocation.y + 1][currentSandLocation.x] === ".") {
      // fall down
      currentSandLocation.y++;
    } else if (
      currentSandLocation.x > 0 &&
      cave[currentSandLocation.y + 1][currentSandLocation.x - 1] === "."
    ) {
      // fall down and to the left
      currentSandLocation.y++;
      currentSandLocation.x--;
    } else if (
      cave[currentSandLocation.y + 1][currentSandLocation.x + 1] === "."
    ) {
      // fall down and to the right
      currentSandLocation.y++;
      currentSandLocation.x++;
    } else {
      // cannot move anywhere -> at rest at current location

      sandAtRest++;
      cave[currentSandLocation.y][currentSandLocation.x] = "o";

      if (
        currentSandLocation.x === SandOrigin.x &&
        currentSandLocation.y === SandOrigin.y
      ) {
        // sand didn't move at all -> sand origin is blocked. Must exit
        break;
      }

      currentSandLocation = { ...SandOrigin };
    }
  }

  printCave(cave);

  return { sandAtRest };
}

function part1(input: string): string {
  return simulateSand(
    createAndPopulateCave(input, false)
  ).sandAtRest.toString();
}

function part2(input: string): string {
  return simulateSand(createAndPopulateCave(input, true)).sandAtRest.toString();
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
