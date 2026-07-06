#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const docsDir = path.resolve("docs");
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getArg(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day}${month}${year}`;
}

function nextVersion() {
  if (!existsSync(docsDir)) {
    return "2.1";
  }

  const versions = readdirSync(docsDir)
    .map((file) => file.match(/^PlanningDoc\d{2}[A-Z][a-z]{2}\d{4}_SiteVersion(\d+)\.(\d+)\.md$/))
    .filter(Boolean)
    .map((match) => [Number(match[1]), Number(match[2])])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  if (versions.length === 0) {
    return "2.1";
  }

  const [major, minor] = versions.at(-1);
  return `${major}.${minor + 1}`;
}

const version = getArg("--version") ?? nextVersion();
const dateStamp = getArg("--date") ?? formatDate(new Date());
const fileName = `PlanningDoc${dateStamp}_SiteVersion${version}.md`;
const filePath = path.join(docsDir, fileName);

if (!/^\d+\.\d+$/.test(version)) {
  console.error("Version must use X.Y format, for example: pnpm run planning:new -- --version 2.1");
  process.exit(1);
}

if (existsSync(filePath)) {
  console.error(`Planning doc already exists: ${filePath}`);
  process.exit(1);
}

mkdirSync(docsDir, { recursive: true });

const content = `# PlanningDoc${dateStamp}_SiteVersion${version}

## Purpose

Write the purpose of this build cycle here before editing the site.

## Source Notes

- Add the meeting notes, browser comments, or decisions that prompted this change.

## Planned Changes

- Add the concrete site changes Codex should make.
- Keep this list small enough to review.

## Mission Statement Changes

- State whether the mission sentence structure or variable banks need to change.
- Current SiteVersion2.0 structure:
  \`An assembly of creative producers specializing in [WHAT + HOW] for [WHO], working toward [WHY].\`

## Page And Wireframe Changes

- Home:
- About:
- Lenses:
- Works:
- Contact:

## Files Likely To Change

- Add likely files here before code editing starts.

## Checks Before Push

- Run the local site.
- Run typecheck or build when relevant.
- Confirm the new planning doc is committed with the site change.

## Open Questions

- Add anything Ravin and Nick need to decide later.
`;

writeFileSync(filePath, content);
console.log(`Created ${filePath}`);
