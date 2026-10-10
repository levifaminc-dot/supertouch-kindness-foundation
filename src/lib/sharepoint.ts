import {createHmac} from 'node:crypto';
type Config={tenantId:string;clientId:string;clientSecret:string;driveId:string;folderId:string;signingSecret:string};
export function storageConfig():Config|null{
 const e=process.env;
 if(!e.SHAREPOINT_TENANT_ID||!e.SHAREPOINT_CLIENT_ID||!e.SHAREPOINT_CLIENT_SECRET||!e.SHAREPOINT_DRIVE_ID||!e.SHAREPOINT_FOLDER_ID||!e.APPLICATION_SIGNING_SECRET||e.APPLICATION_SIGNING_SECRET.length<32)return null;
 return {tenantId:e.SHAREPOINT_TENANT_ID,clientId:e.SHAREPOINT_CLIENT_ID,clientSecret:e.SHAREPOINT_CLIENT_SECRET,driveId:e.SHAREPOINT_DRIVE_ID,folderId:e.SHAREPOINT_FOLDER_ID,signingSecret:e.APPLICATION_SIGNING_SECRET};
}
export function referenceFor(key:string,email:string,secret:string){return 'SKF-'+createHmac('sha256',secret).update(key+'\n'+email).digest('hex').slice(0,24).toUpperCase();}
export async function saveApplication(config:Config,fields:Record<string,string>,cv:File,coverLetter:File|null,fetcher:typeof fetch=fetch){
 const reference=referenceFor(fields.submissionKey,fields.email,config.signingSecret);
 const tokenResponse=await fetcher(`https://login.microsoftonline.com/${encodeURIComponent(config.tenantId)}/oauth2/v2.0/token`,{method:'POST',body:new URLSearchParams({client_id:config.clientId,client_secret:config.clientSecret,scope:'https://graph.microsoft.com/.default',grant_type:'client_credentials'}),signal:AbortSignal.timeout(15000)});
 if(!tokenResponse.ok)throw new Error('SharePoint authentication failed.');
 const {access_token}=await tokenResponse.json();
 const base=`https://graph.microsoft.com/v1.0/drives/${encodeURIComponent(config.driveId)}/items/${encodeURIComponent(config.folderId)}`;
 const call=(url:string,init:RequestInit={})=>fetcher(url,{...init,headers:{...init.headers,Authorization:`Bearer ${access_token}`},signal:AbortSignal.timeout(20000)});
 const path=`${base}:/${reference}`;
 const existing=await call(`${path}/application.json:/content`);
 if(existing.ok)return {reference,duplicate:true};
 if(existing.status!==404)throw new Error('Unable to check existing application.');
 const folder=await call(`${base}/children`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:reference,folder:{},'@microsoft.graph.conflictBehavior':'fail'})});
 if(!folder.ok&&folder.status!==409)throw new Error('Unable to create application folder.');
 const upload=async(name:string,body:ArrayBuffer|string,type:string)=>{
  const res=await call(`${path}/${name}:/content`,{method:'PUT',headers:{'Content-Type':type},body});if(!res.ok)throw new Error('Unable to save application document.');
 };
 // The completion record is written last. Interrupted submissions can safely retry.
 await upload('CV.pdf',await cv.arrayBuffer(),'application/pdf');
 if(coverLetter)await upload('Cover-letter.pdf',await coverLetter.arrayBuffer(),'application/pdf');
 const {submissionKey,...details}=fields;
 const record={reference,submittedAt:new Date().toISOString(),...details,cvFile:'CV.pdf',coverLetterFile:coverLetter?'Cover-letter.pdf':null,consentVersion:'recruitment-2026-10'};
 await upload('Application.txt',Object.entries(record).map(([k,v])=>`${k}: ${v??''}`).join('\n\n'),'text/plain; charset=utf-8');
 await upload('application.json',JSON.stringify(record,null,2),'application/json');
 return {reference,duplicate:false};
}
