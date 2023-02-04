// https://adventofcode.com/2020/day/3

use std::fs;

struct Slope {
    right: usize,
    down: usize,
}

fn parse_input(input: &str) -> Vec<Vec<char>> {
    input.split('\n').map(|row| row.chars().collect()).collect()
}

fn get_trees_for_slope(matrix: &Vec<Vec<char>>, slope: &Slope) -> usize {
    let width = matrix[0].len();
    let mut row: usize = 0;
    let mut col: usize = 0;
    let mut tree_count = 0;

    while row < matrix.len() {
        if matrix[row][col] == '#' {
            tree_count += 1;
        }

        row += slope.down;
        col = (col + slope.right) % width;
    }

    tree_count
}

fn part1(input: &str) -> String {
    let matrix = parse_input(input);
    let slope = Slope { down: 1, right: 3 };

    get_trees_for_slope(&matrix, &slope).to_string()
}

fn part2(input: &str) -> String {
    let matrix = parse_input(input);
    const SLOPES: [Slope; 5] = [
        Slope { right: 1, down: 1 },
        Slope { right: 3, down: 1 },
        Slope { right: 5, down: 1 },
        Slope { right: 7, down: 1 },
        Slope { right: 1, down: 2 },
    ];

    SLOPES
        .iter()
        .fold(1, |acc, slope| acc * get_trees_for_slope(&matrix, slope))
        .to_string()
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
