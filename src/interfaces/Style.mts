export interface RGBColor {
  r: number;
  g: number;
  b: number;
  /** Opacity, 0–100. */
  a?: number;
}

export interface Font {
  name?: string;
  size?: number;
  /** Space-separated list of "plain", "bold", "italic" and "underline". */
  style?: string;
  color?: RGBColor;
}

export interface Style {
  lineColor?: RGBColor;
  fillColor?: RGBColor;
  lineWidth?: number;
  font?: Font;
}

/** An absolute position in the view, e.g. a connection bendpoint. */
export interface Point {
  x: number;
  y: number;
}
