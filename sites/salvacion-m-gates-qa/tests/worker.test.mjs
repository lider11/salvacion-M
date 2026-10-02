import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../dist/server/index.js',import.meta.url),'utf8');const worker=(await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)).default;
test('health and unknown API are explicit',async()=>{let r=await worker.fetch(new Request('https://x/api/health'),{});assert.equal(r.status,200);assert.equal((await r.json()).ok,true);r=await worker.fetch(new Request('https://x/api/missing'),{});assert.equal(r.status,404)});
test('public form rejects incomplete and missing consent',async()=>{const req=new Request('https://x/api/consultations',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});const r=await worker.fetch(req,{DB:{}});assert.equal(r.status,422);const p=await r.json();assert.match(p.error,/campos/)});
test('consent must be an explicit boolean authorization',async()=>{
  const payload={name:'Persona',phone:'3001234567',email:'persona@example.com',problem:'medicamento',entity:'eps',order:'si',action:'ninguna',consent:'false'};
  const r=await worker.fetch(new Request('https://x/api/consultations',{method:'POST',body:JSON.stringify(payload)}),{DB:{}});
  assert.equal(r.status,422);assert.match((await r.json()).error,/autorizar/);
});
test('admin endpoint denies missing token',async()=>{const r=await worker.fetch(new Request('https://x/api/admin/dashboard'),{ADMIN_API_TOKEN:'secret'});assert.equal(r.status,401)});
test('public request persists a consultation without opening a legal case',async()=>{
  const statements=[];
  const DB={prepare(sql){const item={sql,bind(){return item},async first(){return sql.includes('reference_counters')?{seq:1}:null}};return item},async batch(items){statements.push(...items.map(item=>item.sql));return []}};
  const preferred=new Date(Date.now()+86400000).toISOString().slice(0,16);
  const body={name:'Persona',phone:'3001234567',email:'persona@example.com',preferred_at:preferred,problem:'medicamento',entity:'eps',order:'si',action:'ninguna',consent:true};
  const r=await worker.fetch(new Request('https://x/api/consultations',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}),{DB});
  assert.equal(r.status,201);assert.match((await r.json()).reference,/^SM-\d{4}-\d{6}$/);assert.equal(statements.some(sql=>/INSERT INTO cases/i.test(sql)),false);
  assert.equal(statements.some(sql=>/INSERT INTO consultations/i.test(sql)),true);
  assert.equal(statements.some(sql=>/INSERT INTO appointments/i.test(sql)),true);
});
test('consultation can be requested without reserving an appointment',async()=>{
  const statements=[];
  const DB={prepare(sql){const item={sql,bind(){return item},async first(){return sql.includes('reference_counters')?{seq:2}:null}};return item},async batch(items){statements.push(...items.map(item=>item.sql));return []}};
  const body={name:'Persona',phone:'3001234567',email:'persona@example.com',problem:'medicamento',entity:'eps',order:'si',action:'ninguna',consent:true};
  const r=await worker.fetch(new Request('https://x/api/consultations',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}),{DB});
  assert.equal(r.status,201);
  assert.equal(statements.some(sql=>/INSERT INTO appointments/i.test(sql)),false);
  assert.equal(statements.some(sql=>/INSERT INTO consultations/i.test(sql)),true);
});
test('retry with the same request id returns the existing reference without another insert',async()=>{
  const requestId='31b08149-d44d-491a-8e1d-082500fe5b5f';let batches=0;
  const DB={prepare(sql){const item={bind(){return item},async first(){return sql.includes('SELECT reference')?{reference:'SM-2026-000123'}:null}};return item},async batch(){batches++}};
  const body={request_id:requestId,name:'Persona',phone:'3001234567',email:'persona@example.com',problem:'medicamento',entity:'eps',order:'si',action:'ninguna',consent:true};
  const r=await worker.fetch(new Request('https://x/api/consultations',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}),{DB});
  assert.equal(r.status,200);assert.equal((await r.json()).reference,'SM-2026-000123');assert.equal(batches,0);
});
test('client supplied role cannot grant administrative access',async()=>{
  const r=await worker.fetch(new Request('https://x/api/admin/dashboard',{headers:{'x-admin-role':'admin'}}),{ADMIN_API_TOKEN:'secret'});
  assert.equal(r.status,401);
});
test('client supplied actor cannot replace a verified identity',async()=>{
  const DB={prepare(){const item={bind(){return item},async first(){return null},async all(){return {results:[]}}};return item},async batch(){return [{results:[{}]},{results:[]},{results:[]}]}};
  const identities=JSON.stringify([{token:'verified-token',actor_id:'verified-user',roles:['reader']}]);
  const r=await worker.fetch(new Request('https://x/api/admin/dashboard',{headers:{authorization:'Bearer verified-token','x-crm-actor-id':'forged-user'}}),{DB,CRM_IDENTITIES:identities});
  assert.equal(r.status,200);assert.equal(r.headers.get('x-auth-actor'),'verified-user');assert.equal(r.headers.get('x-auth-mode'),'individual');
});
test('trusted CRM proxy attributes the verified Sites actor and role',async()=>{
  const DB={prepare(){const item={bind(){return item},async first(){return null},async all(){return {results:[]}}};return item},async batch(){return [{results:[{}]},{results:[]},{results:[]}]}};
  const r=await worker.fetch(new Request('https://x/api/admin/dashboard',{headers:{authorization:'Bearer service-token','x-crm-actor-id':'site-user-77','x-admin-role':'asesor'}}),{DB,ADMIN_API_TOKEN:'service-token'});
  assert.equal(r.status,200);assert.equal(r.headers.get('x-auth-actor'),'site-user-77');assert.equal(r.headers.get('x-auth-mode'),'individual');
});
test('orientation scripts load under the site content security policy',async()=>{
  const page=await worker.fetch(new Request('https://x/'));
  const html=await page.text();
  assert.match(page.headers.get('content-security-policy'),/script-src 'self'/);
  assert.doesNotMatch(html,/<script(?:\s[^>]*)?>(?!\s*<\/script>)/i);
  for(const path of ['/intro.js','/contact.js']){
    assert.match(html,new RegExp(path.slice(1).replace('.','\\.')));
    const script=await worker.fetch(new Request('https://x'+path));
    assert.equal(script.status,200);
    assert.match(script.headers.get('content-type'),/javascript/);
  }
});
test('static response includes security headers',async()=>{const r=await worker.fetch(new Request('https://x/'),{});assert.equal(r.status,200);assert.equal(r.headers.get('x-content-type-options'),'nosniff');assert.match(await r.text(),/Salvación M/)});
test('complete Abrazo M logo is served',async()=>{const r=await worker.fetch(new Request('https://x/logo-salvacion-m.svg'),{});assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/image\/svg\+xml/);const svg=await r.text();assert.match(svg,/Dos figuras humanas curvas/);assert.match(svg,/SALVACIÓN/)});
test('header motion supports compact state and reduced motion',async()=>{const [js,css,logo]=await Promise.all(['/app.js','/styles.css','/logo-salvacion-m.svg'].map(path=>worker.fetch(new Request('https://x'+path),{}).then(r=>r.text())));assert.match(js,/is-compact/);assert.match(css,/prefers-reduced-motion:reduce/);assert.match(logo,/meet-left/);assert.match(logo,/prefers-reduced-motion:reduce/)});
test('logo animation can replay on click',async()=>{const [html,js,css]=await Promise.all(['/','/app.js','/styles.css'].map(path=>worker.fetch(new Request('https://x'+path),{}).then(r=>r.text())));assert.match(html,/brand-motion/);assert.match(js,/addEventListener\('click',playLogo\)/);assert.match(css,/\.brand-motion\.is-replaying/);assert.match(css,/brand-meet-left/)});
test('header assets bypass stale browser cache',async()=>{const html=await worker.fetch(new Request('https://x/')).then(r=>r.text());assert.match(html,/styles\.css\?v=12/);assert.match(html,/app\.js\?v=12/);for(const path of ['/styles.css','/app.js']){const r=await worker.fetch(new Request('https://x'+path));assert.equal(r.headers.get('cache-control'),'no-cache')}});
test('navigation uses progressive route hover and active section state',async()=>{const [html,js,css]=await Promise.all(['/','/app.js','/styles.css'].map(path=>worker.fetch(new Request('https://x'+path),{}).then(r=>r.text())));assert.match(html,/styles\.css\?v=12/);assert.match(html,/app\.js\?v=12/);assert.match(css,/transform:scaleX\(0\)/);assert.match(css,/aria-current="location"/);assert.match(css,/:focus-visible/);assert.match(js,/IntersectionObserver/);assert.match(js,/aria-current/)});
test('header CTA click triggers accompaniment pulse with reduced-motion fallback',async()=>{const [js,css]=await Promise.all(['/app.js','/styles.css'].map(path=>worker.fetch(new Request('https://x'+path),{}).then(r=>r.text())));assert.match(js,/navCta\.addEventListener\('click'/);assert.match(js,/is-pulsing/);assert.match(css,/@keyframes nav-cta-pulse/);assert.match(css,/scale\(\.97\)/);assert.match(css,/prefers-reduced-motion:reduce/)});

test('G4 API responses enforce no-store and browser security headers',async()=>{
  const r=await worker.fetch(new Request('https://x/api/health'),{});
  assert.equal(r.headers.get('cache-control'),'no-store');
  assert.equal(r.headers.get('x-frame-options'),'DENY');
  assert.equal(r.headers.get('x-content-type-options'),'nosniff');
  assert.match(r.headers.get('content-security-policy'),/frame-ancestors 'none'/);
  assert.match(r.headers.get('strict-transport-security'),/max-age=31536000/);
  assert.match(r.headers.get('permissions-policy'),/camera=\(\)/);
});

test('G4 CORS preflight is restricted to the configured CRM origin',async()=>{
  const r=await worker.fetch(new Request('https://x/api/admin/dashboard',{method:'OPTIONS'}),{CRM_ORIGIN:'https://crm.example.invalid'});
  assert.equal(r.status,204);
  assert.equal(r.headers.get('access-control-allow-origin'),'https://crm.example.invalid');
  assert.equal(r.headers.get('access-control-allow-credentials'),null);
  assert.equal(r.headers.get('access-control-allow-methods'),'GET,PATCH,PUT,OPTIONS');
});

test('G4 rejects malformed JSON and invalid public enum values without persistence',async()=>{
  let prepared=0;
  const DB={prepare(){prepared++;throw new Error('database must not be reached')}};
  let r=await worker.fetch(new Request('https://x/api/consultations',{method:'POST',body:'{' }),{DB});
  assert.equal(r.status,400);assert.equal(prepared,0);
  const payload={name:'Persona',phone:'3001234567',email:'persona@example.com',problem:'script',entity:'eps',order:'si',action:'ninguna',consent:true};
  r=await worker.fetch(new Request('https://x/api/consultations',{method:'POST',body:JSON.stringify(payload)}),{DB});
  assert.equal(r.status,422);assert.equal(prepared,0);
});

test('G4 read-only identity cannot mutate CRM records',async()=>{
  const identities=JSON.stringify([{token:'reader-token',actor_id:'reader-01',roles:['reader']}]);
  const r=await worker.fetch(new Request('https://x/api/admin/records/item-01',{method:'PATCH',headers:{authorization:'Bearer reader-token'},body:JSON.stringify({type:'consultation',status:'closed'})}),{CRM_IDENTITIES:identities});
  assert.equal(r.status,403);
  assert.equal(r.headers.get('cache-control'),'no-store');
});


test('G3 external scheduler endpoint requires its dedicated trigger secret',async()=>{
  let r=await worker.fetch(new Request('https://x/api/internal/reminders/dispatch',{method:'POST'}),{REMINDER_TRIGGER_TOKEN:'scheduler-secret'});
  assert.equal(r.status,401);
  r=await worker.fetch(new Request('https://x/api/internal/reminders/dispatch',{method:'POST',headers:{authorization:'Bearer wrong'}}),{REMINDER_TRIGGER_TOKEN:'scheduler-secret'});
  assert.equal(r.status,401);
});

test('G3 external scheduler endpoint invokes reminders with an authorized trigger',async()=>{
  const DB={prepare(sql){const item={bind(){return item},async all(){return {results:[]}}};return item}};
  const r=await worker.fetch(new Request('https://x/api/internal/reminders/dispatch',{method:'POST',headers:{authorization:'Bearer scheduler-secret'}}),{DB,REMINDER_TRIGGER_TOKEN:'scheduler-secret',REMINDER_WEBHOOK_URL:'https://provider.example.invalid'});
  assert.equal(r.status,200);
  const body=await r.json();
  assert.equal(body.ok,true);assert.equal(body.queued,0);assert.equal(body.sent,0);assert.equal(body.failed,0);
});

test('Auth v2 backend rejects untrusted CRM callers',async()=>{
 const r=await worker.fetch(new Request('https://x/api/internal/auth/me'),{CRM_AUTH_SERVICE_TOKEN:'service'});
 assert.equal(r.status,401);
});
test('Auth v2 backend rejects invalid credentials generically',async()=>{
 const DB={prepare(sql){const item={bind(){return item},async first(){return null},async run(){return {}}};return item}};
 const r=await worker.fetch(new Request('https://x/api/internal/auth/login',{method:'POST',headers:{authorization:'Bearer service','content-type':'application/json'},body:JSON.stringify({email:'nobody@example.invalid',password:'invalid-password'})}),{DB,CRM_AUTH_SERVICE_TOKEN:'service'});
 assert.equal(r.status,401);assert.equal((await r.json()).error,'Credenciales inválidas.');
});


test('Auth v2 bootstrap is internal, service-authenticated and one-time',async()=>{
  const statements=[];
  const DB={
    prepare(sql){const item={sql,bind(){return item},async first(){return null}};return item},
    async batch(items){statements.push(...items.map(x=>x.sql));return [{meta:{changes:1}},{meta:{changes:1}}]}
  };
  let r=await worker.fetch(new Request('https://x/api/internal/auth/bootstrap-admin',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'admin@example.invalid',password:'Strong-Temporary-Password-123!'})}),{DB,CRM_AUTH_SERVICE_TOKEN:'service'});
  assert.equal(r.status,401);
  r=await worker.fetch(new Request('https://x/api/internal/auth/bootstrap-admin',{method:'POST',headers:{authorization:'Bearer service','content-type':'application/json'},body:JSON.stringify({email:'admin@example.invalid',password:'Strong-Temporary-Password-123!'})}),{DB,CRM_AUTH_SERVICE_TOKEN:'service'});
  assert.equal(r.status,201);
  const body=await r.json();
  assert.equal(body.user.role,'ADMIN');
  assert.equal(body.user.email,'admin@example.invalid');
  assert.equal('password' in body,false);assert.equal('password_hash' in body,false);assert.equal('password_salt' in body,false);
  assert.equal(statements.some(sql=>/INSERT INTO crm_users/i.test(sql)),true);
  assert.equal(statements.some(sql=>/INSERT INTO crm_auth_audit/i.test(sql)),true);
});

test('Auth v2 bootstrap refuses a second initial admin',async()=>{
  const DB={prepare(sql){const item={bind(){return item},async first(){return sql.includes('SELECT id FROM crm_users')?{id:'existing'}:null}};return item}};
  const r=await worker.fetch(new Request('https://x/api/internal/auth/bootstrap-admin',{method:'POST',headers:{authorization:'Bearer service','content-type':'application/json'},body:JSON.stringify({email:'admin2@example.invalid',password:'Strong-Temporary-Password-123!'})}),{DB,CRM_AUTH_SERVICE_TOKEN:'service'});
  assert.equal(r.status,409);
  assert.match((await r.json()).error,/bootstrap inicial/);
});


test('Auth v2 setup status reports whether first user is required',async()=>{
  const DB={prepare(){const item={bind(){return item},async first(){return {total:0}}};return item}};
  const r=await worker.fetch(new Request('https://x/api/internal/auth/setup-status',{headers:{authorization:'Bearer service'}}),{DB,CRM_AUTH_SERVICE_TOKEN:'service'});
  assert.equal(r.status,200);assert.equal((await r.json()).needs_setup,true);
});

test('Auth v2 setup status is service protected',async()=>{
  const DB={prepare(){const item={bind(){return item},async first(){return {total:0}}};return item}};
  const r=await worker.fetch(new Request('https://x/api/internal/auth/setup-status'),{DB,CRM_AUTH_SERVICE_TOKEN:'service'});
  assert.equal(r.status,401);
});

test('Auth v2 diagnostics reports expected schema safely',async()=>{
  const DB={prepare(sql){const item={bind(){return item},async first(){return sql.includes('count(*)')?{total:0}:null},async all(){if(sql.includes('sqlite_master'))return {results:[{name:'crm_auth_audit'},{name:'crm_sessions'},{name:'crm_users'}]};if(sql.includes('PRAGMA'))return {results:[{name:'id'},{name:'email'},{name:'password_hash'}]};return {results:[]}}};return item}};
  const r=await worker.fetch(new Request('https://x/api/internal/auth/diagnostics',{headers:{authorization:'Bearer service'}}),{DB,CRM_AUTH_SERVICE_TOKEN:'service'});
  assert.equal(r.status,200);
  const body=await r.json();
  assert.equal(body.ok,true);assert.equal(body.db_bound,true);assert.equal(body.user_count,0);
  assert.deepEqual(body.tables,['crm_auth_audit','crm_sessions','crm_users']);
  assert.equal(body.crm_users_columns.includes('password_hash'),true);
});

test('Auth v2 bootstrap reports missing schema without leaking database errors',async()=>{
  const DB={prepare(){const item={bind(){return item},async first(){throw new Error('no such table: crm_users')}};return item}};
  const r=await worker.fetch(new Request('https://x/api/internal/auth/bootstrap-admin',{method:'POST',headers:{authorization:'Bearer service','content-type':'application/json'},body:JSON.stringify({email:'admin@example.invalid',password:'Strong-Temporary-Password-123!'})}),{DB,CRM_AUTH_SERVICE_TOKEN:'service'});
  assert.equal(r.status,503);
  const body=await r.json();assert.equal(body.code,'AUTH_SCHEMA_UNAVAILABLE');assert.equal(JSON.stringify(body).includes('no such table'),false);
});
