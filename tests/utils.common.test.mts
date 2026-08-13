import { describe, it, expect } from "vitest";
import { StringUtils, DateUtils } from "../src/utils/common.mjs";

describe("StringUtils.cleanup", () => {
  it("returns empty string for falsy input", () => {
    expect(StringUtils.cleanup(undefined)).toBe("");
    expect(StringUtils.cleanup("")).toBe("");
  });

  it("strips control characters", () => {
    expect(StringUtils.cleanup("hello\x00world")).toBe("helloworld");
    expect(StringUtils.cleanup("line\x0Afeed")).toBe("linefeed");
    expect(StringUtils.cleanup("tab\x09here")).toBe("tabhere");
    expect(StringUtils.cleanup("del\x7Fchar")).toBe("delchar");
  });

  it("preserves Unicode and accented characters", () => {
    expect(StringUtils.cleanup("café")).toBe("café");
    expect(StringUtils.cleanup("naïve")).toBe("naïve");
    expect(StringUtils.cleanup("中文")).toBe("中文");
  });

  it("preserves normal ASCII text unchanged", () => {
    expect(StringUtils.cleanup("Hello World!")).toBe("Hello World!");
  });
});

describe("StringUtils.padWithZeros", () => {
  it("pads numbers to the given length", () => {
    expect(StringUtils.padWithZeros(5, 3)).toBe("005");
    expect(StringUtils.padWithZeros(42, 5)).toBe("00042");
  });

  it("does not truncate numbers longer than totalLength", () => {
    expect(StringUtils.padWithZeros(12345, 3)).toBe("12345");
  });
});

describe("StringUtils.extractDigits", () => {
  it("returns only digit characters", () => {
    expect(StringUtils.extractDigits("abc123def456")).toBe("123456");
    expect(StringUtils.extractDigits("no digits")).toBe("");
  });
});

describe("StringUtils.stripHtml", () => {
  it("removes HTML tags", () => {
    expect(StringUtils.stripHtml("<b>bold</b>")).toBe("bold");
    expect(StringUtils.stripHtml("<p>Para</p><br/>")).toBe("Para");
  });

  it("returns plain text unchanged", () => {
    expect(StringUtils.stripHtml("plain text")).toBe("plain text");
  });
});

describe("DateUtils.toMMDDYYYY", () => {
  it("formats a date as MM/DD/YYYY", () => {
    const d = new Date(2025, 0, 5); // Jan 5 2025
    expect(DateUtils.toMMDDYYYY(d)).toBe("01/05/2025");
  });

  it("zero-pads single-digit months and days", () => {
    const d = new Date(2025, 2, 9); // Mar 9 2025
    expect(DateUtils.toMMDDYYYY(d)).toBe("03/09/2025");
  });
});

describe("DateUtils.today", () => {
  it("returns today in MM/DD/YYYY format", () => {
    const result = DateUtils.today();
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    const [mm, dd, yyyy] = result.split("/").map(Number);
    const now = new Date();
    expect(yyyy).toBe(now.getFullYear());
    expect(mm).toBe(now.getMonth() + 1);
    expect(dd).toBe(now.getDate());
  });
});

describe("DateUtils.toISOStringOrNull", () => {
  it("returns ISO string for a valid date", () => {
    const d = new Date("2025-06-15T00:00:00Z");
    expect(DateUtils.toISOStringOrNull(d)).toContain("2025-06-15");
  });

  it("returns null for null/undefined", () => {
    expect(DateUtils.toISOStringOrNull(null)).toBeNull();
    expect(DateUtils.toISOStringOrNull(undefined)).toBeNull();
  });

  it("returns null for an invalid date string", () => {
    expect(DateUtils.toISOStringOrNull("not-a-date")).toBeNull();
  });
});
