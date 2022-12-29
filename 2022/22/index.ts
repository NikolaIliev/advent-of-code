// https://adventofcode.com/2022/day/22

import { readFileSync } from "node:fs";

type Location = { row: number; col: number };
type Direction = "up" | "right" | "down" | "left";
type Direction3D = Direction | "front" | "back";
type TurnDirection = "R" | "L";

type Instruction =
  | {
      type: "move";
      count: number;
    }
  | {
      type: "turn";
      direction: TurnDirection;
    };

const ClockwiseDirections: Direction[] = ["right", "down", "left", "up"];

function parseMap(mapInput: string): string[][] {
  const rows = mapInput.split("\n");
  const paddedRows = rows.map((row) => row.padEnd(rows.length, " "));

  return paddedRows.map((row) => row.split(""));
}

function parseInstructions(instructionsInput: string): Instruction[] {
  const instructions: Instruction[] = [];
  const instructionRegExp = /(\d+|R|L)/g;
  let instructionString: string | undefined;

  while ((instructionString = instructionRegExp.exec(instructionsInput)?.[1])) {
    instructions.push(
      instructionString === "R" || instructionString === "L"
        ? {
            type: "turn",
            direction: instructionString,
          }
        : {
            type: "move",
            count: parseInt(instructionString),
          }
    );
  }

  return instructions;
}

function parseInput(input: string): {
  map: string[][];
  instructions: Instruction[];
} {
  const [mapInput, instructionsInput] = input.split("\n\n");

  return {
    map: parseMap(mapInput),
    instructions: parseInstructions(instructionsInput),
  };
}

function turn(direction: Direction, turnDirection: TurnDirection): Direction {
  const indexOfCurrentDirection = ClockwiseDirections.indexOf(direction);
  const indexOfNewDirection =
    indexOfCurrentDirection + (turnDirection === "R" ? 1 : -1);

  return ClockwiseDirections[
    // loop left -> right
    indexOfNewDirection === -1
      ? ClockwiseDirections.length - 1
      : // loop right -> left
      indexOfNewDirection === ClockwiseDirections.length
      ? 0
      : indexOfNewDirection
  ];
}

function getNeighbouringLocationAtDirection(
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

function performInstructions(
  map: string[][],
  instructions: Instruction[],
  teleport: (
    location: Location,
    direction: Direction
  ) => { location: Location; direction: Direction }
): { location: Location; direction: Direction } {
  let currentLocation = { row: 0, col: map[0].findIndex((s) => s !== " ") };
  let direction: Direction = "right";

  for (const instruction of instructions) {
    switch (instruction.type) {
      case "move": {
        for (let i = 0; i < instruction.count; i++) {
          let newLocation = getNeighbouringLocationAtDirection(
            currentLocation,
            direction
          );
          let newDirection: Direction = direction;

          if (
            !map[newLocation.row]?.[newLocation.col] ||
            map[newLocation.row][newLocation.col] === " "
          ) {
            const teleportationResult = teleport(currentLocation, direction);
            newLocation = teleportationResult.location;
            newDirection = teleportationResult.direction;
          }

          if (map[newLocation.row][newLocation.col] === "#") {
            break;
          }

          currentLocation = newLocation;
          direction = newDirection;
        }

        break;
      }

      case "turn": {
        direction = turn(direction, instruction.direction);
        break;
      }
    }
  }

  return { location: currentLocation, direction };
}

function getPassword(location: Location, direction: Direction): number {
  return (
    (location.row + 1) * 1000 +
    (location.col + 1) * 4 +
    ClockwiseDirections.indexOf(direction)
  );
}

function part1(input: string): string {
  const { map, instructions } = parseInput(input);
  const { location, direction } = performInstructions(
    map,
    instructions,
    (location, direction) => {
      switch (direction) {
        case "right": {
          return {
            location: {
              row: location.row,
              col: map[location.row].findIndex((s) => s !== " "),
            },
            direction,
          };
        }

        case "left": {
          let col = map[location.row].length - 1;

          for (; col >= 0; col--) {
            if (map[location.row][col] !== " ") {
              break;
            }
          }

          return {
            location: {
              row: location.row,
              col,
            },
            direction,
          };
        }

        case "up": {
          let row = map.length - 1;

          for (; row >= 0; row--) {
            if (map[row][location.col] !== " ") {
              break;
            }
          }

          return {
            location: {
              row,
              col: location.col,
            },
            direction,
          };
        }

        case "down": {
          return {
            location: {
              row: map.findIndex((row) => row[location.col] !== " "),
              col: location.col,
            },
            direction,
          };
        }
      }
    }
  );

  return getPassword(location, direction).toString();
}

const CubeSideSize = 50;

// Not sure if every user's input's map is laid out the same
// So this may not work in general but oh well
const CubeSidesTopLeftCorners: Record<Direction3D, Location> = {
  down: { row: 100, col: 50 },
  left: { row: 100, col: 0 },
  front: { row: 150, col: 0 },
  back: { row: 50, col: 50 },
  up: { row: 0, col: 50 },
  right: { row: 0, col: 100 },
};

const CubeSideNeighbours: Record<
  Direction3D,
  Record<Direction, Direction3D>
> = {
  down: {
    left: "left",
    down: "front",
    up: "back",
    right: "right",
  },
  back: {
    down: "down",
    left: "left",
    right: "right",
    up: "up",
  },
  right: {
    left: "up",
    up: "front",
    down: "back",
    right: "down",
  },
  up: {
    right: "right",
    down: "back",
    left: "left",
    up: "front",
  },
  front: {
    up: "left",
    down: "right",
    left: "up",
    right: "down",
  },
  left: {
    right: "down",
    down: "front",
    up: "back",
    left: "up",
  },
};

function getCubeSideFromLocation(location: Location): Direction3D {
  const topLeftCorner: Location = {
    row: location.row - (location.row % CubeSideSize),
    col: location.col - (location.col % CubeSideSize),
  };

  for (let direction in CubeSidesTopLeftCorners) {
    if (
      CubeSidesTopLeftCorners[direction as Direction3D].row ===
        topLeftCorner.row &&
      CubeSidesTopLeftCorners[direction as Direction3D].col ===
        topLeftCorner.col
    ) {
      return direction as Direction3D;
    }
  }

  throw new Error(
    `Could not find cube side for location ${location.row},${location.col}`
  );
}

function part2(input: string): string {
  const { map, instructions } = parseInput(input);
  const { location, direction } = performInstructions(
    map,
    instructions,
    (location, direction) => {
      const side = getCubeSideFromLocation(location);
      const newSide = CubeSideNeighbours[side][direction];

      switch (side) {
        case "down": {
          switch (newSide) {
            case "right": {
              return {
                location: {
                  // flipped row
                  row:
                    CubeSidesTopLeftCorners[newSide].row +
                    CubeSideSize -
                    1 -
                    (location.row - CubeSidesTopLeftCorners[side].row),
                  // last col
                  col: CubeSidesTopLeftCorners[newSide].col + CubeSideSize - 1,
                },
                direction: "left",
              };
            }

            case "front": {
              return {
                location: {
                  // col becomes row
                  row:
                    CubeSidesTopLeftCorners[newSide].row +
                    (location.col - CubeSidesTopLeftCorners[side].col),
                  // last col
                  col: CubeSidesTopLeftCorners[newSide].col + CubeSideSize - 1,
                },
                direction: "left",
              };
            }
          }
        }

        case "left": {
          switch (newSide) {
            case "back": {
              return {
                location: {
                  // col becomes row
                  row:
                    CubeSidesTopLeftCorners[newSide].row +
                    (location.col - CubeSidesTopLeftCorners[side].col),
                  // first col
                  col: CubeSidesTopLeftCorners[newSide].col,
                },
                direction: "right",
              };
            }

            case "up": {
              return {
                location: {
                  // flipped row
                  row:
                    CubeSidesTopLeftCorners[newSide].row +
                    CubeSideSize -
                    1 -
                    (location.row - CubeSidesTopLeftCorners[side].row),
                  // first col
                  col: CubeSidesTopLeftCorners[newSide].col,
                },
                direction: "right",
              };
            }
          }
        }

        case "front": {
          switch (newSide) {
            case "down": {
              return {
                location: {
                  // last row
                  row: CubeSidesTopLeftCorners[newSide].row + CubeSideSize - 1,
                  // row becomes col
                  col:
                    CubeSidesTopLeftCorners[newSide].col +
                    (location.row - CubeSidesTopLeftCorners[side].row),
                },
                direction: "up",
              };
            }

            case "up": {
              return {
                location: {
                  // first row
                  row: CubeSidesTopLeftCorners[newSide].row,
                  // row becomes col
                  col:
                    CubeSidesTopLeftCorners[newSide].col +
                    (location.row - CubeSidesTopLeftCorners[side].row),
                },
                direction: "down",
              };
            }

            case "right": {
              return {
                location: {
                  // first row
                  row: CubeSidesTopLeftCorners[newSide].row,
                  // same col
                  col:
                    CubeSidesTopLeftCorners[newSide].col +
                    (location.col - CubeSidesTopLeftCorners[side].col),
                },
                direction: "down",
              };
            }
          }
        }

        case "back": {
          switch (newSide) {
            case "left": {
              return {
                location: {
                  // first row
                  row: CubeSidesTopLeftCorners[newSide].row,
                  // row becomes col
                  col:
                    CubeSidesTopLeftCorners[newSide].col +
                    (location.row - CubeSidesTopLeftCorners[side].row),
                },
                direction: "down",
              };
            }

            case "right": {
              return {
                location: {
                  // last row
                  row: CubeSidesTopLeftCorners[newSide].row + CubeSideSize - 1,
                  // row becomes col
                  col:
                    CubeSidesTopLeftCorners[newSide].col +
                    (location.row - CubeSidesTopLeftCorners[side].row),
                },
                direction: "up",
              };
            }
          }
        }

        case "up": {
          switch (newSide) {
            case "left": {
              return {
                location: {
                  // flipped row
                  row:
                    CubeSidesTopLeftCorners[newSide].row +
                    CubeSideSize -
                    1 -
                    (location.row - CubeSidesTopLeftCorners[side].row),
                  // first col
                  col: CubeSidesTopLeftCorners[newSide].col,
                },
                direction: "right",
              };
            }

            case "front": {
              return {
                location: {
                  // col becomes row
                  row:
                    CubeSidesTopLeftCorners[newSide].row +
                    (location.col - CubeSidesTopLeftCorners[side].col),
                  // first col
                  col: CubeSidesTopLeftCorners[newSide].col,
                },
                direction: "right",
              };
            }
          }
        }

        case "right": {
          switch (newSide) {
            case "back": {
              return {
                location: {
                  // col becomes row
                  row:
                    CubeSidesTopLeftCorners[newSide].row +
                    (location.col - CubeSidesTopLeftCorners[side].col),
                  // last col
                  col: CubeSidesTopLeftCorners[newSide].col + CubeSideSize - 1,
                },
                direction: "left",
              };
            }

            case "down": {
              return {
                location: {
                  // flipped row
                  row:
                    CubeSidesTopLeftCorners[newSide].row +
                    CubeSideSize -
                    1 -
                    (location.row - CubeSidesTopLeftCorners[side].row),
                  // last col
                  col: CubeSidesTopLeftCorners[newSide].col + CubeSideSize - 1,
                },
                direction: "left",
              };
            }

            case "front": {
              return {
                location: {
                  // last row
                  row: CubeSidesTopLeftCorners[newSide].row + CubeSideSize - 1,
                  // same col
                  col:
                    CubeSidesTopLeftCorners[newSide].col +
                    (location.col - CubeSidesTopLeftCorners[side].col),
                },
                direction: "up",
              };
            }
          }
        }
      }

      throw new Error("Part 2 teleport failed");
    }
  );

  return getPassword(location, direction).toString();
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
