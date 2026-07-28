#!/usr/bin/env node

/**
 * Security monitoring script
 * Checks for vulnerabilities, outdated packages, and security best practices
 */

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SecurityChecker {
  constructor() {
    this.issues = [];
    this.warnings = [];
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
  }

  runPnpmJson(args) {
    let command = 'pnpm';
    let commandArgs = args;
    if (process.platform === 'win32') {
      const resolved = spawnSync('where.exe', ['pnpm.cmd'], {
        encoding: 'utf8',
      });
      const pnpmCmd = resolved.stdout?.split(/\r?\n/).find(Boolean);
      if (pnpmCmd) {
        const runtimeRoot = path.resolve(path.dirname(pnpmCmd), '..', '..');
        command = path.join(runtimeRoot, 'node', 'bin', 'node.exe');
        commandArgs = [
          path.join(
            runtimeRoot,
            'node',
            'node_modules',
            'pnpm',
            'bin',
            'pnpm.mjs'
          ),
          ...args,
        ];
      }
    }

    const result = spawnSync(command, commandArgs, {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
      shell: false,
    });

    if (result.error) throw result.error;
    if (!result.stdout.trim()) {
      throw new Error(
        result.stderr.trim() || `pnpm ${args.join(' ')} produced no output`
      );
    }

    return JSON.parse(result.stdout);
  }

  async checkDependencies() {
    this.log('info', 'Checking for outdated dependencies...');

    try {
      const outdatedPackages = this.runPnpmJson(['outdated', '--json']);

      if (Object.keys(outdatedPackages).length > 0) {
        this.warnings.push('Outdated dependencies found');
        this.log(
          'warn',
          `${Object.keys(outdatedPackages).length} packages are outdated`
        );
      } else {
        this.log('info', 'All dependencies are up to date');
      }
    } catch (error) {
      this.warnings.push('Unable to check outdated dependencies');
      this.log(
        'error',
        `Failed to check outdated dependencies: ${error.message}`
      );
    }
  }

  async checkVulnerabilities() {
    this.log(
      'info',
      'Checking production dependencies for security vulnerabilities...'
    );

    try {
      const auditResults = this.runPnpmJson(['audit', '--prod', '--json']);
      const advisories = Object.values(auditResults.advisories || {});

      if (advisories.length > 0) {
        this.issues.push('Security vulnerabilities found');
        this.log('error', `${advisories.length} vulnerabilities found`);

        // Log high severity vulnerabilities
        advisories.forEach(vuln => {
          if (vuln.severity === 'high' || vuln.severity === 'critical') {
            this.log(
              'error',
              `High severity: ${vuln.module_name} - ${vuln.title}`
            );
          }
        });
      } else {
        this.log('info', 'No security vulnerabilities found');
      }
    } catch (error) {
      this.issues.push('Unable to run security audit');
      this.log('error', `Failed to run security audit: ${error.message}`);
    }
  }

  async checkSecurityHeaders() {
    this.log('info', 'Checking security headers in HTML...');

    const configFile = path.join(__dirname, '../vercel.json');
    if (!fs.existsSync(configFile)) {
      this.warnings.push('Missing deployment security header configuration');
      this.log('warn', 'Missing deployment security header configuration');
      return;
    }

    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    const configuredHeaders = new Set(
      (config.headers || [])
        .filter(route => route.source === '/(.*)')
        .flatMap(route => route.headers || [])
        .map(header => header.key.toLowerCase())
    );
    const requiredHeaders = [
      'content-security-policy',
      'referrer-policy',
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options',
    ];

    requiredHeaders.forEach(header => {
      if (!configuredHeaders.has(header)) {
        this.warnings.push(`Missing security header: ${header}`);
        this.log('warn', `Missing security header: ${header}`);
      }
    });
  }

  async checkEnvironmentVariables() {
    this.log('info', 'Checking for exposed secrets...');

    const filesToCheck = [
      '.env',
      '.env.local',
      '.env.production',
      'vercel.json',
    ];

    filesToCheck.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');

        // Check for common secret patterns
        const secretPatterns = [
          /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
          /secret\s*[:=]\s*['"][^'"]+['"]/gi,
          /password\s*[:=]\s*['"][^'"]+['"]/gi,
          /token\s*[:=]\s*['"][^'"]+['"]/gi,
        ];

        secretPatterns.forEach(pattern => {
          if (pattern.test(content)) {
            this.warnings.push(`Potential secret found in ${file}`);
            this.log('warn', `Potential secret found in ${file}`);
          }
        });
      }
    });
  }

  async checkFilePermissions() {
    this.log('info', 'Checking file permissions...');

    if (process.platform === 'win32') {
      this.log('info', 'Skipping POSIX permission checks on Windows');
      return;
    }

    const sensitiveFiles = ['package.json', 'pnpm-lock.yaml', 'vercel.json'];

    sensitiveFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const mode = stats.mode & parseInt('777', 8);

        if (mode > parseInt('644', 8)) {
          this.warnings.push(`File ${file} has overly permissive permissions`);
          this.log(
            'warn',
            `File ${file} has overly permissive permissions (${mode.toString(8)})`
          );
        }
      }
    });
  }

  async generateReport() {
    this.log('info', 'Generating security report...');

    const report = {
      timestamp: new Date().toISOString(),
      issues: this.issues,
      warnings: this.warnings,
      summary: {
        totalIssues: this.issues.length,
        totalWarnings: this.warnings.length,
        status:
          this.issues.length > 0
            ? 'FAILED'
            : this.warnings.length > 0
              ? 'WARNING'
              : 'PASSED',
      },
    };

    const reportPath = path.join(__dirname, '../security-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    this.log('info', `Security report generated: ${reportPath}`);
    this.log('info', `Status: ${report.summary.status}`);

    if (this.issues.length > 0) {
      this.log('error', `Found ${this.issues.length} security issues`);
      process.exit(1);
    } else if (this.warnings.length > 0) {
      this.log('warn', `Found ${this.warnings.length} security warnings`);
    } else {
      this.log('info', 'Security check passed');
    }
  }

  async run() {
    this.log('info', 'Starting security check...');

    await this.checkDependencies();
    await this.checkVulnerabilities();
    await this.checkSecurityHeaders();
    await this.checkEnvironmentVariables();
    await this.checkFilePermissions();
    await this.generateReport();
  }
}

// Run security check
const checker = new SecurityChecker();
checker.run().catch(error => {
  console.error('Security check failed:', error);
  process.exit(1);
});
