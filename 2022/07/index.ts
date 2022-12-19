// https://adventofcode.com/2022/day/7

import { readFileSync } from "node:fs";

type Context = {
  currentFolder: FileSystemFolder;
};

type Command = {
  bin: string;
  args: string[];
  output: string[];
};

class FileSystemNode {
  size = 0;
  name: string;

  constructor(name: string, size: number = 0) {
    this.name = name;
    this.size = size;
  }
}

class FileSystemFolder extends FileSystemNode {
  parent: FileSystemFolder | null;
  nodes: FileSystemNode[] = [];

  constructor(name: string, parent: FileSystemFolder | null) {
    super(name);

    this.parent = parent;
  }

  addNode(node: FileSystemNode): void {
    this.nodes.push(node);
    this.increaseSize(node.size);
  }

  increaseSize(by: number): void {
    this.size += by;
    this.parent?.increaseSize(by);
  }
}

class FileSystemFile extends FileSystemNode {
  parent: FileSystemNode;

  constructor(name: string, size: number, parent: FileSystemNode) {
    super(name, size);

    this.parent = parent;
  }
}

function buildCommands(input: string): Command[] {
  const commands: Command[] = [];

  for (const line of input.split("\n")) {
    if (line.startsWith("$")) {
      const [_, bin, ...args] = line.split(" ");

      commands.push({
        bin,
        args,
        output: [],
      });
    } else {
      commands[commands.length - 1].output.push(line);
    }
  }

  return commands;
}

function handleExecutedCommand(context: Context, command: Command): void {
  switch (command.bin) {
    case "cd": {
      if (command.args[0] === "..") {
        if (context.currentFolder.parent) {
          context.currentFolder = context.currentFolder.parent;
        }
      } else {
        const node = context.currentFolder.nodes.find(
          (node) => node.name === command.args[0]
        );

        if (node instanceof FileSystemFolder) {
          context.currentFolder = node;
        }
      }

      break;
    }

    case "ls": {
      for (const line of command.output) {
        if (line.startsWith("dir")) {
          context.currentFolder.addNode(
            new FileSystemFolder(line.split(" ")[1], context.currentFolder)
          );
        } else {
          const [size, name] = line.split(" ");
          context.currentFolder.addNode(
            new FileSystemFile(name, parseInt(size), context.currentFolder)
          );
        }
      }

      break;
    }
  }
}

function traverse(
  folder: FileSystemFolder,
  callback: (node: FileSystemNode) => void
) {
  callback(folder);

  for (const node of folder.nodes) {
    if (node instanceof FileSystemFolder) {
      traverse(node, callback);
    } else {
      callback(node);
    }
  }
}

function part1(input: string): string {
  const root = new FileSystemFolder("/", null);
  const context: Context = {
    currentFolder: root,
  };
  const commands = buildCommands(input);

  // skip first command, always is `cd /`
  for (let i = 1; i < commands.length; i++) {
    const command = commands[i];
    handleExecutedCommand(context, command);
  }

  let answer = 0;

  traverse(root, (node) => {
    if (node instanceof FileSystemFolder && node.size <= 100000) {
      answer += node.size;
    }
  });

  return answer.toString();
}

function part2(input: string): string {
  const root = new FileSystemFolder("/", null);
  const context: Context = {
    currentFolder: root,
  };
  const commands = buildCommands(input);

  // skip first command, always is `cd /`
  for (let i = 1; i < commands.length; i++) {
    const command = commands[i];
    handleExecutedCommand(context, command);
  }

  const diskSpaceNeeded = root.size - 40000000;
  let smallestEligibleFolderSize = Number.MAX_SAFE_INTEGER;

  traverse(root, (node) => {
    if (node instanceof FileSystemFolder && node.size >= diskSpaceNeeded) {
      smallestEligibleFolderSize = Math.min(
        smallestEligibleFolderSize,
        node.size
      );
    }
  });

  return smallestEligibleFolderSize.toString() ?? "";
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
