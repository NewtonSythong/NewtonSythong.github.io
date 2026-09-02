// Locating OBS's own websocket credentials, so the capture script can
// connect without anyone having to copy a password out of the OBS UI.
//
// The awkward part is that OBS has moved this file. OBS 28-29 keep the
// websocket settings in an `[OBSWebSocket]` section of global.ini with
// PascalCase INI keys; OBS 30+ moved them to a separate
// plugin_config/obs-websocket/config.json with snake_case JSON keys. Both
// layouts are read here, newest-first, because either can be on disk
// depending on when OBS was installed.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Pulls the `[OBSWebSocket]` section out of an OBS global.ini.
 *
 * Values are taken verbatim after the first `=` — passwords are
 * base64-ish and can contain `=`, so splitting on every occurrence would
 * silently truncate them.
 *
 * @param {string} text Full contents of global.ini.
 * @returns {{ password: string | null, port: number | null }}
 */
export function parseObsWebsocketSection(text) {
	// The `m` flag is needed so `^` can match the section header mid-file, but
	// it also makes `$` mean end-of-line, which would end the section at its
	// very first entry. `(?![\s\S])` is an unambiguous end-of-input instead.
	const section = text.match(/^\[OBSWebSocket\]\r?\n([\s\S]*?)(?=\r?\n\[|(?![\s\S]))/m);
	if (!section) return { password: null, port: null };

	const values = {};
	for (const line of section[1].split(/\r?\n/)) {
		const separator = line.indexOf("=");
		if (separator === -1) continue;
		values[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
	}

	const port = Number.parseInt(values.ServerPort, 10);
	return {
		password: values.ServerPassword || null,
		port: Number.isInteger(port) ? port : null,
	};
}

/**
 * Reads OBS's websocket password and port from whichever config layout this
 * OBS install uses. Returns nulls rather than throwing when nothing is
 * found — a missing password is a normal state (authentication can be
 * switched off), and the caller reports it better than this can.
 *
 * @param {string | undefined} appData Value of %APPDATA%.
 */
export function readObsWebsocketConfig(appData = process.env.APPDATA) {
	if (!appData) return { password: null, port: null };

	// OBS 30+ layout.
	const jsonPath = path.join(appData, "obs-studio/plugin_config/obs-websocket/config.json");
	if (existsSync(jsonPath)) {
		try {
			const config = JSON.parse(readFileSync(jsonPath, "utf-8"));
			if (config.server_password) {
				return {
					password: config.server_password,
					port: Number.isInteger(config.server_port) ? config.server_port : null,
				};
			}
		} catch {
			// Fall through to the INI layout rather than failing outright — a
			// malformed or half-written JSON file should not stop us finding a
			// perfectly good password in global.ini.
		}
	}

	// OBS 28-29 layout.
	const iniPath = path.join(appData, "obs-studio/global.ini");
	if (existsSync(iniPath)) {
		return parseObsWebsocketSection(readFileSync(iniPath, "utf-8"));
	}

	return { password: null, port: null };
}
