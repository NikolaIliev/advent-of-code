// https://adventofcode.com/2020/day/1

use std::fs;

fn parse_input(input: &str) -> Vec<u32> {
    input
        .split('\n')
        .map(|s| s.parse::<u32>().unwrap_or(0))
        .collect()
}

fn part1(input: &str) -> String {
    let numbers = parse_input(input);

    for i in 0..numbers.len() {
        for j in i + 1..numbers.len() {
            if numbers[i] + numbers[j] == 2020 {
                return (numbers[i] * numbers[j]).to_string();
            }
        }
    }

    String::from("")
}

fn part2(input: &str) -> String {
    let numbers = parse_input(input);

    for i in 0..numbers.len() {
        for j in i + 1..numbers.len() {
            for k in j + 1..numbers.len() {
                if numbers[i] + numbers[j] + numbers[k] == 2020 {
                    return (numbers[i] * numbers[j] * numbers[k]).to_string();
                }
            }
        }
    }

    String::from("")
}

fn main() {
    let file_content = fs::read_to_string("input.data").expect("Couldn't read ../input.data");
    let input = file_content.trim_end();

    println!("\n=========");
    println!("\nSolution (Part 1):\n{}", part1(input));
    println!("\n=========");
    println!("\nSolution (Part 2):\n{}", part2(input));
    println!("\n=========");
}
