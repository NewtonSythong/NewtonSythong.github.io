/** Returns the projects sorted by `data.rank`, lowest (strongest) first. */
export function byRank<T extends { data: { rank: number } }>(projects: T[]): T[] {
	return [...projects].sort((a, b) => a.data.rank - b.data.rank);
}

/**
 * Returns the problems with a set of ranks, or an empty list when they run
 * 1..n with no repeats and no gaps. A gap would read as a missing entry.
 */
export function checkRanks(ranks: number[]): string[] {
	const problems: string[] = [];
	const sorted = [...ranks].sort((a, b) => a - b);
	sorted.forEach((rank, i) => {
		if (rank !== i + 1) {
			problems.push(`expected rank ${i + 1} at position ${i + 1}, found ${rank}`);
		}
	});
	return problems;
}
