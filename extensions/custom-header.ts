/**
 * 1st Agent Header
 *
 * Replaces Pi's built-in header with a branded welcome panel.
 */

import { basename } from "node:path";
import { VERSION, type ExtensionAPI, type Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

const WORDMARK = [
	"   ___     __                               __ ",
	"  <  /____/ /_      ____ _____ ____  ____  / /_",
	"  / / ___/ __/_____/ __ `/ __ `/ _ \\/ __ \\/ __/",
	" / (__  ) /_/_____/ /_/ / /_/ /  __/ / / / /_  ",
	"/_/____/\\__/      \\__,_/\\__, /\\___/_/ /_/\\__/  ",
	"                       /____/",
];

const MASCOT = [
	"    ▄▄▄    ",
	"  ▄█████▄  ",
	" ▐██ ◉ ██▌ ",
	"  ▀█████▀  ",
	"   ▀█ █▀   ",
	"    ▀ ▀    ",
];

const MAX_PANEL_WIDTH = 110;
const WORDMARK_WIDTH = Math.max(...WORDMARK.map((line) => visibleWidth(line)));
const MASCOT_WIDTH = Math.max(...MASCOT.map((line) => visibleWidth(line)));

type Alignment = "left" | "center";

interface HeaderMeta {
	cwd: string;
	model: string;
	thinking: string;
}

function colorizeWordmark(theme: Theme, line: string): string {
	const paddedLine = line.padEnd(WORDMARK_WIDTH);
	const firstBreak = Math.min(18, paddedLine.length);
	const secondBreak = Math.min(36, paddedLine.length);

	return [
		theme.fg("warning", paddedLine.slice(0, firstBreak)),
		theme.fg("accent", paddedLine.slice(firstBreak, secondBreak)),
		theme.fg("success", paddedLine.slice(secondBreak)),
	].join("");
}

function colorizeMascot(theme: Theme, line: string, row: number): string {
	const colors = ["warning", "warning", "accent", "accent", "success", "success"] as const;
	return theme.bold(theme.fg(colors[row], line.padEnd(MASCOT_WIDTH)));
}

function panelLine(theme: Theme, content: string, innerWidth: number, alignment: Alignment = "left"): string {
	const clipped = truncateToWidth(content, innerWidth, "");
	const padding = Math.max(0, innerWidth - visibleWidth(clipped));
	const leftPadding = alignment === "center" ? Math.floor(padding / 2) : Math.min(1, padding);
	const rightPadding = padding - leftPadding;

	return [
		theme.fg("borderAccent", "│"),
		" ".repeat(leftPadding),
		clipped,
		" ".repeat(rightPadding),
		theme.fg("borderAccent", "│"),
	].join("");
}

function topBorder(theme: Theme, innerWidth: number): string {
	const title = " 1ST AGENT ";
	const prefix = "╭───";
	const suffix = "╮";
	const fill = Math.max(0, innerWidth + 2 - visibleWidth(prefix) - visibleWidth(title) - visibleWidth(suffix));

	if (fill === 0) return theme.fg("borderAccent", `╭${"─".repeat(innerWidth)}╮`);

	return [
		theme.fg("borderAccent", prefix),
		theme.bold(theme.fg("warning", title)),
		theme.fg("borderAccent", `${"─".repeat(fill)}${suffix}`),
	].join("");
}

function divider(theme: Theme, innerWidth: number): string {
	return theme.fg("borderAccent", `├${"─".repeat(innerWidth)}┤`);
}

function bottomBorder(theme: Theme, innerWidth: number): string {
	return theme.fg("borderAccent", `╰${"─".repeat(innerWidth)}╯`);
}

function buildHeader(theme: Theme, width: number, meta: HeaderMeta): string[] {
	if (width < 2) return [];

	const panelWidth = Math.min(width, MAX_PANEL_WIDTH);
	const innerWidth = panelWidth - 2;
	const lockupWidth = MASCOT_WIDTH + 3 + WORDMARK_WIDTH;
	const showMascot = innerWidth >= lockupWidth + 4;
	const lines = ["", topBorder(theme, innerWidth), panelLine(theme, "", innerWidth)];

	for (let row = 0; row < WORDMARK.length; row++) {
		const wordmark = colorizeWordmark(theme, WORDMARK[row]);
		const lockup = showMascot ? `${colorizeMascot(theme, MASCOT[row], row)}   ${wordmark}` : wordmark;
		lines.push(panelLine(theme, lockup, innerWidth, "center"));
	}

	lines.push(panelLine(theme, "", innerWidth));
	lines.push(divider(theme, innerWidth));
	lines.push(
		panelLine(
			theme,
			`${theme.bold(theme.fg("accent", "EST7"))}${theme.fg("dim", " // FIELD UNIT 01 // FIRST IN, LAST OUT")}`,
			innerWidth,
			"center",
		),
	);
	lines.push(
		panelLine(
			theme,
			theme.fg("muted", `${meta.cwd}  ·  ${meta.model}  ·  thinking ${meta.thinking}  ·  π v${VERSION}`),
			innerWidth,
			"center",
		),
	);
	lines.push(bottomBorder(theme, innerWidth), "");

	return lines;
}

export default function customHeader(pi: ExtensionAPI) {
	pi.on("session_start", async (_event, ctx) => {
		if (ctx.mode !== "tui") return;

		const meta: HeaderMeta = {
			cwd: basename(ctx.cwd) || ctx.cwd,
			model: ctx.model?.id ?? "no model",
			thinking: pi.getThinkingLevel(),
		};

		ctx.ui.setHeader((_tui, theme) => ({
			render: (width: number) => buildHeader(theme, width, meta),
			invalidate() {},
		}));
	});

	pi.registerCommand("builtin-header", {
		description: "Restore Pi's built-in header",
		handler: async (_args, ctx) => {
			ctx.ui.setHeader(undefined);
			ctx.ui.notify("Built-in header restored", "info");
		},
	});
}
