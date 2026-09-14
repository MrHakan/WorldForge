const assert=require('assert');
const charts=require('../../src/rendering/metric-charts.js');
assert.equal(charts.VERSION,'1.0.0');
assert.equal(typeof charts.render,'function');
assert.doesNotThrow(()=>charts.render({series:[],viewYear:0}));
console.log('native metric chart renderer contract OK');
