// Current implementation schematic, derived from runtime geometry. No authoring or physics.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const level=JSON.parse(fs.readFileSync(path.join(root,'public/levels/last-platform-demo.json'),'utf8'));
const sx=x=>60+x/level.width*1480,sy=y=>110+y/level.height*768;
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const parts=['<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1070" viewBox="0 0 1600 1070"><rect width="1600" height="1070" fill="#090c10"/><g font-family="monospace" fill="#e0e6df">'];
const text=(x,y,s,size=12,color='#b1bebf')=>parts.push(`<text x="${x}" y="${y}" font-size="${size}" fill="${color}">${esc(s)}</text>`);
const rect=(r,fill,stroke)=>parts.push(`<rect x="${sx(r.x)}" y="${sy(r.y)}" width="${r.width/level.width*1480}" height="${r.height/level.height*768}" fill="${fill}" stroke="${stroke}"/>`);
text(60,38,'THE LAST PLATFORM / CYBERUNDEAD CONFLUENCE',24,'#e0e6df');
text(60,68,`Revision ${level.revision} · ${level.width} × ${level.height} · electronic infrastructure / undead city · source: Untitled.png`);
for(const y of [0,768,1536,2304,3072,3840]){parts.push(`<path d="M55 ${sy(y)}H1540" stroke="#1a232b"/>`);text(10,sy(y)+4,y,10);}
for(const r of level.terrain)rect(r,r.x>=4800&&r.y<1800?'#534659':r.y>=2496?'#244249':'#303c47','#607984');
for(const [name,x,y] of [['ROOF / LETTER',80,200],['ARRIVALS',80,640],['UPPER VIADUCT',2900,660],['LOWER STATION',80,1430],['REGISTRY GALLERY',4900,1030],['PUBLIC HALL',4900,1430],['FREIGHT EXCHANGE',3000,2200],['SERVICE ROOM',80,2400],['TENANTS’ BALCONY',80,2950],['ARCHIVE / INDEX',5780,2670],['DEPARTURE',6300,3170],['CANAL TOWPATH',3200,3530]])text(sx(x),sy(y),name,11,'#63dfeb');
const at=id=>{const r=level.terrain.find(r=>r.id===id);if(!r)throw Error(id);return [r.x+r.width/2,r.y-30];};
const stairs=(prefix,count,reverse=false)=>Array.from({length:count},(_,i)=>at(prefix+(reverse?count-1-i:i)));
const drawRoute=(points,color)=>parts.push(`<polyline points="${points.map(([x,y])=>`${sx(x)},${sy(y)}`).join(' ')}" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="5 4" opacity=".85"/>`);
drawRoute([[192,834],[1500,834],at('viaduct-west'),at('viaduct-hatch-west'),at('viaduct-hatch-east'),[3300,834],at('viaduct-east'),...stairs('registry-approach-',3),[6024,1218],...stairs('registry-east-stair-',3),at('registry-east-landing'),[4900,1602],...stairs('registry-public-',7),[4700,2370],...stairs('archive-descent-',4),[6224,2850],...stairs('departure-stair-',4),[6800,3330],[7080,3330]],'#ff52ab');
drawRoute([at('roof-stair-0'),...stairs('roof-stair-',5),[400,258],[900,834]],'#63dfeb');
drawRoute([[1200,3618],...stairs('canal-return-',12),[2200,2370],...stairs('station-service-',7,true),[2400,1602],...stairs('station-return-',7),[2800,834],at('viaduct-hatch-east'),at('viaduct-hatch-west'),[2200,834],[600,834]],'#edc383');
drawRoute([[1200,3138],...stairs('west-room-stair-',5,true),[1200,2562],at('west-service-landing'),at('canal-return-10')],'#63dfeb');
drawRoute([[5500,3618],at('canal-east-stair-0'),at('canal-east-stair-1'),[6780,3330]],'#edc383');
for(const e of level.enemies)parts.push(`<circle cx="${sx(e.x)}" cy="${sy(e.y)-7}" r="5" fill="#ff9591"/>`);
for(const item of level.interactables){rect(item,item.kind==='collect'?'#edc383':'#63dfeb','#d1e0db');text(sx(item.x)-10,sy(item.y)-12,item.kind==='collect'?'LETTER':item.kind==='operate'?'SHUTTER':item.id.includes('ledger')?'LEDGER':'INDEX',10);}
rect(level.exit,'#1a232b','#a8d6ab');text(sx(level.spawn.x)-12,sy(level.spawn.y)-18,'START',10,'#ff52ab');
text(sx(level.npcs[0].x)-24,sy(level.npcs[0].y)-22,'ATTENDANT',10,'#edc383');
text(60,922,'MAGENTA · Upper station → Registry → freight → archive → departure',13,'#ff52ab');
text(60,948,'CYAN · Roof Keepsake and inhabited western side loop',13,'#63dfeb');
text(60,974,'AMBER · Canal recovery and return through freight / lower station / maintenance hatch',13,'#edc383');
text(60,1010,'Solids and objects are from runtime JSON. Dashes show connections, not precise jump inputs.');
text(60,1038,'All water, cables, lifts and city traffic are scenery. Existing movement/combat and durable discoveries remain.');
parts.push('</g></svg>');const svg=parts.join('\n')+'\n';
for(const output of ['docs/The_Last_Platform_Demo_v0_1/Implemented_District_v0_5.svg','public/docs/last-platform-map.svg'])fs.writeFileSync(path.join(root,output),svg);
console.log('Rendered revision-5 cyberundead district map.');

