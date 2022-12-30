// https://adventofcode.com/2022/day/24

import { PriorityQueue } from "@datastructures-js/priority-queue";
import { readFileSync } from "node:fs";

type Direction = "up" | "right" | "down" | "left";
type Location = { row: number; col: number };

type Blizzard = { location: Location; direction: Direction };

type MapNode = ({ type: "blizzard" } & Blizzard) | { type: "wall" | "empty" };

type Map = MapNode[][];

function parseInput(input: string): { map: Map; blizzards: Blizzard[] } {
  const rows = input.split("\n");
  const map: Map = [];
  const blizzards: Blizzard[] = [];

  for (let row = 0; row < rows.length; row++) {
    map[row] = [];

    for (let col = 0; col < rows[row].length; col++) {
      const c = rows[row][col];

      switch (c) {
        case "#": {
          map[row][col] = { type: "wall" };
          break;
        }

        case ".": {
          map[row][col] = { type: "empty" };
          break;
        }

        default: {
          const blizzard: Blizzard = {
            location: { row, col },
            direction:
              c === ">"
                ? "right"
                : c === "<"
                ? "left"
                : c === "v"
                ? "down"
                : "up",
          };

          map[row][col] = { type: "blizzard", ...blizzard };
          blizzards.push(blizzard);
        }
      }
    }
  }

  return { map, blizzards };
}

function computeNextMap(map: Map, blizzards: Blizzard[]): Map {
  const nextMap: Map = [];

  for (let row = 0; row < map.length; row++) {
    nextMap[row] = [];

    for (let col = 0; col < map[row].length; col++) {
      const node = map[row][col];

      if (node.type === "wall") {
        nextMap[row][col] = node;
      } else {
        nextMap[row][col] = { type: "empty" };
      }
    }
  }

  for (const blizzard of blizzards) {
    switch (blizzard.direction) {
      case "right": {
        if (
          map[blizzard.location.row][blizzard.location.col + 1].type !== "wall"
        ) {
          blizzard.location.col++;
        } else {
          for (let col = 0; col < map[0].length - 1; col++) {
            if (map[blizzard.location.row][col].type !== "wall") {
              blizzard.location.col = col;
              break;
            }
          }
        }

        break;
      }

      case "left": {
        if (
          map[blizzard.location.row][blizzard.location.col - 1].type !== "wall"
        ) {
          blizzard.location.col--;
        } else {
          for (let col = map[0].length - 1; col >= 0; col--) {
            if (map[blizzard.location.row][col].type !== "wall") {
              blizzard.location.col = col;
              break;
            }
          }
        }

        break;
      }

      case "down": {
        if (
          map[blizzard.location.row + 1] &&
          map[blizzard.location.row + 1][blizzard.location.col].type !== "wall"
        ) {
          blizzard.location.row++;
        } else {
          for (let row = 0; row < map.length; row++) {
            if (map[row][blizzard.location.col].type !== "wall") {
              blizzard.location.row = row;
              break;
            }
          }
        }
        break;
      }

      case "up": {
        if (
          map[blizzard.location.row - 1] &&
          map[blizzard.location.row - 1][blizzard.location.col].type !== "wall"
        ) {
          blizzard.location.row--;
        } else {
          for (let row = map.length - 1; row >= 0; row--) {
            if (map[row][blizzard.location.col].type !== "wall") {
              blizzard.location.row = row;
              break;
            }
          }
        }

        break;
      }
    }

    nextMap[blizzard.location.row][blizzard.location.col] = {
      type: "blizzard",
      ...blizzard,
    };
  }

  return nextMap;
}

function getManhattanDistance(a: Location, b: Location): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

type QueueData = {
  location: Location;
  goalsReached: number;
  minute: number;
};

function traverse(
  map: Map,
  blizzards: Blizzard[],
  startLocation: Location,
  goals: Location[]
): number {
  const mapsByMinute: Record<number, Map> = {
    0: map,
  };

  let answer = Infinity;

  // used for pruning
  // if a position has already been reached for a minute, then no need to continue as
  // you're in essentially the same spot as the path that previously got to here
  // because the blizzard states are the same, you just got to the same point using two different same-length paths
  const positionsReachedByMinuteAndGoalsReached: Record<
    number,
    Record<number, Record<number, Record<number, true>>>
  > = {};

  const queue = new PriorityQueue<QueueData>((a, b) =>
    a.goalsReached === b.goalsReached
      ? getManhattanDistance(a.location, goals[a.goalsReached]) -
        getManhattanDistance(b.location, goals[b.goalsReached])
      : b.goalsReached - a.goalsReached
  );

  queue.enqueue({
    location: startLocation,
    minute: 0,
    goalsReached: 0,
  });

  while (!queue.isEmpty()) {
    const data = queue.dequeue();

    if (data.minute >= answer) {
      continue;
    }

    if (
      data.location.row === goals[data.goalsReached].row &&
      data.location.col === goals[data.goalsReached].col
    ) {
      if (data.goalsReached + 1 === goals.length) {
        answer = data.minute;
        // console.log("Reached final goal in:", data.minute, "minutes");
      } else {
        data.goalsReached++;
      }
    }

    if (!positionsReachedByMinuteAndGoalsReached[data.minute]) {
      positionsReachedByMinuteAndGoalsReached[data.minute] = {};
    }

    if (
      !positionsReachedByMinuteAndGoalsReached[data.minute][data.goalsReached]
    ) {
      positionsReachedByMinuteAndGoalsReached[data.minute][data.goalsReached] =
        {};
    }

    if (
      !positionsReachedByMinuteAndGoalsReached[data.minute][data.goalsReached][
        data.location.row
      ]
    ) {
      positionsReachedByMinuteAndGoalsReached[data.minute][data.goalsReached][
        data.location.row
      ] = {};
    }

    // another path already reached here in the same minute (and same blizzard states)
    // so prune this path as it's a duplicate
    if (
      positionsReachedByMinuteAndGoalsReached[data.minute][data.goalsReached][
        data.location.row
      ][data.location.col]
    ) {
      continue;
    }

    positionsReachedByMinuteAndGoalsReached[data.minute][data.goalsReached][
      data.location.row
    ][data.location.col] = true;

    const nextMap =
      mapsByMinute[data.minute + 1] ??
      computeNextMap(mapsByMinute[data.minute], blizzards);

    mapsByMinute[data.minute + 1] = nextMap;

    // up
    if (nextMap[data.location.row - 1]?.[data.location.col]?.type === "empty") {
      queue.enqueue({
        location: { row: data.location.row - 1, col: data.location.col },
        minute: data.minute + 1,
        goalsReached: data.goalsReached,
      });
    }

    // right
    if (nextMap[data.location.row][data.location.col + 1]?.type === "empty") {
      queue.enqueue({
        location: { row: data.location.row, col: data.location.col + 1 },
        minute: data.minute + 1,
        goalsReached: data.goalsReached,
      });
    }

    // down
    if (nextMap[data.location.row + 1]?.[data.location.col]?.type === "empty") {
      queue.enqueue({
        location: { row: data.location.row + 1, col: data.location.col },
        minute: data.minute + 1,
        goalsReached: data.goalsReached,
      });
    }

    // left
    if (nextMap[data.location.row][data.location.col - 1]?.type === "empty") {
      queue.enqueue({
        location: { row: data.location.row, col: data.location.col - 1 },
        minute: data.minute + 1,
        goalsReached: data.goalsReached,
      });
    }

    // wait
    if (nextMap[data.location.row][data.location.col].type === "empty") {
      queue.enqueue({
        location: { row: data.location.row, col: data.location.col },
        minute: data.minute + 1,
        goalsReached: data.goalsReached,
      });
    }
  }

  return answer;
}

function part1(input: string): string {
  const { map, blizzards } = parseInput(input);
  const startLocation: Location = { row: 0, col: 1 };
  const endLocation: Location = { row: map.length - 1, col: map[0].length - 2 };

  return traverse(map, blizzards, startLocation, [endLocation]).toString();
}

function part2(input: string): string {
  const { map, blizzards } = parseInput(input);
  const startLocation: Location = { row: 0, col: 1 };
  const endLocation: Location = { row: map.length - 1, col: map[0].length - 2 };

  return traverse(map, blizzards, startLocation, [
    endLocation,
    startLocation,
    endLocation,
  ]).toString();
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
