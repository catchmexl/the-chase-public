#!/usr/bin/env node

/**
 * Validation Script for The Chase Rules
 * 
 * Validates:
 * - JSON manifest structure against schema
 * - All referenced markdown files exist
 * - Markdown files are valid
 * - No duplicate IDs or orders
 */

const fs = require('fs');
const path = require('path');

const RULES_DIR = path.join(__dirname);
const MANIFEST_FILE = path.join(RULES_DIR, 'rules.json');
const SCHEMA_FILE = path.join(RULES_DIR, 'rules_manifest.schema.json');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
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
  log(`${message}`, colors.green);
}

function info(message) {
  log(`${message}`, colors.blue);
}

// Validate JSON syntax
function validateJSON(filePath, name) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    success(`${name} is valid JSON`);
    return JSON.parse(content);
  } catch (err) {
    error(`${name} has invalid JSON: ${err.message}`);
    return null;
  }
}

// Check if file exists
function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    success(`${description} exists`);
    return true;
  } else {
    error(`${description} not found: ${filePath}`);
    return false;
  }
}

// Validate manifest structure
function validateManifestStructure(manifest) {
  info('Validating manifest structure...');

  // Check required fields
  if (!manifest.version) {
    error('Manifest missing "version" field');
  } else if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
    error(`Invalid version format: ${manifest.version} (expected X.Y.Z)`);
  } else {
    success(`Version: ${manifest.version}`);
  }

  if (!manifest.lastUpdated) {
    error('Manifest missing "lastUpdated" field');
  } else {
    try {
      new Date(manifest.lastUpdated);
      success(`Last updated: ${manifest.lastUpdated}`);
    } catch (err) {
      error(`Invalid date format: ${manifest.lastUpdated}`);
    }
  }

  if (!Array.isArray(manifest.rules)) {
    error('Manifest "rules" must be an array');
    return false;
  }

  if (manifest.rules.length === 0) {
    error('Manifest "rules" array is empty');
    return false;
  }

  success(`Found ${manifest.rules.length} rule sections`);
  return true;
}

// Validate rule sections
function validateRuleSections(rules) {
  info('Validating rule sections...');

  const ids = new Set();
  const orders = new Set();
  const files = new Set();
  const validCategories = ['core', 'mechanics', 'tips', 'conduct'];

  rules.forEach((rule, index) => {
    const ruleNum = index + 1;
    
    // Check required fields
    if (!rule.id) {
      error(`Rule #${ruleNum}: Missing "id" field`);
    } else {
      if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(rule.id)) {
        error(`Rule #${ruleNum}: Invalid id format "${rule.id}" (use kebab-case)`);
      }
      if (ids.has(rule.id)) {
        error(`Rule #${ruleNum}: Duplicate id "${rule.id}"`);
      }
      ids.add(rule.id);
    }

    if (!rule.title) {
      error(`Rule #${ruleNum} (${rule.id}): Missing "title" field`);
    } else if (rule.title.length > 100) {
      warning(`Rule #${ruleNum} (${rule.id}): Title too long (${rule.title.length} chars)`);
    }

    if (!rule.file) {
      error(`Rule #${ruleNum} (${rule.id}): Missing "file" field`);
    } else {
      if (!/^[a-z0-9-]+\.md$/.test(rule.file)) {
        error(`Rule #${ruleNum} (${rule.id}): Invalid file format "${rule.file}"`);
      }
      if (files.has(rule.file)) {
        error(`Rule #${ruleNum} (${rule.id}): Duplicate file "${rule.file}"`);
      }
      files.add(rule.file);

      // Check if file exists
      const filePath = path.join(RULES_DIR, rule.file);
      if (!checkFileExists(filePath, `Rule file "${rule.file}"`)) {
        // Already logged as error
      }
    }

    if (!rule.category) {
      error(`Rule #${ruleNum} (${rule.id}): Missing "category" field`);
    } else if (!validCategories.includes(rule.category)) {
      error(`Rule #${ruleNum} (${rule.id}): Invalid category "${rule.category}"`);
    }

    if (rule.order === undefined || rule.order === null) {
      error(`Rule #${ruleNum} (${rule.id}): Missing "order" field`);
    } else {
      if (typeof rule.order !== 'number' || rule.order < 1) {
        error(`Rule #${ruleNum} (${rule.id}): Invalid order ${rule.order} (must be >= 1)`);
      }
      if (orders.has(rule.order)) {
        warning(`Rule #${ruleNum} (${rule.id}): Duplicate order ${rule.order}`);
      }
      orders.add(rule.order);
    }

    if (rule.description && rule.description.length > 200) {
      warning(`Rule #${ruleNum} (${rule.id}): Description too long (${rule.description.length} chars)`);
    }

    success(`Rule #${ruleNum}: ${rule.id} - ${rule.title}`);
  });
}

// Validate markdown files
function validateMarkdownFiles(rules) {
  info('Validating markdown content...');

  rules.forEach(rule => {
    const filePath = path.join(RULES_DIR, rule.file);
    
    if (!fs.existsSync(filePath)) {
      // Already reported in previous check
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (content.trim().length === 0) {
        error(`${rule.file}: File is empty`);
        return;
      }

      // Check for basic markdown structure
      if (!content.includes('#')) {
        warning(`${rule.file}: No headings found`);
      }

      // Check file size (warn if > 50KB)
      const sizeKB = Buffer.byteLength(content, 'utf8') / 1024;
      if (sizeKB > 50) {
        warning(`${rule.file}: Large file size (${sizeKB.toFixed(1)} KB)`);
      }

      success(`${rule.file}: Valid (${sizeKB.toFixed(1)} KB)`);
    } catch (err) {
      error(`${rule.file}: Error reading file - ${err.message}`);
    }
  });
}

// Check for orphaned markdown files
function checkOrphanedFiles(rules) {
  info('Checking for orphaned files...');

  const manifestFiles = new Set(rules.map(r => r.file));
  const allFiles = fs.readdirSync(RULES_DIR)
    .filter(f => f.endsWith('.md') && f !== 'README.md' && f !== 'CHANGELOG.md');

  const orphaned = allFiles.filter(f => !manifestFiles.has(f));

  if (orphaned.length > 0) {
    orphaned.forEach(file => {
      warning(`Orphaned file not in manifest: ${file}`);
    });
  } else {
    success('No orphaned markdown files');
  }
}

// Main validation
function main() {
  console.log('\n' + '='.repeat(60));
  log('The Chase Rules Validator', colors.blue);
  console.log('='.repeat(60) + '\n');

  // Check manifest file exists
  if (!checkFileExists(MANIFEST_FILE, 'Manifest file')) {
    log('\n❌ Validation FAILED\n', colors.red);
    process.exit(1);
  }

  // Check schema file exists
  if (!checkFileExists(SCHEMA_FILE, 'Schema file')) {
    log('\n❌ Validation FAILED\n', colors.red);
    process.exit(1);
  }

  // Validate manifest JSON
  const manifest = validateJSON(MANIFEST_FILE, 'Manifest');
  if (!manifest) {
    log('\n❌ Validation FAILED\n', colors.red);
    process.exit(1);
  }

  // Validate schema JSON
  const schema = validateJSON(SCHEMA_FILE, 'Schema');
  if (!schema) {
    log('\n❌ Validation FAILED\n', colors.red);
    process.exit(1);
  }

  console.log('');

  // Validate manifest structure
  if (!validateManifestStructure(manifest)) {
    log('\n❌ Validation FAILED\n', colors.red);
    process.exit(1);
  }

  console.log('');

  // Validate rule sections
  validateRuleSections(manifest.rules);

  console.log('');

  // Validate markdown files
  validateMarkdownFiles(manifest.rules);

  console.log('');

  // Check for orphaned files
  checkOrphanedFiles(manifest.rules);

  console.log('\n' + '='.repeat(60));
  
  if (hasErrors) {
    log('❌ Validation FAILED with errors', colors.red);
    process.exit(1);
  } else if (hasWarnings) {
    log('⚠️  Validation PASSED with warnings', colors.yellow);
    process.exit(0);
  } else {
    log('✅ Validation PASSED', colors.green);
    process.exit(0);
  }
}

// Run validation
main();
