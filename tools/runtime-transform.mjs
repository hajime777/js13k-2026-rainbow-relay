export function integrateRuntime(h){
  const r=[
    ["nextBtn=document.querySelector('#next'),seedInput=document.querySelector('#seed')","nextBtn=document.querySelector('#next'),seedGo=document.querySelector('#seedGo'),seedInput=document.querySelector('#seed')"],
    ["nextBtn.style.display='';clearDialog.classList.add('show')}}if(sectionClearT)","nextBtn.style.display='';clearDialog.style.cssText='position:fixed;left:50%;top:50%;bottom:auto;right:auto;transform:translate(-50%,-50%);width:max-content;max-width:90vw;justify-content:center';clearDialog.classList.add('show')}}if(sectionClearT)"],
    ["if(ready){ready=0;running=1;c.style.cursor='none';nextBtn.textContent='OK';clearText.textContent='もっと先にいるよ！';clearDialog.classList.remove('show')}","if(ready){ready=0;running=1;c.style.cursor='none';nextBtn.textContent='OK';clearText.textContent='もっと先にいるよ！';clearDialog.style.cssText='';clearDialog.classList.remove('show')}"],
    ["document.querySelector('#seedGo').onclick=()=>applySeed(seedInput.value);seedInput.addEventListener('keydown',e=>{if(e.key==='Enter')applySeed(seedInput.value)})","seedGo.addEventListener('pointerdown',()=>seedInput.blur(),true);seedGo.onclick=()=>applySeed(seedInput.value);seedInput.addEventListener('keydown',e=>{if(e.key==='Enter'){if(e.isComposing){e.stopImmediatePropagation();seedInput.blur();setTimeout(()=>seedGo.click());return}applySeed(seedInput.value)}})"],
    ["'v0.3 Seed'","'v0.5 Seed'"]
  ];
  for(const [a,b] of r){const n=h.replace(a,b);if(n===h)throw Error('runtime transform target missing');h=n}
  return h;
}
