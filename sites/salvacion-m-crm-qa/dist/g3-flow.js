(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  let state=null,selected='scheduler',busy=false,readController=null,requestNumber=0,pending=null;
  const labels={READY_FOR_VERIFICATION:'Verificación pendiente',READY_FOR_REVIEW:'Expediente listo para revisión',REVIEW_RECORDED:'Revisión de cierre registrada'};
  const n=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e};
  const date=value=>new Intl.DateTimeFormat('es-CO',{timeZone:'America/Bogota',dateStyle:'medium',timeStyle:'short'}).format(new Date(value));
  async function api(path,options={}){
    const response=await fetch(path,{credentials:'same-origin',cache:'no-store',...options});
    if(!(response.headers.get('content-type')||'').includes('application/json'))throw new Error('No se pudo verificar la sesión privada. Vuelve a iniciar sesión.');
    const result=await response.json();if(!response.ok)throw new Error(result.error||'Operación no disponible.');return result;
  }
  function message(text,error=false){$('flowNotice').textContent=text;$('flowNotice').className=error?'error':'';}
  function link(url,text){const a=n('a',text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
  function field(name,label,{type='text',value='',required=true,maxLength=600}={}){
    const l=n('label',label),i=document.createElement('input');i.name=name;i.type=type;i.required=required;i.value=value;i.maxLength=maxLength;i.autocomplete='off';l.append(i);return l;
  }
  function check(name,label){const l=n('label',undefined,'flow-check'),i=document.createElement('input');i.type='checkbox';i.name=name;i.required=true;l.append(i,n('span',label));return l;}
  function render(){
    const root=$('flowSteps');root.replaceChildren();
    const stages=[...state.stages,{id:'review',title:'Revisión de cierre',ok:!!state.review,source:'Revisión administrativa',instruction:'Revisa el expediente completo y registra el documento de decisión. El cambio canónico a PASS se realiza en la memoria y el PR con esa evidencia; esta interfaz no modifica GitHub.'}];
    const completed=state.stages.filter(x=>x.ok).length;$('flowProgress').value=completed;$('flowProgressText').textContent=`${completed} de 7 criterios con soporte`;
    $('flowStatus').textContent=labels[state.status]||'Verificación pendiente';
    stages.forEach((step,index)=>{
      const li=n('li',undefined,'flow-node '+(step.ok?'is-complete':'is-pending'));
      const b=n('button');b.type='button';b.setAttribute('aria-current',selected===step.id?'step':'false');b.append(n('span',String(index+1),'flow-number'),n('strong',step.title),n('span',step.ok?'Con soporte':'Pendiente','flow-state'));b.addEventListener('click',()=>{selected=step.id;render();$('flowDetailTitle').focus()});li.append(b);root.append(li);
    });
    const stage=stages.find(x=>x.id===selected)||stages[0];selected=stage.id;
    $('flowDetailTitle').textContent=stage.title;$('flowInstruction').textContent=stage.instruction;$('flowSource').textContent='Origen del soporte: '+stage.source;
    $('flowBranch').textContent=stage.ok?'Sí: soporte registrado. Continúa con el siguiente criterio.':'No: completa la evidencia o resuelve la incidencia antes del cierre.';
    const form=$('flowEvidence');form.replaceChildren();
    const automatic=['first','second'].includes(stage.id);
    if(automatic){form.append(n('p','Este criterio se obtiene de D1. No se puede marcar como cumplido manualmente.'));const dl=n('dl');for(const [k,v] of Object.entries(state.observed)){dl.append(n('dt',k),n('dd',String(v??'Sin registro')))}form.append(dl);}
    else if(!state.can_write)form.append(n('p','Acceso de consulta. Solo un administrador identificado puede registrar evidencia.'));
    else if(stage.id==='review'&&!state.ready_for_review)form.append(n('p','Cierre bloqueado: completa los siete criterios. No se puede omitir esta validación.','error'));
    else{
      const prior=[...state.history].reverse().find(x=>x.kind===stage.id);
      form.append(field('url','Enlace HTTPS al soporte revisado',{type:'url',value:prior?.url||''}));
      form.append(n('p','Usa un enlace estable sin parámetros ni fragmentos. No incluyas secretos, datos clínicos o enlaces de acceso temporal.','meta'));
      if(stage.id==='scheduler'){
        form.append(field('first_run_id','run_id del primer disparo',{value:state.observed.first_run_id||'',maxLength:80}),field('second_run_id','run_id del segundo disparo',{value:state.observed.second_run_id||'',maxLength:80}));
      }
      if(stage.id==='recipient')form.append(check('authorized','Confirmo que la cita es sintética y el destinatario autorizó el envío.'));
      if(stage.id==='delivery')form.append(field('message_id','ID del mensaje entregado',{value:state.observed.provider_message_id||'',maxLength:200}));
      if(['visual','documentation'].includes(stage.id)){
        form.append(field('backend_sha','SHA completo del backend QA',{value:prior?.backend_sha||'',maxLength:40}),field('crm_sha','SHA completo del CRM QA',{value:prior?.crm_sha||'',maxLength:40}));
      }
      if(stage.id==='visual')for(const [key,label] of [['desktop','Escritorio y zoom revisados'],['mobile','Móvil sin recortes ni desplazamiento horizontal'],['keyboard','Teclado, foco y etiquetas revisados'],['errors','Carga, errores y estados vacíos revisados'],['regression','Regresión funcional aprobada']])form.append(check(key,label));
      form.append(check('reviewed',stage.id==='review'?'He revisado la evidencia completa y el documento de decisión.':'He revisado el soporte enlazado y corresponde a esta cita y este criterio.'));
      const b=n('button',stage.id==='review'?'Registrar revisión de cierre':'Guardar evidencia','flow-primary');b.type='submit';b.disabled=busy;form.append(b);
    }
    const history=$('flowHistory');history.replaceChildren();
    if(!state.history.length)history.append(n('p','Todavía no hay evidencias documentales guardadas.'));
    else [...state.history].reverse().forEach(item=>{const row=n('li');row.append(n('strong',(stages.find(x=>x.id===item.kind)?.title||item.kind)+' · '),n('span',date(item.created_at)+' · '+item.actor+' · '),link(item.url,'Abrir soporte'));history.append(row)});
    $('flowExport').disabled=false;
  }
  async function load(){
    const id=$('flowAppointment').value;if(!id){requestNumber++;readController?.abort();state=null;$('flowBody').hidden=true;$('flowExport').disabled=true;message('Selecciona una cita para comenzar.');return;}
    const sequence=++requestNumber;readController?.abort();readController=new AbortController();const controller=readController;
    const timer=setTimeout(()=>controller.abort(),20000);$('flowBody').hidden=true;$('flowView').setAttribute('aria-busy','true');message('Consultando evidencia persistida…');
    try{const result=await api('/api/g3/verification?appointment_id='+encodeURIComponent(id),{signal:controller.signal});if(sequence!==requestNumber)return;state=result;pending=null;render();$('flowBody').hidden=false;message('Expediente actualizado. Los enlaces son declaraciones de revisión del administrador.');}
    catch(e){if(sequence!==requestNumber)return;state=null;$('flowExport').disabled=true;message(e.name==='AbortError'?'Consulta cancelada o tiempo de espera agotado. Puedes actualizar.':e.message,true);}
    finally{clearTimeout(timer);if(sequence===requestNumber)$('flowView').setAttribute('aria-busy','false');}
  }
  window.loadG3Flow=async()=>{
    if($('flowAppointment').options.length>1){await load();return}
    message('Cargando citas de QA…');
    try{const data=await api('/api/dashboard',{signal:AbortSignal.timeout(20000)});const select=$('flowAppointment');
      for(const item of data.appointments){const option=n('option',item.reference+' · '+date(item.scheduled_at)+' · '+item.status);option.value=item.id;select.append(option)}
      message(data.appointments.length?'Selecciona la cita sintética que vas a verificar.':'No hay citas disponibles. Prepara la cita desde Agenda.');
    }catch(e){message(e.name==='TimeoutError'?'El servidor no respondió. Actualiza para reintentar.':e.message,true)}
  };
  $('flowEvidence').addEventListener('submit',async event=>{
    event.preventDefault();if(busy||!state)return;const form=event.currentTarget;if(!form.reportValidity())return;
    const body={kind:selected,revision:state.revision};for(const input of form.querySelectorAll('input'))body[input.name]=input.type==='checkbox'?input.checked:input.value.trim();
    const signature=JSON.stringify({appointment:state.appointment.id,...body});if(!pending||pending.signature!==signature)pending={signature,request_id:crypto.randomUUID()};body.request_id=pending.request_id;
    busy=true;$('flowAppointment').disabled=true;$('flowRefresh').disabled=true;form.querySelector('button[type="submit"]').disabled=true;message('Guardando evidencia…');
    try{state=await api('/api/g3/verification?appointment_id='+encodeURIComponent(state.appointment.id),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});pending=null;render();message('Evidencia guardada en el servidor con identidad y fecha.');}
    catch(e){message(e.name==='TimeoutError'?'No se confirmó la respuesta. Reintenta sin cambiar el formulario para conservar la misma solicitud.':e.message,true);}
    finally{busy=false;$('flowAppointment').disabled=false;$('flowRefresh').disabled=false;const button=form.querySelector('button[type="submit"]');if(button)button.disabled=false;}
  });
  $('flowAppointment').addEventListener('change',()=>{selected='scheduler';load()});
  $('flowRefresh').addEventListener('click',()=>window.loadG3Flow());
  $('flowAgenda').addEventListener('click',()=>document.querySelector('[data-view="appointments"]').click());
  $('flowExport').addEventListener('click',()=>{
    if(!state)return;const blob=new Blob([JSON.stringify({format:'salvacion-m-g3-evidence-v1',...state},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=n('a');a.href=url;a.download='G3-'+state.appointment.reference+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
})();
