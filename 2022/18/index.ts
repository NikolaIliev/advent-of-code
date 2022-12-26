// https://adventofcode.com/2022/day/18

import { dir } from "node:console";
import { readFileSync } from "node:fs";

type Point3D = { x: number; y: number; z: number };
type Point3DRecord = Record<number, Record<number, Record<number, true>>>;
type Direction3D = "up" | "down" | "left" | "right" | "front" | "back";

function parseInput(input: string): {
  points: Point3D[];
  pointsRecord: Point3DRecord;
} {
  const points: Point3D[] = [];

  for (const line of input.split("\n")) {
    const [x, y, z] = line.split(",").map((s) => parseInt(s));

    points.push({ x, y, z });
  }

  return {
    points,
    pointsRecord: points.reduce<Point3DRecord>((record, point) => {
      if (!record[point.x]) {
        record[point.x] = {};
      }

      if (!record[point.x][point.y]) {
        record[point.x][point.y] = {};
      }

      record[point.x][point.y][point.z] = true;

      return record;
    }, {}),
  };
}

function getPointAtDirection(point: Point3D, direction: Direction3D): Point3D {
  switch (direction) {
    case "up": {
      return { x: point.x, y: point.y + 1, z: point.z };
    }

    case "down": {
      return { x: point.x, y: point.y - 1, z: point.z };
    }

    case "left": {
      return { x: point.x - 1, y: point.y, z: point.z };
    }

    case "right": {
      return { x: point.x + 1, y: point.y, z: point.z };
    }

    case "front": {
      return { x: point.x, y: point.y, z: point.z - 1 };
    }

    case "back": {
      return { x: point.x, y: point.y, z: point.z + 1 };
    }
  }
}

function part1(input: string): string {
  const { points, pointsRecord } = parseInput(input);
  let surfaceArea = 0;
  const directions: Direction3D[] = [
    "up",
    "down",
    "left",
    "right",
    "front",
    "back",
  ];

  for (let point of points) {
    for (const direction of directions) {
      const neighbour = getPointAtDirection(point, direction);

      if (!pointsRecord[neighbour.x]?.[neighbour.y]?.[neighbour.z]) {
        surfaceArea++;
      }
    }
  }

  return surfaceArea.toString();
}

type Extremums = Record<
  "x" | "y" | "z",
  Record<number, Record<number, { min: number; max: number }>>
>;

function isPointInsideLavaDrop(point: Point3D, extremums: Extremums): boolean {
  return (
    (!extremums.x[point.y]?.[point.z] ||
      (point.x > extremums.x[point.y][point.z].min &&
        point.x < extremums.x[point.y][point.z].max)) &&
    (!extremums.y[point.x]?.[point.z] ||
      (point.y > extremums.y[point.x][point.z].min &&
        point.y < extremums.y[point.x][point.z].max)) &&
    (!extremums.z[point.x]?.[point.y] ||
      (point.z > extremums.z[point.x][point.y].min &&
        point.z < extremums.z[point.x][point.y].max))
  );
}

type WaterContext = {
  surfaceArea: number;
  bounds: { min: number; max: number };
  pointsRecord: Point3DRecord;
  visited: Point3DRecord;
};

const directions: Direction3D[] = [
  "up",
  "down",
  "left",
  "right",
  "front",
  "back",
];

let count = 0;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function simulateWater(
  point: Point3D,
  context: WaterContext
): Promise<void> {
  await delay(0);

  if (
    context.visited[point.x]?.[point.y]?.[point.z] ||
    context.pointsRecord[point.x]?.[point.y]?.[point.z]
  ) {
    return;
  }

  if (!context.visited[point.x]) {
    context.visited[point.x] = {};
  }

  if (!context.visited[point.x][point.y]) {
    context.visited[point.x][point.y] = {};
  }

  context.visited[point.x][point.y][point.z] = true;

  // air, spread in all directions
  for (let direction of directions) {
    const neighbour = getPointAtDirection(point, direction);

    if (context.pointsRecord[neighbour.x]?.[neighbour.y]?.[neighbour.z]) {
      context.surfaceArea++;
    } else if (
      neighbour.x >= context.bounds.min &&
      neighbour.x <= context.bounds.max &&
      neighbour.y >= context.bounds.min &&
      neighbour.y <= context.bounds.max &&
      neighbour.z >= context.bounds.min &&
      neighbour.z <= context.bounds.max
    ) {
      await simulateWater(neighbour, context);
    }
  }
}

async function part2(input: string): Promise<string> {
  const { points, pointsRecord } = parseInput(input);

  const minCoord = points.reduce(
    (min, point) => Math.min(min, point.x, point.y, point.z),
    Number.MAX_SAFE_INTEGER
  );
  const maxCoord = points.reduce(
    (max, point) => Math.max(max, point.x, point.y, point.z),
    Number.MIN_SAFE_INTEGER
  );

  const context: WaterContext = {
    surfaceArea: 0,
    bounds: { min: minCoord - 1, max: maxCoord + 1 },
    pointsRecord,
    visited: {},
  };

  await simulateWater(
    { x: context.bounds.min, y: context.bounds.min, z: context.bounds.min },
    context
  );

  return context.surfaceArea.toString();
}

async function main() {
  const input = readFileSync(`${__dirname}/input.data`, "utf8");

  console.log("\n=========");
  console.log("\nSolution (Part 1):\n" + part1(input));
  console.log("\n=========");
  console.log("\nSolution (Part 2):\n" + (await part2(input)));
  console.log("\n=========");
}

main();
