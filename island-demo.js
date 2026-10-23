if(window.QIQI_DEMO){
  if(!state.demoRabbitSeeded){
    const unique=words.filter((w,i,a)=>a.findIndex(x=>normalize(x.english)===normalize(w.english))===i);
    unique.slice(0,168).forEach(w=>state.mastered[w.id]={source:'review',date:new Date().toISOString()});
    state.reading||={};
    for(const r of window.READINGS||[])state.reading[r.id]={answers:r.questions.map(q=>q.answer),submitted:true,attempts:1,best:5,score:5,updatedAt:Date.now()-21*60000,lastSubmittedAt:Date.now()-21*60000};
    state.demoSeeded=true;state.demoRabbitSeeded=true;save();
  }
  for(const id of ['learn-nav','lists-nav','review-nav','reading-nav','mistakes-nav','reset-nav'])document.querySelector('#'+id).hidden=true;
  document.querySelector('#account-nav').textContent='返回正式学习';
  document.querySelector('#account-nav').onclick=()=>{location.href='./?v=20261024-reading-verdict'};
  openIsland(6);
}