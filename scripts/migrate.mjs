import {mkdir,readFile,writeFile,cp} from 'node:fs/promises';
import {load} from 'cheerio';
const source = new URL('../../supertouch-kindness/public/',import.meta.url);
const root = new URL('../',import.meta.url);
for(const dir of ['public','src/templates','src/data','src/pages','src/lib','src/components','tests']) await mkdir(new URL(dir,root),{recursive:true});
await cp(new URL('assets',source),new URL('public/assets',root),{recursive:true});
await cp(new URL('replica.js',source),new URL('public/replica.js',root));
await cp(new URL('career/applications.css',source),new URL('public/applications.css',root));
await cp(new URL('career/applications.js',source),new URL('public/applications.js',root));
const routes=['','about','our-work','our-team','contact','donate','impact','news-article','career','career/apply','policies'];
const docs=[];
for(const route of routes){
 const $=load(await readFile(new URL(`${route?route+'/':''}index.html`,source),'utf8'));
 // Remove original-site telemetry and obsolete WordPress discovery metadata.
 $('script').each((_,el)=>{const s=$(el);if(/googletagmanager|optimization-detective|google-analytics/.test(s.attr('src')||s.text()))s.remove();});
 $('link[rel="alternate"],link[rel="dns-prefetch"],link[rel="shortlink"],link[rel="https://api.w.org/"]').remove();
 $('a[href]').each((_,el)=>{const a=$(el);let href=a.attr('href')||'';if(href.startsWith('https://supertouchkindnessfoundation.org/'))a.attr('href',href.replace('https://supertouchkindnessfoundation.org',''));});
 $('script[src="/career/applications.js"]').attr('src','/applications.js');
 $('link[href="/career/applications.css"]').attr('href','/applications.css');
 const name=route.replaceAll('/','-')||'home';
 const page={_id:`page-${name}`,_type:'page',title:$('title').text().split('|')[0].trim(),route:'/'+(route?route+'/':''),textBlocks:[]};
 if(!route.startsWith('career')){
  $('h1,h2,h3,h4,h5,h6,p').filter((_,el)=>!$(el).closest('[data-elementor-type="header"],[data-elementor-type="footer"],script,form').length).each((i,el)=>{
   const e=$(el);const text=e.text().trim();if(!text||e.find('a,button,input,img,script').length)return;
   const key='text-'+i;e.attr('data-cms-text',key);page.textBlocks.push({_key:key,_type:'textBlock',label:text.slice(0,70),text});
  });
 }
 docs.push(page);
 if(route==='career'){
  const vacancies=[];
  $('.vacancy-card').each((i,el)=>{const e=$(el);vacancies.push({_id:'vacancy-'+['communication-intern','hr-intern','finance-intern'][i],_type:'vacancy',title:e.find('h3').text(),department:e.find('.vacancy-department').text(),summary:e.children('p').text(),responsibilities:e.find('details li').map((_,li)=>$(li).text()).get(),skills:e.find('details p').text(),location:'Maiduguri',attendance:'2–3 days per week',duration:'6 months',unpaid:true,deadline:'2026-11-02T23:59:59+01:00',active:true});});
  await writeFile(new URL('src/data/vacancies.json',root),JSON.stringify(vacancies,null,2));docs.push(...vacancies);
 }
 if(route==='career/apply'){
  $('#apply-cv').closest('.form-field').after('<div class="form-field cv-upload"><label for="apply-cover-letter">Cover letter <span class="optional">(optional)</span></label><input id="apply-cover-letter" name="coverLetter" type="file" accept=".pdf,application/pdf" aria-describedby="cover-help error-coverLetter"><small id="cover-help">PDF only · Maximum 2 MB.</small><span class="field-error" id="error-coverLetter"></span></div>');
  $('#cv-help').text('PDF only · Maximum 2 MB. Omit identity numbers and bank information.');
  $('#application-privacy').text('Your application, CV and optional cover letter will be stored in SKF’s restricted SharePoint recruitment library for authorised HR staff to review. To ask about your information or request removal, contact info@supertouchkindnessfoundation.org.');
 }
 await writeFile(new URL(`src/templates/${name}.html`,root),$.html());
}
await writeFile(new URL('src/data/seed.json',root),JSON.stringify(docs,null,2));
let js=await readFile(new URL('public/applications.js',root),'utf8');
js=js.replace('5 * 1024 * 1024','2 * 1024 * 1024').replace('5 MB','2 MB');
js=js.replace("const payload = new FormData(form);", "const cover = form.elements.namedItem('coverLetter').files[0]; if (cover && (cover.size > 2 * 1024 * 1024 || !cover.name.toLowerCase().endsWith('.pdf'))) { error.textContent = 'Choose a cover letter PDF no larger than 2 MB.'; error.hidden = false; return; } const payload = new FormData(form);");
// Deadline comes from the selected vacancy, not a hardcoded client date.
js=js.replace(/  if \(Date.now\(\) > Date.parse\('2026-11-02T23:59:59\+01:00'\)\) \{[^\n]+\}\n/,'');
await writeFile(new URL('public/applications.js',root),js);
console.log('Migrated 11 pages, assets, and three vacancies.');
