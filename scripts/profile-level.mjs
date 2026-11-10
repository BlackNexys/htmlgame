import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.argv[2]??'http://127.0.0.1:3012',id=process.argv[3]??'sluice-exchange';
if(!/^[a-z][a-z0-9-]{0,79}$/.test(id))throw Error('Invalid level ID');
const browser=await chromium.launch();
try{
    const page=await browser.newPage();await page.goto(base);
    const report=await page.evaluate(async id=>{
        const [{compileLevel},{World},{AssetLoader},{EnvironmentLoader},{sceneAssetKeys},{GameScreen}]=await Promise.all([
            import('/src/levels/LevelCompiler.ts'),import('/src/game/World.ts'),import('/src/game/AssetLoader.ts'),import('/src/environment/EnvironmentLoader.ts'),import('/src/world/props/SceneAssetKeys.ts'),import('/src/renderers/GameScreen.ts'),
        ]);
        const document=await fetch(`/levels/${id}.json`).then(r=>r.json());
        const summarize=values=>{const s=[...values].sort((a,b)=>a-b);return {medianMs:+s[Math.floor(s.length/2)].toFixed(3),p95Ms:+s[Math.min(s.length-1,Math.floor(s.length*.95))].toFixed(3),maxMs:+s.at(-1).toFixed(3)};};
        const compileTimes=[];let level;
        for(let i=0;i<12;i++){const start=performance.now();level=compileLevel(document);compileTimes.push(performance.now()-start);}
        const start=performance.now(),world=new World(level),constructionMs=performance.now()-start;
        const assets=await new AssetLoader().load();assets.environment=await new EnvironmentLoader().load(level.presentation,new AbortController().signal,!!level.water?.length,sceneAssetKeys(level));
        const canvas=window.document.createElement('canvas'),screen=new GameScreen(canvas,assets),views=[];
        const anchors=document.terrain.filter(r=>r.width>=512&&['platform','bridge'].includes(r.kind));
        for(const anchor of anchors){
            Object.assign(world.camera,{x:Math.max(0,Math.min(document.width-960,anchor.x+anchor.width/2-480)),y:Math.max(0,Math.min(document.height-576,anchor.y-384))});
            for(let i=0;i<4;i++)screen.draw(world);
            const times=[];for(let i=0;i<24;i++){const start=performance.now();screen.draw(world);times.push(performance.now()-start);}
            views.push({anchor:anchor.id,...summarize(times)});
        }
        return {level:id,size:[document.width,document.height],counts:{structures:world.level.structures.length,colliders:world.level.solids.length,props:world.level.props.length,water:world.level.water.elements.length,enemies:world.enemies.length},compile:summarize(compileTimes.slice(2)),constructionMs:+constructionMs.toFixed(3),views,scope:'Warm static 960x576 Canvas draw-call wall time in headless Chromium. No GPU/FPS, live combat, cold networking, memory or human pacing claim.'};
    },id);
    await mkdir('artifacts',{recursive:true});await writeFile(`artifacts/${id}-profile.json`,JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify({level:id,counts:report.counts,compile:report.compile,constructionMs:report.constructionMs,worst:report.views.toSorted((a,b)=>b.p95Ms-a.p95Ms).slice(0,5),scope:report.scope},null,2));
}finally{await browser.close();}
