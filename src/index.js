const fs = require('fs');
const core = require('@actions/core');

const lcov = require('./lcov');
const { sendComment } = require('./github');
const { checkCoverageRation } = require('./features/minCoverageRatio');

async function main() {
  const token = core.getInput('github-token');
  const baseFile = core.getInput('lcov-file');
  const headFile = core.getInput('head-lcov-file');

  const baseFileRaw = fs.readFileSync(baseFile, 'utf8');

  if (!baseFileRaw) {
    console.log(`No coverage report found at '${baseFile}', exiting...`);
    return;
  }

  const headFileRaw = fs.readFileSync(headFile, 'utf8');

  if (!headFileRaw) {
    console.log(`No coverage report found at '${headFileRaw}', exiting...`);
    return;
  }

  const headFileData = await lcov.parse(headFileRaw);
  const baseFileData = await lcov.parse(baseFileRaw);

  const basePercentage = lcov.percentage(baseFileData).toFixed(2);
  const headPercentage = lcov.percentage(headFileData).toFixed(2);

  const diff = basePercentage - headPercentage;

  sendComment(token, diff, basePercentage);
  checkCoverageRation(diff);

  core.setOutput('percentage', basePercentage);
  core.setOutput('diff', diff);
}

try {
  main();
} catch {
  console.log(err);
  core.setFailed(err.message);
}