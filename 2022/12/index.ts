// https://adventofcode.com/2022/day/12

import { readFileSync } from "node:fs";

type Direction = "up" | "right" | "down" | "left";
type Location = { row: number; col: number };
type LabyrinthNode = {
  elevation: number;
  distance: number | null;
  start?: boolean;
  end?: boolean;
};
type Labyrinth = LabyrinthNode[][];

function parseInput(input: string): {
  labyrinth: Labyrinth;
  startLocation: Location;
  endLocation: Location;
} {
  const startLocation: Location = { row: 0, col: 0 };
  const endLocation: Location = { row: 0, col: 0 };
  const labyrinth: Labyrinth = input.split("\n").map((row, rowIndex) =>
    row.split("").map<LabyrinthNode>((s, colIndex) => {
      if (s === "S") {
        startLocation.row = rowIndex;
        startLocation.col = colIndex;
      }

      if (s === "E") {
        endLocation.row = rowIndex;
        endLocation.col = colIndex;
      }

      return {
        elevation: s === "S" ? 0 : s === "E" ? 25 : s.charCodeAt(0) - 97,
        start: s === "S",
        end: s === "E",
        distance: null,
      };
    })
  );

  return { labyrinth, startLocation, endLocation };
}

function getElevationAtLocation(
  location: Location,
  labyrinth: Labyrinth
): number {
  return labyrinth[location.row]?.[location.col]?.elevation ?? -1;
}

function getNeighbouringLocation(
  location: Location,
  direction: Direction
): Location {
  switch (direction) {
    case "up": {
      return { row: location.row - 1, col: location.col };
    }

    case "right": {
      return { row: location.row, col: location.col + 1 };
    }

    case "down": {
      return { row: location.row + 1, col: location.col };
    }

    case "left": {
      return { row: location.row, col: location.col - 1 };
    }
  }
}

function canMoveToLocation(
  currentLocation: Location,
  targetLocation: Location,
  labyrinth: Labyrinth
): boolean {
  if (
    targetLocation.row < 0 ||
    targetLocation.col < 0 ||
    targetLocation.row >= labyrinth.length ||
    targetLocation.col >= labyrinth[0].length
  ) {
    return false;
  }

  const currentElevation = getElevationAtLocation(currentLocation, labyrinth);
  const targetElevation = getElevationAtLocation(targetLocation, labyrinth);

  return currentElevation <= targetElevation + 1;
}

function printLabyrinth(labyrinth: Labyrinth): void {
  console.log(labyrinth.length);
  console.log(
    labyrinth
      .map((row) =>
        row
          .map((node) =>
            node.distance ? (node.distance % 2 === 0 ? "*" : "#") : "-"
          )
          .join("")
      )
      .join("\n")
  );
}

function visitLocation(
  labyrinth: Labyrinth,
  isStartingNode: (node: LabyrinthNode) => boolean,
  location: Location,
  distanceToEnd: number
): void {
  const node = labyrinth[location.row][location.col];

  if (node.distance !== null && node.distance <= distanceToEnd) {
    // already found shorter or equal distance path going through this node
    return;
  }

  node.distance = distanceToEnd;

  if (isStartingNode(node)) {
    return;
  }

  const neighbours = [
    "up" as const,
    "right" as const,
    "down" as const,
    "left" as const,
  ].map((direction) => getNeighbouringLocation(location, direction));

  for (const neighbour of neighbours) {
    if (canMoveToLocation(location, neighbour, labyrinth)) {
      visitLocation(labyrinth, isStartingNode, neighbour, distanceToEnd + 1);
    }
  }
}

function part1(input: string): string {
  const { labyrinth, startLocation, endLocation } = parseInput(input);
  const isStartingNode = (node: LabyrinthNode): boolean => node.start === true;

  visitLocation(labyrinth, isStartingNode, endLocation, 0);

  return (
    labyrinth[startLocation.row][startLocation.col].distance ?? 0
  ).toString();
}

function part2(input: string): string {
  const { labyrinth, endLocation } = parseInput(input);
  const isStartingNode = (node: LabyrinthNode): boolean => node.elevation === 0;

  visitLocation(labyrinth, isStartingNode, endLocation, 0);

  let minDistance = Number.MAX_SAFE_INTEGER;

  for (let row = 0; row < labyrinth.length; row++) {
    for (let col = 0; col < labyrinth[row].length; col++) {
      const node = labyrinth[row][col];

      if (
        isStartingNode(node) &&
        node.distance !== null &&
        node.distance < minDistance
      ) {
        minDistance = node.distance;
      }
    }
  }

  return minDistance.toString();
}

async function main() {
  const input = readFileSync(`${__dirname}/input.data`, "utf8");

  console.log("\n=========");
  console.log("\nSolution (Part 1):\n" + part1(input));
  console.log("\n=========");
  console.log("\nSolution (Part 2):\n" + part2(input));
  console.log("\n=========");
}

main();
