const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

// Copy warranty functions to test directly:
function normalizeWarrantyModel(value) {
  return value.trim().toUpperCase().replace(/[\s\u00A0]+/g, "");
}

function normalizeWarrantyBranch(value) {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

function parseWarrantyBranches(value) {
  if (!value?.trim()) return [];
  return [...new Set(value.split(",").map(normalizeWarrantyBranch).filter(Boolean))];
}

function parseModelAliases(value) {
  const aliases = new Set();
  let pending = "";
  for (const commaPart of value.replace(/\r\n?/g, "\n").split(",")) {
    const lines = commaPart.split("\n");
    for (const line of lines) {
      const part = line.trim();
      if (!part) continue;
      if (!pending) {
        pending = part;
        continue;
      }
      if (pending.endsWith("-")) {
        pending += part;
        continue;
      }
      const norm = normalizeWarrantyModel(pending);
      if (norm) aliases.add(norm);
      pending = part;
    }
    if (pending) {
      const norm = normalizeWarrantyModel(pending);
      if (norm) aliases.add(norm);
    }
  }
  return [...aliases];
}

function createUtcDate(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function parseFinderInstallationDate(value) {
  const ISO_DATE_PATTERN = /^(\d{4})([-/])(\d{2})\2(\d{2})$/;
  const FINDER_DATE_PATTERN = /^(\d{2})([-/])(\d{2})\2(\d{4})$/;

  let match = value.match(ISO_DATE_PATTERN);
  if (match) {
    return { date: createUtcDate(Number(match[1]), Number(match[3]), Number(match[4])) };
  }
  match = value.match(FINDER_DATE_PATTERN);
  if (match) {
    return { date: createUtcDate(Number(match[4]), Number(match[3]), Number(match[1])) };
  }
  return null;
}

function matchesWarrantyDate(installationDate, installationDateOperator, installationFrom, installationTo) {
  if (!installationDate) return true;
  const toCalendarDay = (date) => Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

  const installDay = toCalendarDay(installationDate);
  const fromDay = installationFrom ? toCalendarDay(installationFrom) : null;
  const toDay = installationTo ? toCalendarDay(installationTo) : null;

  const rawOp = (installationDateOperator || "").trim().toUpperCase();

  if (rawOp === "BETWEEN") {
    if (fromDay !== null && installDay < fromDay) return false;
    if (toDay !== null && installDay > toDay) return false;
    return true;
  }

  if (rawOp === "MORE THAN" || rawOp === "GREATER THAN" || rawOp === ">" || rawOp === ">=") {
    if (fromDay !== null && installDay < fromDay) return false;
    return true;
  }

  if (rawOp === "LESS THAN" || rawOp === "<" || rawOp === "<=") {
    if (toDay !== null && installDay > toDay) return false;
    if (fromDay !== null && installDay > fromDay) return false;
    return true;
  }

  if (fromDay !== null && installDay < fromDay) return false;
  if (toDay !== null && installDay > toDay) return false;
  return true;
}

function matchesWarrantyBranch(branch, branchOperator, branches) {
  if (!branch || !branch.trim()) return true;
  const op = (branchOperator || "").trim().toUpperCase();
  if (!op || !branches || !branches.trim()) return true;

  const branchValues = parseWarrantyBranches(branches);
  const containsBranch = branchValues.includes(normalizeWarrantyBranch(branch));

  if (op === "IN" || op === "EQUALS" || op === "=") return containsBranch;
  if (op === "NOT IN" || op === "NOT EQUALS" || op === "!=") return !containsBranch;
  return true;
}

function matchesWarrantyModel(searchedModel, modelOperator, conditionModels) {
  if (!conditionModels || !conditionModels.trim()) return false;
  const normalizedModel = normalizeWarrantyModel(searchedModel);
  const strippedModel = normalizedModel.replace(/^(?:BO|BI)-/, "");

  const aliases = parseModelAliases(conditionModels);
  const containsModel = aliases.includes(normalizedModel) || aliases.includes(strippedModel);

  const op = (modelOperator || "").trim().toUpperCase();
  if (op === "NOT IN" || op === "NOT EQUALS" || op === "!=") return !containsModel;
  return containsModel;
}

async function run() {
  const modelNumber = "IA412FNU";
  const installationDate = "07-11-2026";
  const branch = "";

  const normalizedModel = normalizeWarrantyModel(modelNumber);
  const parsedDateObj = parseFinderInstallationDate(installationDate);
  const dateToSearch = parsedDateObj ? parsedDateObj.date : null;
  const strippedModel = normalizedModel.replace(/^(?:BO|BI)-/, "");

  console.log("Searching DB for:", { normalizedModel, strippedModel, dateToSearch });

  const candidateConditions = await prisma.warrantyCondition.findMany({
    where: {
      OR: [
        { models: { contains: normalizedModel, mode: 'insensitive' } },
        { models: { contains: strippedModel, mode: 'insensitive' } },
      ]
    },
    orderBy: { sourceRow: 'asc' }
  });

  console.log(`Found ${candidateConditions.length} candidate conditions from DB query`);

  for (const cond of candidateConditions) {
    console.log(`\nEvaluating row ${cond.sourceRow}: term=${cond.termName}`);
    console.log(`  dateOp: ${cond.installationDateOperator}, from: ${cond.installationFrom}, to: ${cond.installationTo}`);
    console.log(`  branchOp: ${cond.branchOperator}, branches: ${cond.branches}`);
    console.log(`  modelOp: ${cond.modelOperator}`);

    const dateOk = matchesWarrantyDate(dateToSearch, cond.installationDateOperator, cond.installationFrom, cond.installationTo);
    console.log(`  matchesWarrantyDate: ${dateOk}`);

    const branchOk = matchesWarrantyBranch(branch, cond.branchOperator, cond.branches);
    console.log(`  matchesWarrantyBranch: ${branchOk}`);

    const modelOk = matchesWarrantyModel(normalizedModel, cond.modelOperator, cond.models);
    console.log(`  matchesWarrantyModel: ${modelOk}`);

    const aliases = parseModelAliases(cond.models);
    console.log(`  total aliases parsed: ${aliases.length}`);
    console.log(`  aliases includes normalized (${normalizedModel}): ${aliases.includes(normalizedModel)}`);
    console.log(`  aliases includes stripped (${strippedModel}): ${aliases.includes(strippedModel)}`);
  }

  await prisma.$disconnect();
}

run();
