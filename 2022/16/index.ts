// https://adventofcode.com/2022/day/16

import { readFileSync } from "node:fs";
import { PriorityQueue } from "@datastructures-js/priority-queue";

type Valve = {
  id: string;
  rate: number;
  connections: Valve[];
};

function parseValves(input: string): Valve[] {
  const valves: Record<string, Valve> = {};
  const connections: Record<string, string[]> = {};
  const re =
    /Valve (\w\w) has flow rate=(\d+); tunnels? leads? to valves? ([A-Z, ]+)/;

  for (const row of input.split("\n")) {
    const matches = row.match(re);
    const id = matches?.[1] ?? "";

    connections[id] = [];

    valves[id] = {
      id: matches?.[1] ?? "",
      rate: parseInt(matches?.[2] ?? "0"),
      connections: [],
    };

    for (const connectionId of (matches?.[3] ?? "").split(", ")) {
      connections[id].push(connectionId);
    }
  }

  for (const [id, connectionIds] of Object.entries(connections)) {
    for (const connectionId of connectionIds) {
      valves[id].connections.push(valves[connectionId]);
    }
  }

  return Object.values(valves);
}

function calculateShortestPathsFromValve(
  valves: Valve[],
  sourceValve: Valve
): Record<string, number> {
  const distances: Record<string, number> = { [sourceValve.id]: 0 };
  const queue = new PriorityQueue<Valve>(
    (a, b) => distances[a.id] - distances[b.id]
  );

  for (const valve of valves) {
    if (valve.id !== sourceValve.id) {
      distances[valve.id] = Infinity;
    }

    queue.enqueue(valve);
  }

  while (!queue.isEmpty()) {
    const valve = queue.dequeue();

    for (const connection of valve.connections) {
      const maybeShorterDistance = distances[valve.id] + 1;

      if (maybeShorterDistance < distances[connection.id]) {
        distances[connection.id] = maybeShorterDistance;
        queue.enqueue(connection);
      }
    }
  }

  return distances;
}

function calculateShortestPathsForAllValves(
  valves: Valve[]
): Record<string, Record<string, number>> {
  const distances: Record<string, Record<string, number>> = {};

  for (const valve of valves) {
    distances[valve.id] = calculateShortestPathsFromValve(valves, valve);
  }

  return distances;
}

function aStarPart1(
  valve: Valve,
  shortestPaths: Record<string, Record<string, number>>
): { valves: Valve[]; pressureReleased: number } {
  const queue = new PriorityQueue<{
    opened: Record<string, true>;
    valves: Valve[];
    timeLeft: number;
    pressureReleased: number;
  }>((a, b) => b.pressureReleased - a.pressureReleased);
  let maxSolution: { valves: Valve[]; pressureReleased: number } = {
    valves: [valve],
    pressureReleased: 0,
  };

  queue.enqueue({
    valves: [valve],
    opened: {},
    timeLeft: 30,
    pressureReleased: 0,
  });

  for (let i = 0; i < 1000000; i++) {
    if (queue.isEmpty()) {
      break;
    }

    const data = queue.dequeue();
    const currentValve = data.valves[data.valves.length - 1];
    let didEnqueue = false;

    for (const connection of data.valves[data.valves.length - 1].connections) {
      if (data.opened[connection.id]) {
        continue;
      }

      const timeRequired = shortestPaths[currentValve.id][connection.id] + 1;

      if (timeRequired <= data.timeLeft) {
        didEnqueue = true;
        queue.enqueue({
          valves: data.valves.concat(connection),
          opened: { ...data.opened, [connection.id]: true },
          timeLeft: data.timeLeft - timeRequired,
          pressureReleased:
            data.pressureReleased +
            (data.timeLeft - timeRequired) * connection.rate,
        });
      }

      if (
        !didEnqueue &&
        data.pressureReleased >= maxSolution.pressureReleased
      ) {
        maxSolution = data;
      }
    }
  }

  return maxSolution;
}

function part1(input: string): string {
  const valves = parseValves(input);
  const shortestPaths = calculateShortestPathsForAllValves(valves);
  const startingValve = valves.find((valve) => valve.id === "AA");

  const relevantValves = valves.filter((valve) => valve.rate > 0);

  if (!startingValve) {
    return "0";
  }

  for (const valve of [startingValve, ...relevantValves]) {
    valve.connections = relevantValves;
  }

  const solution = aStarPart1(startingValve, shortestPaths);

  console.log(solution);

  return solution.pressureReleased.toString();
}

function getMaxPotential(
  node: {
    opened: Record<string, boolean>;
    timeLeft: [number, number];
    pressureReleased: number;
  },
  valves: Valve[]
): number {
  const maxTimeLeft = Math.max(...node.timeLeft);

  return (
    node.pressureReleased +
    valves.reduce(
      (sum, valve) =>
        sum + (!node.opened[valve.id] ? maxTimeLeft * valve.rate : 0),
      0
    )
  );
}

function aStarPart2(
  valve: Valve,
  valves: Valve[],
  shortestPaths: Record<string, Record<string, number>>
): { valves: [Valve, Valve][]; pressureReleased: number } {
  const queue = new PriorityQueue<{
    opened: Record<string, boolean>;
    valves: [Valve, Valve][];
    timeLeft: [number, number];
    pressureReleased: number;
  }>((a, b) => {
    return (
      b.pressureReleased / Math.max(1, b.valves.length - 1) -
      a.pressureReleased / Math.max(1, a.valves.length - 1)
    );
  });
  let maxSolution: { valves: [Valve, Valve][]; pressureReleased: number } = {
    valves: [[valve, valve]],
    pressureReleased: 0,
  };

  queue.enqueue({
    valves: [[valve, valve]],
    opened: {},
    timeLeft: [26, 26],
    pressureReleased: 0,
  });

  while (!queue.isEmpty()) {
    const data = queue.dequeue();

    const [valveGuy, valveElephant] = data.valves[data.valves.length - 1];
    let didEnqueue = false;

    for (const connectionGuy of valveGuy.connections) {
      for (const connectionElephant of valveElephant.connections) {
        if (
          connectionGuy.id === connectionElephant.id ||
          (data.opened[connectionGuy.id] && data.opened[connectionElephant.id])
        ) {
          continue;
        }

        const [timeLeftGuy, timeLeftElephant] = data.timeLeft;
        const timeRequiredGuy =
          shortestPaths[valveGuy.id][connectionGuy.id] + 1;
        const timeRequiredElephant =
          shortestPaths[valveElephant.id][connectionElephant.id] + 1;

        const canGuyOpenValve =
          !data.opened[connectionGuy.id] && timeRequiredGuy <= timeLeftGuy;
        const canElephantOpenValve =
          !data.opened[connectionElephant.id] &&
          timeRequiredElephant <= timeLeftElephant;

        if (canGuyOpenValve || canElephantOpenValve) {
          const pressureReleased =
            data.pressureReleased +
            (canGuyOpenValve
              ? (timeLeftGuy - timeRequiredGuy) * connectionGuy.rate
              : 0) +
            (canElephantOpenValve
              ? (timeLeftElephant - timeRequiredElephant) *
                connectionElephant.rate
              : 0);

          const valves = data.valves.concat(
            canGuyOpenValve && canElephantOpenValve
              ? [[connectionGuy, connectionElephant]]
              : canGuyOpenValve
              ? [[connectionGuy, valveElephant]]
              : [[valveGuy, connectionElephant]]
          );

          if (
            pressureReleased / valves.length <
            0.85 * (maxSolution.pressureReleased / maxSolution.valves.length)
          ) {
            // no chance
            continue;
          }

          didEnqueue = true;

          queue.enqueue({
            opened: {
              ...data.opened,
              [connectionGuy.id]:
                data.opened[connectionGuy.id] || canGuyOpenValve,
              [connectionElephant.id]:
                data.opened[connectionElephant.id] || canElephantOpenValve,
            },
            pressureReleased,
            timeLeft: [
              timeLeftGuy - (canGuyOpenValve ? timeRequiredGuy : 0),
              timeLeftElephant -
                (canElephantOpenValve ? timeRequiredElephant : 0),
            ],
            valves,
          });
        }
      }
    }

    if (!didEnqueue && data.pressureReleased > maxSolution.pressureReleased) {
      maxSolution = data;
      console.log(
        maxSolution.pressureReleased,
        maxSolution.valves.map((a) => a.map((v) => v.id)),
        queue.size()
      );
    }
  }

  return maxSolution;
}

function part2(input: string): string {
  const valves = parseValves(input);
  const shortestPaths = calculateShortestPathsForAllValves(valves);
  const startingValve = valves.find((valve) => valve.id === "AA");

  const relevantValves = valves.filter((valve) => valve.rate > 0);

  console.log(relevantValves);

  if (!startingValve) {
    return "0";
  }

  for (const valve of [startingValve, ...relevantValves]) {
    valve.connections = relevantValves;
  }

  const solution = aStarPart2(startingValve, relevantValves, shortestPaths);

  console.log(solution);

  return solution.pressureReleased.toString();
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
