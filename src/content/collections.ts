import type { Loader, LoaderContext } from "astro/loaders";

/** Returns the slugs that appear more than once in `entries`, deduplicated. */
export function findDuplicateSlugs(entries: { slug: string }[]): string[] {
	const seen = new Set<string>();
	const duplicates = new Set<string>();

	for (const entry of entries) {
		if (seen.has(entry.slug)) {
			duplicates.add(entry.slug);
		}
		seen.add(entry.slug);
	}

	return [...duplicates];
}

/**
 * Wraps a loader so that, once it has loaded, duplicate `slug` values
 * across the collection fail the load loudly (a build/dev-sync error)
 * instead of silently shipping two entries that would collide on the
 * same `/projects/[slug]` route.
 */
export function withUniqueSlugs(loader: Loader): Loader {
	return {
		...loader,
		name: `${loader.name}-with-unique-slugs`,
		async load(context: LoaderContext) {
			await loader.load(context);

			const slugs = context
				.store.values()
				.map((entry) => (entry.data as { slug?: unknown }).slug)
				.filter((slug): slug is string => typeof slug === "string")
				.map((slug) => ({ slug }));

			const duplicates = findDuplicateSlugs(slugs);
			if (duplicates.length > 0) {
				throw new Error(
					`Duplicate slug(s) in "${context.collection}": ${duplicates.join(", ")}. Slugs must be unique — each drives a distinct /projects/[slug] route.`,
				);
			}
		},
	};
}
