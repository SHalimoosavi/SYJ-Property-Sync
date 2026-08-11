import {
  DuplicateCandidate,
  NormalizationChange,
  Property,
  ValidationResult,
} from "../types";

// ---- Validation Engine -----------------------------------------------
// Mirrors section 9 of the brief: required fields, invalid values,
// missing descriptions/images, invalid dates, etc.

export function validateProperty(property: Property): ValidationResult[] {
  const results: ValidationResult[] = [];

  results.push(
    property.id
      ? { field: "propertyId", severity: "pass", messageKey: "validation.msg.ok", messageParams: { field: "" } }
      : { field: "propertyId", severity: "error", messageKey: "validation.msg.ok" }
  );

  results.push(
    property.address && property.address.trim().length > 3
      ? { field: "address", severity: "pass", messageKey: "validation.msg.ok" }
      : { field: "address", severity: "error", messageKey: "validation.msg.ok" }
  );

  results.push(
    property.monthlyRent > 0
      ? { field: "rent", severity: "pass", messageKey: "validation.msg.ok" }
      : { field: "rent", severity: "error", messageKey: "validation.msg.invalidRent" }
  );

  const postalOk = /^\d{5}$/.test(property.postalCode.trim());
  results.push(
    postalOk
      ? { field: "postalCode", severity: "pass", messageKey: "validation.msg.ok" }
      : { field: "postalCode", severity: "error", messageKey: "validation.msg.invalidPostal" }
  );

  const availabilityDate = new Date(property.availabilityDate);
  const isPast = availabilityDate.getTime() < Date.now() - 1000 * 60 * 60 * 24;
  results.push(
    !isPast
      ? { field: "availabilityDate", severity: "pass", messageKey: "validation.msg.ok" }
      : { field: "availabilityDate", severity: "warning", messageKey: "validation.msg.pastAvailability" }
  );

  const hasEnglish = Boolean(property.descriptions.en && property.descriptions.en.trim().length > 0);
  results.push(
    hasEnglish
      ? { field: "description_en", severity: "pass", messageKey: "validation.msg.ok" }
      : { field: "description_en", severity: "warning", messageKey: "validation.msg.missingDescription", messageParams: { lang: "English" } }
  );

  const hasFinnish = Boolean(property.descriptions.fi && property.descriptions.fi.trim().length > 0);
  results.push(
    hasFinnish
      ? { field: "description_fi", severity: "pass", messageKey: "validation.msg.ok" }
      : { field: "description_fi", severity: "warning", messageKey: "validation.msg.missingDescription", messageParams: { lang: "Finnish" } }
  );

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(property.agentEmail);
  results.push(
    emailOk
      ? { field: "email", severity: "pass", messageKey: "validation.msg.ok" }
      : { field: "email", severity: "error", messageKey: "validation.msg.invalidEmail" }
  );

  results.push(
    property.imageCount >= 3
      ? { field: "images", severity: "pass", messageKey: "validation.msg.ok" }
      : { field: "images", severity: "warning", messageKey: "validation.msg.missingImages" }
  );

  results.push(
    property.propertyType
      ? { field: "propertyType", severity: "pass", messageKey: "validation.msg.ok" }
      : { field: "propertyType", severity: "error", messageKey: "validation.msg.ok" }
  );

  return results;
}

export function validationSummary(results: ValidationResult[]) {
  return {
    errors: results.filter((r) => r.severity === "error").length,
    warnings: results.filter((r) => r.severity === "warning").length,
    passed: results.filter((r) => r.severity === "pass").length,
  };
}

// ---- Normalization Engine ----------------------------------------------
// Mirrors section 10 of the brief.

function normalizeCityName(city: string): string {
  const trimmed = city.trim();
  const lower = trimmed.toLowerCase();
  if (lower === "turku" || lower === "åbo") return "Turku";
  if (lower.length === 0) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("0")) return "+358" + digits.slice(1);
  return "+358" + digits;
}

function normalizePostal(postal: string): string {
  const digits = postal.replace(/\D/g, "");
  return digits.padStart(5, "0").slice(0, 5);
}

export function normalizeProperty(property: Property): NormalizationChange[] {
  const changes: NormalizationChange[] = [];

  const normalizedCity = normalizeCityName(property.city);
  if (normalizedCity !== property.city) {
    changes.push({
      field: "city",
      original: property.city,
      normalized: normalizedCity,
      ruleKey: "normalization.rule.city",
    });
  }

  changes.push({
    field: "currency",
    original: "EUR",
    normalized: "EUR",
    ruleKey: "normalization.rule.currency",
  });

  changes.push({
    field: "area",
    original: `${property.areaSqm} m2`,
    normalized: `${property.areaSqm} m\u00B2`,
    ruleKey: "normalization.rule.area",
  });

  if (property.country.toLowerCase() !== "finland") {
    changes.push({
      field: "country",
      original: property.country,
      normalized: "Finland",
      ruleKey: "normalization.rule.country",
    });
  }

  const normalizedPhone = normalizePhone(property.agentPhone);
  if (normalizedPhone !== property.agentPhone.replace(/\s/g, "")) {
    changes.push({
      field: "phone",
      original: property.agentPhone,
      normalized: normalizedPhone,
      ruleKey: "normalization.rule.phone",
    });
  }

  const normalizedPostal = normalizePostal(property.postalCode);
  if (normalizedPostal !== property.postalCode) {
    changes.push({
      field: "postalCode",
      original: property.postalCode,
      normalized: normalizedPostal,
      ruleKey: "normalization.rule.postal",
    });
  }

  changes.push({
    field: "propertyType",
    original: property.propertyType,
    normalized: property.propertyType.toUpperCase(),
    ruleKey: "normalization.rule.propertyType",
  });

  return changes;
}

// ---- Duplicate Detection ------------------------------------------------
// Mirrors section 11 of the brief.

export function detectDuplicates(property: Property, all: Property[]): DuplicateCandidate[] {
  const candidates: DuplicateCandidate[] = [];

  for (const other of all) {
    if (other.id === property.id) continue;

    let score = 0;
    const matched: string[] = [];

    if (other.postalCode === property.postalCode) {
      score += 20;
      matched.push("postalCode");
    }
    if (other.city.toLowerCase() === property.city.toLowerCase()) {
      score += 10;
      matched.push("city");
    }
    if (Math.abs(other.monthlyRent - property.monthlyRent) < 50) {
      score += 20;
      matched.push("rent");
    }
    if (other.bedrooms === property.bedrooms) {
      score += 15;
      matched.push("bedrooms");
    }
    if (Math.abs(other.areaSqm - property.areaSqm) < 5) {
      score += 20;
      matched.push("area");
    }
    // Address similarity: same street token (very rough demo heuristic)
    const streetA = property.address.split(" ")[0]?.toLowerCase();
    const streetB = other.address.split(" ")[0]?.toLowerCase();
    if (streetA && streetB && streetA === streetB) {
      score += 15;
      matched.push("address");
    }

    if (score >= 55) {
      candidates.push({
        propertyId: property.id,
        comparedTo: other.id,
        confidence: Math.min(99, score),
        matchedFields: matched,
      });
    }
  }

  return candidates.sort((a, b) => b.confidence - a.confidence);
}
