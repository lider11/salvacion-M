const fs=require('fs'), http=require('http'), cp=require('child_process');
const {chromium}=require('playwright'); const {HtmlValidate}=require('html-validate'); const cssTree=require('css-tree');
(async()=>{
 const out='output/playwright'; const result={date:'2026-11-08',widths:[],errors:[],regressions:[],links:[],contrast:[]};
 const html=fs.readFileSync('index.html','utf8'), css=fs.readFileSync('css/style.css','utf8');
 const oldHtml=cp.execFileSync('git',['show','HEAD:index.html'],{encoding:'utf8'}),oldCss=cp.execFileSync('git',['show','HEAD:css/style.css'],{encoding:'utf8'});
 const validator=new HtmlValidate({extends:['html-validate:recommended'],rules:{'void-style':'off','no-trailing-whitespace':'off'}});
 const validation=await validator.validateString(html); const baseline=await validator.validateString(oldHtml);
 result.html={valid:validation.valid,messages:validation.results.flatMap(r=>r.messages),baselineMessages:baseline.results.flatMap(r=>r.messages)};
 let cssErrors=[];cssTree.parse(css,{onParseError:e=>cssErrors.push(e.message)}); result.css={parseErrors:cssErrors};
 const sectionRE=/<section id="servicios"[\s\S]*?(?=        <!-- NOSOTROS -->)/;
 result.outsideHtmlUnchanged=html.replace(sectionRE,'').replace(/\r\n/g,'\n')===oldHtml.replace(sectionRE,'').replace(/\r\n/g,'\n');
 const server=http.createServer((req,res)=>{let url=decodeURIComponent(req.url.split('?')[0]);let base=url.startsWith('/baseline/');if(base)url=url.slice(9); if(url==='/'||url==='')url='/index.html';let body;if(url==='/index.html')body=base?oldHtml:html;else if(url==='/css/style.css')body=base?oldCss:css;else {try{body=fs.readFileSync('.'+url)}catch{res.statusCode=404;res.end();return}}res.setHeader('Content-Type',url.endsWith('.css')?'text/css':url.endsWith('.js')?'application/javascript':url.endsWith('.svg')?'image/svg+xml':url.endsWith('.png')?'image/png':'text/html; charset=utf-8');res.end(body)});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try {
 browser=await chromium.launch({headless:true});const page=await browser.newPage({reducedMotion:'reduce'});page.on('pageerror',e=>result.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')result.errors.push(m.text())});const root=`http://127.0.0.1:${server.address().port}`;
 for(const width of [375,768,1024,1440,320]){
 await page.setViewportSize({width,height:1000});await page.goto(root);await page.evaluate(()=>document.fonts.ready);
 const metrics=await page.evaluate(()=>{const section=document.querySelector('#servicios'),cards=[...section.querySelectorAll('.servicio')].map(e=>{let r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}});return {overflow:document.documentElement.scrollWidth>innerWidth,cards,ctaHeight:section.querySelector('.servicios-cta').getBoundingClientRect().height}});
 result.widths.push({width,...metrics});if([375,1440].includes(width))await page.locator('#servicios').screenshot({path:`${out}/servicios-${width}.png`});
 for(const selector of ['.site-header','#inicio','#nosotros','#proceso','#contacto','.site-footer']){
 const styleSnapshot=els=>els.flatMap(e=>[e,...e.querySelectorAll('*')]).map(e=>{const s=getComputedStyle(e);return [...s].map(k=>[k,s.getPropertyValue(k)])}); const after=await page.locator(selector).evaluateAll(styleSnapshot);await page.goto(root+'/baseline/');const before=await page.locator(selector).evaluateAll(styleSnapshot);result.regressions.push({width,selector,computedStylesIdentical:JSON.stringify(before)===JSON.stringify(after)});await page.goto(root);
 }
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto(root);await page.locator('#servicios').scrollIntoViewIfNeeded();await page.addScriptTag({path:require.resolve('axe-core')});result.axe=await page.evaluate(async()=>{const r=await axe.run('#servicios',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return {violations:r.violations,incomplete:r.incomplete.map(x=>({id:x.id,impact:x.impact})),passes:r.passes.map(x=>x.id)}});
 await page.locator('.hero .btn-primary').focus();result.keyboard=[];for(let i=0;i<4;i++){await page.keyboard.press('Tab');result.keyboard.push(await page.evaluate(()=>{const e=document.activeElement,c=getComputedStyle(e);return {text:e.getAttribute('aria-label')||e.textContent.trim(),inServices:!!e.closest('#servicios'),outline:c.outlineStyle,outlineWidth:c.outlineWidth}}));}await page.keyboard.press('Enter');result.keyboardDestination=await page.evaluate(()=>({hash:location.hash,contactVisible:document.querySelector('#contacto').getBoundingClientRect().top>=0}));
 for(const a of await page.locator('#servicios a').all()){await a.click();result.links.push(await page.evaluate(()=>location.hash==='#contacto'));}
 result.localLinks=await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].every(a=>!!document.querySelector(a.getAttribute('href'))));
 result.reducedMotion=await page.locator('.servicios-cta').evaluate(e=>getComputedStyle(e).transitionDuration);
 function lum(hex){return hex.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((a,x,i)=>a+x*[.2126,.7152,.0722][i],0)}
 for(const [fg,bg] of [['ffffff','102a43'],['f0c35b','102a43'],['c5d5e2','102a43'],['102a43','ffffff'],['405769','ffffff'],['102a43','f0c35b'],['086c72','eef5f8'],['086c72','ffffff']]){const x=lum(fg),y=lum(bg);result.contrast.push({fg,bg,ratio:(Math.max(x,y)+.05)/(Math.min(x,y)+.05)});}
 }finally{if(browser)await browser.close();server.close();fs.writeFileSync(`${out}/resultados.json`,JSON.stringify(result,null,2));}
 console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
