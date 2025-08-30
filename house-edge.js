// rtp.js
const PAYTABLE = {
  1: { 1: 3 },
  2: { 1: 1, 2: 9 },
  3: { 1: 1, 2: 2, 3: 16 },
  4: { 1: 0, 2: 2, 3: 6, 4: 12 },
  5: { 1: 0, 2: 1, 3: 3, 4: 15, 5: 50 },
  6: { 1: 0, 2: 0, 3: 2, 4: 3, 5: 30, 6: 75 },
  7: { 1: 0, 2: 0, 3: 1, 4: 6, 5: 12, 6: 36, 7: 100 },
  8: { 1: 0, 2: 0, 3: 1, 4: 3, 5: 6, 6: 19, 7: 90, 8: 720 },
  9: { 1: 0, 2: 0, 3: 1, 4: 2, 5: 4, 6: 8, 7: 20, 8: 80, 9: 1200 },
  10: { 1: 0, 2: 0, 3: 1, 4: 2, 5: 3, 6: 8, 7: 26, 8: 500, 9: 1500, 10: 10000 },
};

function logChoose(n,k){
  if(k<0||k>n) return -Infinity;
  k = Math.min(k, n-k);
  let s=0;
  for(let i=1;i<=k;i++){
    s += Math.log(n - (k - i)) - Math.log(i);
  }
  return s;
}
function probHits(k,h){
  if(h<0||h>k) return 0;
  if(h>20) return 0;
  if(20-h>80-k) return 0;
  const ln = logChoose(k,h)+logChoose(80-k,20-h)-logChoose(80,20);
  return Math.exp(ln);
}
for(let k=1;k<=10;k++){
  const table = PAYTABLE[k]||{};
  let rtp=0;
  for(const hs of Object.keys(table)){
    const h = Number(hs);
    const mult = table[h];
    rtp += mult * probHits(k,h);
  }
  console.log(`picks=${k} RTP=${(rtp*100).toFixed(2)}%  house_edge=${((1-rtp)*100).toFixed(2)}%`);
}