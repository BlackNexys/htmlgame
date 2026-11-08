import {writeFile,mkdir} from 'node:fs/promises';
import {chromium} from '@playwright/test';

// Authoring artifact: draw the actual level, assets and existing renderers at world scale.
// Requires the Vite development server, since it imports the source TypeScript modules.
const base=process.argv[2]??'http://127.0.0.1:3012';
const browser=await chromium.launch();
try{
    const page=await browser.newPage();await page.goto(base+'/');
    const result=await page.evaluate(async()=>{
        const [{AssetLoader},{EnvironmentLoader},{ConfluenceEnvironment},{compileLevel},{World},{MapRenderer},{EnemyRenderer},{NPCRenderer},{CharacterRenderer},{InteractableRenderer},{NarrativeSession},{SaveStore}]=await Promise.all([
            import('/src/game/AssetLoader.ts'),import('/src/environment/EnvironmentLoader.ts'),import('/src/environment/ConfluenceEnvironment.ts'),import('/src/levels/LevelCompiler.ts'),import('/src/game/World.ts'),import('/src/renderers/MapRenderer.ts'),import('/src/renderers/EnemyRenderer.ts'),import('/src/renderers/NPCRenderer.ts'),import('/src/renderers/CharacterRenderer.ts'),import('/src/renderers/InteractableRenderer.ts'),import('/src/narrative/NarrativeSession.ts'),import('/src/narrative/SaveStore.ts'),
        ]);
        const level=await fetch('/levels/last-platform-demo.json').then(r=>r.json());
        const [assets,images]=await Promise.all([new AssetLoader().load(),new EnvironmentLoader().load(level.id,new AbortController().signal)]);
        if(!images?.canopy || !images?.landmarkFrames || !images?.buildingWalls || !images?.buildingTrims || !images?.architecture || !images?.props || !images?.terrain || !images?.city)throw Error('Overview requires the current environment kit');
        const world=new World(compileLevel(level)),story=new NarrativeSession(level.id,new SaveStore(),true);story.enter();story.attach(world);
        for(let i=0;i<120;i++)world.update(1/120,{left:false,right:false,jump:false,fire:false});
        const canvas=document.createElement('canvas');canvas.width=level.width;canvas.height=level.height;
        const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
        c.drawImage(images.city,0,0,canvas.width,canvas.height);c.fillStyle='#07131c77';c.fillRect(0,0,canvas.width,canvas.height);
        Object.assign(world.camera,{x:0,y:0,width:level.width,height:level.height});
        const environment=new ConfluenceEnvironment(c,images);environment.drawScenery(world.camera,0,world.level);
        new MapRenderer(c,assets.wall,environment.terrain,environment.exit).draw(world.level,world.camera);
        const objects=new InteractableRenderer(c,environment.objects);world.interactables.forEach(o=>objects.draw(o));
        const npcs=new NPCRenderer(c,assets.npcs);world.npcs.forEach(n=>npcs.draw(n));
        const enemies=new EnemyRenderer(c,assets);world.enemies.forEach(e=>enemies.draw(e,world.elapsed,world.corpses));
        new CharacterRenderer(c,assets.hero,assets.heroAim).draw(world.player,world.elapsed);
        const details={};
        for(const [name,x,y] of [['arrival',0,480],['station-east',720,480],['roof',0,0],['lower-station',768,1152],['registry',5376,864],['registry-hall',5376,1248],['freight',3072,2016],['west-service',0,2112],['tenants',0,2784],['archive',5520,2400],['departure',6144,2880]]){
            const detail=document.createElement('canvas');detail.width=960;detail.height=576;
            const d=detail.getContext('2d');d.imageSmoothingEnabled=false;d.drawImage(canvas,x,y,960,576,0,0,960,576);
            details[name]=detail.toDataURL('image/png').split(',')[1];
        }
        return {overview:canvas.toDataURL('image/png').split(',')[1],details};
    });
    await mkdir('public/docs',{recursive:true});
    await writeFile('public/docs/last-platform-overview-v5.png',Buffer.from(result.overview,'base64'));
    await mkdir('artifacts/confluence-details',{recursive:true});
    for(const [name,data] of Object.entries(result.details))await writeFile('artifacts/confluence-details/'+name+'.png',Buffer.from(data,'base64'));
    console.log('Captured the implemented cyberundead level at 7200 × 3840 using its game renderers.');
}finally{await browser.close();}
