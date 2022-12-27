// https://adventofcode.com/2022/day/20

import nodeCluster from "node:cluster";
import { readFileSync } from "node:fs";

type DoublyLinkedListNode = {
  value: number;
  prev: DoublyLinkedListNode;
  next: DoublyLinkedListNode;
};

function parseValues(values: number[]): {
  nodes: DoublyLinkedListNode[];
  zeroNode: DoublyLinkedListNode;
} {
  let firstNode: DoublyLinkedListNode = {
    value: values[0],
    prev: null as any, // don't wanna deal with nulls later so lie to TS here
    next: null as any, // don't wanna deal with nulls later so lie to TS here
  };
  let currentNode: DoublyLinkedListNode = firstNode;
  const nodes: DoublyLinkedListNode[] = [firstNode];
  let zeroNode: DoublyLinkedListNode | null =
    firstNode.value === 0 ? firstNode : null;

  for (let i = 1; i < values.length; i++) {
    currentNode.next = {
      value: values[i],
      prev: currentNode,
      next: null as any,
    };

    currentNode = currentNode.next;
    nodes.push(currentNode);

    if (currentNode.value === 0) {
      zeroNode = currentNode;
    }
  }

  // create loop
  currentNode.next = firstNode;
  firstNode.prev = currentNode;

  if (!zeroNode) {
    throw new Error("Could not find zero node. Wrong input?");
  }

  return { nodes, zeroNode };
}

function move(node: DoublyLinkedListNode, listLength: number): void {
  let targetNode = node;

  if (node.value === 0) {
    return;
  }

  const direction: "next" | "prev" = node.value > 0 ? "next" : "prev";

  // when moving backwards (negative value),
  // targetNode is acquired by taking .prev one additional time
  const rawMoveCount = direction === "next" ? node.value : -node.value + 1;
  const optimisedMoveCount =
    rawMoveCount > listLength
      ? // when looping, remember to skip the original position for every loop
        // after the first
        rawMoveCount % (listLength - 1)
      : rawMoveCount;

  for (let i = 0; i < optimisedMoveCount; i++) {
    targetNode = targetNode[direction];

    // looped around and reached the same node, we must skip it
    // as it's not supposed to be there
    if (targetNode === node) {
      targetNode = targetNode[direction];
    }
  }

  node.prev.next = node.next;
  node.next.prev = node.prev;
  node.prev = targetNode;
  node.next = targetNode.next;
  node.prev.next = node;
  node.next.prev = node;
}

function print(node: DoublyLinkedListNode): void {
  const values: number[] = [];
  let currentNode = node;

  do {
    values.push(currentNode.value);
    currentNode = currentNode.next;
  } while (currentNode !== node);

  console.log(values.join(", "));
}

function getGroveCoordinateSum(zeroNode: DoublyLinkedListNode): number {
  let currentNode = zeroNode;
  let groveCoordinatesSum = 0;

  for (let i = 1; i <= 3000; i++) {
    currentNode = currentNode.next;

    if (i % 1000 === 0) {
      groveCoordinatesSum += currentNode.value;
    }
  }

  return groveCoordinatesSum;
}

function part1(input: string): string {
  const values = input.split("\n").map((s) => parseInt(s));
  const { nodes, zeroNode } = parseValues(values);

  for (const node of nodes) {
    move(node, values.length);
  }

  return getGroveCoordinateSum(zeroNode).toString();
}

function part2(input: string): string {
  const values = input.split("\n").map((s) => parseInt(s) * 811589153);
  const { nodes, zeroNode } = parseValues(values);

  for (let i = 0; i < 10; i++) {
    for (const node of nodes) {
      move(node, values.length);
    }
  }

  return getGroveCoordinateSum(zeroNode).toString();
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
