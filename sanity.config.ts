import {defineConfig,defineType,defineField} from 'sanity';
import {structureTool} from 'sanity/structure';
import settings from './config/sanity.json';
import newsStory from './sanity.news';
import {vacancyApplicationUrl} from './src/lib/vacancy-link';
import {libraryDocument, impactFigure, impactProject} from './sanity.editorial';
const required=(rule:any)=>rule.required();
export default defineConfig({name:'skf',title:'Supertouch Kindness Foundation',projectId:process.env.SANITY_STUDIO_PROJECT_ID||settings.projectId,dataset:process.env.SANITY_STUDIO_DATASET||settings.dataset,plugins:[structureTool()],schema:{types:[newsStory,libraryDocument,impactFigure,impactProject,
 defineType({name:'page',title:'Website pages',type:'document',fields:[
  defineField({name:'title',type:'string',validation:required}),
  defineField({name:'route',type:'string',readOnly:true,description:'Preserves existing website links.'}),
  defineField({name:'textBlocks',title:'Page content',type:'array',of:[{type:'textBlock'}]}),
 ],preview:{select:{title:'title',subtitle:'route'}}}),
 defineType({name:'textBlock',title:'Text',type:'object',fields:[{name:'label',title:'Section',type:'string',readOnly:true},{name:'text',title:'Content',type:'text',rows:4,validation:required}],preview:{select:{title:'label',subtitle:'text'}}}),
 defineType({name:'vacancy',title:'Vacancies',type:'document',fields:[
  defineField({name:'title',type:'string',validation:required}),defineField({name:'department',type:'string',validation:required}),
  defineField({name:'summary',type:'text',rows:3,validation:required}),
  defineField({name:'responsibilities',type:'array',of:[{type:'string'}],validation:required}),
  defineField({name:'skills',type:'text',rows:3}),defineField({name:'location',type:'string',initialValue:'Maiduguri',validation:required}),
  defineField({name:'attendance',type:'string',initialValue:'2–3 days per week',validation:required}),
  defineField({name:'duration',type:'string',initialValue:'6 months',validation:required}),
  defineField({name:'unpaid',title:'Unpaid placement',type:'boolean',initialValue:true}),
  defineField({name:'employmentType',title:'Position type',type:'string',options:{list:['Internship','Full-time','Part-time','Contract','Volunteer']},initialValue:'Internship'}),
  defineField({name:'applicationUrl',title:'Public HR application URL',type:'url',description:'Paste the public application link for this specific position from the HR platform.',validation:r=>r.custom((value,context)=>{
    if(!value)return context.document?.active ? 'Add a public HR link before accepting applications.' : true;
    return vacancyApplicationUrl(value) ? true : 'Enter a public HTTPS application URL.';
  })}),
  defineField({name:'deadline',type:'datetime',validation:required}),defineField({name:'active',title:'Accepting applications',type:'boolean',initialValue:false})
 ],preview:{select:{title:'title',subtitle:'department'}}})
]}});
