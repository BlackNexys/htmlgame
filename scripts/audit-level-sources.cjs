require('tsx/cjs');
const fs=require('node:fs'),path=require('node:path');
const {LevelSource}=require('../src/levels/source/LevelSource.ts');
const directory=path.resolve(__dirname,'../src/content/levels');
const files=fs.readdirSync(directory);
const names=files.filter(n=>n.endsWith('.level.ts')).sort();
for(const companion of files.filter(n=>n.endsWith('.layout.ts')))if(!files.includes(companion.replace(/\.layout\.ts$/,'.level.ts')))throw Error(`${companion}: no matching level source`);
for(const name of names){
    let source=require(path.join(directory,name)).default;
    const companion=path.join(directory,name.replace(/\.level\.ts$/,'.layout.ts'));
    if(fs.existsSync(companion))source=source.withLayout(require(companion).default);
    if(!(source instanceof LevelSource)||source.id!==name.slice(0,-9))throw Error(`${name}: default export must match the filename ID`);
    const a=source.document(),b=source.document();
    if(JSON.stringify(a)!==JSON.stringify(b))throw Error(`${name}: source builds must be deterministic`);
    source.compile();console.log(`${source.id}: valid source and compiled scene`);
}
console.log(`${names.length} authored level modules. ${names.length?'Compilation is not a traversal or balance test.':'Empty content is intentional after the reset.'}`);
