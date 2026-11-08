export function parseTerrainBaselines(value:unknown):number[]{
    const data=value as {version?:unknown;baselines?:unknown};
    if(data?.version!==1 || !Array.isArray(data.baselines) || data.baselines.length!==16 || data.baselines.some((n,i)=>!Number.isInteger(n)||n<0||n>16||i%4===3&&n!==0))throw Error('Invalid terrain baselines');
    return [...data.baselines];
}
