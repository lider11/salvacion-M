export const G3_KEYS=Object.freeze(['ciAndReleaseCandidate','githubSitesReconciled','automaticSchedulerAuthenticated','realRemindersAndIdempotency','authRbacCsrf','e2eAndAccessibility','documentationAndTraceability']);
export function decide(input={}){
 const g3=Object.fromEntries(G3_KEYS.map(key=>[key,input.g3?.[key]===true]));
 const count=Object.values(g3).filter(x=>x===true).length;
 const pass=count===7&&input.auditComplete===true&&input.criticalDefectsOpen===false&&input.highDefectsOpen===false&&input.releaseCandidateEvidenceConsistent===true;
 const retry=input.criterionPassed===false&&input.defectIsCorrectable===true&&input.operationAuthorized===true&&input.progressObserved===true&&input.duplicateRisk===false&&Number.isInteger(input.iterationCount)&&input.iterationCount>=0&&input.iterationCount<3&&Number.isInteger(input.externalRetries)&&input.externalRetries>=0&&input.externalRetries<2&&Number.isInteger(input.adversarialRounds)&&input.adversarialRounds>=0&&input.adversarialRounds<2;
 return {g3,G3_CRITERIA_COUNT:count,G3_PASS:pass,G3_STATUS:pass?'PASS':'READY_FOR_VERIFICATION',RETRY_ALLOWED:retry,SHOULD_FINISH:pass||input.allAuthorizedActionsExhausted===true||input.allRemainingWorkBlocked===true};
}
