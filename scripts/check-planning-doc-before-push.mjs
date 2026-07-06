#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const ZERO_SHA = /^0{40}$/;
const PROTECTED_BRANCHES = new Set(["master", "main"]);
const PLANNING_DOC_PATTERN =
  /^docs\/PlanningDoc\d{2}[A-Z][a-z]{2}\d{4}_SiteVersion\d+\.\d+\.md$/;

function getArg(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function shortBranch(refOrBranch) {
  return refOrBranch.replace(/^refs\/heads\//, "");
}

function addedFilesInRange(range) {
  const output = git([
    "diff",
    "--name-only",
    "--diff-filter=A",
    range,
    "--",
    "docs/PlanningDoc*_SiteVersion*.md",
  ]);

  return output ? output.split(/\r?\n/).filter(Boolean) : [];
}

function addedFilesInCommit(commitSha) {
  const output = git([
    "diff-tree",
    "--no-commit-id",
    "--name-only",
    "--diff-filter=A",
    "-r",
    "--root",
    commitSha,
    "--",
    "docs/PlanningDoc*_SiteVersion*.md",
  ]);

  return output ? output.split(/\r?\n/).filter(Boolean) : [];
}

function hasNewPlanningDoc(files) {
  return files.some((file) => PLANNING_DOC_PATTERN.test(file));
}

function fail(branch) {
  console.error("");
  console.error(`Push blocked: pushes to ${branch} must include a new planning doc.`);
  console.error("");
  console.error("Create one first:");
  console.error("");
  console.error("  pnpm run planning:new");
  console.error("");
  console.error("Then edit the new file, commit it with the intended site changes, and push again.");
  console.error("");
  console.error("Expected filename pattern:");
  console.error("");
  console.error("  docs/PlanningDocDDMonYYYY_SiteVersionX.Y.md");
  console.error("");
  process.exit(1);
}

function checkRange(range, branch) {
  const branchName = shortBranch(branch);
  if (!PROTECTED_BRANCHES.has(branchName)) {
    return;
  }

  if (!hasNewPlanningDoc(addedFilesInRange(range))) {
    fail(branchName);
  }
}

const explicitRange = getArg("--range");
const explicitBranch = getArg("--branch") ?? "master";

if (explicitRange) {
  checkRange(explicitRange, explicitBranch);
  process.exit(0);
}

if (process.stdin.isTTY) {
  process.exit(0);
}

const stdin = readFileSync(0, "utf8").trim();

if (!stdin) {
  process.exit(0);
}

for (const line of stdin.split(/\r?\n/)) {
  const [localRef, localSha, remoteRef, remoteSha] = line.trim().split(/\s+/);
  const branch = shortBranch(remoteRef ?? "");

  if (!PROTECTED_BRANCHES.has(branch) || !localSha || ZERO_SHA.test(localSha)) {
    continue;
  }

  const files = ZERO_SHA.test(remoteSha)
    ? addedFilesInCommit(localSha)
    : addedFilesInRange(`${remoteSha}..${localSha}`);

  if (!hasNewPlanningDoc(files)) {
    fail(branch);
  }
}
