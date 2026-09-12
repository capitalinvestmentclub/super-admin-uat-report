const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const data=fs.readFileSync('data.js','utf8');
const retest=fs.readFileSync('retest.js','utf8');
const app=fs.readFileSync('app.js','utf8');
function setup(query=''){
 const dom=new JSDOM(html,{url:'https://capitalinvestmentclub.github.io/super-admin-uat-report/'+query,runScripts:'outside-only'});const w=dom.window,d=w.document;
 w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 w.URL.createObjectURL=()=> 'blob:test';w.URL.revokeObjectURL=()=>{};w.navigator.clipboard={writeText:async()=>{}};w.setTimeout=fn=>{fn();return 1;};w.clearTimeout=()=>{};
 vm.runInContext(data,dom.getInternalVMContext());vm.runInContext(retest,dom.getInternalVMContext());vm.runInContext(app,dom.getInternalVMContext());
 return {dom,w,d,$:s=>d.querySelector(s),all:s=>[...d.querySelectorAll(s)]};
}
test('publishes all priority scenarios, six-size cells and findings',()=>{const x=setup();assert.equal(x.all('.finding-row').length,26);assert.equal(x.all('#scenarios tr').length,10);assert.equal(x.all('.cells span').length,60);assert.equal(x.$('#metric-total').textContent,'26');assert.equal(x.$('#metric-urgent').textContent,'18');assert.match(x.d.body.textContent,/10\/10 scenarios closed/);assert.match(x.d.body.textContent,/Final UAT score: 2\/10/);x.dom.window.close();});
test('supports finding search and deep links',()=>{const x=setup();x.$('#search').value='Assessor is not credited';x.$('#search').dispatchEvent(new x.w.Event('input'));assert.equal(x.all('.finding-row').length,1);x.$('.finding-row').click();assert.ok(x.$('dialog').open);assert.match(x.$('#dialog-content').textContent,/payer is debited/i);x.dom.window.close();const y=setup('#ADM055-LEDGER-001');assert.ok(y.$('dialog').open);assert.match(y.$('#dialog-title').textContent,/ledger values/i);y.dom.window.close();});
test('contains no credentials, applicant emails or unsupported pass claims',()=>{for(const file of ['index.html','data.js','app.js']){const value=fs.readFileSync(file,'utf8');assert.doesNotMatch(value,/approver@gmail|test123|cic\.test\./i);assert.doesNotMatch(value,/all scenarios passed/i);}});
