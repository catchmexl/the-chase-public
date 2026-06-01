#!/usr/bin/env node

/**
 * Validation Script for The Chase Rules
 *
 * Validates:
 * - Every locale-aware rules manifest discovered under the rules directory
 * - All referenced markdown files exist relative to each manifest directory
 * - Markdown files are non-empty
 * - No duplicate IDs, orders, or files within a manifest
 * - No orphaned markdown files within a manifest directory
 */

const fs = require('fs');
const path = require('path');

const RULES_DIR = __dirname;
const ROOT_MANIFEST_FILE = path.join(RULES_DIR, 'rules.json');
const SCHEMA_FILE = path.join(RULES_DIR, 'rules_manifest.schema.json');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

let hasErrors = false;
let hasWarnings = false;

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function error(message) {
  log(`ERROR: ${message}`, colors.red);
  hasErrors = true;
}

function warning(message) {
  log(`WARNING: ${message}`, colors.yellow);
  hasWarnings = true;
}

function success(message) {
  log(message, colors.green);
}

function info(message) {
  log(message, colors.blue);
}

function validateJSON(filePath, label) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    success(`${label} is valid JSON`);
    return json;
  } catch (err) {
    error(`${label} has invalid JSON: ${err.message}`);
    return null;
  }
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    success(`${description} exists`);
    return true;
  }

  error(`${description} not found: ${filePath}`);
  return false;
}

function discoverManifestFiles(dirPath) {
  const manifestFiles = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      manifestFiles.push(...discoverManifestFiles(entryPath));
      continue;
    }

    if (entry.isFile() && entry.name === 'rules.json') {
      manifestFiles.push(entryPath);
    }
  }

  manifestFiles.sort((a, b) => a.localeCompare(b));
  return manifestFiles;
}

function validateManifestStructure(manifest, label) {
  info(`Validating manifest structure for ${label}...`);

  if (!manifest.version) {
    error(`${label}: missing "version" field`);
  } else if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
    error(`${label}: invalid version format ${manifest.version} (expected X.Y.Z)`);
  } else {
    success(`${label}: version ${manifest.version}`);
  }

  if (!manifest.lastUpdated) {
    error(`${label}: missing "lastUpdated" field`);
  } else if (Number.isNaN(Date.parse(manifest.lastUpdated))) {
    error(`${label}: invalid date format ${manifest.lastUpdated}`);
  } else {
    success(`${label}: last updated ${manifest.lastUpdated}`);
  }

  if (!Array.isArray(manifest.rules)) {
    error(`${label}: "rules" must be an array`);
    return false;
  }

  if (manifest.rules.length === 0) {
    error(`${label}: "rules" array is empty`);
    return false;
  }

  success(`${label}: found ${manifest.rules.length} rule sections`);
  return true;
}

function validateRuleSections(rules, manifestDir, label) {
  info(`Validating rule sections for ${label}...`);

  const ids = new Set();
  const orders = new Set();
  const files = new Set();
  const validCategories = ['core', 'mechanics', 'tips', 'conduct'];

  rules.forEach((rule, index) => {
    const ruleNum = index + 1;

    if (!rule.id) {
      error(`${label} rule #${ruleNum}: missing "id" field`);
    } else {
      if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(rule.id)) {
        error(`${label} rule #${ruleNum}: invalid id "${rule.id}" (use kebab-case)`);
      }
      if (ids.has(rule.id)) {
        error(`${label} rule #${ruleNum}: duplicate id "${rule.id}"`);
      }
      ids.add(rule.id);
    }

    if (!rule.title) {
      error(`${label} rule #${ruleNum} (${rule.id}): missing "title" field`);
    } else if (rule.title.length > 100) {
      warning(`${label} rule #${ruleNum} (${rule.id}): title too long (${rule.title.length} chars)`);
    }

    if (!rule.file) {
      error(`${label} rule #${ruleNum} (${rule.id}): missing "file" field`);
    } else {
      if (!/^[a-z0-9-]+\.md$/.test(rule.file)) {
        error(`${label} rule #${ruleNum} (${rule.id}): invalid file "${rule.file}"`);
      }
      if (files.has(rule.file)) {
        error(`${label} rule #${ruleNum} (${rule.id}): duplicate file "${rule.file}"`);
      }
      files.add(rule.file);

      const filePath = path.join(manifestDir, rule.file);
      checkFileExists(filePath, `${label} rule file "${rule.file}"`);
    }

    if (!rule.category) {
      error(`${label} rule #${ruleNum} (${rule.id}): missing "category" field`);
    } else if (!validCategories.includes(rule.category)) {
      error(`${label} rule #${ruleNum} (${rule.id}): invalid category "${rule.category}"`);
    }

    if (rule.order === undefined || rule.order === null) {
      error(`${label} rule #${ruleNum} (${rule.id}): missing "order" field`);
    } else {
      if (typeof rule.order !== 'number' || rule.order < 1) {
        error(`${label} rule #${ruleNum} (${rule.id}): invalid order ${rule.order}`);
      }
      if (orders.has(rule.order)) {
        warning(`${label} rule #${ruleNum} (${rule.id}): duplicate order ${rule.order}`);
      }
      orders.add(rule.order);
    }

    if (rule.description && rule.description.length > 200) {
      warning(
        `${label} rule #${ruleNum} (${rule.id}): description too long (${rule.description.length} chars)`,
      );
    }

    success(`${label} rule #${ruleNum}: ${rule.id} - ${rule.title}`);
  });
}

function validateMarkdownFiles(rules, manifestDir, label) {
  info(`Validating markdown content for ${label}...`);

  rules.forEach((rule) => {
    const filePath = path.join(manifestDir, rule.file);

    if (!fs.existsSync(filePath)) {
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');

      if (content.trim().length === 0) {
        error(`${label} ${rule.file}: file is empty`);
        return;
      }

      if (!content.includes('#')) {
        warning(`${label} ${rule.file}: no headings found`);
      }

      const sizeKB = Buffer.byteLength(content, 'utf8') / 1024;
      if (sizeKB > 50) {
        warning(`${label} ${rule.file}: large file size (${sizeKB.toFixed(1)} KB)`);
      }

      success(`${label} ${rule.file}: valid (${sizeKB.toFixed(1)} KB)`);
    } catch (err) {
      error(`${label} ${rule.file}: error reading file - ${err.message}`);
    }
  });
}

function checkOrphanedFiles(rules, manifestDir, label) {
  info(`Checking for orphaned files in ${label}...`);

  const manifestFiles = new Set(rules.map((rule) => rule.file));
  const allMarkdownFiles = fs
    .readdirSync(manifestDir)
    .filter((file) => file.endsWith('.md') && file !== 'README.md' && file !== 'CHANGELOG.md');

  const orphanedFiles = allMarkdownFiles.filter((file) => !manifestFiles.has(file));

  if (orphanedFiles.length > 0) {
    orphanedFiles.forEach((file) => {
      warning(`${label}: orphaned file not in manifest: ${file}`);
    });
    return;
  }

  success(`${label}: no orphaned markdown files`);
}

function validateManifestFile(manifestPath) {
  const relativeManifestPath = path.relative(RULES_DIR, manifestPath) || 'rules.json';
  const label = relativeManifestPath === 'rules.json' ? 'root rules' : relativeManifestPath;
  const manifestDir = path.dirname(manifestPath);

  console.log('');
  info(`Validating ${label}`);

  const manifest = validateJSON(manifestPath, `Manifest ${label}`);
  if (!manifest) {
    return;
  }

  if (!validateManifestStructure(manifest, label)) {
    return;
  }

  console.log('');
  validateRuleSections(manifest.rules, manifestDir, label);

  console.log('');
  validateMarkdownFiles(manifest.rules, manifestDir, label);

  console.log('');
  checkOrphanedFiles(manifest.rules, manifestDir, label);
}

function main() {
  console.log(`\n${'='.repeat(60)}`);
  log('The Chase Rules Validator', colors.blue);
  console.log(`${'='.repeat(60)}\n`);

  if (!checkFileExists(ROOT_MANIFEST_FILE, 'Root manifest file')) {
    log('\nValidation FAILED\n', colors.red);
    process.exit(1);
  }

  if (!checkFileExists(SCHEMA_FILE, 'Schema file')) {
    log('\nValidation FAILED\n', colors.red);
    process.exit(1);
  }

  const schema = validateJSON(SCHEMA_FILE, 'Schema');
  if (!schema) {
    log('\nValidation FAILED\n', colors.red);
    process.exit(1);
  }

  const manifestFiles = discoverManifestFiles(RULES_DIR);
  if (manifestFiles.length === 0) {
    error('No rules.json manifests found');
    process.exit(1);
  }

  success(`Discovered ${manifestFiles.length} manifest file(s)`);

  manifestFiles.forEach(validateManifestFile);

  console.log(`\n${'='.repeat(60)}`);
  if (hasErrors) {
    log('Validation FAILED with errors', colors.red);
    process.exit(1);
  }

  if (hasWarnings) {
    log('Validation PASSED with warnings', colors.yellow);
    process.exit(0);
  }

  log('Validation PASSED', colors.green);
}

main();
