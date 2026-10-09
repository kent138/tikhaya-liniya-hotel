import {readFile} from 'node:fs/promises';
import {db} from './db.js';
await db().unsafe(await readFile(new URL('./schema.sql',import.meta.url),'utf8'));
console.log('Hotel schema ready.');
await db().end();
