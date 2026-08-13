import { describe, it, expect } from "vitest";
import {
  stringFormatters,
  dateFormatters,
  booleanFormatters,
  numberFormatters,
  PropertyFormatter,
  FormatterRegistry,
} from "../src/utils/property-formatters.mjs";

describe("stringFormatters.cleanup", () => {
  it("strips control characters and HTML", () => {
    expect(stringFormatters.cleanup("<b>hello\x00</b>")).toBe("hello");
  });

  it("truncates to maxLength", () => {
    expect(stringFormatters.cleanup("hello world", { maxLength: 5 })).toBe("hello");
  });

  it("applies prefix and suffix", () => {
    expect(stringFormatters.cleanup("hi", { prefix: "[", suffix: "]" })).toBe("[hi]");
  });

  it("returns empty string for non-string input", () => {
    expect(stringFormatters.cleanup(null)).toBe("");
    expect(stringFormatters.cleanup(undefined)).toBe("");
    expect(stringFormatters.cleanup(42 as unknown as string)).toBe("");
  });
});

describe("stringFormatters.basic", () => {
  it("converts value to string", () => {
    expect(stringFormatters.basic(42)).toBe("42");
    expect(stringFormatters.basic("hello")).toBe("hello");
  });

  it("applies maxLength, prefix, suffix", () => {
    expect(stringFormatters.basic("abcde", { maxLength: 3, prefix: ">", suffix: "<" })).toBe(
      ">abc<",
    );
  });
});

describe("dateFormatters.format", () => {
  const ISO_DATE = "2025-03-15T00:00:00.000Z";

  it("formats as ISO by default", () => {
    const result = dateFormatters.format(ISO_DATE);
    expect(result).toContain("2025-03-15");
  });

  it("formats as MM/DD/YYYY (mmddyyyy) from the input date, not today", () => {
    const result = dateFormatters.format(ISO_DATE, { dateFormat: "mmddyyyy" });
    expect(result).toMatch(/^03\/\d{2}\/2025$/);
    expect(result).not.toBe(dateFormatters.today(null, { dateFormat: "mmddyyyy" }));
  });

  it("formats as yyyy-mm-dd", () => {
    const result = dateFormatters.format(ISO_DATE, { dateFormat: "yyyy-mm-dd" });
    expect(result).toBe("2025-03-15");
  });

  it("returns empty string for falsy input", () => {
    expect(dateFormatters.format(null)).toBe("");
    expect(dateFormatters.format("")).toBe("");
  });

  it("returns empty string for an invalid date", () => {
    expect(dateFormatters.format("not-a-date")).toBe("");
  });
});

describe("dateFormatters.today", () => {
  it("returns today in mmddyyyy format by default", () => {
    const result = dateFormatters.today(null, { dateFormat: "mmddyyyy" });
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it("returns today in yyyy-mm-dd format", () => {
    const result = dateFormatters.today(null, { dateFormat: "yyyy-mm-dd" });
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("booleanFormatters.convert", () => {
  it("converts true/false boolean", () => {
    expect(booleanFormatters.convert(true)).toBe("True");
    expect(booleanFormatters.convert(false)).toBe("False");
  });

  it("converts truthy/falsy strings", () => {
    expect(booleanFormatters.convert("yes")).toBe("True");
    expect(booleanFormatters.convert("no")).toBe("False");
    expect(booleanFormatters.convert("1")).toBe("True");
    expect(booleanFormatters.convert("0")).toBe("False");
  });

  it("uses custom true/false values", () => {
    expect(booleanFormatters.convert(true, { trueValue: "YES", falseValue: "NO" })).toBe("YES");
    expect(booleanFormatters.convert(false, { trueValue: "YES", falseValue: "NO" })).toBe("NO");
  });

  it("returns falseValue for unrecognized input", () => {
    expect(booleanFormatters.convert("maybe")).toBe("False");
  });
});

describe("numberFormatters.pad", () => {
  it("pads a number to the given length", () => {
    expect(numberFormatters.pad(5, { padLength: 4 })).toBe("0005");
  });

  it("handles string input", () => {
    expect(numberFormatters.pad("42", { padLength: 5 })).toBe("00042");
  });

  it("returns 0 for NaN input", () => {
    expect(numberFormatters.pad("abc")).toBe("0");
  });
});

describe("numberFormatters.basic", () => {
  it("converts a number to string", () => {
    expect(numberFormatters.basic(3.14)).toBe("3.14");
  });

  it("parses a string number", () => {
    expect(numberFormatters.basic("100")).toBe("100");
  });

  it("returns 0 for non-numeric input", () => {
    expect(numberFormatters.basic("abc")).toBe("0");
  });
});

describe("PropertyFormatter.format", () => {
  it("defaults to string conversion with no formatter", () => {
    expect(PropertyFormatter.format("hello")).toBe("hello");
    expect(PropertyFormatter.format(42)).toBe("42");
  });

  it("applies string cleanup formatter", () => {
    expect(
      PropertyFormatter.format("<b>test</b>", { type: "string", options: { cleanup: true } }),
    ).toBe("test");
  });

  it("applies date formatter", () => {
    const result = PropertyFormatter.format("2025-06-01T00:00:00.000Z", {
      type: "date",
      options: { dateFormat: "yyyy-mm-dd" },
    });
    expect(result).toBe("2025-06-01");
  });

  it("applies boolean formatter", () => {
    expect(PropertyFormatter.format(true, { type: "boolean" })).toBe("True");
  });

  it("applies number pad formatter", () => {
    expect(PropertyFormatter.format(7, { type: "number", options: { padLength: 3 } })).toBe("007");
  });

  it("applies number basic formatter", () => {
    expect(PropertyFormatter.format(3.14, { type: "number" })).toBe("3.14");
  });

  it("uses custom formatter from registry", () => {
    PropertyFormatter.registerFormatter("upper", (v) => String(v).toUpperCase());
    expect(
      PropertyFormatter.format("hi", { type: "custom", options: { customFormatter: "upper" } }),
    ).toBe("HI");
  });

  it("falls back to string for unknown custom formatter", () => {
    expect(
      PropertyFormatter.format("val", {
        type: "custom",
        options: { customFormatter: "nonexistent" },
      }),
    ).toBe("val");
  });
});

describe("FormatterRegistry", () => {
  it("registers and retrieves a formatter", () => {
    const reg = new FormatterRegistry();
    const fn = (v: unknown) => String(v);
    reg.register("myFmt", fn);
    expect(reg.get("myFmt")).toBe(fn);
    expect(reg.has("myFmt")).toBe(true);
  });

  it("returns undefined for unknown formatter", () => {
    const reg = new FormatterRegistry();
    expect(reg.get("missing")).toBeUndefined();
    expect(reg.has("missing")).toBe(false);
  });

  it("lists registered formatter names", () => {
    const reg = new FormatterRegistry();
    reg.register("a", () => "");
    reg.register("b", () => "");
    expect(reg.getRegisteredNames()).toContain("a");
    expect(reg.getRegisteredNames()).toContain("b");
  });
});
