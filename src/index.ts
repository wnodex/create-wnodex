#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import ora from 'ora';
import picocolors from 'picocolors';
import { confirm, input, select } from '@inquirer/prompts';

const { cyan, green, red } = picocolors;

/**
 * Main entry point for the CLI.
 */
async function main() {
  console.log(cyan('\nWelcome to create-wnodex! 🚀\n'));

  // 1. Get Project Name
  const projectName = await input({
    message: 'What is your project named?',
    default: 'my-wnodex-app',
    validate: (input) => {
      if (input.trim() === '') return 'Project name cannot be empty.';
      if (existsSync(input.trim()))
        return 'Directory already exists. Please choose another name.';
      return true;
    },
  });

  const targetDir = path.join(process.cwd(), projectName);

  // 2. Select Package Manager
  const packageManager = await select({
    message: 'Which package manager do you want to use?',
    choices: [
      { name: 'npm', value: 'npm' },
      { name: 'pnpm', value: 'pnpm' },
      { name: 'yarn', value: 'yarn' },
      { name: 'bun', value: 'bun' },
    ],
    default: 'npm',
  });

  // 3. Prompt for Prisma
  const usePrisma = await confirm({
    message: 'Do you want to use Prisma?',
    default: true,
  });

  // 4. Clone Template
  const spinner = ora('Cloning template...').start();
  try {
    execSync(
      `git clone --depth 1 https://github.com/wnodex/wnodex-template "${projectName}"`,
      { stdio: 'ignore' }
    );

    // Remove .git directory
    await rm(path.join(targetDir, '.git'), { recursive: true, force: true });
    spinner.succeed('Template cloned successfully.');
  } catch (error) {
    spinner.fail('Failed to clone template.');
    console.error(red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }

  // 5. Handle Prisma
  if (!usePrisma) {
    const prismaSpinner = ora('Removing Prisma dependencies...').start();
    try {
      const pkgPath = path.join(targetDir, 'package.json');
      const pkgContent = await readFile(pkgPath, 'utf8');
      const pkg = JSON.parse(pkgContent);

      const depsToRemove = [
        'prisma',
        '@dotenvx/dotenvx',
        '@prisma/adapter-pg',
        '@prisma/client',
        'pg',
      ];

      for (const dep of depsToRemove) {
        if (pkg.dependencies && pkg.dependencies[dep])
          delete pkg.dependencies[dep];
        if (pkg.devDependencies && pkg.devDependencies[dep])
          delete pkg.devDependencies[dep];
      }

      await writeFile(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');

      const prismaDir = path.join(targetDir, 'prisma');
      if (existsSync(prismaDir)) {
        await rm(prismaDir, { recursive: true, force: true });
      }

      const modelsDir = path.join(targetDir, 'src', 'models');
      if (existsSync(modelsDir)) {
        await rm(modelsDir, { recursive: true, force: true });
      }

      prismaSpinner.succeed('Prisma removed successfully.');
    } catch (error) {
      prismaSpinner.fail('Failed to remove Prisma dependencies.');
      console.error(
        red(error instanceof Error ? error.message : String(error))
      );
    }
  }

  // 6. Install Dependencies
  const installSpinner = ora(
    `Installing dependencies using ${packageManager}...`
  ).start();
  try {
    execSync(`${packageManager} install`, { cwd: targetDir, stdio: 'ignore' });
    installSpinner.succeed('Dependencies installed successfully.');
  } catch {
    installSpinner.warn(
      `Failed to install dependencies automatically. You can install them manually.`
    );
  }

  // 7. Success Message
  console.log(green('\nProject successfully created! 🎉\n'));
  console.log('Next steps:');
  console.log(cyan(`  cd ${projectName}`));
  console.log(
    cyan(
      `  ${packageManager} ${packageManager === 'npm' ? 'run dev' : 'dev'}\n`
    )
  );
}

try {
  await main();
} catch (error) {
  console.error(red('\nAn unexpected error occurred:'));
  console.error(error);
  process.exit(1);
}
