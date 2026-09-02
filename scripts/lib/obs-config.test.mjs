import { describe, expect, it } from "vitest";
import { parseObsWebsocketSection } from "./obs-config.mjs";

// The shape here is real: OBS 29 writes the websocket settings into
// global.ini rather than the config.json that later versions use, which is
// what these cases pin down.

const globalIni = [
	"[General]",
	"Pre19Defaults=false",
	"",
	"[OBSWebSocket]",
	"FirstLoad=false",
	"ServerEnabled=true",
	"ServerPort=4455",
	"AlertsEnabled=false",
	"AuthRequired=true",
	"ServerPassword=aBcD1234efGh5678",
	"",
	"[ScriptLogWindow]",
	"geometry=AdnQywADAAAA",
	"",
].join("\n");

describe("parseObsWebsocketSection", () => {
	it("reads the password and port", () => {
		expect(parseObsWebsocketSection(globalIni)).toEqual({
			password: "aBcD1234efGh5678",
			port: 4455,
		});
	});

	it("stops at the next section rather than bleeding into it", () => {
		// `geometry` belongs to [ScriptLogWindow]; picking it up would mean the
		// section regex had run past its end.
		expect(parseObsWebsocketSection(globalIni).password).not.toContain("AdnQ");
	});

	// OBS passwords are base64-flavoured and can end in padding, so splitting
	// on every "=" instead of the first would silently truncate them.
	it("keeps '=' characters inside a password", () => {
		const text = "[OBSWebSocket]\nServerPassword=abc=def==\nServerPort=4455\n";
		expect(parseObsWebsocketSection(text).password).toBe("abc=def==");
	});

	it("handles CRLF line endings", () => {
		expect(parseObsWebsocketSection(globalIni.replace(/\n/g, "\r\n"))).toEqual({
			password: "aBcD1234efGh5678",
			port: 4455,
		});
	});

	it("returns nulls when there is no websocket section", () => {
		expect(parseObsWebsocketSection("[General]\nPre19Defaults=false\n")).toEqual({
			password: null,
			port: null,
		});
	});

	it("returns a null password when authentication is off and none is stored", () => {
		const text = "[OBSWebSocket]\nServerEnabled=true\nServerPort=4455\nAuthRequired=false\n";
		expect(parseObsWebsocketSection(text)).toEqual({ password: null, port: 4455 });
	});

	it("reports the section as last in the file", () => {
		const text = "[General]\nPre19Defaults=false\n\n[OBSWebSocket]\nServerPassword=tail\n";
		expect(parseObsWebsocketSection(text).password).toBe("tail");
	});
});
