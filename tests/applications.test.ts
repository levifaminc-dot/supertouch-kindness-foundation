import test from 'node:test';
import assert from 'node:assert/strict';
import {submit} from '../src/lib/applications.ts';
const config={tenantId:'t',clientId:'c',clientSecret:'secret',driveId:'d',folderId:'f',signingSecret:'12345678901234567890123456789012'};
const role={title:'Finance Intern',deadline:'2099-11-02T23:59:59+01:00',active:true,unpaid:true};
function application(cv:Blob=new Blob(['%PDF-test'],{type:'application/pdf'})){
 const f=new FormData();for(const [key,value] of Object.entries({submissionKey:'5dc556d7-e546-4f64-b9f2-aae1808f41d4',role:'Finance Intern',fullName:'Example Applicant',email:'applicant@example.org',phone:'+2347031234567',location:'Maiduguri',background:'Relevant volunteering experience',motivation:'I would like to support the mission and contribute to the team.',availability:'2 days per week',unpaid:'yes',attendance:'yes',consent:'yes'}))f.set(key,value);
 f.set('cv',new File([cv],'cv.pdf',{type:'application/pdf'}));return new Request('https://example.org/api/applications',{method:'POST',headers:{origin:'https://example.org'},body:f});
}
test('valid application saves both documents only after validation',async()=>{
 process.env.APPLICATIONS_ENABLED='true';let saved=false;
 const result=await submit(application(),[role],async()=>{saved=true;return{reference:'SKF-TEST',duplicate:false}},config);
 assert.equal(result.status,201);assert.equal((await result.json()).reference,'SKF-TEST');assert.equal(saved,true);
});
test('invalid PDF and closed vacancy never reach SharePoint',async()=>{
 process.env.APPLICATIONS_ENABLED='true';let saved=false;const save=async()=>{saved=true;return{reference:'TEST',duplicate:false}};
 const bad=await submit(application(new Blob(['not a PDF'],{type:'application/pdf'})),[role],save,config);
 assert.equal(bad.status,400);const closed=await submit(application(),[{...role,deadline:'2020-01-01T00:00:00Z'}],save,config);
 assert.equal(closed.status,400);assert.equal(saved,false);
});
