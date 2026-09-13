if(typeof document!='undefined'){
  const s=document.querySelector('#seed'),b=document.querySelector('#seedGo');
  b.addEventListener('pointerdown',()=>s.blur(),true);
  s.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&e.isComposing){
      e.stopImmediatePropagation();
      s.blur();
      setTimeout(()=>b.click());
    }
  },true);
  setTimeout(()=>document.querySelector('.seedbar span').textContent='v0.4 Seed');
}
