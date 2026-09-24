import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { DocBackingMetadata } from "./schema.ts";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, "..");

export interface ValidationResult {
  valid: boolean;
  fixture: string;
  docPath: string;
  docFileExists: boolean;
  errors: string[];
  docMetadata: DocBackingMetadata;
}

/**
 * Validates that a mock fixture is backed by authoritative local documentation
 * and adheres to the specified schema contract fields.
 */
export function validateFixtureDocBacking(
  fixtureName: string,
  data: unknown,
  metadata: DocBackingMetadata,
  checkFileOnDisk: boolean = true
): ValidationResult {
  const errors: string[] = [];
  let docFileExists = true;

  if (checkFileOnDisk) {
    const absoluteDocPath = path.resolve(repoRoot, metadata.docPath);
    docFileExists = fs.existsSync(absoluteDocPath);
    if (!docFileExists) {
      errors.push(`Authoritative doc file does not exist on disk: ${metadata.docPath}`);
    }
  }

  // Verify that required fields exist in data
  const isBrandContainer =
    data && typeof data === "object" && "brand" in data && typeof (data as any).brand === "object" && (data as any).brand !== null;
  const isSourcesContainer =
    data && typeof data === "object" && !("identity" in data) && "sources" in data && Array.isArray((data as any).sources);

  const target = isBrandContainer
    ? (data as any).brand
    : isSourcesContainer
    ? (data as any).sources
    : data;

  if (Array.isArray(target)) {
    if (target.length === 0) {
      errors.push("Fixture array is empty; cannot validate schema conformance.");
    } else {
      target.forEach((item, idx) => {
        if (!item || typeof item !== "object") {
          errors.push(`Item at index ${idx} is not an object.`);
          return;
        }
        for (const field of metadata.requiredFields) {
          if (!(field in item) || (item as Record<string, unknown>)[field] === undefined) {
            errors.push(`Item at index ${idx} is missing required field: ${field}`);
          }
        }
      });
    }
  } else if (target && typeof target === "object") {
    for (const field of metadata.requiredFields) {
      if (!(field in target) || (target as Record<string, unknown>)[field] === undefined) {
        errors.push(`Object is missing required field: ${field}`);
      }
    }
  } else {
    errors.push("Fixture data is neither an array nor an object.");
  }

  return {
    valid: errors.length === 0,
    fixture: fixtureName,
    docPath: metadata.docPath,
    docFileExists,
    errors,
    docMetadata: metadata,
  };
}

/**
 * Formats a response envelope when the client requests doc backing verification.
 */
export function wrapWithDocBacking<T>(data: T, metadata: DocBackingMetadata): {
  data: T;
  _meta: {
    docBacked: boolean;
    docPath: string;
    specSection: string;
    specUrl: string;
    lastVerified: string;
    verified: boolean;
    errors?: string[];
  };
} {
  const validation = validateFixtureDocBacking("runtime-response", data, metadata, true);
  return {
    data,
    _meta: {
      docBacked: true,
      docPath: metadata.docPath,
      specSection: metadata.specSection,
      specUrl: metadata.specUrl,
      lastVerified: metadata.lastVerified,
      verified: validation.valid,
      errors: validation.errors,
    },
  };
}
