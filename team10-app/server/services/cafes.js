import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dir, '../db/cafes.json');

const readCafes = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

export const getCafes = () => readCafes();

export const getCafeById = (id) => {
  const cafes = readCafes();
  return cafes.find((c) => c.id === id);
};

