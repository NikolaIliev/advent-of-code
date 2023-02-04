// https://adventofcode.com/%year%/day/%day%

fn part1(input: &str) -> String {
    String::from("")
}

fn part2(input: &str) -> String {
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
