if(typeof document!='undefined'){
  const s=document.querySelector('#seed'),b=document.querySelector('#seedGo'),d=document.querySelector('#clearDialog'),n=document.querySelector('#next');
  b.addEventListener('pointerdown',()=>s.blur(),true);
  s.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&e.isComposing){
      e.stopImmediatePropagation();
      s.blur();
      setTimeout(()=>b.click());
    }
  },true);
  const p=()=>{if(n.textContent==='GO'&&d.classList.contains('show'))d.style.cssText='position:fixed;left:50%;top:50%;bottom:auto;right:auto;transform:translate(-50%,-50%);width:max-content;max-width:90vw;justify-content:center';else if(d.style.position==='fixed'&&d.style.width==='max-content')d.style.cssText=''};
  new MutationObserver(p).observe(d,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['class']});
  setTimeout(()=>{document.querySelector('.seedbar span').textContent='v0.5 Seed';p()});
}
