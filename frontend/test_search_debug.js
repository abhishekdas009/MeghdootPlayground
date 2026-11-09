const { prisma } = require('./lib/prisma');
const {
  matchesWarrantyDate,
  matchesWarrantyBranch,
  matchesWarrantyModel,
  normalizeWarrantyModel,
  parseFinderInstallationDate,
  repairWarrantyText,
} = require('./lib/warranty');

async function testSearch() {
  const modelNumber = "IA412FNU";
  const installationDate = "07-11-2026";
  const branch = "";

  console.log('Testing search with:', { modelNumber, installationDate, branch });

  const normalizedModel = normalizeWarrantyModel(typeof modelNumber === "string" ? modelNumber : "");
  console.log('normalizedModel:', normalizedModel);

  let parsedDateObj = null;
  if (installationDate) {
    parsedDateObj = parseFinderInstallationDate(installationDate);
    console.log('parsedDateObj:', parsedDateObj);
  }
  const dateToSearch = parsedDateObj ? parsedDateObj.date : null;

  const strippedModel = normalizedModel.replace(/^(?:BO|BI)-/, "");
  console.log('strippedModel:', strippedModel);

  const candidateConditions = await prisma.warrantyCondition.findMany({
    where: {
      OR: [
        { models: { contains: normalizedModel, mode: 'insensitive' } },
        { models: { contains: strippedModel, mode: 'insensitive' } },
      ]
    },
    orderBy: {
      sourceRow: 'asc'
    }
  });

  console.log('candidateConditions count:', candidateConditions.length);
  for (const c of candidateConditions) {
    console.log(`\nChecking condition: ID=${c.id}, sourceRow=${c.sourceRow}, termName=${c.termName}`);
    console.log(`  dateOp=${c.installationDateOperator}, from=${c.installationFrom}, to=${c.installationTo}`);
    console.log(`  branchOp=${c.branchOperator}, branches=${c.branches}`);
    console.log(`  modelOp=${c.modelOperator}, models length=${c.models?.length}`);

    const dateMatch = matchesWarrantyDate(dateToSearch, c.installationDateOperator, c.installationFrom, c.installationTo);
    console.log('  -> dateMatch:', dateMatch);

    const branchMatch = matchesWarrantyBranch(branch, c.branchOperator, c.branches);
    console.log('  -> branchMatch:', branchMatch);

    const modelMatch = matchesWarrantyModel(normalizedModel, c.modelOperator, c.models);
    console.log('  -> modelMatch:', modelMatch);
  }

  await prisma.$disconnect();
}

testSearch();
