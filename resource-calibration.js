(function(root){
'use strict';
const R=root.WorldForgeResources;if(!R||R.__calibrated18)return;R.__calibrated18=true;
// Production and consumption use abstract annual cargo-lot units. These values keep a
// normally productive settlement near food balance while preserving severe failures
// from drought, war, isolation and transport collapse.
const demand={grain:.00027,rice:.00015,fish:.000115,livestock:.000072,wine:.00003,timber:.00013,iron:.000055,copper:.000038,salt:.00007,coal:.000065};
for(const c of R.COMMODITIES)if(demand[c.id]!=null)c.demand=demand[c.id];
R.BALANCE_VERSION='1.8.1';
})(typeof window!=='undefined'?window:globalThis);