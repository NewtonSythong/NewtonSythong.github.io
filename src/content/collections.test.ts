import { describe, expect, it } from "vitest";
import type { Loader, LoaderContext } from "astro/loaders";
import { findDuplicateSlugs, withUniqueSlugs } from "./collections";

describe("findDuplicateSlugs", () => {
	it("returns an empty list when all slugs are unique", () => {
		const entries = [{ slug: "fresh-flat" }, { slug: "note-pilot" }];
		expect(findDuplicateSlugs(entries)).toEqual([]);
	});

	it("returns the slugs that appear more than once", () => {
		const entries = [
			{ slug: "fresh-flat" },
			{ slug: "note-pilot" },
			{ slug: "fresh-flat" },
		];
		expect(findDuplicateSlugs(entries)).toEqual(["fresh-flat"]);
	});

	it("returns an empty list for an empty collection", () => {
		expect(findDuplicateSlugs([])).toEqual([]);
	});
});

describe("withUniqueSlugs", () => {
	/** A minimal fake loader + context: the fake loader's `load` is a
	 * no-op, standing in for "the real loader already populated the
	 * store" (matching how the glob loader behaves in practice). */
	function makeContext(entries: { slug: string }[]): LoaderContext {
		return {
			collection: "projects",
			store: {
				values: () => entries.map((data) => ({ id: data.slug, data })),
			},
		} as unknown as LoaderContext;
	}

	const noopLoader: Loader = { name: "noop", async load() {} };

	it("resolves without error when all slugs are unique", async () => {
		const context = makeContext([{ slug: "fresh-flat" }, { slug: "note-pilot" }]);
		await expect(withUniqueSlugs(noopLoader).load(context)).resolves.toBeUndefined();
	});

	it("throws when a duplicate slug is present", async () => {
		const context = makeContext([{ slug: "fresh-flat" }, { slug: "fresh-flat" }]);
		await expect(withUniqueSlugs(noopLoader).load(context)).rejects.toThrow(
			/fresh-flat/,
		);
	});
});
