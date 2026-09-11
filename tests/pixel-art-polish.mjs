import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

global.window=global;
for(const f of ['structure-archetypes.js','pixel-structure-renderer.js','pixel-art-polish.js']){
  vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f});
}

const A=global.WorldForgeStructureArchetypes;
const R=global.WorldForgePixelRenderer;
const P=global.WorldForgePixelPolish;
assert.ok(A&&R&&P,'pixel polish dependencies must load');
assert.equal(P.VERSION,'4.1.1','pixel polish version must be v4.1.1');
assert.equal(R.POLISH_VERSION,'4.1.1','renderer must expose applied polish version');

const fallbackCases=[
  ['merchant_house','northern','gable_house'],
  ['house','coastal','stucco_house'],
  ['merchant_house','frontier','trading_post'],
  ['barracks','frontier','stockade_barracks'],
  ['merchant_house','steppe','caravan_house']
];
for(const [type,culture,variant] of fallbackCases){
  assert.equal(A.resolveVariant(type,culture),variant,`${culture}:${type} must resolve to ${variant}`);
  const profile={cultureStyle:culture,biomeStyle:'temperate',flags:{},previewSeed:`POLISH-${culture}`};
  const glyph=R.structureGlyph(type,20,20,3,R.palette(profile),profile.previewSeed,1,profile);
  assert.ok(glyph.includes(`data-variant="${variant}"`),`${variant} variant marker must survive rendering`);
  assert.ok(glyph.includes(`data-polish-detail="${variant}"`),`${variant} must receive a dedicated polish layer instead of generic fallback only`);
}

const profile={
  name:'Pixel Polish Fixture',
  previewSeed:'PIXEL-POLISH-FIXTURE',
  cultureStyle:'northern',
  biomeStyle:'forest',
  settlementType:'trade_town',
  flags:{coastal:false,river:false,fortified:false},
  architectureStyle:A.architecture('northern','forest',{}),
  condition:1,
  districts:[{id:'market-1',kind:'market',x:.5,y:.55,condition:1,structures:[{type:'merchant_house',count:6},{type:'house',count:4}]}],
  landmarks:[]
};
const svg=R.renderSettlement(profile,{width:640,height:400});
assert.ok(svg.includes('data-worldforge-polish="4.1.1"'),'settlement SVG must advertise the v4.1.1 polish layer');
assert.ok(svg.includes('data-polish-detail="gable_house"'),'settlement render must include culture-specific polished structure details');
assert.equal(R.renderSettlement(profile,{width:640,height:400}),svg,'polished settlement rendering must remain deterministic');
assert.equal(R.fingerprint(profile),R.fingerprint(profile),'polished renderer fingerprint must remain deterministic');

const coastal={...profile,cultureStyle:'coastal',biomeStyle:'temperate',previewSeed:'PIXEL-POLISH-COASTAL',architectureStyle:A.architecture('coastal','temperate',{}),districts:[{id:'residential-1',kind:'residential',x:.5,y:.55,condition:1,structures:[{type:'house',count:6}]}]};
const coastalSvg=R.renderSettlement(coastal,{width:640,height:400});
assert.notEqual(svg,coastalSvg,'culture-specific polish must create visibly distinct deterministic SVG output');
assert.ok(coastalSvg.includes('data-polish-detail="stucco_house"'),'coastal houses must expose stucco-house polish details');

console.log('WorldForge v4.1.1 Pixel Art Diversity regression tests passed.');
console.log(JSON.stringify({version:P.VERSION,enhancedVariants:P.ENHANCED_VARIANTS.size,northernFingerprint:R.fingerprint(profile),coastalFingerprint:R.fingerprint(coastal)}));
