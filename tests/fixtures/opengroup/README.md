# Open Group ArchiMate Exchange Format fixtures

Copied from <https://www.opengroup.org/xsd/archimate/> (ArchiMate 3.1 exchange format).
Copyright © 2015-2019 The Open Group. Used here only as test fixtures; not part of the published package.

- `xsd/archimate3_{Model,View,Diagram}.xsd`: the 3.1 schemas. The `xml.xsd` import in
  `archimate3_Model.xsd` is changed to point at the local copy so validation works offline.
- `xsd/xml.xsd`: the W3C `xml:` namespace schema, from <https://www.w3.org/2001/xml.xsd>.
- `examples/`: example models from `3.1/examples/`. `Basic_Model_Metadata.xml` is left out
  because validating it needs the Dublin Core schemas.
