// https://adventofcode.com/2022/day/15

import { readFileSync } from "node:fs";

type Point = { x: number; y: number };
type Sensor = {
  location: Point;
  beacon: Point;
};

function getSensors(input: String): Sensor[] {
  const sensors: Sensor[] = [];
  const re =
    /Sensor at x=([-]{0,1}\d+), y=([-]{0,1}\d+): closest beacon is at x=([-]{0,1}\d+), y=([-]{0,1}\d+)/;

  for (const row of input.split("\n")) {
    const matches = row.match(re);

    sensors.push({
      location: {
        x: parseInt(matches?.[1] ?? "0"),
        y: parseInt(matches?.[2] ?? "0"),
      },
      beacon: {
        x: parseInt(matches?.[3] ?? "0"),
        y: parseInt(matches?.[4] ?? "0"),
      },
    });
  }

  return sensors;
}

function getManhattanDistance(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getSensorThatCoversPoint(
  point: Point,
  sensors: Sensor[]
): Sensor | undefined {
  return sensors.find(
    (sensor) =>
      getManhattanDistance(point, sensor.location) <=
      getManhattanDistance(sensor.location, sensor.beacon)
  );
}

function escape(point: Point, sensor: Sensor): void {
  // if on left side of sensor, flip
  if (point.x < sensor.location.x) {
    point.x += 2 * (sensor.location.x - point.x);
  }

  const desiredManhattanDistance =
    getManhattanDistance(sensor.location, sensor.beacon) + 1;
  const currentManhattanDistance = getManhattanDistance(point, sensor.location);

  point.x += desiredManhattanDistance - currentManhattanDistance;
}

function part1(input: string): string {
  const sensors = getSensors(input);
  const targetRow = 2e6;
  const xs: Set<number> = new Set();

  const start = Date.now();

  for (const sensor of sensors) {
    const manhattanDistance = getManhattanDistance(
      sensor.location,
      sensor.beacon
    );

    if (
      sensor.location.y - manhattanDistance <= targetRow &&
      sensor.location.y + manhattanDistance >= targetRow
    ) {
      const count =
        (manhattanDistance - Math.abs(targetRow - sensor.location.y)) * 2 + 1;

      for (
        let x = sensor.location.x - (count - 1) / 2;
        x <= sensor.location.x + (count - 1) / 2;
        x++
      ) {
        if (sensor.beacon.y !== targetRow || sensor.beacon.x !== x) {
          xs.add(x);
        }
      }
    }
  }

  return xs.size.toString();
}

function part2(input: string): string {
  const sensors = getSensors(input);

  const point: Point = { x: 0, y: 0 };
  let sensorThatCoversPoint: Sensor | undefined = undefined;

  while ((sensorThatCoversPoint = getSensorThatCoversPoint(point, sensors))) {
    escape(point, sensorThatCoversPoint);

    if (point.x > 4e6) {
      point.x = 0;
      point.y++;
    }
  }

  return (point.x * 4e6 + point.y).toString();
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
