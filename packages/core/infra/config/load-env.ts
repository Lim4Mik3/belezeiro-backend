/**
 * Load environment variables from multiple .env files
 * This script should be imported at the entry point of the application
 *
 * Bun automatically loads .env files, but we need to ensure all module-specific
 * .env files are loaded as well
 */

import { join, dirname } from "path";
import { existsSync, readFileSync } from "fs";

// Find the monorepo root by looking for package.json with workspaces
function findMonorepoRoot(startDir: string = process.cwd()): string {
  let currentDir = startDir;

  while (currentDir !== '/') {
    const packageJsonPath = join(currentDir, 'package.json');

    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

        // Check if this is the monorepo root (has workspaces)
        if (packageJson.workspaces) {
          return currentDir;
        }
      } catch (error) {
        // Continue searching
      }
    }

    // Go up one directory
    currentDir = dirname(currentDir);
  }

  // Fallback to current directory
  return process.cwd();
}

const rootDir = findMonorepoRoot();

/**
 * Load environment files in order of priority (first one wins for existing variables)
 * 1. .env - Global variables (root)
 * 2. packages/core/.env - Core module variables
 * 3. packages/iam/.env - IAM module variables
 * 4. packages/shared/.env - Shared module variables
 * 5. .env.local - Local overrides (highest priority)
 */
const envFiles = [
  ".env",
  "packages/core/.env",
  "packages/iam/.env",
  "packages/shared/.env",
  `.env.${process.env.NODE_ENV || "development"}`,
  ".env.local",
];

function parseEnvFile(filePath: string): Record<string, string> {
  const content = readFileSync(filePath, "utf-8");
  const env: Record<string, string> = {};

  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const index = trimmed.indexOf("=");
    if (index === -1) {
      continue;
    }

    const key = trimmed.substring(0, index).trim();
    let value = trimmed.substring(index + 1).trim();

    // Remove quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

export function loadEnvironmentVariables() {
  console.log(`\n[ENV] Loading environment variables from: ${rootDir}`);
  const loadedVars: Record<string, string> = {};

  for (const file of envFiles) {
    const filePath = join(rootDir, file);

    if (existsSync(filePath)) {
      try {
        const env = parseEnvFile(filePath);
        let newVarsCount = 0;

        // Merge into process.env
        for (const [key, value] of Object.entries(env)) {
          // Don't override existing environment variables
          if (!process.env[key]) {
            process.env[key] = value;
            loadedVars[key] = filePath;
            newVarsCount++;
          }
        }

        console.log(`✓ Loaded: ${file} (${newVarsCount} new variables)`);
      } catch (error) {
        console.warn(`⚠ Failed to load ${file}:`, error);
      }
    } else {
      console.log(`⊘ Not found: ${file}`);
    }
  }

  console.log("\n[ENV] Key variables loaded:");
  const importantVars = ['NODE_ENV', 'PORT', 'REDIS_HOST', 'REDIS_PORT', 'REDIS_URL', 'JWT_SECRET'];
  for (const varName of importantVars) {
    const value = process.env[varName];
    const source = loadedVars[varName] || 'system/default';
    if (value) {
      const displayValue = varName.includes('SECRET') || varName.includes('PASSWORD')
        ? '***HIDDEN***'
        : value;
      console.log(`  ${varName} = ${displayValue} (from: ${source})`);
    } else {
      console.log(`  ${varName} = NOT SET ⚠️`);
    }
  }

  console.log("\n✓ Environment variables loaded successfully\n");
}

// Auto-load on import
loadEnvironmentVariables();
