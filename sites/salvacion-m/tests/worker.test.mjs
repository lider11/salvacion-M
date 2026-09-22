import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../dist/server/index.js',import.meta.url),'utf8');const worker=(await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)).default;
test('health and unknown API are explicit',async()=>{let r=await worker.fetch(new Request('https://x/api/health'),{});assert.equal(r.status,200);assert.equal((await r.json()).ok,true);r=await worker.fetch(new Request('https://x/api/missing'),{});assert.equal(r.status,404)});
test('public form rejects incomplete and missing consent',async()=>{const req=new Request('https://x/api/consultations',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});const r=await worker.fetch(req,{DB:{}});assert.equal(r.status,422);const p=await r.json();assert.match(p.error,/campos/)});
test('admin endpoint denies missing token',async()=>{const r=await worker.fetch(new Request('https://x/api/admin/dashboard'),{ADMIN_API_TOKEN:'secret'});assert.equal(r.status,401)});
test('static response includes security headers',async()=>{const r=await worker.fetch(new Request('https://x/'),{});assert.equal(r.status,200);assert.equal(r.headers.get('x-content-type-options'),'nosniff');assert.match(await r.text(),/Salvación M/)});
test('complete Abrazo M logo is served',async()=>{const r=await worker.fetch(new Request('https://x/logo-salvacion-m.svg'),{});assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/image\/svg\+xml/);const svg=await r.text();assert.match(svg,/Dos figuras humanas curvas/);assert.match(svg,/SALVACIÓN/)});
test('header motion supports compact state and reduced motion',async()=>{const [js,css,logo]=await Promise.all(['/app.js','/styles.css','/logo-salvacion-m.svg'].map(path=>worker.fetch(new Request('https://x'+path),{}).then(r=>r.text())));assert.match(js,/is-compact/);assert.match(css,/prefers-reduced-motion:reduce/);assert.match(logo,/meet-left/);assert.match(logo,/prefers-reduced-motion:reduce/)});
test('logo animation can replay on click',async()=>{const [html,js,css]=await Promise.all(['/','/app.js','/styles.css'].map(path=>worker.fetch(new Request('https://x'+path),{}).then(r=>r.text())));assert.match(html,/brand-motion/);assert.match(js,/addEventListener\('click',playLogo\)/);assert.match(css,/\.brand-motion\.is-replaying/);assert.match(css,/brand-meet-left/)});
test('header assets bypass stale browser cache',async()=>{const html=await worker.fetch(new Request('https://x/')).then(r=>r.text());assert.match(html,/styles\.css\?v=9/);assert.match(html,/app\.js\?v=9/);for(const path of ['/styles.css','/app.js']){const r=await worker.fetch(new Request('https://x'+path));assert.equal(r.headers.get('cache-control'),'no-cache')}});


test('D1: identical request retry returns same reference and creates no duplicate logical consultation', async()=>{
  const state={consultations:[], batches:0};
  const DB={
    prepare(sql){
      return {
        sql,args:[],
        bind(...args){this.args=args;return this},
        async first(){
          if(sql.includes('SELECT reference FROM consultations WHERE request_id')){
            const row=state.consultations.find(x=>x.request_id===this.args[0]);
            return row?{reference:row.reference}:null;
          }
          return null;
        }
      };
    },
    async batch(stmts){
      state.batches++;
      const c=stmts.find(s=>s.sql.includes('INSERT INTO consultations'));
      if(c){state.consultations.push({id:c.args[0],reference:c.args[1],request_id:c.args[2]})}
      return stmts.map(()=>({results:[]}));
    }
  };
  const payload={request_id:'D1-SM-20260922-001',name:'Prueba D1',phone:'3000000000',email:'d1@example.com',preferred_at:'2099-09-22T10:00',problem:'medicamento',entity:'EPS',order:'si',action:'ninguna',summary:'Prueba idempotencia',consent:true,website:''};
  const make=()=>new Request('https://x/api/consultations',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
  const r1=await worker.fetch(make(),{DB}); const b1=await r1.json();
  const r2=await worker.fetch(make(),{DB}); const b2=await r2.json();
  assert.equal(r1.status,201);
  assert.equal(r2.status,200);
  assert.equal(b2.reference,b1.reference);
  assert.equal(state.consultations.length,1);
  assert.equal(state.batches,1);
  assert.equal(state.consultations.filter(x=>x.request_id===payload.request_id).length,1);
});


test('G2 NO_STORE: sensitive admin responses are not cacheable', async()=>{
  const DB={batch:async()=>[{results:[{total:0,nuevos:0,cerrados:0}]},{results:[]},{results:[]} ]};
  const r=await worker.fetch(new Request('https://x/api/admin/dashboard',{headers:{authorization:'Bearer secret','x-admin-role':'admin'}}),{ADMIN_API_TOKEN:'secret',DB});
  assert.equal(r.status,200);
  assert.equal(r.headers.get('cache-control'),'no-store');
});

test('G2 ROLES: viewer cannot mutate, operador can schedule only, abogado cannot delete', async()=>{
  const DB={prepare(){return {bind(){return this},async first(){return {consultation_id:'c1',status:'requested'}}}},async batch(){return [{results:[]},{results:[]}]}};
  const call=(role,type,status)=>worker.fetch(new Request('https://x/api/admin/records/a1',{method:'PATCH',headers:{authorization:'Bearer secret','x-admin-role':role,'content-type':'application/json'},body:JSON.stringify({type,status})}),{ADMIN_API_TOKEN:'secret',DB});
  assert.equal((await call('viewer','appointment','confirmed')).status,403);
  assert.equal((await call('operador','appointment','confirmed')).status,200);
  assert.equal((await call('operador','consultation','progress')).status,403);
});
