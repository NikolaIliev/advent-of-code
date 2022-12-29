// https://adventofcode.com/2022/day/23

import { readFileSync } from "node:fs";

type Location = { row: number; col: number };
type Elf = { location: Location };
type ElvesByLocation = Record<number, Record<number, Elf>>;
type Context = { round: number; maxRounds: number };

const Directions = ["N", "S", "W", "E"] as const;
type Direction = typeof Directions[number];

function parseInput(input: string): {
  elves: Elf[];
  elvesByLocation: ElvesByLocation;
} {
  const rows = input.split("\n");
  const elves: Elf[] = [];
  const elvesByLocation: ElvesByLocation = {};

  for (let row = 0; row < rows.length; row++) {
    for (let col = 0; col < rows[row].length; col++) {
      if (rows[row][col] === "#") {
        if (!elvesByLocation[row]) {
          elvesByLocation[row] = {};
        }

        const elf: Elf = { location: { row, col } };

        elves.push(elf);
        elvesByLocation[row][col] = elf;
      }
    }
  }

  return { elves, elvesByLocation };
}

function getNextDirection(direction: Direction): Direction {
  const index = Directions.indexOf(direction);

  return Directions[index < Directions.length - 1 ? index + 1 : 0];
}

function isInCorrectPosition(
  elf: Elf,
  elvesByLocation: ElvesByLocation
): boolean {
  return (
    !elvesByLocation[elf.location.row - 1]?.[elf.location.col] &&
    !elvesByLocation[elf.location.row - 1]?.[elf.location.col + 1] &&
    !elvesByLocation[elf.location.row]?.[elf.location.col + 1] &&
    !elvesByLocation[elf.location.row + 1]?.[elf.location.col + 1] &&
    !elvesByLocation[elf.location.row + 1]?.[elf.location.col] &&
    !elvesByLocation[elf.location.row + 1]?.[elf.location.col - 1] &&
    !elvesByLocation[elf.location.row]?.[elf.location.col - 1] &&
    !elvesByLocation[elf.location.row - 1]?.[elf.location.col - 1]
  );
}

function getLocationInDirectionIfEligible(
  elf: Elf,
  elvesByLocation: ElvesByLocation,
  direction: Direction
): Location | null {
  switch (direction) {
    case "N": {
      return !elvesByLocation[elf.location.row - 1]?.[elf.location.col - 1] &&
        !elvesByLocation[elf.location.row - 1]?.[elf.location.col] &&
        !elvesByLocation[elf.location.row - 1]?.[elf.location.col + 1]
        ? { row: elf.location.row - 1, col: elf.location.col }
        : null;
    }

    case "S": {
      return !elvesByLocation[elf.location.row + 1]?.[elf.location.col - 1] &&
        !elvesByLocation[elf.location.row + 1]?.[elf.location.col] &&
        !elvesByLocation[elf.location.row + 1]?.[elf.location.col + 1]
        ? { row: elf.location.row + 1, col: elf.location.col }
        : null;
    }

    case "W": {
      return !elvesByLocation[elf.location.row - 1]?.[elf.location.col - 1] &&
        !elvesByLocation[elf.location.row]?.[elf.location.col - 1] &&
        !elvesByLocation[elf.location.row + 1]?.[elf.location.col - 1]
        ? { row: elf.location.row, col: elf.location.col - 1 }
        : null;
    }

    case "E": {
      return !elvesByLocation[elf.location.row - 1]?.[elf.location.col + 1] &&
        !elvesByLocation[elf.location.row]?.[elf.location.col + 1] &&
        !elvesByLocation[elf.location.row + 1]?.[elf.location.col + 1]
        ? { row: elf.location.row, col: elf.location.col + 1 }
        : null;
    }
  }
}

function getBoundingRectangle(elves: Elf[]): {
  topLeft: Location;
  width: number;
  height: number;
} {
  let minRow = Number.MAX_SAFE_INTEGER;
  let maxRow = Number.MIN_SAFE_INTEGER;
  let minCol = Number.MAX_SAFE_INTEGER;
  let maxCol = Number.MIN_SAFE_INTEGER;

  for (const elf of elves) {
    if (elf.location.row < minRow) {
      minRow = elf.location.row;
    }

    if (elf.location.row > maxRow) {
      maxRow = elf.location.row;
    }

    if (elf.location.col < minCol) {
      minCol = elf.location.col;
    }

    if (elf.location.col > maxCol) {
      maxCol = elf.location.col;
    }
  }

  return {
    topLeft: { row: minRow, col: minCol },
    width: maxCol - minCol + 1,
    height: maxRow - minRow + 1,
  };
}

function print(elves: Elf[]): void {
  let rows: string[][] = [];
  const rectangle = getBoundingRectangle(elves);

  for (let i = 0; i < rectangle.height; i++) {
    rows.push("".padEnd(rectangle.width, ".").split(""));
  }

  for (const elf of elves) {
    const adjustedLocation = {
      row: elf.location.row - rectangle.topLeft.row,
      col: elf.location.col - rectangle.topLeft.col,
    };

    rows[adjustedLocation.row][adjustedLocation.col] = "#";
  }

  console.log(
    "\n\n--------\n" + rows.map((row) => row.join("")).join("\n"),
    "\n-------\n"
  );
}

function play(
  elves: Elf[],
  elvesByLocation: ElvesByLocation,
  context: Context
): void {
  let startingDirection: Direction = "N";
  let proposals: Record<number, Record<number, Elf[]>> = {};

  // print(elves);

  for (context.round = 1; context.round <= context.maxRounds; context.round++) {
    let allElvesInCorrectPosition = true;

    for (const elf of elves) {
      if (isInCorrectPosition(elf, elvesByLocation)) {
        continue;
      }

      allElvesInCorrectPosition = false;

      let currentDirection = startingDirection;

      for (let i = 0; i < 4; i++) {
        const proposal = getLocationInDirectionIfEligible(
          elf,
          elvesByLocation,
          currentDirection
        );

        if (proposal) {
          if (!proposals[proposal.row]) {
            proposals[proposal.row] = {};
          }

          if (!proposals[proposal.row][proposal.col]) {
            proposals[proposal.row][proposal.col] = [];
          }

          proposals[proposal.row][proposal.col].push(elf);
          break;
        }

        currentDirection = getNextDirection(currentDirection);
      }
    }

    for (let row in proposals) {
      for (let col in proposals[row]) {
        if (proposals[row][col].length === 1) {
          const elf = proposals[row][col][0];

          delete elvesByLocation[elf.location.row][elf.location.col];
          elf.location.row = parseInt(row);
          elf.location.col = parseInt(col);

          if (!elvesByLocation[elf.location.row]) {
            elvesByLocation[elf.location.row] = {};
          }

          elvesByLocation[elf.location.row][elf.location.col] = elf;
        }
      }
    }

    // console.log("End of round", round);
    // print(elves);

    proposals = {};
    startingDirection = getNextDirection(startingDirection);

    if (allElvesInCorrectPosition) {
      break;
    }
  }
}

function part1(input: string): string {
  const { elves, elvesByLocation } = parseInput(input);

  play(elves, elvesByLocation, { round: 1, maxRounds: 10 });

  return (
    getBoundingRectangle(elves).width * getBoundingRectangle(elves).height -
    elves.length
  ).toString();
}

function part2(input: string): string {
  const { elves, elvesByLocation } = parseInput(input);
  const context: Context = { round: 1, maxRounds: Infinity };

  play(elves, elvesByLocation, context);

  return context.round.toString();
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
