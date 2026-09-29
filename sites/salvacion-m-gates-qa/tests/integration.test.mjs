import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';

const importWorker=async path=>{
  const source=await readFile(new URL(path,import.meta.url),'utf8');
  return (await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)).default;
};
const publicWorker=await importWorker('../dist/server/index.js');
const crmSource="const ASSETS={'/':{body:'',type:'text/html'}};\n"+await readFile(new URL('./fixtures/crm-runtime.js',import.meta.url),'utf8');
const crmWorker=(await import(`data:text/javascript;base64,${Buffer.from(crmSource).toString('base64')}`)).default;

function createD1(){
  const sql=new DatabaseSync(':memory:');
  for(const file of ['../drizzle/0000_initial.sql','../drizzle/0001_reference_counters.sql','../drizzle/0002_client_address.sql','../drizzle/0003_confirmed_slots.sql','../drizzle/0004_professional_availability.sql','../drizzle/0005_availability_audit.sql','../drizzle/0006_identity_reminders.sql']){
    sql.exec((awaitText(file)).replaceAll('--> statement-breakpoint',''));
  }
  function awaitText(file){return files.get(file)}
  function statement(query){
    let values=[];
    return {sql:query,bind(...args){values=args;return this},async first(){return sql.prepare(query).get(...values)??null},run(){return sql.prepare(query).run(...values)},all(){return sql.prepare(query).all(...values)}};
  }
  return {prepare:statement,async batch(statements){sql.exec('BEGIN');try{const result=statements.map(s=>(/^\s*SELECT\b/i.test(s.sql)?{results:s.all()}:{results:[],meta:{changes:s.run().changes}}));sql.exec('COMMIT');return result}catch(e){sql.exec('ROLLBACK');throw e}},count(table){return sql.prepare(`SELECT count(*) n FROM ${table}`).get().n},close(){sql.close()}};
}
const files=new Map(await Promise.all(['../drizzle/0000_initial.sql','../drizzle/0001_reference_counters.sql','../drizzle/0002_client_address.sql','../drizzle/0003_confirmed_slots.sql','../drizzle/0004_professional_availability.sql','../drizzle/0005_availability_audit.sql','../drizzle/0006_identity_reminders.sql'].map(async p=>[p,await readFile(new URL(p,import.meta.url),'utf8')])));

test('consultation persists and appears through the separate CRM proxy with the same reference',async()=>{
  const DB=createD1(),token='synthetic-test-token';
  const originalFetch=globalThis.fetch;
  globalThis.fetch=async (url,init)=>publicWorker.fetch(new Request(url,init),{DB,ADMIN_API_TOKEN:token});
  try{
    const payload={request_id:'31b08149-d44d-491a-8e1d-082500fe5b5f',name:'Usuario de prueba',phone:'3000000000',email:'qa@example.invalid',address:'Calle de prueba 1',summary:'Resumen sintético',problem:'medicamento',entity:'eps',order:'si',action:'ninguna',consent:true};
    const post=()=>publicWorker.fetch(new Request('https://public.test/api/consultations',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)}),{DB,ADMIN_API_TOKEN:token});
    const first=await post();assert.equal(first.status,201);const receipt=await first.json();assert.match(receipt.reference,/^SM-\d{4}-\d{6}$/);
    assert.equal(DB.count('consultations'),1);assert.equal(DB.count('consents'),1);assert.equal(DB.count('appointments'),0);assert.equal(DB.count('cases'),0);
    const retry=await post();assert.equal(retry.status,200);assert.equal((await retry.json()).reference,receipt.reference);assert.equal(DB.count('consultations'),1);
    const unauthorized=await publicWorker.fetch(new Request('https://public.test/api/admin/dashboard'),{DB,ADMIN_API_TOKEN:token});assert.equal(unauthorized.status,401);
    const dashboard=await crmWorker.fetch(new Request('https://crm.test/api/dashboard'),{BACKEND_URL:'https://public.test',ADMIN_API_TOKEN:token});assert.equal(dashboard.status,200);
    const data=await dashboard.json();assert.equal(data.consultations.length,1);assert.equal(data.consultations[0].reference,receipt.reference);assert.equal(data.consultations[0].address,'Calle de prueba 1');assert.equal(data.consultations[0].summary,'Resumen sintético');assert.equal(data.appointments.length,0);
  }finally{globalThis.fetch=originalFetch;DB.close()}
});

test('two preferred times coexist but only one can be confirmed for a professional',async()=>{
  const DB=createD1(), token='synthetic-test-token';
  try{
    const preferred=new Date(Date.now()+3*86400000).toISOString().slice(0,16);
    const submit=async n=>{
      const payload={request_id:`31b08149-d44d-491a-8e1d-082500fe5b5${n}`,name:`Persona ${n}`,phone:'3000000000',email:`qa${n}@example.invalid`,problem:'medicamento',entity:'eps',order:'si',action:'ninguna',consent:true,preferred_at:preferred};
      return publicWorker.fetch(new Request('https://public.test/api/consultations',{method:'POST',body:JSON.stringify(payload)}),{DB,ADMIN_API_TOKEN:token});
    };
    const requests=await Promise.all([submit(1),submit(2)]);
    assert.deepEqual(requests.map(r=>r.status),[201,201]);
    const dashboard=await publicWorker.fetch(new Request('https://public.test/api/admin/dashboard',{headers:{authorization:`Bearer ${token}`}}),{DB,ADMIN_API_TOKEN:token});
    const {appointments}=await dashboard.json();assert.equal(appointments.length,2);
    const slot=new Date(appointments[0].scheduled_at);const date=new Date(slot.getTime()-5*3600000).toISOString().slice(0,10);
    const availability=await publicWorker.fetch(new Request('https://public.test/api/admin/availability',{method:'PUT',headers:{authorization:`Bearer ${token}`},body:JSON.stringify({professional:'Daniel Vergel',date,start_at:new Date(slot.getTime()-3600000).toISOString(),end_at:new Date(slot.getTime()+3600000).toISOString()})}),{DB,ADMIN_API_TOKEN:token});assert.equal(availability.status,200,await availability.text());
    const confirm=id=>publicWorker.fetch(new Request(`https://public.test/api/admin/records/${id}`,{method:'PATCH',headers:{authorization:`Bearer ${token}`},body:JSON.stringify({type:'appointment',status:'confirmed'})}),{DB,ADMIN_API_TOKEN:token});
    const result=await Promise.all(appointments.map(a=>confirm(a.id)));
    assert.deepEqual(result.map(r=>r.status).sort(),[200,409]);
    assert.equal((await DB.prepare("SELECT count(*) n FROM appointments WHERE status='confirmed'").first()).n,1);
  }finally{DB.close()}
});

test('G3 availability guards transitions and reprogramming retains audit trail',async()=>{
 const DB=createD1(),token='synthetic-test-token',headers={authorization:`Bearer ${token}`};
 try{
  const date='2099-09-22',original='2099-09-22T15:00:00.000Z',next='2099-09-22T16:00:00.000Z';
  await DB.prepare('INSERT INTO clients (id,name,phone,email,created_at) VALUES (?,?,?,?,?)').bind('c','Test','3000000000','qa@example.invalid',original).run();
  await DB.prepare("INSERT INTO consultations (id,reference,request_id,client_id,problem,entity_type,has_order,prior_action,urgent,summary,status,priority,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind('q','SM-2099-000001','r','c','medicamento','eps','si','ninguna','no','','new','medium',original,original).run();
  await DB.prepare('INSERT INTO appointments (id,consultation_id,scheduled_at,timezone,status,professional,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)').bind('a','q',original,'America/Bogota','requested','Daniel Vergel',original,original).run();
  const patch=body=>publicWorker.fetch(new Request('https://public.test/api/admin/records/a',{method:'PATCH',headers,body:JSON.stringify({type:'appointment',...body})}),{DB,ADMIN_API_TOKEN:token});
  assert.equal((await patch({status:'confirmed'})).status,409);
  assert.equal((await patch({status:'attended'})).status,422);
  const put=await publicWorker.fetch(new Request('https://public.test/api/admin/availability',{method:'PUT',headers,body:JSON.stringify({professional:'Daniel Vergel',date,start_at:'2099-09-22T14:00:00.000Z',end_at:'2099-09-22T18:00:00.000Z'})}),{DB,ADMIN_API_TOKEN:token});assert.equal(put.status,200);
  const availability=await publicWorker.fetch(new Request(`https://public.test/api/admin/availability?professional=Daniel%20Vergel&date=${date}`,{headers}),{DB,ADMIN_API_TOKEN:token});assert.equal((await availability.json()).window.date,date);
  assert.equal((await patch({status:'confirmed'})).status,200);
  assert.equal((await patch({status:'rescheduled'})).status,422);
  assert.equal((await patch({status:'rescheduled',scheduled_at:next})).status,200);
  assert.equal((await patch({status:'confirmed'})).status,200);
  assert.equal((await patch({status:'cancelled'})).status,200);
  assert.equal((await patch({status:'confirmed'})).status,422);
  assert.equal((await DB.prepare('SELECT count(*) n FROM activities').first()).n,4);assert.equal((await DB.prepare('SELECT count(*) n FROM availability_events').first()).n,1);
 }finally{DB.close()}
});

test('G3 individual identities enforce server roles and own the audit trail',async()=>{
 const DB=createD1(),identities=JSON.stringify([{token:'reader-token',actor_id:'reader-01',roles:['reader']},{token:'lawyer-token',actor_id:'lawyer-07',roles:['lawyer']}]);
 try{
  const at='2099-09-22T15:00:00.000Z';
  await DB.prepare('INSERT INTO clients (id,name,phone,email,created_at) VALUES (?,?,?,?,?)').bind('ci','Test','3000000000','identity@example.invalid',at).run();
  await DB.prepare("INSERT INTO consultations (id,reference,request_id,client_id,problem,entity_type,has_order,prior_action,urgent,summary,status,priority,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind('qi','SM-2099-000002','ri','ci','medicamento','eps','si','ninguna','no','','new','medium',at,at).run();
  const patch=(token,actor)=>publicWorker.fetch(new Request('https://public.test/api/admin/records/qi',{method:'PATCH',headers:{authorization:`Bearer ${token}`,'x-crm-actor-id':actor},body:JSON.stringify({type:'consultation',status:'progress'})}),{DB,CRM_IDENTITIES:identities});
  assert.equal((await patch('reader-token','forged-admin')).status,403);
  assert.equal((await patch('lawyer-token','forged-admin')).status,200);
  const audit=await DB.prepare("SELECT actor FROM activities WHERE action='consultation_status_changed'").first();
  assert.equal(audit.actor,'lawyer-07');
  const dashboard=await publicWorker.fetch(new Request('https://public.test/api/admin/dashboard',{headers:{authorization:'Bearer reader-token'}}),{DB,CRM_IDENTITIES:identities});
  assert.equal(dashboard.status,200);assert.equal(dashboard.headers.get('x-auth-actor'),'reader-01');assert.equal(dashboard.headers.get('x-auth-mode'),'individual');
 }finally{DB.close()}
});

test('G3 reminders send once for a confirmed appointment due in 24 hours',async()=>{
 const DB=createD1(),originalFetch=globalThis.fetch,now=new Date('2099-09-21T15:00:00.000Z');let deliveries=0;
 globalThis.fetch=async (_url,init)=>{deliveries++;const body=JSON.parse(init.body);assert.equal(body.event,'appointment.reminder.24h');assert.equal(body.reference,'SM-2099-000003');return new Response(null,{status:204})};
 try{
  await DB.prepare('INSERT INTO clients (id,name,phone,email,created_at) VALUES (?,?,?,?,?)').bind('cr','Test','3000000000','reminder@example.invalid',now.toISOString()).run();
  await DB.prepare("INSERT INTO consultations (id,reference,request_id,client_id,problem,entity_type,has_order,prior_action,urgent,summary,status,priority,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind('qr','SM-2099-000003','rr','cr','medicamento','eps','si','ninguna','no','','new','medium',now.toISOString(),now.toISOString()).run();
  await DB.prepare('INSERT INTO appointments (id,consultation_id,scheduled_at,timezone,status,professional,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)').bind('ar','qr','2099-09-22T15:00:00.000Z','America/Bogota','confirmed','Daniel Vergel',now.toISOString(),now.toISOString()).run();
  const env={DB,REMINDER_WEBHOOK_URL:'https://reminders.test/events',REMINDER_WEBHOOK_TOKEN:'synthetic'};
  await publicWorker.scheduled({scheduledTime:now.getTime()},env);
  await publicWorker.scheduled({scheduledTime:now.getTime()},env);
  assert.equal(deliveries,1);assert.equal(DB.count('appointment_reminders'),1);
  assert.equal((await DB.prepare('SELECT status FROM appointment_reminders').first()).status,'sent');
 }finally{globalThis.fetch=originalFetch;DB.close()}
});

test('G3 protected HTTP trigger preserves Brevo and sends once on repeated dispatch',async()=>{
 const DB=createD1(),originalFetch=globalThis.fetch,now=new Date();let deliveries=0;
 globalThis.fetch=async (_url,init)=>{deliveries++;const body=JSON.parse(init.body);assert.equal(_url,'https://api.brevo.com/v3/smtp/email');assert.equal(body.to[0].email,'reminder@example.invalid');assert.match(body.htmlContent,/SM-2099-000003/);return new Response(null,{status:204})};
 try{
  await DB.prepare('INSERT INTO clients (id,name,phone,email,created_at) VALUES (?,?,?,?,?)').bind('cr','Test','3000000000','reminder@example.invalid',now.toISOString()).run();
  await DB.prepare("INSERT INTO consultations (id,reference,request_id,client_id,problem,entity_type,has_order,prior_action,urgent,summary,status,priority,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind('qr','SM-2099-000003','rr','cr','medicamento','eps','si','ninguna','no','','new','medium',now.toISOString(),now.toISOString()).run();
  await DB.prepare('INSERT INTO appointments (id,consultation_id,scheduled_at,timezone,status,professional,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)').bind('ar','qr',new Date(now.getTime()+86400000).toISOString(),'America/Bogota','confirmed','Daniel Vergel',now.toISOString(),now.toISOString()).run();
  const env={DB,BREVO_API_KEY:'synthetic',BREVO_FROM_EMAIL:'qa@example.invalid',REMINDER_TRIGGER_TOKEN:'synthetic-trigger'};
  assert.equal((await publicWorker.fetch(new Request('https://qa.test/api/internal/reminders/dispatch',{method:'POST',headers:{authorization:'Bearer synthetic-trigger'}}),env)).status,200);
  assert.equal((await publicWorker.fetch(new Request('https://qa.test/api/internal/reminders/dispatch',{method:'POST',headers:{authorization:'Bearer synthetic-trigger'}}),env)).status,200);
  assert.equal(deliveries,1);assert.equal(DB.count('appointment_reminders'),1);
  assert.equal((await DB.prepare('SELECT status FROM appointment_reminders').first()).status,'sent');
 }finally{globalThis.fetch=originalFetch;DB.close()}
});

test('G3 monitor protects access and reconciles provider receipt with repeated triggers',async()=>{
 const DB=createD1(),previous=globalThis.fetch,at=new Date(),slot=new Date(at.getTime()+86400000).toISOString();let deliveries=0;
 globalThis.fetch=async()=>{deliveries++;return Response.json({messageId:'synthetic-message-123'},{status:201})};
 try{
  await DB.prepare('INSERT INTO clients (id,name,phone,email,created_at) VALUES (?,?,?,?,?)').bind('cm','Monitor','3000000000','monitor@example.invalid',at.toISOString()).run();
  await DB.prepare('INSERT INTO consultations (id,reference,request_id,client_id,problem,entity_type,has_order,prior_action,urgent,summary,status,priority,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind('qm','SM-2026-009999','rm','cm','medicamento','eps','si','ninguna','no','','new','medium',at.toISOString(),at.toISOString()).run();
  await DB.prepare('INSERT INTO appointments (id,consultation_id,scheduled_at,timezone,status,professional,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)').bind('am','qm',slot,'America/Bogota','confirmed','Daniel Vergel',at.toISOString(),at.toISOString()).run();
  const env={DB,BREVO_API_KEY:'private-provider-key',BREVO_FROM_EMAIL:'qa@example.invalid',REMINDER_TRIGGER_TOKEN:'trigger',CRM_IDENTITIES:JSON.stringify([{token:'read',actor_id:'reader',roles:['reader']}])};
  const monitor=headers=>publicWorker.fetch(new Request('https://qa.test/api/admin/reminders',{headers}),env);
  assert.equal((await monitor({})).status,401);
  const before=await (await monitor({authorization:'Bearer read'})).json();assert.equal(before.eligible.length,1);assert.equal(before.stats.total,0);
  const trigger=()=>publicWorker.fetch(new Request('https://qa.test/api/internal/reminders/dispatch',{method:'POST',headers:{authorization:'Bearer trigger'}}),env);
  const first=await (await trigger()).json(),second=await (await trigger()).json();
  assert.equal(first.sent,1);assert.equal(second.sent,0);assert.equal(second.duplicates,1);assert.notEqual(first.run_id,second.run_id);assert.equal(deliveries,1);
  const response=await monitor({authorization:'Bearer read'});assert.equal(response.headers.get('cache-control'),'no-store');
  const content=await response.text();assert.doesNotMatch(content,/private-provider-key|monitor@example.invalid|3000000000/);
  const data=JSON.parse(content);assert.equal(data.stats.total,1);assert.equal(data.stats.sent,1);
  const receipt=data.audit.find(x=>x.outcome==='provider_accepted');assert.equal(receipt.provider_message_id,'synthetic-message-123');assert.equal(receipt.provider_status,201);assert.equal(receipt.run_id,first.run_id);assert.equal(data.audit.filter(x=>x.outcome==='duplicate_skipped').length,1);
 }finally{globalThis.fetch=previous;DB.close()}
});

test('G3 failed provider attempts are visible and never silently resent',async()=>{
 const DB=createD1(),previous=globalThis.fetch,at=new Date(),slot=new Date(at.getTime()+86400000).toISOString();let attempts=0;
 globalThis.fetch=async()=>{attempts++;return Response.json({error:'ignored-provider-body'},{status:503})};
 try{
  await DB.prepare('INSERT INTO clients (id,name,phone,email,created_at) VALUES (?,?,?,?,?)').bind('cf','Failure','3000000000','failure@example.invalid',at.toISOString()).run();
  await DB.prepare('INSERT INTO consultations (id,reference,request_id,client_id,problem,entity_type,has_order,prior_action,urgent,summary,status,priority,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind('qf','SM-2026-009998','rf','cf','medicamento','eps','si','ninguna','no','','new','medium',at.toISOString(),at.toISOString()).run();
  await DB.prepare('INSERT INTO appointments (id,consultation_id,scheduled_at,timezone,status,professional,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)').bind('af','qf',slot,'America/Bogota','confirmed','Daniel Vergel',at.toISOString(),at.toISOString()).run();
  const env={DB,REMINDER_WEBHOOK_URL:'https://provider.invalid',REMINDER_TRIGGER_TOKEN:'trigger'};
  const call=()=>publicWorker.fetch(new Request('https://qa.test/api/internal/reminders/dispatch',{method:'POST',headers:{authorization:'Bearer trigger'}}),env);
  const first=await (await call()).json();assert.equal(first.ok,false);assert.equal(first.failed,1);
  await call();assert.equal(attempts,1);
  const row=await DB.prepare('SELECT status,error_code FROM appointment_reminders').first();assert.equal(row.status,'failed');assert.equal(row.error_code,'provider_503');
 }finally{globalThis.fetch=previous;DB.close()}
});

test('G3 workflow persists reviewed evidence, enforces transitions and never invents canonical PASS',async()=>{
 const DB=createD1(),previous=globalThis.fetch,at=new Date(),slot=new Date(at.getTime()+86400000).toISOString();
 globalThis.fetch=async()=>Response.json({messageId:'message-flow-1'},{status:201});
 try{
  await DB.prepare('INSERT INTO clients (id,name,phone,email,created_at) VALUES (?,?,?,?,?)').bind('cg','Synthetic','3000000000','flow@example.invalid',at.toISOString()).run();
  await DB.prepare('INSERT INTO consultations (id,reference,request_id,client_id,problem,entity_type,has_order,prior_action,urgent,summary,status,priority,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind('qg','SM-2026-000987','rg','cg','medicamento','eps','si','ninguna','no','','new','medium',at.toISOString(),at.toISOString()).run();
  await DB.prepare('INSERT INTO appointments (id,consultation_id,scheduled_at,timezone,status,professional,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)').bind('ag','qg',slot,'America/Bogota','confirmed','Daniel Vergel',at.toISOString(),at.toISOString()).run();
  const env={DB,BREVO_API_KEY:'synthetic',BREVO_FROM_EMAIL:'qa@example.invalid',REMINDER_TRIGGER_TOKEN:'trigger',CRM_IDENTITIES:JSON.stringify([{token:'admin-flow',actor_id:'reviewer-1',roles:['admin']},{token:'reader-flow',actor_id:'reader-1',roles:['reader']}])};
  const get=()=>publicWorker.fetch(new Request('https://qa.test/api/admin/g3/verification?appointment_id=ag',{headers:{authorization:'Bearer admin-flow'}}),env);
  const save=(body,token='admin-flow')=>publicWorker.fetch(new Request('https://qa.test/api/admin/g3/verification?appointment_id=ag',{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify(body)}),env);
  const base={request_id:crypto.randomUUID(),revision:0,kind:'review',url:'https://evidence.example.invalid/review',reviewed:true};
  assert.equal((await save(base)).status,409);assert.equal((await save(base,'reader-flow')).status,403);
  assert.equal((await save({...base,kind:'recipient',authorized:true,url:'https://evidence.example.invalid/?token=secret'})).status,422);
  assert.equal((await save(null)).status,422);
  let state=await (await get()).json();assert.equal(state.status,'READY_FOR_VERIFICATION');assert.equal(state.history.length,0);
  const trigger=()=>publicWorker.fetch(new Request('https://qa.test/api/internal/reminders/dispatch',{method:'POST',headers:{authorization:'Bearer trigger'}}),env);
  const first=await (await trigger()).json(),second=await (await trigger()).json();
  const proofs=[{kind:'scheduler',first_run_id:first.run_id,second_run_id:second.run_id},{kind:'recipient',authorized:true},{kind:'delivery',message_id:'message-flow-1'},{kind:'visual',desktop:true,mobile:true,keyboard:true,errors:true,regression:true,backend_sha:'a'.repeat(40),crm_sha:'b'.repeat(40)},{kind:'documentation',backend_sha:'a'.repeat(40),crm_sha:'b'.repeat(40)}];
  assert.equal((await save({...base,kind:'delivery',message_id:'wrong-message'})).status,422);
  for(const proof of proofs){state=await (await get()).json();const body={...base,...proof,request_id:crypto.randomUUID(),revision:state.revision};const r=await save(body);assert.equal(r.status,201,await r.clone().text());const retry=await save(body);assert.equal(retry.status,200);assert.equal((await retry.json()).revision,state.revision+1);}
  state=await (await get()).json();assert.equal(state.ready_for_review,true);assert.equal(state.status,'READY_FOR_REVIEW');assert.equal(state.canonical_gate_changed,false);assert.equal(state.stages.every(s=>s.ok),true);
  assert.equal((await save({...base,revision:0,kind:'recipient',authorized:true})).status,409);
  const review=await save({...base,request_id:crypto.randomUUID(),revision:state.revision});assert.equal(review.status,201);state=await review.json();assert.equal(state.status,'REVIEW_RECORDED');assert.equal(state.canonical_gate_changed,false);assert.equal(state.review.actor,'reviewer-1');assert.equal(state.history.length,6);
  const changed=await save({...base,kind:'documentation',backend_sha:'c'.repeat(40),crm_sha:'b'.repeat(40),request_id:crypto.randomUUID(),revision:state.revision});assert.equal(changed.status,201);state=await changed.json();assert.equal(state.ready_for_review,false);assert.equal(state.review,null);
 }finally{globalThis.fetch=previous;DB.close()}
});
