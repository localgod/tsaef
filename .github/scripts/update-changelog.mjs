import { readFileSync, writeFileSync } from 'node:fs';

const tag = process.env.RELEASE_TAG ?? '';
const dateStr = (process.env.RELEASE_DATE ?? new Date().toISOString()).slice(0, 10);
const body = process.env.RELEASE_BODY ?? '';
const version = tag.replace(/^v/, '');

const changelog = readFileSync('CHANGELOG.md', 'utf-8');
const insertAt = changelog.indexOf('\n## ');

const newEntry = `\n## [${version}] - ${dateStr}\n\n${body.trim()}\n`;

const updated = insertAt === -1
  ? changelog.trimEnd() + newEntry + '\n'
  : changelog.slice(0, insertAt) + newEntry + changelog.slice(insertAt);

writeFileSync('CHANGELOG.md', updated, 'utf-8');
