// https://adventofcode.com/2022/day/8

import { readFileSync } from "node:fs";

type Forest = {
  width: number;
  height: number;
  trees: number[][];
};

type Location = { row: number; col: number };

type Direction = "top" | "right" | "bottom" | "left";

function move(
  location: Location,
  direction: Direction,
  forest: Forest
): boolean {
  switch (direction) {
    case "top": {
      if (location.row === 0) {
        return false;
      }

      location.row--;
      return true;
    }

    case "right": {
      if (location.col === forest.width - 1) {
        return false;
      }

      location.col++;
      return true;
    }

    case "bottom": {
      if (location.row === forest.height - 1) {
        return false;
      }

      location.row++;
      return true;
    }

    case "left": {
      if (location.col === 0) {
        return false;
      }

      location.col--;
      return true;
    }
  }
}

function areAllTreesShorterInDirection(
  forest: Forest,
  row: number,
  col: number,
  direction: Direction
): boolean {
  const sourceHeight = forest.trees[row][col];
  const location: Location = { row, col };

  while (move(location, direction, forest)) {
    const currentHeight = forest.trees[location.row][location.col];

    if (currentHeight >= sourceHeight) {
      return false;
    }
  }

  return true;
}

function getScenicScoreInDirection(
  forest: Forest,
  row: number,
  col: number,
  direction: Direction
): number {
  const sourceHeight = forest.trees[row][col];
  const location: Location = { row, col };

  let score = 0;

  while (move(location, direction, forest)) {
    const currentHeight = forest.trees[location.row][location.col];

    if (currentHeight <= sourceHeight) {
      score++;
    }

    if (currentHeight >= sourceHeight) {
      // view blocked
      break;
    }
  }

  return score;
}

function part1(input: string): string {
  const rows = input.split("\n");
  const forest: Forest = {
    width: rows[0].length,
    height: rows.length,
    trees: rows.map((row) => row.split("").map((s) => parseInt(s))),
  };

  let count = 0;

  for (let row = 0; row < forest.width; row++) {
    for (let col = 0; col < forest.height; col++) {
      if (
        areAllTreesShorterInDirection(forest, row, col, "top") ||
        areAllTreesShorterInDirection(forest, row, col, "right") ||
        areAllTreesShorterInDirection(forest, row, col, "bottom") ||
        areAllTreesShorterInDirection(forest, row, col, "left")
      ) {
        count++;
      }
    }
  }

  return count.toString();
}

function part2(input: string): string {
  const rows = input.split("\n");
  const forest: Forest = {
    width: rows[0].length,
    height: rows.length,
    trees: rows.map((row) => row.split("").map((s) => parseInt(s))),
  };

  let maxScenicScore = 0;

  for (let row = 0; row < forest.width; row++) {
    for (let col = 0; col < forest.height; col++) {
      maxScenicScore = Math.max(
        maxScenicScore,
        getScenicScoreInDirection(forest, row, col, "top") *
          getScenicScoreInDirection(forest, row, col, "right") *
          getScenicScoreInDirection(forest, row, col, "bottom") *
          getScenicScoreInDirection(forest, row, col, "left")
      );
    }
  }

  return maxScenicScore.toString();
}

function main() {
  const input = readFileSync(`${__dirname}/input.data`, "utf8");

  console.log("Solution (Part 1):", part1(input));
  console.log("Solution (Part 2):", part2(input));
}

main();
