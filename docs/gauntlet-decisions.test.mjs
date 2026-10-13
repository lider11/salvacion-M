import test from 'node:test';import assert from 'node:assert/strict';import {decide,G3_KEYS} from './gauntlet-decisions.mjs';
const all=Object.fromEntries(G3_KEYS.map(k=>[k,true]));const complete={g3:all,auditComplete:true,criticalDefectsOpen:false,highDefectsOpen:false,releaseCandidateEvidenceConsistent:true};
test('missing evidence defaults to false',()=>assert.equal(decide().G3_PASS,false));
test('truthy strings never accredit a gate',()=>assert.equal(decide({...complete,g3:{...all,authRbacCsrf:'true'}}).G3_PASS,false));
test('each gate individually prevents PASS',()=>{for(const k of G3_KEYS)assert.equal(decide({...complete,g3:{...all,[k]:false}}).G3_PASS,false)});
test('7/7 requires complete audit and consistent RC',()=>{assert.equal(decide(complete).G3_PASS,true);for(const key of ['auditComplete','releaseCandidateEvidenceConsistent'])assert.equal(decide({...complete,[key]:false}).G3_PASS,false)});
test('open blocking defects prevent PASS',()=>{for(const k of ['criticalDefectsOpen','highDefectsOpen'])assert.equal(decide({...complete,[k]:true}).G3_PASS,false)});
test('ambiguous outcome and exhausted budget deny retries',()=>{const i={criterionPassed:false,defectIsCorrectable:true,operationAuthorized:true,progressObserved:true,duplicateRisk:false,iterationCount:1,externalRetries:0,adversarialRounds:0};assert.equal(decide(i).RETRY_ALLOWED,true);for(const x of [{duplicateRisk:true},{iterationCount:3},{externalRetries:2},{adversarialRounds:2},{progressObserved:false}])assert.equal(decide({...i,...x}).RETRY_ALLOWED,false)});
test('exhaustion terminates without approving',()=>{const r=decide({allAuthorizedActionsExhausted:true});assert.equal(r.SHOULD_FINISH,true);assert.equal(r.G3_STATUS,'READY_FOR_VERIFICATION')});
