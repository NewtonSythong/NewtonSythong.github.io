// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	// The repo is published as a GitHub Pages *user* site
	// (NewtonSythong.github.io), so the site serves from the domain root and
	// needs no `base`. `site` is what makes canonical and Open Graph URLs
	// absolute, which they have to be to work when the link is shared.
	site: "https://newtonsythong.github.io",

	// Every internal link on the site points at a page in this same small
	// static build, so prefetching the ones that scroll into view costs a few
	// kB and makes the project pages open instantly.
	prefetch: {
		prefetchAll: true,
		defaultStrategy: "viewport",
	},

	security: {
		// GitHub Pages serves static files and cannot set response headers,
		// so the policy ships as a <meta> tag. Astro generates the hashes for
		// its own inline scripts and styles; everything else is locked to
		// same-origin, and there is no third-party script, font, analytics or
		// embed on the site to punch a hole for.
		csp: {
			directives: [
				"default-src 'self'",
				// Screenshots are same-origin; `data:` covers the inline SVG
				// favicon and any data URI Astro inlines.
				"img-src 'self' data:",
				"font-src 'self'",
				"connect-src 'self'",
				// Nothing on the site plugs in, embeds, or posts anywhere.
				"object-src 'none'",
				"frame-src 'none'",
				"form-action 'none'",
				// Stops an injected <base> from re-pointing every relative URL.
				"base-uri 'self'",
			],
		},
	},
});
