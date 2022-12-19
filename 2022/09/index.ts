// https://adventofcode.com/2022/day/9

import { readFileSync } from "node:fs";

type Direction = "U" | "R" | "D" | "L";

class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  move(direction: Direction): void {
    switch (direction) {
      case "U": {
        this.y++;
        break;
      }

      case "R": {
        this.x++;
        break;
      }

      case "D": {
        this.y--;
        break;
      }

      case "L": {
        this.x--;
        break;
      }
    }
  }
}

class AttachedPoint extends Point {
  attachedTo: Point;

  constructor(x: number, y: number, attachedTo: Point) {
    super(x, y);

    this.attachedTo = attachedTo;
  }

  follow(): void {
    const adjacent =
      Math.abs(this.x - this.attachedTo.x) <= 1 &&
      Math.abs(this.y - this.attachedTo.y) <= 1;

    if (adjacent) {
      return;
    }

    if (this.y !== this.attachedTo.y) {
      // move vertically in the direction of the attached point
      this.move(this.y < this.attachedTo.y ? "U" : "D");
    }

    if (this.x !== this.attachedTo.x) {
      // move horizontally in the direction of the attached point
      this.move(this.x < this.attachedTo.x ? "R" : "L");
    }
  }
}

function last<T>(arr: T[]): T | undefined {
  return arr.length > 0 ? arr[arr.length - 1] : undefined;
}

function part1(input: string): string {
  const head = new Point(0, 0);
  const tail = new AttachedPoint(0, 0, head);
  const tailPositions = new Set<string>();
  tailPositions.add("0.0");

  const commands = input.split("\n");

  for (const command of commands) {
    const parts = command.split(" ");
    const direction = parts[0] as Direction;
    const count = parseInt(parts[1]);

    for (let i = 0; i < count; i++) {
      head.move(direction);
      tail.follow();
      tailPositions.add(`${tail.x}.${tail.y}`);
    }
  }

  return tailPositions.size.toString();
}

function part2(input: string): string {
  const head = new Point(0, 0);
  const body: AttachedPoint[] = [];

  for (let i = 0; i < 8; i++) {
    body.push(new AttachedPoint(0, 0, last(body) ?? head));
  }

  const tail = new AttachedPoint(0, 0, last(body) ?? head);
  const tailPositions = new Set<string>();
  tailPositions.add("0.0");

  const commands = input.split("\n");

  for (const command of commands) {
    const parts = command.split(" ");
    const direction = parts[0] as Direction;
    const count = parseInt(parts[1]);

    for (let i = 0; i < count; i++) {
      head.move(direction);

      for (const point of body) {
        point.follow();
      }

      tail.follow();

      tailPositions.add(`${tail.x}.${tail.y}`);
    }
  }

  return tailPositions.size.toString();
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
