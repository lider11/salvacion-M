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
