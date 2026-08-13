import { readFile, writeFile } from "fs/promises";
import { Archimate } from "./Archimate.mjs";
import { Parser } from "./Parser.mjs";
import { Serializer } from "./Serializer.mjs";

export class TsAEF {
  async load(filePath: string): Promise<Archimate> {
    try {
      const xml = await readFile(filePath, "utf-8");
      return Parser.parse(xml);
    } catch (error) {
      throw new Error(`Failed to load AEF file: ${filePath}`, { cause: error });
    }
  }

  async save(filePath: string, model: Archimate): Promise<void> {
    try {
      const xml = Serializer.serialize(model);
      await writeFile(filePath, xml, "utf-8");
    } catch (error) {
      throw new Error(`Failed to save AEF file: ${filePath}`, { cause: error });
    }
  }
}
