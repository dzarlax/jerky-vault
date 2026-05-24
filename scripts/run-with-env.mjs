import { spawn } from 'node:child_process';

const separatorIndex = process.argv.indexOf('--');

if (separatorIndex === -1 || separatorIndex === process.argv.length - 1) {
  console.error('Usage: node scripts/run-with-env.mjs KEY=value [KEY=value ...] -- command [args ...]');
  process.exit(1);
}

const env = { ...process.env };
const assignments = process.argv.slice(2, separatorIndex);

for (const assignment of assignments) {
  const equalsIndex = assignment.indexOf('=');

  if (equalsIndex <= 0) {
    console.error(`Invalid environment assignment: ${assignment}`);
    process.exit(1);
  }

  const key = assignment.slice(0, equalsIndex);
  const value = assignment.slice(equalsIndex + 1);
  env[key] = value;
}

const [command, ...args] = process.argv.slice(separatorIndex + 1);
const child = spawn(command, args, {
  env,
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

child.on('error', (error) => {
  console.error(error.message);
  process.exit(1);
});
