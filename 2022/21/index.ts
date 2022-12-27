// https://adventofcode.com/2022/day/21

import { readFileSync } from "node:fs";

type MathOperation = "+" | "-" | "*" | "/";
type MonkeyJob = MathOperation | number;

class Monkey {
  id: string;
  job: MonkeyJob = 0;
  left: Monkey | null = null;
  right: Monkey | null = null;

  constructor(id: string) {
    this.id = id;
  }

  setJob(job: MonkeyJob): void {
    this.job = job;
  }

  setLeft(monkey: Monkey): void {
    this.left = monkey;
  }

  setRight(monkey: Monkey): void {
    this.right = monkey;
  }

  performJob(): number {
    if (typeof this.job === "number") {
      return this.job;
    }

    if (!this.left || !this.right) {
      throw new Error("Cannot perform job - unknown left/right monkeys");
    }

    const left = this.left.performJob();
    const right = this.right.performJob();

    switch (this.job) {
      case "+": {
        return left + right;
      }

      case "-": {
        return left - right;
      }

      case "*": {
        return left * right;
      }

      case "/": {
        return left / right;
      }
    }
  }
}

function parseInput(input: string): Record<string, Monkey> {
  const monkeys: Record<string, Monkey> = {};

  for (let line of input.split("\n")) {
    const [id, jobDescription] = line.split(": ");

    monkeys[id] = monkeys[id] ?? new Monkey(id);

    if (Number.isInteger(parseInt(jobDescription))) {
      monkeys[id].setJob(parseInt(jobDescription));
    } else {
      const [leftId, mathOperation, rightId] = jobDescription.split(" ");

      monkeys[id].setJob(mathOperation as MathOperation);

      monkeys[leftId] = monkeys[leftId] ?? new Monkey(leftId);
      monkeys[rightId] = monkeys[rightId] ?? new Monkey(leftId);

      monkeys[id].setLeft(monkeys[leftId]);
      monkeys[id].setRight(monkeys[rightId]);
    }
  }

  return monkeys;
}

function part1(input: string): string {
  const monkeys = parseInput(input);

  return monkeys.root.performJob().toString();
}

function calculateJobWithHumanNumber(
  n: number,
  human: Monkey,
  topMonkeyLinkedToHuman: Monkey
): number {
  human.setJob(n);
  return topMonkeyLinkedToHuman.performJob();
}

function part2(input: string): string {
  const monkeys = parseInput(input);

  // detect which subtree - left or right, contains the humn monkey
  monkeys.humn.setJob(Infinity);
  const leftJobResult = monkeys.root.left?.performJob();
  const rightJobResult = monkeys.root.right?.performJob();

  const targetValue =
    leftJobResult === Infinity || leftJobResult === -Infinity
      ? rightJobResult
      : leftJobResult;

  if (targetValue === undefined) {
    throw new Error("Something went wrong");
  }

  const topMonkeyLinkedToHuman =
    leftJobResult === Infinity || leftJobResult === -Infinity
      ? monkeys.root.left
      : monkeys.root.right;

  if (!topMonkeyLinkedToHuman) {
    throw new Error("Something went wrong");
  }

  // now find left and right bound so we can do binary search

  let leftBound = 1;
  let rightBound = 1;

  while (
    calculateJobWithHumanNumber(
      rightBound,
      monkeys.humn,
      topMonkeyLinkedToHuman
    ) < targetValue
  ) {
    rightBound *= 10;
  }

  let middle = Math.floor((leftBound + rightBound) / 2);
  let currentValue = calculateJobWithHumanNumber(
    middle,
    monkeys.humn,
    topMonkeyLinkedToHuman
  );

  while (currentValue !== targetValue) {
    if (currentValue < targetValue) {
      leftBound = middle + 1;
    } else {
      rightBound = middle - 1;
    }

    middle = Math.floor((leftBound + rightBound) / 2);
    currentValue = calculateJobWithHumanNumber(
      middle,
      monkeys.humn,
      topMonkeyLinkedToHuman
    );
  }

  return middle.toString();
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
