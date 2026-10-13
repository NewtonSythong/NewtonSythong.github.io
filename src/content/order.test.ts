import { describe, expect, it } from "vitest";
import { byRank, checkRanks } from "./order";

describe("byRank", () => {
	it("puts the lowest rank first, whatever order the projects load in", () => {
		const projects = [{ data: { rank: 3 } }, { data: { rank: 1 } }, { data: { rank: 2 } }];
		expect(byRank(projects).map((p) => p.data.rank)).toEqual([1, 2, 3]);
	});

	it("does not reorder the array it was given", () => {
		const projects = [{ data: { rank: 2 } }, { data: { rank: 1 } }];
		byRank(projects);
		expect(projects.map((p) => p.data.rank)).toEqual([2, 1]);
	});
});

describe("checkRanks", () => {
	it("accepts ranks that run 1..n in any order", () => {
		expect(checkRanks([2, 1, 3])).toEqual([]);
	});

	it("rejects a gap, which would read as a missing entry", () => {
		expect(checkRanks([1, 3])).not.toEqual([]);
	});

	it("rejects a repeated rank", () => {
		expect(checkRanks([1, 1, 2])).not.toEqual([]);
	});
});
