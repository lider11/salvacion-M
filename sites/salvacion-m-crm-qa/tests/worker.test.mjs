import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';const source=await readFile(new URL('../dist/server/index.js',import.meta.url),'utf8');const worker=(await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)).default;const identity={'oai-authenticated-user-id':'site-user-1','oai-authenticated-user-email':'owner@example.invalid'},roles=JSON.stringify({'owner@example.invalid':'ADMIN','viewer@example.invalid':'LECTURA'});
test('CRM requires backend configuration',async()=>{const r=await worker.fetch(new Request('https://x/api/dashboard'),{});assert.equal(r.status,503)});test('CRM page does not describe local storage demo',async()=>{const r=await worker.fetch(new Request('https://x/'),{});assert.equal(r.status,200);const html=await r.text();assert.doesNotMatch(html,/localStorage|solo en este navegador/);assert.match(html,/Agenda/)});

test('CRM reports private backend sign-in instead of parsing HTML as data',async()=>{
 const previous=globalThis.fetch;globalThis.fetch=async()=>new Response('<!DOCTYPE html><title>Sign in</title>',{headers:{'content-type':'text/html'}});
 try{const r=await worker.fetch(new Request('https://x/api/dashboard',{headers:identity}),{BACKEND_URL:'https://qa.test',ADMIN_API_TOKEN:'test-token',CRM_USERS_JSON:roles});assert.equal(r.status,502);assert.match((await r.json()).error,/conexión privada/)}finally{globalThis.fetch=previous}
});
test('configured service credential is sent only to the backend',async()=>{
 const previous=globalThis.fetch;let auth;
 globalThis.fetch=async(_url,init)=>{auth=init.headers['OAI-Sites-Authorization'];return new Response('{"ok":true}',{headers:{'content-type':'application/json'}})};
 try{const r=await worker.fetch(new Request('https://x/api/dashboard',{headers:identity}),{BACKEND_URL:'https://qa.test',ADMIN_API_TOKEN:'test-token',BACKEND_SITE_AUTH_TOKEN:'service-token',CRM_USERS_JSON:roles});assert.equal(r.status,200);assert.equal(auth,'Bearer service-token');assert.doesNotMatch(await r.text(),/service-token/)}finally{globalThis.fetch=previous}
});

test('server role mapping denies anonymous and unknown users',async()=>{const env={BACKEND_URL:'https://qa.test',ADMIN_API_TOKEN:'test-token',CRM_USERS_JSON:roles};let r=await worker.fetch(new Request('https://x/api/dashboard'),env);assert.equal(r.status,401);r=await worker.fetch(new Request('https://x/api/dashboard',{headers:{'oai-authenticated-user-id':'other','oai-authenticated-user-email':'unknown@example.invalid','x-admin-role':'admin'}}),env);assert.equal(r.status,403)});
test('read-only user cannot update a record',async()=>{const env={BACKEND_URL:'https://qa.test',ADMIN_API_TOKEN:'test-token',CRM_USERS_JSON:roles};const r=await worker.fetch(new Request('https://x/api/records/id',{method:'PATCH',headers:{'oai-authenticated-user-id':'viewer-1','oai-authenticated-user-email':'viewer@example.invalid','x-admin-role':'admin'},body:'{}'}),env);assert.equal(r.status,403);assert.match((await r.json()).error,/solo lectura/)});

test('verified site identity is forwarded for backend audit',async()=>{const previous=globalThis.fetch;let actor;globalThis.fetch=async(_url,init)=>{actor=init.headers['x-crm-actor-id'];return new Response('{"ok":true}',{headers:{'content-type':'application/json'}})};try{const r=await worker.fetch(new Request('https://x/api/availability',{method:'PUT',headers:identity,body:'{}'}),{BACKEND_URL:'https://qa.test',ADMIN_API_TOKEN:'test-token',CRM_USERS_JSON:roles});assert.equal(r.status,200);assert.equal(actor,'site-user-1')}finally{globalThis.fetch=previous}});

test('reminder monitor uses authenticated proxy and preserves query parameters',async()=>{
 const previous=globalThis.fetch;let target,authorization;
 globalThis.fetch=async(url,init)=>{target=url;authorization=init.headers.authorization;return Response.json({stats:{total:0},reminders:[],audit:[]})};
 try{const env={BACKEND_URL:'https://qa.test',ADMIN_API_TOKEN:'test-token',CRM_USERS_JSON:roles};
 const r=await worker.fetch(new Request('https://crm.test/api/reminders?view=recent',{headers:identity}),env);
 assert.equal(r.status,200);assert.equal(target,'https://qa.test/api/admin/reminders?view=recent');assert.equal(authorization,'Bearer test-token');assert.doesNotMatch(await r.text(),/test-token/);
 assert.equal((await worker.fetch(new Request('https://crm.test/api/reminders'),env)).status,401);
 }finally{globalThis.fetch=previous}
});
