import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pbkdf2Sync} from 'node:crypto';
const source=await readFile(new URL('../worker/pbkdf2.js',import.meta.url),'utf8');
const fallback=(await import('data:text/javascript;base64,'+Buffer.from(source+'\nexport {pbkdf2Sha256Fallback};').toString('base64'))).pbkdf2Sha256Fallback;
for(const password of ['SalvacionM-Test-Password-2026!','Clave-é-🔐-'+ 'x'.repeat(100)])test('Fallback equals native PBKDF2 at approved cost for password byte length '+Buffer.byteLength(password),()=>{
 const p=new TextEncoder().encode(password),salt=Uint8Array.from({length:24},(_,i)=>i*7);
 const result=fallback(p,salt,210000);assert.deepEqual(Buffer.from(result),pbkdf2Sync(p,salt,210000,32,'sha256'));
});
test('Fallback rejects lowered iteration counts',()=>assert.throws(()=>fallback(new Uint8Array(14),new Uint8Array(24),100000)));
