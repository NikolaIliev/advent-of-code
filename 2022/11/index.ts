// https://adventofcode.com/2022/day/11

import { readFileSync } from "node:fs";

type Operation = {
  sign: "+" | "*";
  operand: "self" | number;
};

type MonkeyTargetsByTestDivisibility = Record<
  "divisible" | "not-divisible",
  number
>;
type MonkeyItemTransfer = { index: number; toMonkey: number };

class Monkey {
  inspected = 0;
  items: number[] = [];
  operation: Operation;
  testDivisibilityNumber: number;
  targetsByTestDivisibility: MonkeyTargetsByTestDivisibility;
  postOpItemMapper: (item: number) => number = (item) => item;

  constructor(
    items: number[],
    operation: Operation,
    testDivisibilityNumber: number,
    targetsByTestDivisibility: MonkeyTargetsByTestDivisibility
  ) {
    this.items = items;
    this.operation = operation;
    this.testDivisibilityNumber = testDivisibilityNumber;
    this.targetsByTestDivisibility = targetsByTestDivisibility;
  }

  static parseFromString(s: string): Monkey {
    const rows = s.split("\n").map((row) => row.trim());
    const digitOperandAsString = rows[2].match(
      /Operation: new = old [+*] (\d+)/
    )?.[1];

    return new Monkey(
      rows[1]
        .replace("Starting items: ", "")
        .split(", ")
        .map((s) => parseInt(s)),

      {
        sign: rows[2].match(
          /Operation: new = old ([+*])/
        )?.[1] as Operation["sign"],
        operand: digitOperandAsString ? parseInt(digitOperandAsString) : "self",
      },
      parseInt(rows[3].replace("Test: divisible by ", "")),
      {
        divisible: parseInt(rows[4].replace("If true: throw to monkey ", "")),
        "not-divisible": parseInt(
          rows[5].replace("If false: throw to monkey ", "")
        ),
      }
    );
  }

  setPostOpItemMapper(postOpItemMapper: (item: number) => number): void {
    this.postOpItemMapper = postOpItemMapper;
  }

  addItem(item: number): void {
    this.items.push(item);
  }

  applyOperationToItemAtIndex(index: number): void {
    const operand =
      this.operation.operand === "self"
        ? this.items[index]
        : this.operation.operand;

    switch (this.operation.sign) {
      case "+": {
        this.items[index] += operand;
        break;
      }

      case "*": {
        this.items[index] *= operand;
        break;
      }
    }

    this.items[index] = this.postOpItemMapper(this.items[index]);
  }

  buildTransferForItemAtIndex(index: number): MonkeyItemTransfer {
    return {
      index,
      toMonkey:
        this.targetsByTestDivisibility[
          this.items[index] % this.testDivisibilityNumber === 0
            ? "divisible"
            : "not-divisible"
        ],
    };
  }

  clearItems(): void {
    this.items = [];
  }

  takeTurn(): MonkeyItemTransfer[] {
    const transfers: MonkeyItemTransfer[] = [];

    for (let i = 0; i < this.items.length; i++) {
      this.inspected++;
      this.applyOperationToItemAtIndex(i);
      transfers.push(this.buildTransferForItemAtIndex(i));
    }

    return transfers;
  }
}

function part1(input: string): string {
  const monkeys = input.split("\n\n").map(Monkey.parseFromString);

  for (const monkey of monkeys) {
    monkey.setPostOpItemMapper((item: number) => Math.floor(item / 3));
  }

  for (let round = 1; round <= 20; round++) {
    for (const monkey of monkeys) {
      const transfers = monkey.takeTurn();

      for (const transfer of transfers) {
        monkeys[transfer.toMonkey].addItem(monkey.items[transfer.index]);
      }

      monkey.clearItems();
    }
  }

  monkeys.sort((monkey1, monkey2) => monkey2.inspected - monkey1.inspected);

  return (monkeys[0].inspected * monkeys[1].inspected).toString();
}

function part2(input: string): string {
  const monkeys = input.split("\n\n").map(Monkey.parseFromString);
  // to keep items bounded, we perform modulo division of every item
  // dividing by the product of all testDivisibilityNumbers
  //
  // that way the divisibility property of the item stays the same relative
  // to all testDivisibilityNumbers, however the item itself does not go out of bounds
  // #math #hashtag
  const divisibilityBound = monkeys.reduce(
    (factor, monkey) => factor * monkey.testDivisibilityNumber,
    1
  );

  for (const monkey of monkeys) {
    monkey.setPostOpItemMapper((item) => item % divisibilityBound);
  }

  for (let round = 1; round <= 10000; round++) {
    for (const monkey of monkeys) {
      const transfers = monkey.takeTurn();

      for (const transfer of transfers) {
        monkeys[transfer.toMonkey].addItem(monkey.items[transfer.index]);
      }

      monkey.clearItems();
    }
  }

  monkeys.sort((monkey1, monkey2) => monkey2.inspected - monkey1.inspected);

  return (monkeys[0].inspected * monkeys[1].inspected).toString();
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
