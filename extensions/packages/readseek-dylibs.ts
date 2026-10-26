import { closeSync, existsSync, openSync, readSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const MH_MAGIC_64 = 0xfeedfacf;
const FAT_MAGIC = 0xcafebabe;
const CPU_TYPE_BY_ARCH: Record<string, number> = { arm64: 0x0100000c, x64: 0x01000007 };
const LC_LOAD_DYLIB = 0x0c;
const LC_LOAD_WEAK_DYLIB = 0x80000018;
const LC_REEXPORT_DYLIB = 0x8000001f;
const LC_LOAD_UPWARD_DYLIB = 0x80000023;
const DYLIB_COMMANDS = new Set([LC_LOAD_DYLIB, LC_LOAD_WEAK_DYLIB, LC_REEXPORT_DYLIB, LC_LOAD_UPWARD_DYLIB]);
const BREW_FORMULA = /^(?:\/opt\/homebrew|\/usr\/local)\/opt\/([^/]+)\//;

function readAt(fd: number, position: number, length: number): Buffer {
  const buffer = Buffer.alloc(length);
  return buffer.subarray(0, readSync(fd, buffer, 0, length, position));
}

/**
 * Reads only the 64-bit Mach-O header and load commands for `arch`, selecting
 * the matching slice of a universal binary. Returns undefined for other formats.
 */
export function readMachOLoadCommands(path: string, arch: string = process.arch): Buffer | undefined {
  const fd = openSync(path, "r");
  try {
    let offset = 0;
    const head = readAt(fd, 0, 4096);
    if (head.length >= 8 && head.readUInt32BE(0) === FAT_MAGIC) {
      const count = head.readUInt32BE(4);
      const slice = Array.from({ length: count }, (_, i) => 8 + i * 20)
        .find((at) => at + 20 <= head.length && head.readUInt32BE(at) === CPU_TYPE_BY_ARCH[arch]);
      if (slice === undefined) return undefined;
      offset = head.readUInt32BE(slice + 8);
    }
    const header = readAt(fd, offset, 32);
    if (header.length < 32 || header.readUInt32LE(0) !== MH_MAGIC_64) return undefined;
    return readAt(fd, offset, 32 + header.readUInt32LE(20));
  } finally {
    closeSync(fd);
  }
}

/** Returns the dylib install names linked by a thin 64-bit Mach-O header plus its load commands. */
export function machODylibs(binary: Buffer): string[] {
  if (binary.length < 32 || binary.readUInt32LE(0) !== MH_MAGIC_64) return [];

  const commandCount = binary.readUInt32LE(16);
  const dylibs: string[] = [];
  let at = 32;
  for (let i = 0; i < commandCount && at + 8 <= binary.length; i++) {
    const cmd = binary.readUInt32LE(at);
    const size = binary.readUInt32LE(at + 4);
    if (size < 8) break;
    if (DYLIB_COMMANDS.has(cmd)) {
      const nameStart = at + binary.readUInt32LE(at + 8);
      const nameEnd = binary.indexOf(0, nameStart);
      dylibs.push(binary.toString("utf8", nameStart, nameEnd < 0 || nameEnd > at + size ? at + size : nameEnd));
    }
    at += size;
  }
  return dylibs;
}

/**
 * Dylibs that dyld would fail to load. System libraries live in the dyld shared
 * cache rather than on disk, and `@rpath`-style names are relative, so only
 * other absolute paths can be checked.
 */
export function missingDylibs(dylibs: string[], exists: (path: string) => boolean = existsSync): string[] {
  return dylibs.filter(
    (dylib) => dylib.startsWith("/") && !dylib.startsWith("/usr/lib/") && !dylib.startsWith("/System/") && !exists(dylib),
  );
}

export function missingDylibsMessage(missing: string[]): string {
  const formulas = [...new Set(missing.map((dylib) => BREW_FORMULA.exec(dylib)?.[1]).filter((f): f is string => !!f))];
  const unknown = missing.filter((dylib) => !BREW_FORMULA.test(dylib));
  const lines = ["pi-readseek's native binary is missing shared libraries, so read/edit/write will fail until they are installed."];
  if (formulas.length > 0) lines.push(`Run: brew install ${formulas.join(" ")}`);
  if (unknown.length > 0) lines.push(`Missing: ${unknown.join(", ")}`);
  return lines.join("\n");
}

/** Mirrors pi-readseek's own lookup: READSEEK_BINARY, then the platform package beside @jarkkojs/readseek. */
export function resolveReadseekBinary(): string | undefined {
  const override = process.env.READSEEK_BINARY;
  if (override) return override;
  if (process.platform !== "darwin") return undefined;
  try {
    const require = createRequire(createRequire(import.meta.url).resolve("pi-readseek"));
    const metaDir = dirname(require.resolve("@jarkkojs/readseek/package.json"));
    const platformJson = require.resolve(`@jarkkojs/readseek-darwin-${process.arch}/package.json`, { paths: [metaDir] });
    return join(dirname(platformJson), "bin", "readseek");
  } catch {
    // pi-readseek reports a missing platform package itself.
    return undefined;
  }
}

/** Returns a warning when the readseek binary cannot load on this machine, otherwise undefined. */
export function readseekDylibWarning(): string | undefined {
  if (process.platform !== "darwin") return undefined;
  const binary = resolveReadseekBinary();
  if (!binary || !existsSync(binary)) return undefined;
  const commands = readMachOLoadCommands(binary);
  const missing = commands ? missingDylibs(machODylibs(commands)) : [];
  return missing.length > 0 ? missingDylibsMessage(missing) : undefined;
}
