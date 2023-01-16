// https://adventofcode.com/2022/day/2

import { readFileSync } from "node:fs";

const choices = ["rock", "paper", "scissors"] as const;
const outcomes = ["lose", "draw", "win"] as const;
type Choice = typeof choices[number];
type Outcome = typeof outcomes[number];

type GameRound = {
  us: Choice;
  them: Choice;
  outcome: Outcome;
};

const win: Record<Choice, Choice> = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

function getOutcome(us: Choice, them: Choice): Outcome {
  return us === them ? "draw" : win[us] === them ? "win" : "lose";
}

const AllPossibleRounds: GameRound[] = choices.reduce((rounds, us) => {
  for (const them of choices) {
    rounds.push({
      us,
      them,
      outcome: getOutcome(us, them),
    });
  }
  return rounds;
}, [] as GameRound[]);

const PointsForChoice: Record<Choice, number> = {
  rock: 1,
  paper: 2,
  scissors: 3,
};

const PointsForOutcome: Record<Outcome, number> = {
  win: 6,
  draw: 3,
  lose: 0,
};

function scoreRounds(rounds: GameRound[]): number {
  return rounds.reduce(
    (sum, round) =>
      sum + PointsForChoice[round.us] + PointsForOutcome[round.outcome],
    0
  );
}

function part1(input: string): string {
  const rounds: GameRound[] = [];

  for (const line of input.split("\n")) {
    const [themRaw, usRaw] = line.split(" ");
    const us: Choice = choices[["X", "Y", "Z"].indexOf(usRaw)];
    const them: Choice = choices[["A", "B", "C"].indexOf(themRaw)];
    const round = AllPossibleRounds.find(
      (round) => round.us === us && round.them === them
    );

    if (round) {
      rounds.push(round);
    }
  }

  return scoreRounds(rounds).toString();
}

function part2(input: string): string {
  const rounds: GameRound[] = [];

  for (const line of input.split("\n")) {
    const [themRaw, outcomeRaw] = line.split(" ");
    const them: Choice = choices[["A", "B", "C"].indexOf(themRaw)];
    const outcome: Outcome = outcomes[["X", "Y", "Z"].indexOf(outcomeRaw)];

    const round = AllPossibleRounds.find(
      (round) => round.them === them && round.outcome === outcome
    );

    if (round) {
      rounds.push(round);
    }
  }

  return scoreRounds(rounds).toString();
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
