import {defineField, defineType} from 'sanity';

export const documentCategories = [
  {title: 'Impact reports', value: 'impact-reports'},
  {title: 'Assessments', value: 'assessments'},
  {title: 'Board meeting reports', value: 'board-reports'},
];

const order = defineField({name:'order', title:'Display order', type:'number', initialValue:100, validation:r=>r.integer().min(0)});
const title = defineField({name:'title', type:'string', validation:r=>r.required()});
const year = defineField({name:'year', type:'number', validation:r=>r.integer().min(1900).max(2200)});
const link = defineField({
  name:'href', title:'Existing website link', type:'string',
  description:'Use a site path starting with / or an HTTPS link.',
  validation:r=>r.regex(/^(?:\/(?![\/\\])|https:\/\/[^\s/]+(?:\/|$))/),
});
const cover = defineField({name:'cover', type:'image'});
const coverUrl = defineField({name:'coverUrl', title:'Original cover image', type:'string', readOnly:true});
const ordering = [{name:'displayOrder', title:'Display order', by:[{field:'order', direction:'asc' as const}]}];

export const libraryDocument = defineType({
  name:'libraryDocument', title:'Reports and documents', type:'document', orderings:ordering,
  fields:[
    title,
    defineField({name:'category', type:'string', options:{list:documentCategories}, validation:r=>r.required()}),
    year, order,
    defineField({name:'pdf', title:'Public PDF', type:'file', options:{accept:'application/pdf'}, description:'Leave the PDF and existing link empty to offer a copy by email.'}),
    link,
    defineField({name:'size', title:'Existing PDF size label', type:'string'}),
    defineField({name:'featured', type:'boolean', initialValue:false}),
    cover, coverUrl,
  ],
  preview:{select:{title:'title', subtitle:'category', media:'cover'}},
});

export const impactFigure = defineType({
  name:'impactFigure', title:'Impact figures', type:'document', orderings:ordering,
  fields:[
    defineField({name:'label', type:'string', validation:r=>r.required()}),
    defineField({name:'value', type:'number', validation:r=>r.required().integer().min(0)}),
    defineField({name:'suffix', type:'string', options:{list:[{title:'Plus (+)', value:'+'}]}}),
    defineField({name:'period', title:'Reporting period', type:'string', validation:r=>r.required().warning('Add the verified reporting period.')}),
    defineField({name:'source', title:'Source or report title', type:'string', validation:r=>r.required().warning('Add the verified source.')}),
    defineField({name:'sourceUrl', title:'Public source URL', type:'url', validation:r=>r.uri({scheme:['https']})}),
    order,
  ],
  preview:{select:{title:'label', subtitle:'period'}},
});

export const impactProject = defineType({
  name:'impactProject', title:'Impact projects', type:'document', orderings:ordering,
  fields:[
    title, year, link, order,
    defineField({name:'place', title:'Location', type:'string', validation:r=>r.required()}),
    defineField({name:'description', type:'text', rows:3}),
    defineField({name:'featured', type:'boolean', initialValue:false}),
    cover, coverUrl,
    defineField({name:'alt', title:'Image description', type:'string', validation:r=>r.custom((value,ctx)=>!ctx.document?.cover||value?.trim()?true:'Describe the image.')}),
  ],
  preview:{select:{title:'title', subtitle:'place', media:'cover'}},
});
