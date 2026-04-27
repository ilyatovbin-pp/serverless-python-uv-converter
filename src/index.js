'use strict';

const { execSync } = require('child_process');

function ensureTomlInstalled() {
  try {
    require.resolve('toml');
  } catch {
    try {
      require.resolve('@iarna/toml');
    } catch {
      console.log('Installing @iarna/toml automatically...');
      execSync('npm install @iarna/toml', { stdio: 'inherit' });
    }
  }
}

ensureTomlInstalled();

const fs = require('fs');
const path = require('path');
const toml = require('./node_modules/@iarna/toml'); // relative to plugin file

class PythonUvConverter {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.hooks = {
      'before:package:createDeploymentArtifacts': this.convertPyproject.bind(this),
    };
  }

  convertPyproject() {
    const servicePath = this.serverless.serviceDir || process.cwd();
    const requirementsPath = path.join(servicePath, 'requirements.txt');

    const config = this.serverless.service.custom?.pythonUvConverter || {};
    const overwrite = config.overwrite || false;
    const depGroup = config.dependencyGroup || null;

    // Check if requirements.txt exists
    if (fs.existsSync(requirementsPath) && !overwrite) {
      this.serverless.cli.log('requirements.txt already exists, skipping generation (overwrite=false).');
      return;
    }

    const pyprojectPath = path.join(servicePath, 'pyproject.toml');
    if (!fs.existsSync(pyprojectPath)) {
      this.serverless.cli.log('No pyproject.toml found, skipping requirements.txt generation.');
      return;
    }

    const pyprojectContent = fs.readFileSync(pyprojectPath, 'utf-8');
    const pyproject = toml.parse(pyprojectContent);

    let dependencies = [];
    
    // PEP 621 style [project] table
    if (pyproject.project?.dependencies) {
      dependencies.push(...pyproject.project.dependencies);
    }

    // optional dependencies (PEP 621)
    if (depGroup && pyproject.project?.['optional-dependencies']?.[depGroup]) {
      dependencies.push(...pyproject.project['optional-dependencies'][depGroup]);
    }

    // dependency-groups (PEP 660 style / modern Poetry)
    if (depGroup && pyproject['dependency-groups']?.[depGroup]) {
      dependencies.push(...pyproject['dependency-groups'][depGroup]);
    }

    // Write requirements.txt
    fs.writeFileSync(requirementsPath, dependencies.join('\n'));
    this.serverless.cli.log(`requirements.txt generated with ${dependencies.length} dependencies.`);
  }
}

module.exports = PythonUvConverter;
