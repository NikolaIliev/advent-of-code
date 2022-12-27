// https://adventofcode.com/2022/day/19

import { readFileSync } from "node:fs";

// Change these around if you're not getting a correct answer
// Good luck.
const Heuristics = {
  maxConsecutiveWaits: 2,
  maxClayRobotsFractionOfMaxMinutes: 3,
  geodePruningDistance: 2,
  stopProducingClayAndOreRobotsIfObsidianRobotsCountExceeds: 2,
};

type Resource = "ore" | "clay" | "obsidian" | "geode";

type Blueprint = {
  id: number;
  robotCosts: Record<Resource, Record<Resource, number>>;
};

function parseInput(input: string): Blueprint[] {
  const blueprints: Blueprint[] = [];
  const re =
    /Blueprint (\d+): Each ore robot costs (\d+) ore. Each clay robot costs (\d+) ore. Each obsidian robot costs (\d+) ore and (\d+) clay. Each geode robot costs (\d+) ore and (\d+) obsidian./;

  for (let line of input.split("\n")) {
    const matches = line.match(re);

    blueprints.push({
      id: parseInt(matches?.[1] ?? "0"),
      robotCosts: {
        ore: {
          ore: parseInt(matches?.[2] ?? "0"),
          clay: 0,
          obsidian: 0,
          geode: 0,
        },
        clay: {
          ore: parseInt(matches?.[3] ?? "0"),
          clay: 0,
          obsidian: 0,
          geode: 0,
        },
        obsidian: {
          ore: parseInt(matches?.[4] ?? "0"),
          clay: parseInt(matches?.[5] ?? "0"),
          obsidian: 0,
          geode: 0,
        },
        geode: {
          ore: parseInt(matches?.[6] ?? "0"),
          clay: 0,
          obsidian: parseInt(matches?.[7] ?? "0"),
          geode: 0,
        },
      },
    });
  }

  return blueprints;
}

type GameContext = {
  minute: number;
  maxMinute: number;
  resources: Record<Resource, number>;
  produce: Record<Resource, number>;
  maxScoreForMinute: Record<number, number>;
  maxGeodeForMinute: Record<number, number>;
  path: BuildAction[];
};

function canBuild(
  robot: Resource,
  blueprint: Blueprint,
  context: GameContext
): boolean {
  let canBuild = true;
  for (let resource in blueprint.robotCosts[robot]) {
    const cost = blueprint.robotCosts[robot][resource as Resource];

    canBuild = canBuild && context.resources[resource as Resource] >= cost;
  }

  return canBuild;
}

type BuildAction = Resource | "wait";

function play(
  blueprint: Blueprint,
  buildAction: BuildAction,
  context: GameContext
): void {
  context.path.push(buildAction);

  if (buildAction !== "wait") {
    // spend resources to build, assume we have the resources, this should have been checked when setting buildAction
    for (let resource in blueprint.robotCosts[buildAction]) {
      context.resources[resource as Resource] -=
        blueprint.robotCosts[buildAction][resource as Resource];
    }
  }

  // resource gathering
  for (let resource in context.produce) {
    context.resources[resource as Resource] +=
      context.produce[resource as Resource];
  }

  // pruning
  if (context.maxGeodeForMinute[context.minute] === undefined) {
    context.maxGeodeForMinute[context.minute] = context.resources.geode;
  } else {
    if (
      context.resources.geode + Heuristics.geodePruningDistance <
      context.maxGeodeForMinute[context.minute]
    ) {
      return;
    }

    if (context.resources.geode > context.maxGeodeForMinute[context.minute]) {
      context.maxGeodeForMinute[context.minute] = context.resources.geode;
    }
  }

  // finish build
  if (buildAction !== "wait") {
    context.produce[buildAction]++;
  }

  if (context.minute === context.maxMinute) {
    return;
  }

  // DFS next build move

  const didReachMaxObsidianRobots =
    context.produce.obsidian >= blueprint.robotCosts.geode.obsidian;

  const didReachMaxClayRobots =
    context.produce.clay >=
    Math.min(
      context.maxMinute / Heuristics.maxClayRobotsFractionOfMaxMinutes,
      blueprint.robotCosts.obsidian.clay
    );

  const didReachMaxOreRobots =
    context.produce.ore >=
    Math.max(
      blueprint.robotCosts.ore.ore,
      blueprint.robotCosts.clay.ore,
      blueprint.robotCosts.obsidian.ore,
      blueprint.robotCosts.geode.ore
    );

  let didScheduleBuild = false;

  if (
    context.produce.obsidian >
    Heuristics.stopProducingClayAndOreRobotsIfObsidianRobotsCountExceeds
  ) {
    if (canBuild("geode", blueprint, context)) {
      didScheduleBuild = true;
      play(blueprint, "geode", {
        minute: context.minute + 1,
        maxMinute: context.maxMinute,
        maxScoreForMinute: context.maxScoreForMinute,
        maxGeodeForMinute: context.maxGeodeForMinute,
        produce: { ...context.produce },
        resources: { ...context.resources },
        path: [...context.path],
      });
    }

    if (
      canBuild("obsidian", blueprint, context) &&
      !didReachMaxObsidianRobots
    ) {
      didScheduleBuild = true;
      play(blueprint, "obsidian", {
        minute: context.minute + 1,
        maxMinute: context.maxMinute,
        maxScoreForMinute: context.maxScoreForMinute,
        maxGeodeForMinute: context.maxGeodeForMinute,
        produce: { ...context.produce },
        resources: { ...context.resources },
        path: [...context.path],
      });
    }
  } else {
    if (
      canBuild("obsidian", blueprint, context) &&
      !didReachMaxObsidianRobots
    ) {
      didScheduleBuild = true;
      play(blueprint, "obsidian", {
        minute: context.minute + 1,
        maxMinute: context.maxMinute,
        maxScoreForMinute: context.maxScoreForMinute,
        maxGeodeForMinute: context.maxGeodeForMinute,
        produce: { ...context.produce },
        resources: { ...context.resources },
        path: [...context.path],
      });
    }

    if (canBuild("clay", blueprint, context) && !didReachMaxClayRobots) {
      didScheduleBuild = true;
      play(blueprint, "clay", {
        minute: context.minute + 1,
        maxMinute: context.maxMinute,
        maxScoreForMinute: context.maxScoreForMinute,
        maxGeodeForMinute: context.maxGeodeForMinute,
        produce: { ...context.produce },
        resources: { ...context.resources },
        path: [...context.path],
      });
    }

    if (canBuild("ore", blueprint, context) && !didReachMaxOreRobots) {
      didScheduleBuild = true;
      play(blueprint, "ore", {
        minute: context.minute + 1,
        maxMinute: context.maxMinute,
        maxScoreForMinute: context.maxScoreForMinute,
        maxGeodeForMinute: context.maxGeodeForMinute,
        produce: { ...context.produce },
        resources: { ...context.resources },
        path: [...context.path],
      });
    }
  }

  let consecutiveWaits = 0;

  for (let i = context.path.length - 1; i >= 0; i--) {
    if (context.path[i] === "wait") {
      consecutiveWaits++;
    } else {
      break;
    }
  }

  if (!didScheduleBuild || consecutiveWaits < Heuristics.maxConsecutiveWaits) {
    play(blueprint, "wait", {
      minute: context.minute + 1,
      maxMinute: context.maxMinute,
      maxScoreForMinute: context.maxScoreForMinute,
      maxGeodeForMinute: context.maxGeodeForMinute,
      produce: { ...context.produce },
      resources: { ...context.resources },
      path: [...context.path],
    });
  }
}

function part1(input: string): string {
  const blueprints = parseInput(input);
  let answer = 0;

  for (let blueprint of blueprints) {
    const context: GameContext = {
      maxScoreForMinute: {},
      maxGeodeForMinute: {},
      minute: 1,
      maxMinute: 24,
      produce: { ore: 1, clay: 0, obsidian: 0, geode: 0 },
      resources: { ore: 0, clay: 0, obsidian: 0, geode: 0 },
      path: [],
    };

    play(blueprint, "wait", context);

    console.log(
      "Blueprint",
      blueprint.id,
      "max geodes in 24 minutes:",
      context.maxGeodeForMinute[24]
    );

    answer += blueprint.id * context.maxGeodeForMinute[24];
  }

  return answer.toString();
}

function part2(input: string): string {
  const blueprints = parseInput(input);
  let answer = 1;

  for (let i = 0; i < 3; i++) {
    const blueprint = blueprints[i];

    const context: GameContext = {
      maxScoreForMinute: {},
      maxGeodeForMinute: {},
      minute: 1,
      maxMinute: 32,
      produce: { ore: 1, clay: 0, obsidian: 0, geode: 0 },
      resources: { ore: 0, clay: 0, obsidian: 0, geode: 0 },
      path: [],
    };

    play(blueprint, "wait", context);

    console.log(
      "Blueprint",
      blueprint.id,
      "max geodes in 32 minutes:",
      context.maxGeodeForMinute[32]
    );

    answer *= context.maxGeodeForMinute[32];
  }

  return answer.toString();
}

function main() {
  const input = readFileSync(`${__dirname}/input.data`, "utf8");

  console.log("\nStrap in, this might take a while...\n");
  console.log("\n=========");
  console.log("\nSolution (Part 1):\n" + part1(input));
  console.log("\n=========");
  console.log("\nSolution (Part 2):\n" + part2(input));
  console.log("\n=========");
}

main();
