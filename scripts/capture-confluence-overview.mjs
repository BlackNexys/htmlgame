import {writeFile,mkdir} from 'node:fs/promises';
import {chromium} from '@playwright/test';

// Authoring artifact: draw the actual level, assets and existing renderers at world scale.
// Requires the Vite development server, since it imports the source TypeScript modules.
const base=process.argv[2]??'http://127.0.0.1:3012';
const selector=process.argv[3]??'last-platform-demo';
const levelId=({rebuild:'last-platform-rebuild',construction:'construction-study'})[selector]??selector;
if(!/^[a-z][a-z0-9-]{0,79}$/.test(levelId))throw Error('Invalid level ID');
const focusIds=(process.argv[4]??'').split(',').filter(Boolean);
const rebuild=levelId==='last-platform-rebuild',construction=levelId==='construction-study';
const standard=rebuild||construction||levelId==='last-platform-demo';
const browser=await chromium.launch();
try{
    const page=await browser.newPage();await page.goto(base+'/');
    const result=await page.evaluate(async({rebuild,construction,levelId,focusIds,standard})=>{
        const [{AssetLoader},{EnvironmentLoader},{ConfluenceEnvironment},{compileLevel},{World},{MapRenderer},{EnemyRenderer},{NPCRenderer},{CharacterRenderer},{InteractableRenderer},{NarrativeSession},{SaveStore}]=await Promise.all([
            import('/src/game/AssetLoader.ts'),import('/src/environment/EnvironmentLoader.ts'),import('/src/environment/ConfluenceEnvironment.ts'),import('/src/levels/LevelCompiler.ts'),import('/src/game/World.ts'),import('/src/renderers/MapRenderer.ts'),import('/src/renderers/EnemyRenderer.ts'),import('/src/renderers/NPCRenderer.ts'),import('/src/renderers/CharacterRenderer.ts'),import('/src/renderers/InteractableRenderer.ts'),import('/src/narrative/NarrativeSession.ts'),import('/src/narrative/SaveStore.ts'),
        ]);
        const level=await fetch(`/levels/${levelId}.json`).then(r=>r.json());
        const [assets,images]=await Promise.all([new AssetLoader().load(),new EnvironmentLoader().load(level.presentation,new AbortController().signal,!!level.water?.length,level.props?.map(p=>p.asset))]);
        if(!images?.canopy || !images?.landmarkFrames || !images?.buildingWalls || !images?.buildingTrims || !images?.architecture || !images?.props || !images?.terrain || !images?.city)throw Error('Overview requires the current environment kit');
        const world=new World(compileLevel(level)),story=new NarrativeSession(level.id,new SaveStore(),true);story.enter();story.attach(world);
        for(let i=0;i<120;i++)world.update(1/120,{left:false,right:false,jump:false,fire:false});
        const canvas=document.createElement('canvas');canvas.width=level.width;canvas.height=level.height;
        const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
        // A whole-world overview has no single gameplay parallax camera. Fit uniformly
        // and repeat the city instead of stretching its towers across the full level.
        const skyWidth=images.city.naturalWidth*canvas.height/images.city.naturalHeight;
        for(let x=0,index=0;x<canvas.width;x+=skyWidth,index++){
            c.save();c.translate(x+(index%2?skyWidth:0),0);if(index%2)c.scale(-1,1);
            c.drawImage(images.city,0,0,skyWidth,canvas.height);c.restore();
        }
        c.fillStyle='#07131c77';c.fillRect(0,0,canvas.width,canvas.height);
        Object.assign(world.camera,{x:0,y:0,width:level.width,height:level.height});
        const environment=new ConfluenceEnvironment(c,images);environment.drawScenery(world.camera,0,world.level);
        const {PropRenderer}=await import('/src/world/props/PropRenderer.ts');const props=new PropRenderer(c,images);
        world.level.props.filter(p=>p.definition.layer!=='foreground').forEach(p=>props.draw(p.definition.asset,p,p.definition));
        const {WaterRenderer}=await import('/src/renderers/water/WaterRenderer.ts');new WaterRenderer(c,images).draw(world.level.water,world.camera,0);
        const mapRenderer=new MapRenderer(c,assets.wall,environment.terrain,environment.exit,images);mapRenderer.draw(world.level,world.camera);
        const objects=new InteractableRenderer(c,props);world.interactables.forEach(o=>objects.draw(o));
        const npcs=new NPCRenderer(c,assets.npcs);world.npcs.forEach(n=>npcs.draw(n));
        const enemies=new EnemyRenderer(c,assets);world.enemies.forEach(e=>enemies.draw(e,world.elapsed,world.corpses));
        new CharacterRenderer(c,assets.hero,assets.heroAim).draw(world.player,world.elapsed);
        mapRenderer.drawForeground(world.level,world.camera);
        world.level.props.filter(p=>p.definition.layer==='foreground').forEach(p=>props.draw(p.definition.asset,p,p.definition));
        const details={};
        const focus=(name,id)=>{
            const part=world.level.structures.find(s=>s.id===id)??world.level.water.get(id)??world.interactables.find(o=>o.id===id);
            if(!part)throw Error(`Missing capture anchor ${id}`);
            return [name,Math.max(0,Math.min(level.width-960,Math.round(part.x+part.width/2-480))),Math.max(0,Math.min(level.height-576,Math.round(part.y-384)))];
        };
        const crops=focusIds.length?focusIds.map(id=>focus(id,id)):!standard?level.terrain.filter(r=>r.width>=512).slice(0,16).map(r=>focus(r.id,r.id)):construction?[focus('thin-platforms','thin-ledge'),focus('doorway','open-doorway')]:rebuild?[
            focus('arrival','arrivals'),focus('station-drain','station-drain-west'),focus('split','concourse'),focus('roof','roof-letter'),focus('viaduct','viaduct-middle'),focus('recovery','catch-route'),focus('freight','freight'),focus('freight-water','freight-basin'),focus('registry','registry'),focus('archive','archive'),focus('departure','departure'),focus('river','soul-river'),
        ]:[focus('arrival','arrival-concourse'),focus('station-east','station-return-5'),focus('roof','station-roof'),focus('lower-station','station-lower-hall'),focus('registry','registry-transfer-ledger'),focus('registry-hall','registry-hall'),focus('freight','freight-hall'),focus('west-service','west-service-room'),focus('tenants','west-tenants-balcony'),focus('archive','archive-route-index'),focus('departure','departure-shutter')];
        for(const [name,x,y] of crops){
            const detail=document.createElement('canvas');detail.width=960;detail.height=576;
            const d=detail.getContext('2d');d.imageSmoothingEnabled=false;d.drawImage(canvas,x,y,960,576,0,0,960,576);
            details[name]=detail.toDataURL('image/png').split(',')[1];
        }
        return {overview:canvas.toDataURL('image/png').split(',')[1],details};
    },{rebuild,construction,levelId,focusIds,standard});
    await mkdir('public/docs',{recursive:true});
    await writeFile(standard?`public/docs/last-platform-overview-${construction?'construction':rebuild?'rebuild':'v5'}.png`:`public/docs/${levelId}-overview.png`,Buffer.from(result.overview,'base64'));
    const directory=standard?`artifacts/confluence-${construction?'construction':rebuild?'rebuild':'details'}`:`artifacts/level-${levelId}`;
    await mkdir(directory,{recursive:true});
    for(const [name,data] of Object.entries(result.details))await writeFile(directory+'/'+name+'.png',Buffer.from(data,'base64'));
    console.log('Captured the implemented level using its game renderers.');
}finally{await browser.close();}
