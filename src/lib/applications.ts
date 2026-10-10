import {saveApplication,storageConfig} from './sharepoint.ts';
type Role={title:string;deadline:string;active:boolean;unpaid:boolean};
export const MAX_FILE=2*1024*1024;
export const MAX_BODY=2*MAX_FILE+65536;
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function submit(request:Request,roles:Role[],save=saveApplication,config=storageConfig()){
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Please submit from the SKF application page.'},403);
 if(!config||process.env.APPLICATIONS_ENABLED!=='true')return json({error:'Online applications are being configured. Please check back shortly.'},503);
 if(!request.headers.get('content-type')?.startsWith('multipart/form-data;'))return json({error:'Please use the application form.'},415);
 if(Number(request.headers.get('content-length'))>MAX_BODY)return json({error:'Each PDF must be no larger than 2 MB.'},413);
 let form:FormData;
 try{
  const reader=request.body?.getReader();if(!reader)return json({error:'Empty application.'},400);
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX_BODY){await reader.cancel();return json({error:'Each PDF must be no larger than 2 MB.'},413);}chunks.push(value);}
  form=await new Response(Buffer.concat(chunks),{headers:{'Content-Type':request.headers.get('content-type')!}}).formData();
 }catch{return json({error:'Unable to read your files. Please select them again.'},400);}
 const fields:Record<string,string>={};
 for(const key of ['submissionKey','role','fullName','email','phone','location','background','motivation','availability','portfolio','unpaid','attendance','consent','website'])fields[key]=typeof form.get(key)==='string'?String(form.get(key)).trim():'';
 fields.email=fields.email.toLowerCase();
 if(fields.website)return json({error:'Unable to submit.'},400);
 const errors:Record<string,string>={};
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(fields.submissionKey))errors.submissionKey='Reload the page and try again.';
 const role=roles.find(r=>r.title===fields.role&&r.active);
 if(!role||!(Date.parse(role.deadline)>Date.now()))errors.role='This internship is no longer accepting applications.';
 for(const [key,min,max] of [['fullName',2,120],['location',2,160],['background',10,2000],['motivation',30,3000]] as const)if(fields[key].length<min||fields[key].length>max)errors[key]=`Enter between ${min} and ${max} characters.`;
 if(fields.email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))errors.email='Enter a valid email.';
 if(!/^[+\d\s().-]{7,30}$/.test(fields.phone))errors.phone='Enter a valid phone number.';
 if(!['2 days per week','3 days per week','Either 2 or 3 days per week'].includes(fields.availability))errors.availability='Choose your availability.';
 for(const key of ['unpaid','attendance','consent'])if(fields[key]!=='yes')errors[key]='Please confirm this statement.';
 if(fields.portfolio){try{const url=new URL(fields.portfolio);if(!['http:','https:'].includes(url.protocol)||fields.portfolio.length>500)throw Error();}catch{errors.portfolio='Enter an https:// link or leave blank.';}}
 const cv=form.get('cv'),cover=form.get('coverLetter');
 const validate=async(file:FormDataEntryValue|null,key:string,required:boolean)=>{
  if(!file||(typeof file!=='string'&&file.size===0)){if(required)errors[key]='Choose a PDF file.';return;}
  if(typeof file==='string'||file.size>MAX_FILE||!file.name.toLowerCase().endsWith('.pdf')||!['','application/pdf'].includes(file.type)){errors[key]='Choose a PDF no larger than 2 MB.';return;}
  if(new TextDecoder().decode(await file.slice(0,5).arrayBuffer())!=='%PDF-')errors[key]='Choose a valid PDF document.';
 };
 await validate(cv,'cv',true);await validate(cover,'coverLetter',false);
 if(Object.keys(errors).length)return json({error:'Please check the highlighted fields.',fields:errors},400);
 try{return json(await save(config,fields,cv as File,cover&&typeof cover!=='string'&&cover.size?cover:null),201);}
 catch{return json({error:'Your application has not been confirmed. Please retry; your information is still on screen.'},503);}
}
