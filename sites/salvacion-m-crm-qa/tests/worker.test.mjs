import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../dist/server/index.js',import.meta.url),'utf8');
const worker=(await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)).default;
const envBase={BACKEND_URL:'https://qa.test',ADMIN_API_TOKEN:'admin-service',CRM_AUTH_SERVICE_TOKEN:'auth-service'};
const json=(data,status=200)=>Response.json(data,{status});

test('CRM requires backend configuration',async()=>{
  const r=await worker.fetch(new Request('https://x/api/dashboard'),{});
  assert.equal(r.status,503);
});

test('CRM page and browser auth code keep secrets out of Web Storage',async()=>{
  const page=await worker.fetch(new Request('https://x/'));
  assert.equal(page.status,200);
  const html=await page.text();
  assert.match(html,/auth\.js/);
  assert.doesNotMatch(html,/localStorage|sessionStorage/);
  const js=await worker.fetch(new Request('https://x/auth.js')).then(r=>r.text());
  assert.doesNotMatch(js,/localStorage|sessionStorage|ADMIN_API_TOKEN|CRM_AUTH_SERVICE_TOKEN|REMINDER_TRIGGER_TOKEN/);
});

test('private Sites sign-in HTML is rejected instead of becoming a session',async()=>{
  const previous=globalThis.fetch;
  globalThis.fetch=async()=>new Response('<!doctype html><title>Sign in</title>',{status:200,headers:{'content-type':'text/html'}});
  try{
    const r=await worker.fetch(new Request('https://crm.test/api/auth/login',{method:'POST',body:'{}'}),envBase);
    assert.equal(r.status,502);
    assert.match((await r.json()).error,/conexión privada/);
    assert.equal(r.headers.get('set-cookie'),null);
  }finally{globalThis.fetch=previous}
});

test('login sends service credentials only server-to-server and sets an HttpOnly cookie',async()=>{
  const previous=globalThis.fetch;
  let target,headers;
  globalThis.fetch=async(url,init)=>{target=url;headers=init.headers;return json({token:'opaque-session',csrf_token:'csrf',user:{id:'admin-1',email:'admin@example.invalid',role:'ADMIN'}})};
  try{
    const env={...envBase,BACKEND_SITE_AUTH_TOKEN:'site-service'};
    const r=await worker.fetch(new Request('https://crm.test/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'admin@example.invalid',password:'password-123'})}),env);
    assert.equal(r.status,200);
    assert.equal(target,'https://qa.test/api/internal/auth/login');
    assert.equal(headers.authorization,'Bearer auth-service');
    assert.equal(headers['OAI-Sites-Authorization'],'Bearer site-service');
    const cookie=r.headers.get('set-cookie')||'';
    assert.match(cookie,/__Host-sm_session=opaque-session/);
    assert.match(cookie,/HttpOnly/);assert.match(cookie,/Secure/);assert.match(cookie,/SameSite=Strict/);
    assert.doesNotMatch(await r.text(),/opaque-session|auth-service|site-service/);
  }finally{globalThis.fetch=previous}
});

test('session lookup forwards only the opaque session cookie',async()=>{
  const previous=globalThis.fetch;
  let sessionHeader;
  globalThis.fetch=async(_url,init)=>{sessionHeader=init.headers['x-auth-session'];return json({id:'admin-1',email:'admin@example.invalid',role:'ADMIN',csrf_token:'csrf'})};
  try{
    const r=await worker.fetch(new Request('https://crm.test/api/auth/me',{headers:{cookie:'__Host-sm_session=opaque-session'}}),envBase);
    assert.equal(r.status,200);
    assert.equal(sessionHeader,'opaque-session');
    assert.equal((await r.json()).role,'ADMIN');
  }finally{globalThis.fetch=previous}
});

test('anonymous users cannot proxy CRM APIs',async()=>{
  const previous=globalThis.fetch;let calls=0;
  globalThis.fetch=async()=>{calls++;return json({error:'No autenticado.'},401)};
  try{
    const r=await worker.fetch(new Request('https://crm.test/api/dashboard'),envBase);
    assert.equal(r.status,401);assert.equal(calls,1);
  }finally{globalThis.fetch=previous}
});

test('read-only sessions cannot mutate CRM records',async()=>{
  const previous=globalThis.fetch;let calls=0;
  globalThis.fetch=async()=>{calls++;return json({id:'reader-1',email:'reader@example.invalid',role:'LECTURA',csrf_token:'csrf'})};
  try{
    const r=await worker.fetch(new Request('https://crm.test/api/records/id',{method:'PATCH',headers:{cookie:'__Host-sm_session=opaque','x-csrf-token':'csrf'},body:'{}'}),envBase);
    assert.equal(r.status,403);assert.match((await r.json()).error,/solo lectura/);assert.equal(calls,1);
  }finally{globalThis.fetch=previous}
});

test('authenticated session identity and role are forwarded for backend audit',async()=>{
  const previous=globalThis.fetch;let calls=0,target,adminHeaders;
  globalThis.fetch=async(url,init)=>{
    calls++;
    if(calls===1)return json({id:'advisor-7',email:'advisor@example.invalid',role:'ASESOR',csrf_token:'csrf'});
    target=url;adminHeaders=init.headers;return json({ok:true});
  };
  try{
    const r=await worker.fetch(new Request('https://crm.test/api/reminders?view=recent',{headers:{cookie:'__Host-sm_session=opaque'}}),envBase);
    assert.equal(r.status,200);
    assert.equal(target,'https://qa.test/api/admin/reminders?view=recent');
    assert.equal(adminHeaders.authorization,'Bearer admin-service');
    assert.equal(adminHeaders['x-admin-role'],'asesor');
    assert.equal(adminHeaders['x-crm-actor-id'],'advisor-7');
    assert.equal(calls,2);
  }finally{globalThis.fetch=previous}
});

test('G3 evidence mutations reject cross-origin requests before any backend call',async()=>{
  const previous=globalThis.fetch;let calls=0;
  globalThis.fetch=async()=>{calls++;return json({ok:true})};
  try{
    const r=await worker.fetch(new Request('https://crm.test/api/g3/verification?appointment_id=test',{method:'POST',headers:{origin:'https://attacker.invalid','content-type':'application/json'},body:'{}'}),envBase);
    assert.equal(r.status,403);assert.equal(calls,0);
  }finally{globalThis.fetch=previous}
});

test('invalid CSRF token stops a mutable request after session validation',async()=>{
  const previous=globalThis.fetch;let calls=0;
  globalThis.fetch=async()=>{calls++;return json({id:'admin-1',email:'admin@example.invalid',role:'ADMIN',csrf_token:'expected'})};
  try{
    const r=await worker.fetch(new Request('https://crm.test/api/records/id',{method:'PATCH',headers:{cookie:'__Host-sm_session=opaque','x-csrf-token':'wrong'},body:'{}'}),envBase);
    assert.equal(r.status,403);assert.equal(calls,1);
  }finally{globalThis.fetch=previous}
});

test('logout forwards CSRF and clears the browser session cookie',async()=>{
  const previous=globalThis.fetch;let csrf,session;
  globalThis.fetch=async(_url,init)=>{csrf=init.headers['x-csrf-token'];session=init.headers['x-auth-session'];return json({ok:true})};
  try{
    const r=await worker.fetch(new Request('https://crm.test/api/auth/logout',{method:'POST',headers:{cookie:'__Host-sm_session=opaque','x-csrf-token':'csrf'}}),envBase);
    assert.equal(r.status,200);assert.equal(csrf,'csrf');assert.equal(session,'opaque');
    assert.match(r.headers.get('set-cookie')||'',/Max-Age=0/);
  }finally{globalThis.fetch=previous}
});
