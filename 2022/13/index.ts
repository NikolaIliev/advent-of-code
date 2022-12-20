// https://adventofcode.com/2022/day/13

import { readFileSync } from "node:fs";

type Input = number | Input[];
type Packet = Input[];
type PacketPair = [Packet, Packet];

const a: Packet = [1, 2, [1, [1]]];
const b: PacketPair = [[1], [2]];

function parseInput(input: string): PacketPair[] {
  return input
    .split("\n\n")
    .map((s) => s.split("\n").map((s) => JSON.parse(s))) as PacketPair[];
}

function compare(a: Input, b: Input): "correct" | "incorrect" | "continue" {
  if (typeof a === "number" && typeof b === "number") {
    return a < b ? "correct" : a > b ? "incorrect" : "continue";
  }

  if (typeof a === "number") {
    a = [a];
  }

  if (typeof b === "number") {
    b = [b];
  }

  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const left = a[i];
    const right = b[i];

    if (left === undefined && right !== undefined) {
      return "correct";
    }

    if (left !== undefined && right === undefined) {
      return "incorrect";
    }

    const comparison = compare(left, right);

    if (comparison !== "continue") {
      return comparison;
    }
  }

  return "continue";
}

function arePacketsInCorrectOrder(pair: PacketPair): boolean {
  return compare(pair[0], pair[1]) === "correct";
}

function part1(input: string): string {
  const packetPairs = parseInput(input);
  const correctlyOrderedPacketPairsIndices: number[] = [];

  for (let i = 0; i < packetPairs.length; i++) {
    if (arePacketsInCorrectOrder(packetPairs[i])) {
      correctlyOrderedPacketPairsIndices.push(i + 1);
    }
  }

  return correctlyOrderedPacketPairsIndices
    .reduce((sum, i) => sum + i, 0)
    .toString();
}

function part2(input: string): string {
  const packetPairs = parseInput(input);
  const dividerPackets: Packet[] = [[[2]], [[6]]];

  const sortedPackets = packetPairs
    .flat()
    .concat(dividerPackets)
    .sort((a, b) => {
      return arePacketsInCorrectOrder([a, b]) ? -1 : 1;
    });

  return dividerPackets
    .reduce(
      (product, packet) => product * (sortedPackets.indexOf(packet) + 1),
      1
    )
    .toString();
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
