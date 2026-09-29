(() => {
  const el = id => document.getElementById(id);
  const labels = {sent:'Aceptado por proveedor',pending:'Pendiente de verificación',failed:'Error de envío',started:'Disparo iniciado',provider_accepted:'Aceptado por proveedor',duplicate_skipped:'Duplicado evitado'};
  let snapshot = null, loading = false;
  const when = value => value && Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat('es-CO',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Bogota'}).format(new Date(value)) : 'Sin registro';
  function node(tag, text, className) { const n=document.createElement(tag); n.textContent=text; if(className)n.className=className; return n; }
  function card(title,status,details) {
    const article=node('article','','reminder-card');
    article.append(node('strong',title),node('span',labels[status]||status||'Sin registro','reminder-status status-'+(Object.hasOwn(labels,status)?status:'unknown')));
    const dl=document.createElement('dl');
    for(const [key,value] of details){dl.append(node('dt',key),node('dd',value??'Sin registro'));} article.append(dl); return article;
  }
  function list(id,items,empty,render){const host=el(id);host.replaceChildren(); if(!items.length)host.append(node('p',empty,'empty'));else items.forEach(item=>host.append(render(item)));}
  function render(){
    if(!snapshot)return;
    const d=snapshot;
    for(const [id,key] of [['reminderTotal','total'],['reminderSent','sent'],['reminderPending','pending'],['reminderFailed','failed']])el(id).textContent=d.stats[key]||0;
    el('reminderWindow').textContent=when(d.window.from)+' — '+when(d.window.to)+' (fin no incluido)';
    list('reminderEligible',d.eligible,'No hay citas confirmadas en la ventana actual.',x=>card(x.reference,x.reminder_status||'Sin recordatorio registrado',[['Cita',when(x.scheduled_at)]]));
    const filter=el('reminderFilter').value;
    list('reminderRows',d.reminders.filter(x=>!filter||x.status===filter),'No hay recordatorios para este filtro.',x=>card(x.reference,x.status,[['Cita',when(x.scheduled_for)],['Intento',when(x.attempted_at)],['Aceptación',when(x.sent_at)],['Error',x.error_code||'Ninguno registrado']]));
    list('reminderAudit',d.audit,'Todavía no hay eventos de recordatorios registrados.',x=>card(x.reference,x.outcome,[['Fecha',when(x.created_at)],['Ejecución',x.run_id],['Proveedor',x.provider||'No aplica'],['Estado HTTP',x.provider_status??'No aplica'],['ID del mensaje',x.provider_message_id||'No registrado'],['Error',x.error_code||'Ninguno registrado']]));
  }
  window.loadReminders=async()=>{
    if(loading)return;loading=true;el('refreshReminders').disabled=true;el('remindersView').setAttribute('aria-busy','true');
    el('reminderNotice').className='';el('reminderNotice').textContent='Consultando recordatorios…';el('reminderContent').hidden=true;
    try{
      const response=await fetch('/api/reminders',{credentials:'same-origin',cache:'no-store'});
      if(!(response.headers.get('content-type')||'').includes('application/json'))throw new Error('No fue posible verificar el acceso privado. Vuelve a iniciar sesión.');
      const d=await response.json();if(!response.ok)throw new Error(d.error||'No fue posible consultar los recordatorios.');
      if(!d.stats||!d.window||!Array.isArray(d.reminders)||!Array.isArray(d.eligible)||!Array.isArray(d.audit))throw new Error('La respuesta de recordatorios está incompleta.');
      snapshot=d;render();el('reminderContent').hidden=false;
      el('reminderNotice').textContent='Actualizado: '+when(d.generated_at)+(d.provider_configured?'':' · Proveedor de envío no configurado.');
      if(!d.provider_configured)el('reminderNotice').className='error';
    }catch(error){snapshot=null;el('reminderNotice').className='error';el('reminderNotice').textContent=error.message;}
    finally{loading=false;el('refreshReminders').disabled=false;el('remindersView').setAttribute('aria-busy','false');}
  };
  el('refreshReminders').addEventListener('click',window.loadReminders);
  el('reminderFilter').addEventListener('change',render);
})();
