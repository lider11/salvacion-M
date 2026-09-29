// Workflow evidence is append-only. External documents are human-reviewed,
// not fetched by this service and never treated as automated provider evidence.
const G3_TYPES=['scheduler','recipient','delivery','visual','documentation','review'];
function g3Url(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.search&&!u.hash&&u.href.length<=600?u.href:null}catch{return null}}
function g3Proof(body){
 if(!body||typeof body!=='object'||Array.isArray(body))return null;
 if(!G3_TYPES.includes(body.kind)||body.reviewed!==true||!g3Url(body.url))return null;
 const p={kind:body.kind,url:g3Url(body.url),reviewed:true};
 if(body.kind==='scheduler'){
  if(!/^[a-z0-9-]{1,80}$/i.test(body.first_run_id||'')||!/^[a-z0-9-]{1,80}$/i.test(body.second_run_id||'')||body.first_run_id===body.second_run_id)return null;
  p.first_run_id=body.first_run_id;p.second_run_id=body.second_run_id;
 }
 if(body.kind==='delivery'){if(typeof body.message_id!=='string'||!body.message_id.trim()||body.message_id.length>200)return null;p.message_id=body.message_id.trim();}
 if(body.kind==='recipient'&&body.authorized!==true)return null;
 if(body.kind==='recipient')p.authorized=true;
 if(body.kind==='visual'){if(!['desktop','mobile','keyboard','errors','regression'].every(k=>body[k]===true))return null;for(const k of ['desktop','mobile','keyboard','errors','regression'])p[k]=true;}
 if(['visual','documentation'].includes(body.kind)){
  if(!/^[a-f0-9]{40}$/.test(body.backend_sha||'')||!/^[a-f0-9]{40}$/.test(body.crm_sha||''))return null;
  p.backend_sha=body.backend_sha;p.crm_sha=body.crm_sha;
 }
 return p;
}
async function g3Read(env,appointmentId,user){
 const appointment=await env.DB.prepare('SELECT a.id,a.consultation_id,a.status,a.scheduled_at,c.reference FROM appointments a JOIN consultations c ON c.id=a.consultation_id WHERE a.id=?').bind(appointmentId).first();
 if(!appointment)return null;
 const [reminders,events,proofs]=await env.DB.batch([
  env.DB.prepare("SELECT id,status,scheduled_for,sent_at,error_code FROM appointment_reminders WHERE appointment_id=? AND reminder_type='24h'").bind(appointmentId),
  env.DB.prepare("SELECT id,new_value,created_at FROM activities WHERE consultation_id=? AND action='reminder_dispatch' ORDER BY created_at,id").bind(appointment.consultation_id),
  env.DB.prepare("SELECT id,actor,new_value,created_at FROM activities WHERE consultation_id=? AND action='g3_verification' ORDER BY rowid").bind(appointment.consultation_id)
 ]);
 const parse=row=>{try{return {...JSON.parse(row.new_value),id:row.id,actor:row.actor,created_at:row.created_at}}catch{return null}};
 const audit=events.results.map(parse).filter(x=>x?.appointment_id===appointmentId);
 const history=proofs.results.map(parse).filter(x=>x?.appointment_id===appointmentId);
 const latest=Object.fromEntries(history.filter(x=>x.kind!=='review').map(x=>[x.kind,x]));
 const accepted=audit.filter(x=>x.outcome==='provider_accepted');
 const first=accepted[0],duplicate=audit.find(x=>x.outcome==='duplicate_skipped'&&first&&x.run_id!==first.run_id&&x.created_at>=first.created_at);
 const record=reminders.results[0];
 const hours=first?(Date.parse(record?.scheduled_for)-Date.parse(first.created_at))/3600000:NaN;
 const inWindow=appointment.status==='confirmed'&&((Date.parse(appointment.scheduled_at)-Date.now())/3600000>=23)&&((Date.parse(appointment.scheduled_at)-Date.now())/3600000<25);
 const historicalWindow=hours>=23&&hours<25&&record?.scheduled_for===appointment.scheduled_at;
 const stages=[
  {id:'scheduler',title:'Acceso del scheduler',ok:!!(latest.scheduler&&first&&duplicate&&latest.scheduler.first_run_id===first.run_id&&latest.scheduler.second_run_id===duplicate.run_id),source:'D1 + revisión documental',instruction:'Ejecuta el workflow autorizado desde GitHub. Si recibes 401, identifica si falla Sites o el endpoint. Registra la evidencia y los dos run_id cuando existan.'},
  {id:'recipient',title:'Cita y destinatario autorizado',ok:!!latest.recipient&&(inWindow||historicalWindow),source:'D1 + revisión documental',instruction:'Selecciona una cita sintética confirmada y documenta la autorización del destinatario. Antes del disparo debe estar entre 23 y 25 horas.'},
  {id:'first',title:'Primer disparo real',ok:!!first&&record?.status==='sent'&&historicalWindow,source:'D1',instruction:'Ejecuta el primer disparo desde el scheduler. Debe producir un recibo del proveedor y persistir su estado en D1.'},
  {id:'second',title:'Repetición sin duplicados',ok:!!duplicate&&accepted.length===1&&reminders.results.length===1&&record?.status==='sent',source:'D1',instruction:'Repite el workflow para la misma cita. Debe haber otro run_id, un duplicado evitado y un único envío aceptado.'},
  {id:'delivery',title:'Entrega al destinatario',ok:!!(latest.delivery&&first?.provider_message_id&&latest.delivery.message_id===first.provider_message_id),source:'Revisión documental',instruction:'Consulta la entrega en el proveedor. Registra el mismo ID del mensaje y la evidencia de entrega; HTTP 201 no es entrega.'},
  {id:'visual',title:'Interfaz y regresión',ok:!!latest.visual,source:'Revisión documental',instruction:'Prueba escritorio, móvil, teclado, errores y regresión en las versiones finales. Adjunta el informe y ambos SHA.'},
  {id:'documentation',title:'Reconciliación y memoria',ok:!!(latest.documentation&&latest.visual&&latest.documentation.backend_sha===latest.visual.backend_sha&&latest.documentation.crm_sha===latest.visual.crm_sha),source:'Revisión documental',instruction:'Actualiza memoria y PR #5 con los SHA, versiones, deployments, ejecuciones y recibo. Los SHA deben coincidir con la revisión visual.'}
 ];
 const ready=stages.every(x=>x.ok),review=history.at(-1)?.kind==='review'?history.at(-1):null;
 return {appointment,revision:proofs.results.length,can_write:!!user&&!user.legacy&&user.roles.includes('admin'),stages,ready_for_review:ready,review:ready?review:null,status:ready?(review?'REVIEW_RECORDED':'READY_FOR_REVIEW'):'READY_FOR_VERIFICATION',canonical_gate_changed:false,history,observed:{first_run_id:first?.run_id||null,second_run_id:duplicate?.run_id||null,provider_message_id:first?.provider_message_id||null,accepted_count:accepted.length,record_count:reminders.results.length,in_window:inWindow},generated_at:iso()};
}
async function g3Route(request,env,user){
 if(!can(user,'read'))return json({error:'No autorizado.'},401);
 const url=new URL(request.url),appointmentId=url.searchParams.get('appointment_id')||'';
 if(!/^[a-z0-9-]{1,80}$/i.test(appointmentId))return json({error:'Selecciona una cita válida.'},422);
 if(!['GET','POST'].includes(request.method))return json({error:'Método no permitido.'},405,{'allow':'GET, POST'});
 if(request.method==='POST'&&(user.legacy||!user.roles.includes('admin')))return json({error:'Solo un administrador identificado puede registrar evidencia.'},403);
 const state=await g3Read(env,appointmentId,user);if(!state)return json({error:'Cita no encontrada.'},404);
 if(request.method==='GET')return json(state);
 if(!(request.headers.get('content-type')||'').startsWith('application/json'))return json({error:'Se requiere JSON.'},415);
 const raw=await request.text();if(new TextEncoder().encode(raw).length>6000)return json({error:'Evidencia demasiado extensa.'},413);
 let body;try{body=JSON.parse(raw)}catch{return json({error:'JSON inválido.'},400)}
 const proof=g3Proof(body);
 if(!proof||!Number.isSafeInteger(body.revision)||body.revision<0||!/^[a-f0-9-]{36}$/i.test(body.request_id||''))return json({error:'Completa una evidencia HTTPS sin parámetros, revisión expresa y campos válidos.'},422);
 const id='g3-'+body.request_id,payload=JSON.stringify({appointment_id:appointmentId,...proof});
 const prior=await env.DB.prepare('SELECT actor,new_value FROM activities WHERE id=?').bind(id).first();
 if(prior)return prior.actor===user.actor_id&&prior.new_value===payload?json(state):json({error:'Identificador de solicitud en conflicto.'},409);
 if(body.revision!==state.revision)return json({error:'El expediente cambió. Actualiza antes de guardar.'},409);
 if(proof.kind==='review'&&!state.ready_for_review)return json({error:'No se puede registrar el cierre: hay criterios sin evidencia suficiente.'},409);
 if(proof.kind==='scheduler'&&(proof.first_run_id!==state.observed.first_run_id||proof.second_run_id!==state.observed.second_run_id))return json({error:'Los run_id no coinciden con los disparos observados en D1.'},422);
 if(proof.kind==='delivery'&&proof.message_id!==state.observed.provider_message_id)return json({error:'El mensaje no coincide con el recibo del proveedor.'},422);
 const result=await env.DB.prepare("INSERT OR IGNORE INTO activities (id,consultation_id,actor,action,new_value,created_at) SELECT ?,?,?,'g3_verification',?,? WHERE (SELECT count(*) FROM activities WHERE consultation_id=? AND action='g3_verification')=?").bind(id,state.appointment.consultation_id,user.actor_id,payload,iso(),state.appointment.consultation_id,body.revision).run();
 if(Number(result?.meta?.changes??result?.changes)!==1)return json({error:'Hubo un cambio concurrente. Actualiza y revisa la evidencia.'},409);
 return json(await g3Read(env,appointmentId,user),201);
}
