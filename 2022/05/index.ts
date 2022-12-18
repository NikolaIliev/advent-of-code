// https://adventofcode.com/2022/day/5

import { readFileSync } from "node:fs";

type Crate = string;
type Stack = Crate[];

type Command = {
  from: number;
  to: number;
  count: number;
};

function extractStacks(rows: string[]): Stack[] {
  const indexOfEmptyRow = rows.findIndex((row) => row === "");
  const stacksCount = parseInt(
    rows[indexOfEmptyRow - 1][rows[indexOfEmptyRow - 1].length - 2]
  );
  const stacks: Stack[] = new Array(stacksCount).fill(0).map(() => []);

  for (let i = 0; i < indexOfEmptyRow - 1; i++) {
    const row = rows[i];

    for (let j = 0; j < stacksCount; j++) {
      const crate: Crate = row[j * 4 + 1];

      if (crate !== " ") {
        stacks[j].unshift(crate);
      }
    }
  }

  return stacks;
}

function extractCommands(rows: string[]): Command[] {
  const commands: Command[] = [];
  const indexOfEmptyRow = rows.findIndex((row) => row === "");

  for (let i = indexOfEmptyRow + 1; i < rows.length; i = i + 1) {
    const commandString = rows[i];

    const numbers = commandString
      .split(" ")
      .filter((nikol) => /\d+/.test(nikol));

    commands.push({
      count: parseInt(numbers[0]),
      from: parseInt(numbers[1]) - 1,
      to: parseInt(numbers[2]) - 1,
    });
  }

  return commands;
}

function crateMover9000(command: Command, stacks: Stack[]): void {
  for (let i = 0; i < command.count; i++) {
    stacks[command.to].push(stacks[command.from].pop());
  }
}

function crateMover9001(command: Command, stacks: Stack[]): void {
  stacks[command.to].push(...stacks[command.from].splice(-command.count));
}

function part1(input: string): string {
  const rows = input.split("\n");

  const stacks: Stack[] = extractStacks(rows);
  const commands: Command[] = extractCommands(rows);

  for (const command of commands) {
    crateMover9000(command, stacks);
  }

  return stacks.map((stack) => stack[stack.length - 1]).join("");
}

function part2(input: string): string {
  const rows = input.split("\n");

  const stacks: Stack[] = extractStacks(rows);
  const commands: Command[] = extractCommands(rows);

  for (const command of commands) {
    crateMover9001(command, stacks);
  }

  return stacks.map((stack) => stack[stack.length - 1]).join("");
}

function main() {
  const input = readFileSync(`${__dirname}/input.data`, "utf8");

  console.log("Solution (Part 1):", part1(input));
  console.log("Solution (Part 2):", part2(input));
}

main();
