export class ParseError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ParseError";
  }
}

export class IOError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "IOError";
  }
}

export class ValidationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ValidationError";
  }
}
