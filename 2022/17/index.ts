// https://adventofcode.com/2022/day/17

import { readFileSync } from "node:fs";

type Direction = "right" | "down" | "left";

type Location = { x: number; y: number };

class JetPattern {
  private pattern: string;
  private index: number;

  constructor(pattern: string) {
    this.pattern = pattern;
    this.index = 0;
  }

  get(): Direction {
    const direction = this.pattern[this.index];

    this.index++;

    if (this.index >= this.pattern.length) {
      this.index = 0;
    }

    return direction === ">" ? "right" : "left";
  }

  getIndex(): number {
    return this.index;
  }

  increaseIndexBy(n: number): void {
    this.index = (this.index + n) % this.pattern.length;
  }
}

class Chamber {
  invisibleRows = 0;
  width = 7;
  matrix: number[][] = [];

  ensureSpaceOnTop(height: number): void {
    let spaceOnTop = 0;

    while (
      spaceOnTop < this.matrix.length &&
      this.matrix[spaceOnTop].every((n) => n === 0)
    ) {
      spaceOnTop++;
    }

    if (spaceOnTop > height) {
      for (let i = 0; i < spaceOnTop - height; i++) {
        this.matrix.shift();
      }
    } else if (spaceOnTop < height) {
      for (let i = 0; i < height - spaceOnTop; i++) {
        this.matrix.unshift([0, 0, 0, 0, 0, 0, 0]);
      }
    }
  }

  insert(matrix: readonly number[][], location: Location): boolean {
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] === 1) {
          this.matrix[location.y + row][location.x + col] = 1;
        }
      }
    }

    // optimise space
    if (location.y + matrix.length >= this.matrix.length - 1) {
      return false;
    }

    let filledCols: boolean[] = [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];
    let entireRowFilledIndex: number | undefined;

    for (let y = 0; y <= matrix.length; y++) {
      let rowFilledCols = 0;
      for (let x = 0; x < 7; x++) {
        if (this.matrix[location.y + y][x] === 1) {
          rowFilledCols++;
          filledCols[x] = true;
        }
      }

      if (rowFilledCols === 7) {
        entireRowFilledIndex = location.y + y;
        break;
      }
    }

    if (entireRowFilledIndex !== undefined || filledCols.every((x) => x)) {
      // no way to pass through these 2 rows, can delete everything below them

      const lengthBeforeDeleting = this.matrix.length;

      this.matrix.splice(
        entireRowFilledIndex !== undefined
          ? entireRowFilledIndex
          : location.y + matrix.length + 1,
        this.matrix.length
      );

      this.invisibleRows += lengthBeforeDeleting - this.matrix.length;

      return entireRowFilledIndex !== undefined;
    }

    return false;
  }

  getHash(): number {
    // use this to skip empty rows at matrix start
    let hash = 0;
    let startRow: number | undefined = 0;

    for (let row = this.matrix.length - 1; row >= 0; row--) {
      let isEmptyRow = true;

      for (let col = 0; col < this.matrix[row].length; col++) {
        if (this.matrix[row][col] === 1) {
          isEmptyRow = false;
          hash += (row - startRow) * 7 + col;
        }
      }

      if (isEmptyRow) {
        break;
      }
    }

    return hash;
  }

  print(withShape?: Shape): void {
    console.log(
      this.matrix
        .map((row, y) =>
          row
            .map((n, x) =>
              n === 1
                ? "#"
                : withShape &&
                  y >= withShape.location.y &&
                  y < withShape.location.y + withShape.matrix.length &&
                  x >= withShape.location.x &&
                  x < withShape.location.x + withShape.matrix[0].length &&
                  withShape.matrix[y - withShape.location.y]?.[
                    x - withShape.location.x
                  ] === 1
                ? "@"
                : "."
            )
            .join("")
        )
        .join("\n")
    );
  }

  increaseInvisibleRowsBy(n: number): void {
    this.invisibleRows += n;
  }

  getHeight(): number {
    let firstNonEmptyRowIndex: number | undefined;

    for (let i = 0; i < this.matrix.length; i++) {
      if (this.matrix[i].some((n) => n === 1)) {
        firstNonEmptyRowIndex = i;
        break;
      }
    }

    return (
      this.invisibleRows +
      (firstNonEmptyRowIndex !== undefined
        ? this.matrix.length - firstNonEmptyRowIndex
        : 0)
    );
  }
}

class ShapesManager {
  private shapes = [
    new Shape([[1, 1, 1, 1]]),
    new Shape([
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ]),
    new Shape([
      [0, 0, 1],
      [0, 0, 1],
      [1, 1, 1],
    ]),
    new Shape([[1], [1], [1], [1]]),
    new Shape([
      [1, 1],
      [1, 1],
    ]),
  ];
  private index = 0;

  get(): Shape {
    const nextShape = this.shapes[this.index];

    this.index++;

    if (this.index === this.shapes.length) {
      this.index = 0;
    }

    return nextShape;
  }

  getIndex(): number {
    return this.index;
  }

  increaseIndexBy(n: number): void {
    this.index = (this.index + n) % this.shapes.length;
  }
}

class Shape {
  location: Location = { x: 0, y: 0 };
  matrix: readonly number[][];

  constructor(matrix: readonly number[][]) {
    this.matrix = matrix;
  }

  setX(x: number): void {
    this.location.x = x;
  }
  setY(y: number): void {
    this.location.y = y;
  }

  canMove(direction: Direction, chamber: Chamber): boolean {
    for (let y = 0; y < this.matrix.length; y++) {
      for (let x = 0; x < this.matrix[y].length; x++) {
        if (this.matrix[y][x] !== 1) {
          continue;
        }

        let canMove = false;
        switch (direction) {
          case "left": {
            canMove =
              chamber.matrix[this.location.y + y][this.location.x + x - 1] ===
              0;
            break;
          }

          case "right": {
            canMove =
              chamber.matrix[this.location.y + y][this.location.x + x + 1] ===
              0;
            break;
          }

          case "down": {
            canMove =
              chamber.matrix[this.location.y + y + 1]?.[this.location.x + x] ===
              0;
            break;
          }
        }

        if (!canMove) {
          return false;
        }
      }
    }

    return true;
  }

  maybeMove(direction: Direction, chamber: Chamber): boolean {
    if (!this.canMove(direction, chamber)) {
      return false;
    }

    switch (direction) {
      case "left": {
        this.location.x--;
        break;
      }

      case "right": {
        this.location.x++;
        break;
      }

      case "down": {
        this.location.y++;
        break;
      }
    }

    return true;
  }

  settle(chamber: Chamber): boolean {
    return chamber.insert(this.matrix, this.location);
  }
}

function part1(input: string): string {
  const jetPattern = new JetPattern(input);
  const shapesManager = new ShapesManager();
  const chamber = new Chamber();

  for (let i = 1; i <= 2022; i++) {
    const shape = shapesManager.get();

    chamber.ensureSpaceOnTop(shape.matrix.length + 3);

    shape.setX(2);
    shape.setY(0);

    do {
      const pattern = jetPattern.get();
      shape.maybeMove(pattern, chamber);
    } while (shape.maybeMove("down", chamber));

    shape.settle(chamber);
  }

  chamber.print();

  return (
    chamber.invisibleRows +
    chamber.matrix.filter((row) => row.some((n) => n === 1)).length
  ).toString();
}

function part2(input: string): string {
  const jetPattern = new JetPattern(input);
  const shapesManager = new ShapesManager();
  const chamber = new Chamber();

  // cache i by shape index, jet pattern index, and state of the chamber
  const cache: Record<
    number,
    Record<
      number,
      Record<number, { shapesSettled: number; chamberHeight: number }>
    >
  > = {};

  let shapesSettled = 0;

  while (shapesSettled < 1e12) {
    const shape = shapesManager.get();

    chamber.ensureSpaceOnTop(shape.matrix.length + 3);

    shape.setX(2);
    shape.setY(0);

    do {
      const pattern = jetPattern.get();
      shape.maybeMove(pattern, chamber);
    } while (shape.maybeMove("down", chamber));

    const didJustClearRow = shape.settle(chamber);
    shapesSettled++;

    if (didJustClearRow) {
      const cacheEntry =
        cache[shapesManager.getIndex()]?.[jetPattern.getIndex()]?.[
          chamber.getHash()
        ];

      if (cacheEntry) {
        const heightPerLoop = chamber.getHeight() - cacheEntry.chamberHeight;
        const shapesSettledPerLoop = shapesSettled - cacheEntry.shapesSettled;
        const loops = Math.floor((1e12 - shapesSettled) / shapesSettledPerLoop);

        shapesSettled += loops * shapesSettledPerLoop;
        chamber.increaseInvisibleRowsBy(loops * heightPerLoop);
      } else {
        if (!cache[shapesManager.getIndex()]) {
          cache[shapesManager.getIndex()] = {};
        }

        if (!cache[shapesManager.getIndex()][jetPattern.getIndex()]) {
          cache[shapesManager.getIndex()][jetPattern.getIndex()] = {};
        }

        cache[shapesManager.getIndex()][jetPattern.getIndex()][
          chamber.getHash()
        ] = { chamberHeight: chamber.getHeight(), shapesSettled };
      }
    }
  }

  chamber.print();

  return chamber.getHeight().toString();
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
