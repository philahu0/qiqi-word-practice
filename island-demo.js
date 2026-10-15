if(window.QIQI_DEMO){
  if(!state.demoSeeded){
    const unique=words.filter((w,i,a)=>a.findIndex(x=>normalize(x.english)===normalize(w.english))===i);
    unique.slice(0,84).forEach(w=>state.mastered[w.id]={source:'review',date:new Date().toISOString()});
    state.reading||={};
    for(const r of window.READINGS||[])state.reading[r.id]={answers:r.questions.map(q=>q.answer),submitted:true,attempts:1,best:5,score:5,updatedAt:Date.now()-21*60000,lastSubmittedAt:Date.now()-21*60000};
    state.demoSeeded=true;save();
  }
  for(const id of ['lists-nav','review-nav','reading-nav','mistakes-nav','reset-nav'])document.querySelector('#'+id).hidden=true;
  document.querySelector('#account-nav').textContent='返回正式学习';
  document.querySelector('#account-nav').onclick=()=>{location.href='./?v=20261015-reading-adventure'};
  openIsland(0);
}