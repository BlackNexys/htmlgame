// Production round trip with temporary source modules; no test level is shipped afterward.
require('tsx/cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {spawn,execFileSync}=require('node:child_process');
const {chromium,firefox}=require('@playwright/test');
const root=path.resolve(__dirname,'..'),directory=path.join(root,'src/content/levels');
const vite=path.join(root,'node_modules/vite/bin/vite.js'),port=3014,base=`http://127.0.0.1:${port}`;
const moduleFile=path.join(directory,'workshop-proof.level.ts'),kitFile=path.join(directory,'workshop-proof-kit.ts'),layoutFile=path.join(directory,'workshop-proof.layout.ts');
const created=new Set();let server,browser,activePage;
function write(file,text){assert.equal(fs.existsSync(file),false,`Refusing to overwrite ${file}`);fs.writeFileSync(file,text,{flag:'wx'});created.add(file);}
function build(label){
    fs.mkdirSync(path.join(root,'artifacts'),{recursive:true});
    const log=fs.openSync(path.join(root,`artifacts/unified-workshop-build-${label}.log`),'w');
    try{execFileSync(process.execPath,[path.join(root,'node_modules/typescript/bin/tsc'),'--noEmit'],{cwd:root,stdio:['ignore',log,log]});execFileSync(process.execPath,[vite,'build'],{cwd:root,stdio:['ignore',log,log]});}finally{fs.closeSync(log);}
}
async function start(){
    server=spawn(process.execPath,[vite,'preview','--port',String(port),'--strictPort'],{cwd:root,stdio:'ignore',windowsHide:true});
    for(let i=0;i<100;i++){if(server.exitCode!==null)throw Error(`Preview exited: ${server.exitCode}`);try{if((await fetch(base)).ok)return;}catch{}await new Promise(r=>setTimeout(r,100));}
    throw Error('Preview did not start');
}
async function stop(){if(!server)return;const running=server;server=undefined;if(running.exitCode!==null)return;await new Promise(resolve=>{running.once('exit',resolve);running.kill();});}
async function downloadText(download){const stream=await download.createReadStream(),chunks=[];for await(const chunk of stream)chunks.push(chunk);return Buffer.concat(chunks).toString();}
async function act(page, action) {const revision=(await snapshot(page)).revision;await action();await page.waitForFunction(r=>window.levelEditor.getDocument().revision>r,revision,{timeout:3000});}
const snapshot=page=>page.evaluate(()=>window.levelEditor.getDocument());
const layout=page=>page.evaluate(()=>window.levelEditor.getLayout());

(async()=>{
    let failure;
    try{
        for(const file of [moduleFile,kitFile,layoutFile])assert.equal(fs.existsSync(file),false,`Test fixture already exists: ${file}`);
        write(kitFile,`import {defineAssembly} from '../../levels/source';
export const gallery=defineAssembly({name:'Pump gallery',parameters:{width:{type:'number',default:600,min:400,max:800,step:8},lit:{type:'boolean',default:true}}},(scene,p)=>{
 scene.add('terrain',{id:'deck',kind:'platform',x:0,y:0,width:p.width,height:24,material:1});
 scene.add('props',{id:'bench',asset:'confluence-bench',x:20,y:-64,width:128,height:64,light:p.lit?100:30,mount:{parent:'deck',socket:'topLeft'}});
 scene.add('water',{id:'drain',kind:'drain',x:64,y:24,width:80,height:32,mount:{parent:'deck',socket:'bottomLeft'}},{id:'basin',kind:'basin',x:40,y:300,width:160,height:48},{id:'fall',kind:'waterfall',x:0,y:0,width:20,from:{parent:'drain',socket:'mouth'},to:'basin'});
 scene.add('enemies',{id:'guard',kind:'zombie',x:p.width-100,y:0,patrol:{left:p.width-140,right:p.width-60}});
});
`);
        write(moduleFile,`import {defineLevel} from '../../levels/source';
import {gallery} from './workshop-proof-kit';
export default defineLevel({id:'workshop-proof',name:'Workshop proof',width:3200,height:1600,spawn:{x:160,y:1200},exit:{x:3000,y:1092,width:64,height:108}},scene=>{
 scene.add('terrain',{id:'floor',x:0,y:1200,width:3200,height:24});
 scene.place('gallery',{x:800,y:600},gallery);
});
`);
        build('source');await start();let exported,expected;
        for(const [name,type]of Object.entries({chromium,firefox})){
            browser=await type.launch();const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
            activePage=page; page.on('pageerror',e=>errors.push(e.message));
            await page.goto(base+'/editor.html');await page.locator('#source-level').selectOption('workshop-proof');
            await page.getByRole('button',{name:'Open level source',exact:true}).click();await page.waitForFunction(()=>window.levelEditor?.getDocument().id==='workshop-proof');
            await page.locator('#assembly-list').selectOption('gallery');
            await page.locator('#assembly-properties [name="param-width"]').fill('720');
            await act(page,()=>page.getByRole('button',{name:'Apply assembly',exact:true}).click());
            await page.waitForFunction(()=>window.levelEditor.getDocument().terrain.find(o=>o.id==='gallery--deck').width===720,{},{timeout:3000});
            await page.locator('#object-list').selectOption('props:gallery--bench');
            await page.locator('#object-properties [name="opacity"]').fill('60');
            await act(page,()=>page.getByRole('button',{name:'Apply properties',exact:true}).click());
            assert.deepEqual((await layout(page)).instances.gallery.children[0].set,{opacity:60},'untouched defaults must remain inherited');
            await act(page,()=>page.getByRole('button',{name:'Reset child override',exact:true}).click());assert.equal((await snapshot(page)).props[0].opacity,undefined);
            await act(page,()=>page.getByRole('button',{name:'Undo',exact:true}).click());assert.equal((await snapshot(page)).props[0].opacity,60);
            await page.reload();await page.waitForFunction(()=>window.levelEditor?.getLayout()?.instances.gallery.children?.length===1);
            assert.equal((await snapshot(page)).props[0].opacity,60);
            await page.evaluate(()=>window.levelEditor.selectAssembly('gallery'));
            await page.getByRole('button',{name:'Move assembly',exact:true}).click();
            const point=await page.locator('#level-canvas').evaluate(canvas=>{const r=canvas.getBoundingClientRect(),scale=canvas.width/3200;return{x:r.left+840*scale,y:r.top+612*scale,dx:64*scale,dy:32*scale};});
            await act(page,async()=>{await page.mouse.move(point.x,point.y);await page.mouse.down();await page.mouse.move(point.x+point.dx,point.y+point.dy,{steps:8});await page.mouse.up();});
            assert.equal((await layout(page)).instances.gallery.x,864);assert.equal((await layout(page)).instances.gallery.y,632);
            const before=await snapshot(page),invalid=await page.evaluate(()=>{try{const d=window.levelEditor.getDocument();window.levelEditor.configureAssembly('gallery',{parameters:{width:1000}},d.revision);return '';}catch(e){return String(e);}});
            assert.match(invalid,/Parameter width/);assert.deepEqual(await snapshot(page),before);
            const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Export source layout',exact:true}).click();const file=await pending;
            assert.equal(file.suggestedFilename(),'workshop-proof.layout.ts');const text=await downloadText(file);assert.ok(!text.includes('scene.add('));
            if(!exported){exported=text;expected=await snapshot(page);}else assert.deepEqual(await snapshot(page),expected);
            await page.screenshot({path:path.join(root,`artifacts/${name}-unified-workshop.png`),fullPage:true});
            assert.deepEqual(errors,[]);await browser.close();browser=undefined;
            console.log(`${name}: parameters, child override/reset, undo, draft restoration, assembly drag and export passed`);
        }
        await stop();write(layoutFile,exported);build('companion');await start();
        const source=require(moduleFile).default.withLayout(require(layoutFile).default);assert.deepEqual(source.document(),expected);
        const cli=execFileSync(process.execPath,[path.join(root,'scripts/levels.cjs'),'build',moduleFile],{cwd:root,encoding:'utf8'});assert.deepEqual(JSON.parse(cli),expected);
        for(const [name,type]of Object.entries({chromium,firefox})){
            browser=await type.launch();const page=await browser.newPage();await page.goto(base+'/?level=workshop-proof&observe=1');
            await page.getByRole('button',{name:'Play',exact:true}).click();
            const state=await page.evaluate(()=>window.gameObservation({includeProps:true}));
            const deck=state.collision.find(o=>o.owner==='gallery--deck');assert.equal(deck.x,864);assert.equal(deck.y,632);assert.equal(deck.width,720);
            const bench=state.props.find(o=>o.id==='gallery--bench');assert.equal(bench.x,884);assert.equal(bench.y,568);
            await page.goto(base+'/editor.html');await page.locator('#source-level').selectOption('workshop-proof');await page.getByRole('button',{name:'Open level source',exact:true}).click();
            await page.waitForFunction(()=>window.levelEditor?.getDocument().id==='workshop-proof');assert.deepEqual(await snapshot(page),expected);
            await browser.close();browser=undefined;console.log(`${name}: exported companion matches runtime, CLI and reopened editor`);
        }
    }catch(error){
        if(activePage && !activePage.isClosed()) {
            console.error(await activePage.evaluate(()=>({status:document.querySelector('#editor-status')?.textContent,form:document.querySelector('#assembly-properties')?.innerHTML,layout:window.levelEditor?.getLayout()})));
            await activePage.screenshot({path:path.join(root,'artifacts/unified-workshop-failure.png'),fullPage:true}).catch(()=>{});
        }
        failure=error;
    }
    finally{
        if(browser)await browser.close();await stop();
        for(const file of created){assert.ok(path.resolve(file).startsWith(directory+path.sep));fs.rmSync(file,{force:true});}
        if(created.size)try{build('clean');}catch(error){failure??=error;}
    }
    if(failure)throw failure;
    console.log('PASS: source/workshop production round trip; temporary content removed and original production content restored.');
})().catch(error=>{console.error(error);process.exitCode=1;});
