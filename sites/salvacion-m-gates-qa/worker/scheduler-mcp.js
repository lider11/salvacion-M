// Sites validates MCP OAuth and forwards a verified caller identity.
// Never accept the private service token as a human operator identity.
const schedulerTools=[
 {name:'scheduler_status',description:'Read QA scheduler readiness and safe run summaries; never sends messages.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true}},
 {name:'dispatch_appointment_reminders',description:'Dispatch eligible QA reminders once. Never retry an ambiguous result. request_id must be reused when checking a previous invocation.',inputSchema:{type:'object',properties:{request_id:{type:'string',format:'uuid'}},required:['request_id'],additionalProperties:false},annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:true}}
];
async function schedulerStatus(env){
 const records=await env.DB.prepare('SELECT id,status,started_at,finished_at,result_json,release_sha FROM scheduler_runs ORDER BY started_at DESC LIMIT 20').all();
 const runs=(records.results||records).map(r=>{let result=null;try{result=JSON.parse(r.result_json)}catch{}return {...r,result_json:undefined,result}});
 return {mechanism:'sites_mcp_cloud_task',configured:env.SCHEDULER_ENABLED==='true',authentication_policy_configured:!!env.SCHEDULER_OPERATOR_EMAIL,release_sha:env.G3_RELEASE_CANDIDATE_SHA||null,latest_run:runs[0]||null,runs,delivery_verified:false};
}
async function schedulerDispatch(env,requestId){
 if(env.SCHEDULER_ENABLED!=='true')throw new Error('SCHEDULER_NOT_ENABLED');
 if(!/^[0-9a-f]{40}$/.test(env.G3_RELEASE_CANDIDATE_SHA||''))throw new Error('RELEASE_NOT_CONFIGURED');
 const started=iso();
 const inserted=await env.DB.prepare("INSERT OR IGNORE INTO scheduler_runs (id,status,started_at,release_sha) VALUES (?,'started',?,?)").bind(requestId,started,env.G3_RELEASE_CANDIDATE_SHA).run();
 if(Number(inserted?.meta?.changes??inserted?.changes)!==1){const prior=await env.DB.prepare('SELECT status,result_json FROM scheduler_runs WHERE id=?').bind(requestId).first();return {replayed:true,status:prior?.status||'unknown_requires_review',result:prior?.result_json?JSON.parse(prior.result_json):null};}
 try{
  const result=await dispatchReminders(env,new Date());
  const status=result.skipped||result.failed?'requires_review':'completed';
  await env.DB.prepare('UPDATE scheduler_runs SET status=?,finished_at=?,result_json=? WHERE id=?').bind(status,iso(),JSON.stringify(result),requestId).run();
  return {replayed:false,status,result};
 }catch{
  // A started reservation is never dispatched again, even if this update fails.
  try{await env.DB.prepare("UPDATE scheduler_runs SET status='unknown_requires_review',finished_at=? WHERE id=?").bind(iso(),requestId).run()}catch{}
  throw new Error('DISPATCH_UNKNOWN_REQUIRES_REVIEW');
 }
}
async function schedulerMcp(request,env){
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'JSON required'},415);
 const raw=await request.text();if(raw.length>8192)return json({error:'Request too large'},413);
 let rpc;try{rpc=JSON.parse(raw)}catch{return json({error:'Invalid JSON'},400)}
 if(!rpc||Array.isArray(rpc)||typeof rpc!=='object')return json({error:'Invalid request'},400);
 const reply=result=>json({jsonrpc:'2.0',id:rpc.id??null,result});
 const fail=(code,message)=>json({jsonrpc:'2.0',id:rpc.id??null,error:{code,message}});
 if(rpc.jsonrpc!=='2.0'||typeof rpc.method!=='string')return fail(-32600,'Invalid request');
 if(rpc.method==='server/discover')return reply({supportedVersions:['2026-07-28'],capabilities:{tools:{}}});
 if(rpc.method==='initialize')return reply({protocolVersion:'2026-07-28',capabilities:{tools:{}},serverInfo:{name:'salvacion-m-qa-reminders',version:'1.0.0'}});
 if(rpc.method==='notifications/initialized')return new Response(null,{status:204});
 if(rpc.method==='tools/list')return reply({tools:schedulerTools});
 const email=request.headers.get('oai-authenticated-user-email');
 const userId=request.headers.get('oai-authenticated-user-id');
 if(!env.SCHEDULER_OPERATOR_EMAIL||!email||!userId||email.toLowerCase()!==env.SCHEDULER_OPERATOR_EMAIL.toLowerCase())return json({error:'Operator not authorized'},403);
 if(rpc.method!=='tools/call')return fail(-32601,'Method not found');
 const args=rpc.params?.arguments??{};
 if(!args||Array.isArray(args)||typeof args!=='object')return fail(-32602,'Invalid arguments');
 try{
  let data;
  if(rpc.params?.name==='scheduler_status'){if(Object.keys(args).length)return fail(-32602,'Unexpected arguments');data=await schedulerStatus(env)}
  else if(rpc.params?.name==='dispatch_appointment_reminders'){
   if(Object.keys(args).length!==1||typeof args.request_id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(args.request_id))return fail(-32602,'Valid request_id required');
   data=await schedulerDispatch(env,args.request_id.toLowerCase());
  }else return fail(-32602,'Unknown tool');
  return reply({content:[{type:'text',text:JSON.stringify(data)}],isError:false});
 }catch(error){return reply({content:[{type:'text',text:JSON.stringify({error:['SCHEDULER_NOT_ENABLED','RELEASE_NOT_CONFIGURED','DISPATCH_UNKNOWN_REQUIRES_REVIEW'].includes(error.message)?error.message:'SCHEDULER_STORAGE_UNAVAILABLE'})}],isError:true})}
}
