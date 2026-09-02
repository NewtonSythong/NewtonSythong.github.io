// Front-matter editing for the capture script, kept as a pure string
// transform in its own module so it can be unit-tested without touching the
// real content files — this is the one part of that script that mutates
// src/content/, and a bug here corrupts a project entry rather than just
// producing a bad screenshot.

/**
 * Returns `raw` with an `image:` block added to its YAML front matter,
 * replacing an existing one if present.
 *
 * This is a targeted text edit rather than a parse-and-re-serialise, because
 * dumping the parsed YAML back out would reorder the keys and normalise the
 * quoting style the existing entries use, turning a two-line addition into a
 * whole-file diff.
 *
 * The values are written with JSON.stringify: a JSON string is also a valid
 * YAML double-quoted scalar, so quotes, colons and backslashes in the alt
 * text are escaped correctly without hand-rolling an escaper.
 *
 * @param {string} raw   Full markdown file contents, front matter included.
 * @param {string} src   Root-relative image path, e.g. "/images/projects/x.png".
 * @param {string} alt   Alt text; required by the projects schema.
 * @returns {string}     The updated file contents.
 */
export function insertImageFrontmatter(raw, src, alt) {
	const match = raw.match(/^(---\r?\n)([\s\S]*?)(\r?\n---)/);
	if (!match) {
		throw new Error("No frontmatter found");
	}

	if (typeof alt !== "string" || alt.trim() === "") {
		throw new Error("Alt text is required whenever an image is set");
	}

	const [whole, open, body, close] = match;
	const eol = raw.includes("\r\n") ? "\r\n" : "\n";

	// Drop any existing `image:` mapping — the key line plus the indented
	// lines beneath it, stopping at the next unindented key.
	const withoutExisting = body.replace(/(^|\r?\n)image:\r?\n(?:[ \t]+\S[^\r\n]*(?:\r?\n|$))*/, "$1");
	const trimmed = withoutExisting.replace(/(\r?\n)+$/, "");

	const block = [
		"image:",
		`  src: ${JSON.stringify(src)}`,
		`  alt: ${JSON.stringify(alt.trim())}`,
	].join(eol);

	// Rebuilt by slicing rather than String.replace, so that a `$&` or `$1`
	// appearing in the alt text is not interpreted as a replacement pattern.
	return `${open}${trimmed}${eol}${block}${close}${raw.slice(whole.length)}`;
}
