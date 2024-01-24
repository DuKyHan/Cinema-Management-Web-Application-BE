import { execSync } from 'child_process';
import dayjs from 'dayjs';
import fs from 'fs';
import { parseArgs } from 'util';

const {
  values: { clean, apply },
} = parseArgs({
  options: {
    clean: {
      type: 'boolean',
      short: 'c',
    },
    apply: {
      type: 'boolean',
      short: 'a',
    },
  },
});

console.log('⇊ Squashing migrations...');

if (clean) {
  console.log('> Cleaning old migrations...');
  execSync('rimraf prisma/migrations', { stdio: 'inherit' });
}

const dateFormat = dayjs().format(`YYYYMMDDHHmmss`);
const migrationName = `${dateFormat}_squashed_migrations`;
const migrationPath = `prisma/migrations/${migrationName}`;

fs.mkdirSync(migrationPath, { recursive: true });
fs.writeFileSync(`${migrationPath}/migration.sql`, '');

console.log('> Generating new migration...');
execSync(
  `npx prisma migrate diff --from-empty --to-schema-datamodel ./prisma/schema.prisma --script > ${migrationPath}/migration.sql`,
  { stdio: 'inherit' },
);

if (apply) {
  console.log('> Apply new migration...');
  execSync(`npx prisma migrate resolve --applied ${migrationName}`, {
    stdio: 'inherit',
  });
}
