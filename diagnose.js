#!/usr/bin/env node

/**
 * Quick Diagnostic Script for Supply Chain Management System
 * Run this to verify your setup is correct before starting the application
 * 
 * Usage: node diagnose.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║   Supply Chain Management System - Diagnostic Tool        ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: []
};

function check(name, condition, details = '') {
  if (condition) {
    console.log(`✅ ${name}`);
    checks.passed++;
  } else {
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
    checks.failed++;
    checks.errors.push(name);
  }
}

function warn(name, details = '') {
  console.log(`⚠️  ${name}`);
  if (details) console.log(`   ${details}`);
  checks.warnings++;
}

// 1. Check Node.js version
console.log('\n📦 Environment Checks');
console.log('─'.repeat(60));
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
check('Node.js v16+', majorVersion >= 16, `Current: ${nodeVersion}`);

// 2. Check package.json
console.log('\n📂 Project Files');
console.log('─'.repeat(60));
const packagePath = path.join(__dirname, 'package.json');
check('package.json exists', fs.existsSync(packagePath));

const envExamplePath = path.join(__dirname, '.env.example');
check('.env.example exists', fs.existsSync(envExamplePath));

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  check('.env file exists', true);
} else {
  check('.env file exists', false, 'Run: cp .env.example .env');
}

// 3. Check required directories
const dirs = [
  'src',
  'controllers',
  'routes',
  'middleware',
  'utils'
];

dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  check(`Directory: ${dir}/`, fs.existsSync(dirPath));
});

// 4. Check key files
console.log('\n🔧 Key Files');
console.log('─'.repeat(60));
const files = [
  'server.js',
  'src/App.jsx',
  'src/main.jsx',
  'src/api.js',
  'utils/db.js',
  'controllers/authController.js',
  'middleware/authMiddleware.js',
  'vite.config.js',
  'tailwind.config.js'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  check(`File: ${file}`, fs.existsSync(filePath));
});

// 5. Check .env configuration
console.log('\n🔐 Environment Configuration');
console.log('─'.repeat(60));

if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        envVars[key?.trim()] = value?.trim() || '';
      }
    });

    check('DB_HOST configured', !!envVars.DB_HOST, `Value: ${envVars.DB_HOST || 'NOT SET'}`);
    check('DB_USER configured', !!envVars.DB_USER, `Value: ${envVars.DB_USER || 'NOT SET'}`);
    check('DB_PASSWORD configured', !!envVars.DB_PASSWORD, `Value: ${envVars.DB_PASSWORD ? '***' : 'NOT SET'}`);
    check('DB_NAME configured', !!envVars.DB_NAME, `Value: ${envVars.DB_NAME || 'NOT SET'}`);
    check('JWT_SECRET configured', !!envVars.JWT_SECRET, `Value: ${envVars.JWT_SECRET ? '***' : 'NOT SET'}`);
    check('PORT configured', !!envVars.PORT, `Value: ${envVars.PORT || '5000 (default)'}`);
    check('VITE_API_BASE configured', !!envVars.VITE_API_BASE, `Value: ${envVars.VITE_API_BASE || 'NOT SET'}`);
  } catch (error) {
    warn('Could not read .env file', error.message);
  }
} else {
  warn('.env file not found', 'Copy from .env.example: cp .env.example .env');
}

// 6. Check dependencies
console.log('\n📚 Dependencies');
console.log('─'.repeat(60));

if (fs.existsSync(packagePath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    const deps = packageJson.dependencies || {};
    const devDeps = packageJson.devDependencies || {};
    const allDeps = { ...deps, ...devDeps };

    const required = [
      'react',
      'react-router-dom',
      'express',
      'mysql2',
      'cors',
      'dotenv',
      'bcryptjs',
      'jsonwebtoken',
      'vite',
      'tailwindcss'
    ];

    required.forEach(dep => {
      if (allDeps[dep]) {
        check(`${dep}`, true, `v${allDeps[dep]}`);
      } else {
        check(`${dep}`, false, 'Missing - run: npm install');
      }
    });
  } catch (error) {
    warn('Could not parse package.json', error.message);
  }
}

// Check for node_modules
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  check('node_modules installed', true);
} else {
  check('node_modules installed', false, 'Run: npm install');
}

// 7. Summary
console.log('\n' + '─'.repeat(60));
console.log('📊 Summary');
console.log('─'.repeat(60));
console.log(`✅ Passed: ${checks.passed}`);
console.log(`❌ Failed: ${checks.failed}`);
console.log(`⚠️  Warnings: ${checks.warnings}`);

if (checks.failed === 0 && checks.warnings === 0) {
  console.log('\n🎉 All checks passed! You\'re ready to run:');
  console.log('   npm run backend    (Terminal 1)');
  console.log('   npm run dev        (Terminal 2)');
} else if (checks.failed === 0) {
  console.log('\n⚠️  Address warnings above, then you can run the application.');
  console.log('   Most common issue: Missing .env file');
  console.log('   Fix: cp .env.example .env');
} else {
  console.log('\n❌ Fix the errors above before running the application.');
  console.log('\n📋 Next Steps:');
  console.log('   1. Check that all required files exist');
  console.log('   2. Run: npm install');
  console.log('   3. Create .env file: cp .env.example .env');
  console.log('   4. Edit .env with your MySQL credentials');
  console.log('   5. Run: node diagnose.js (to verify again)');
}

console.log('\n💡 Need help?');
console.log('   - Check README.md for setup instructions');
console.log('   - Check TROUBLESHOOTING.md for common issues');
console.log('   - See: https://github.com/your-repo/ for more info\n');

// Exit with error code if checks failed
process.exit(checks.failed > 0 ? 1 : 0);
