import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateXML } from "xmllint-wasm";

const XSD_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "fixtures/opengroup/xsd");

const schemaFile = (fileName: string) => ({
  fileName,
  contents: readFileSync(resolve(XSD_DIR, fileName), "utf-8"),
});

const SCHEMA = [schemaFile("archimate3_Diagram.xsd")];
const PRELOAD = ["archimate3_View.xsd", "archimate3_Model.xsd", "xml.xsd"].map(schemaFile);

export async function xsdErrors(xml: string): Promise<string[]> {
  const result = await validateXML({
    xml: [{ fileName: "model.xml", contents: xml }],
    schema: SCHEMA,
    preload: PRELOAD,
  });
  return result.errors.map((error) => error.rawMessage);
}
