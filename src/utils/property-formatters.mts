import { StringUtils, DateUtils } from "./common.mjs";

export interface FormatterConfig {
  type: "string" | "date" | "boolean" | "number" | "custom";
  options?: {
    cleanup?: boolean;
    maxLength?: number;
    prefix?: string;
    suffix?: string;
    dateFormat?: "iso" | "mmddyyyy" | "ddmmyyyy" | "yyyy-mm-dd";
    padLength?: number;
    trueValue?: string;
    falseValue?: string;
    customFormatter?: string;
  };
}

export type FormatterFunction = (value: unknown, options?: FormatterConfig["options"]) => string;

export class FormatterRegistry {
  private formatters: Map<string, FormatterFunction> = new Map();

  register(name: string, formatter: FormatterFunction): void {
    this.formatters.set(name, formatter);
  }

  get(name: string): FormatterFunction | undefined {
    return this.formatters.get(name);
  }

  has(name: string): boolean {
    return this.formatters.has(name);
  }

  getRegisteredNames(): string[] {
    return Array.from(this.formatters.keys());
  }
}

export const formatterRegistry = new FormatterRegistry();

export const stringFormatters = {
  cleanup: (value: unknown, options?: FormatterConfig["options"]): string => {
    if (!value || typeof value !== "string") return "";
    let result = StringUtils.stripHtml(StringUtils.cleanup(value));
    if (options?.maxLength && result.length > options.maxLength)
      result = result.substring(0, options.maxLength);
    if (options?.prefix) result = options.prefix + result;
    if (options?.suffix) result = result + options.suffix;
    return result;
  },

  basic: (value: unknown, options?: FormatterConfig["options"]): string => {
    let result = String(value ?? "");
    if (options?.maxLength && result.length > options.maxLength)
      result = result.substring(0, options.maxLength);
    if (options?.prefix) result = options.prefix + result;
    if (options?.suffix) result = result + options.suffix;
    return result;
  },
};

export const dateFormatters = {
  format: (value: unknown, options?: FormatterConfig["options"]): string => {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(String(value));
    if (isNaN(date.getTime())) return "";
    switch (options?.dateFormat ?? "iso") {
      case "iso":
        return DateUtils.toISOStringOrNull(date) ?? "";
      case "mmddyyyy":
        return DateUtils.toMMDDYYYY(date);
      case "ddmmyyyy":
        return date.toLocaleDateString("en-GB");
      case "yyyy-mm-dd":
        return date.toISOString().split("T")[0];
      default:
        return date.toISOString();
    }
  },

  today: (_value: unknown, options?: FormatterConfig["options"]): string => {
    const today = new Date();
    switch (options?.dateFormat ?? "mmddyyyy") {
      case "iso":
        return DateUtils.toISOStringOrNull(today) ?? "";
      case "mmddyyyy":
        return DateUtils.today();
      case "ddmmyyyy":
        return today.toLocaleDateString("en-GB");
      case "yyyy-mm-dd":
        return today.toISOString().split("T")[0];
      default:
        return today.toISOString();
    }
  },
};

export const booleanFormatters = {
  convert: (value: unknown, options?: FormatterConfig["options"]): string => {
    const trueValue = options?.trueValue ?? "True";
    const falseValue = options?.falseValue ?? "False";
    if (typeof value === "boolean") return value ? trueValue : falseValue;
    if (typeof value === "string") {
      const lower = value.toLowerCase();
      if (lower === "true" || lower === "yes" || lower === "1") return trueValue;
      if (lower === "false" || lower === "no" || lower === "0") return falseValue;
    }
    return falseValue;
  },
};

export const numberFormatters = {
  pad: (value: unknown, options?: FormatterConfig["options"]): string => {
    const num = typeof value === "number" ? value : parseInt(String(value ?? "0"), 10);
    if (isNaN(num)) return "0";
    return StringUtils.padWithZeros(num, options?.padLength ?? 0);
  },

  basic: (value: unknown): string => {
    const num = typeof value === "number" ? value : parseFloat(String(value ?? "0"));
    return isNaN(num) ? "0" : String(num);
  },
};

export class PropertyFormatter {
  static format(value: unknown, formatter?: FormatterConfig): string {
    if (!formatter || formatter.type === "string") {
      return formatter?.options?.cleanup
        ? stringFormatters.cleanup(value, formatter.options)
        : String(value ?? "");
    }
    switch (formatter.type) {
      case "date":
        return dateFormatters.format(value, formatter.options);
      case "boolean":
        return booleanFormatters.convert(value, formatter.options);
      case "number":
        return formatter.options?.padLength
          ? numberFormatters.pad(value, formatter.options)
          : numberFormatters.basic(value);
      case "custom": {
        const fn = formatterRegistry.get(formatter.options?.customFormatter ?? "");
        return fn ? fn(value, formatter.options) : String(value ?? "");
      }
      default:
        return String(value ?? "");
    }
  }

  static registerFormatter(name: string, formatter: FormatterFunction): void {
    formatterRegistry.register(name, formatter);
  }

  static getAvailableFormatters(): string[] {
    return formatterRegistry.getRegisteredNames();
  }
}

PropertyFormatter.registerFormatter("stringCleanup", stringFormatters.cleanup);
PropertyFormatter.registerFormatter("stringBasic", stringFormatters.basic);
PropertyFormatter.registerFormatter("dateFormat", dateFormatters.format);
PropertyFormatter.registerFormatter("dateToday", dateFormatters.today);
PropertyFormatter.registerFormatter("booleanConvert", booleanFormatters.convert);
PropertyFormatter.registerFormatter("numberPad", numberFormatters.pad);
PropertyFormatter.registerFormatter("numberBasic", numberFormatters.basic);
