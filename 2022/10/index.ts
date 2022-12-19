// https://adventofcode.com/2022/day/10

import { readFileSync } from "node:fs";

type Registers = {
  x: number;
};

interface Instruction {
  cycles: number;
  execute(registers: Registers): void;
}

class NoopInstruction implements Instruction {
  cycles = 1;
  execute() {}
}

class AddXInstruction implements Instruction {
  cycles = 2;
  add: number;

  constructor(add: number) {
    this.add = add;
  }

  execute(registers: Registers) {
    registers.x += this.add;
  }
}

class CPU {
  cycle = 0;
  registers: Registers = { x: 1 };
  instructions: Instruction[] = [];

  queueInstruction(instruction: Instruction): void {
    this.instructions.push(instruction);
  }

  startCycle(): void {
    this.cycle++;
    this.instructions[0].cycles--;
  }

  endCycle(): void {
    if (this.instructions[0].cycles === 0) {
      this.instructions[0].execute(this.registers);
      this.instructions.shift();
    }
  }
}

class CRT {
  x = 0;
  y = 0;
  width = 40;
  height = 6;
  screen: string[][] = new Array(this.height)
    .fill(0)
    .map(() => new Array(this.width).fill(" "));

  draw(spriteX: number): void {
    if (Math.abs(this.x - spriteX) <= 1) {
      this.screen[this.y][this.x] = "#";
    }

    this.x++;

    if (this.x === this.width) {
      this.x = 0;
      this.y++;
    }
  }

  flush(): string {
    return this.screen.map((row) => row.join("")).join("\n");
  }
}

function parseInstructionsIntoCpu(input: string, cpu: CPU): void {
  const rows = input.split("\n");
  for (const row of rows) {
    const [name, ...args] = row.split(" ");

    switch (name) {
      case "noop": {
        cpu.queueInstruction(new NoopInstruction());
        break;
      }

      case "addx": {
        cpu.queueInstruction(new AddXInstruction(parseInt(args[0])));
        break;
      }
    }
  }
}

function part1(input: string): string {
  const cpu = new CPU();
  parseInstructionsIntoCpu(input, cpu);

  let signalStrengthSum = 0;
  const significantCycles = [20, 60, 100, 140, 180, 220];

  for (let i = 1; i <= significantCycles[significantCycles.length - 1]; i++) {
    cpu.startCycle();

    if (significantCycles.includes(cpu.cycle)) {
      signalStrengthSum += i * cpu.registers.x;
    }

    cpu.endCycle();
  }

  return signalStrengthSum.toString();
}

function part2(input: string): string {
  const cpu = new CPU();
  const crt = new CRT();
  parseInstructionsIntoCpu(input, cpu);

  for (let i = 1; i <= 240; i++) {
    cpu.startCycle();
    crt.draw(cpu.registers.x);
    cpu.endCycle();
  }

  return crt.flush();
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
