// https://adventofcode.com/2020/day/2

use std::fs;

use regex::Regex;
use lazy_static::lazy_static;

#[derive(Debug)]
struct PasswordPolicy {
    c: char,
    min: usize,
    max: usize,
    password: String,
}

impl PasswordPolicy {
    fn check_old(&self) -> bool {
        let char_count = self.password.matches(self.c).count();

        char_count >= self.min && char_count <= self.max
    }

    fn check_new(&self) -> bool {
        let contains_first = self.password.chars().nth(self.min - 1).unwrap_or(' ') == self.c;
        let contains_second = self.password.chars().nth(self.max - 1).unwrap_or(' ') == self.c;

        contains_first ^ contains_second
    }
}


fn parse_input(input: &str) -> Vec<PasswordPolicy> {
    let mut policies: Vec<PasswordPolicy> = Vec::new();

    for line in input.split('\n') {
        lazy_static! {
            static ref RE: Regex = Regex::new(r"(\d+)-(\d+) (\w): (\w+)").unwrap();
        }

        let captures = RE.captures(line).expect(format!("Could not parse line {}", &line).as_str());

        policies.push(PasswordPolicy {
            c: captures[3].chars().nth(0).unwrap(),
            min: captures[1].parse::<usize>().unwrap_or(0),
            max: captures[2].parse::<usize>().unwrap_or(0),
            password: captures[4].to_string(),
        })
    }

    policies
}

fn part1(input: &str) -> String {
    let policies = parse_input(input);

    policies.iter().filter(|policy| policy.check_old()).count().to_string()
}

fn part2(input: &str) -> String {
    let policies = parse_input(input);

    policies.iter().filter(|policy| policy.check_new()).count().to_string()
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
