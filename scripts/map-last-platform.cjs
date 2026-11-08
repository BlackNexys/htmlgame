// Render the current JSON geometry. This diagram never authors collision or gameplay.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const level=JSON.parse(fs.readFileSync(path.join(root,'public/levels/last-platform-demo.json'),'utf8'));
const sx=x=>60+x/level.width*1480,sy=y=>110+y/level.height*440;
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const parts=['<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="740" viewBox="0 0 1600 740"><rect width="1600" height="740" fill="#090c10"/><g font-family="monospace" fill="#e0e6df">'];
const text=(x,y,s,size=12,color='#b1bebf')=>parts.push(`<text x="${x}" y="${y}" font-size="${size}" fill="${color}">${esc(s)}</text>`);
const rect=(r,fill,stroke)=>parts.push(`<rect x="${sx(r.x)}" y="${sy(r.y)}" width="${r.width/level.width*1480}" height="${r.height/level.height*440}" fill="${fill}" stroke="${stroke}"/>`);
text(60,38,'THE LAST PLATFORM / CONFLUENCE DISTRICT',24,'#e0e6df');
text(60,68,`Revision ${level.revision} · ${level.width} × ${level.height} · two Registry entrances · reversible archive · canal return`);
for(const y of [0,480,960,1440,1920,2496]){
    parts.push(`<path d="M55 ${sy(y)}H1540" stroke="#1a232b"/>`);text(10,sy(y)+4,y,10);
}
for(const [name,x,y] of [
    ['ARRIVALS',60,1580],['INHABITED FRONTAGE',1020,1260],['ROOFS / FREIGHT BRIDGE',2500,1070],
    ['OLD VIADUCT',3020,1580],['REGISTRY',5480,570],['CITY OVERLOOK',7042,640],
    ['PUBLIC STAIRS',4780,1470],['READING HALL',5530,1510],['LOWER RECORDS',5700,2000],
    ['ARCHIVE / INDEX',7240,1980],['DEPARTURE',8570,2020],['CANAL TOWPATH / RETURN',3060,2020],
])text(sx(x),sy(y),name,11,'#63dfeb');
for(const r of level.terrain)rect(r,r.x>=4992&&r.y<1632?'#6b6968':r.x>=6912?'#284247':'#303c47','#6d8186');
const at=id=>{const r=level.terrain.find(r=>r.id===id);if(!r)throw Error(id);return [r.x+r.width/2,r.y-36];};
const drawRoute=(points,color)=>parts.push(`<polyline points="${points.map(([x,y])=>`${sx(x)},${sy(y)}`).join(' ')}" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="5 4" opacity=".8"/>`);
drawRoute([[192,1980],[2320,1980],at('viaduct-west-landing'),...[0,1,2].map(i=>at('viaduct-approach-'+i)),[3900,1692],at('viaduct-east-balcony'),[4750,1692],...[0,1,2].map(i=>at('registry-public-stair-'+i)),[6600,1308],at('registry-east-stair-0'),at('registry-east-stair-1'),at('registry-gallery-east-landing'),[5544,1020],[6440,1020],at('registry-east-stair-1'),at('registry-east-stair-0'),at('archive-entry-landing'),...[0,1,2,3].map(i=>at('archive-descent-'+i)),[8184,1788],at('departure-stair-0'),at('departure-stair-1'),[9200,2076]],'#ff52ab');
drawRoute([at('frontage-stair-0'),at('frontage-stair-1'),at('frontage-stair-2'),[1320,1596],[1540,1596],at('roof-step-0'),at('roof-step-1'),[2190,1308],[4200,1308],at('freight-entry-step'),at('registry-service-step'),at('registry-service-landing'),[5544,1020]],'#63dfeb');
drawRoute([[8400,2076],[4800,2076],[2850,2076],[2420,2076],[2300,1980],[600,1980]],'#edc383');
drawRoute([[3650,2076],at('river-recovery-0'),at('river-recovery-1'),at('river-recovery-2'),at('viaduct-east-balcony')],'#edc383');
for(const e of level.enemies){parts.push(`<circle cx="${sx(e.x)}" cy="${sy(e.y)-7}" r="5" fill="#ff9591"/>`);}
for(const item of level.interactables){
    rect(item,item.kind==='collect'?'#edc383':'#63dfeb','#d1e0db');
    const label=item.kind==='collect'?'LETTER':item.kind==='operate'?'SHUTTER':item.id.includes('ledger')?'LEDGER':'INDEX';
    text(sx(item.x)-10,sy(item.y)-12,label,10,item.kind==='collect'?'#edc383':'#63dfeb');
}
rect(level.exit,'#1a232b','#a8d6ab');text(sx(level.exit.x)-4,sy(level.exit.y)-12,'EXIT',10,'#a8d6ab');
text(sx(level.spawn.x)-12,sy(level.spawn.y)-18,'START',10,'#ff52ab');
text(sx(level.npcs[0].x)-24,sy(level.npcs[0].y)-22,'ATTENDANT',10,'#edc383');
text(60,596,'MAGENTA · Public route to ledger, archive index and departure',13,'#ff52ab');
text(60,622,'CYAN · Balcony / freight shortcut to the same Registry gallery',13,'#63dfeb');
text(60,648,'AMBER · Lower return and missed-jump recovery (traversable in both directions)',13,'#edc383');
text(60,684,'Solids and objects come from the runtime JSON. Dashes illustrate connections; they are not a jump-input trace.');
text(60,710,'Draft demo. Existing movement / combat; discoveries persist immediately. The onward line is outside this demo.');
parts.push('</g></svg>');
const svg=parts.join('\n')+'\n';
for(const output of ['docs/The_Last_Platform_Demo_v0_1/Implemented_District_v0_4.svg','public/docs/last-platform-map.svg'])fs.writeFileSync(path.join(root,output),svg);
console.log('Rendered revision-4 district map from runtime geometry.');

