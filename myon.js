(function(){
  // myON 每日提醒：去 myON 读一本书 → 完成 AR 测试 → 回来点两下完成。
  const MYON_URL='https://www.myon.com/index.html',app=document.querySelector('#app'),esc=window.LearningApp.escape;
  const streakGoals=[[3,'🌱','连续3天'],[7,'🌳','连续一周'],[14,'🌈','连续两周'],[30,'🎆','连续一个月'],[60,'👑','连续两个月']];
  const totalGoals=[[1,'📗','第一天'],[10,'📚','完成10天'],[30,'🏅','完成30天'],[100,'🏆','完成100天']];
  const dayNum=d=>Date.UTC(+d.slice(0,4),+d.slice(5,7)-1,+d.slice(8,10))/864e5;
  const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Hong_Kong'});
  const valid=d=>/^\d{4}-\d{2}-\d{2}$/.test(d);
  function store(){let state=window.LearningApp.read();state.myon||={};state.myon.days||={};state.myon.entries||=[];return state.myon}
  const done=x=>!!(x&&x.read&&x.ar);
  function stats(){
    let days=store().days,list=Object.keys(days).filter(d=>valid(d)&&done(days[d])).map(dayNum).sort((a,b)=>a-b),best=0,run=0,prev=null;
    for(let d of list){run=prev!==null&&d-prev===1?run+1:1;best=Math.max(best,run);prev=d}
    let now=dayNum(today()),current=0;if(list.length&&now-list[list.length-1]<=1){current=1;for(let i=list.length-1;i>0&&list[i]-list[i-1]===1;i--)current++}
    return {total:list.length,best,current,todayDone:done(days[today()])};
  }
  function badges(goals,value,unit){let next=goals.find(g=>value<g[0]);return `<div class="myon-badges">${goals.map(([n,icon,name])=>`<div class="myon-badge ${value>=n?'earned':''}"><span>${value>=n?icon:'🔒'}</span><small>${name}</small></div>`).join('')}</div>${next?`<div class="progress"><i style="width:${Math.min(100,value/next[0]*100)}%"></i></div><p class="hint">距离「${next[2]}」还差 ${next[0]-value} ${unit}</p>`:'<p class="hint">这一组徽章全部点亮！</p>'}`}
  function week(){let days=store().days,now=dayNum(today());return `<div class="myon-week">${[6,5,4,3,2,1,0].map(n=>{let d=new Date((now-n)*864e5).toISOString().slice(0,10),x=days[d],w='日一二三四五六'[new Date(d+'T00:00:00Z').getUTCDay()];return `<div class="myon-day ${done(x)?'full':x&&(x.read||x.ar)?'half':''}"><small>${n?'周'+w:'今天'}</small><span>${done(x)?'⭐':x&&(x.read||x.ar)?'½':'·'}</span></div>`}).join('')}</div>`}
  function setNav(){document.querySelectorAll('header nav button').forEach(b=>b.classList.toggle('active',b.id==='myon-nav'))}
  function refreshDot(){btn.classList.toggle('myon-due',!stats().todayDone);btn.title=stats().todayDone?'今天的 myON 阅读已完成':'今天还没完成 myON 阅读和 AR 测试'}
  function page(){
    window.LearningApp.leave();setNav();
    let s=stats(),t=store().days[today()]||{};
    app.innerHTML=`<div class="eyebrow">MYON · 每日阅读</div><h1>myON 阅读</h1>
    <section class="card myon-today ${s.todayDone?'complete':''}">
      <h2>${s.todayDone?'🎉 今天的阅读任务完成啦！':'📖 今天的阅读任务'}</h2>
      <ol class="myon-steps">
        <li class="${t.read?'checked':''}"><div><strong>第 1 步：去 myON 读完一本书</strong><a class="button primary" href="${MYON_URL}" target="_blank" rel="noopener">打开 myON ↗</a></div><button class="myon-check" data-myon-step="read" aria-pressed="${!!t.read}">${t.read?'✓ 读完了':'读完了，点这里'}</button></li>
        <li class="${t.ar?'checked':''}"><div><strong>第 2 步：完成这本书的 AR 测试</strong><span class="hint">在学校的 Renaissance / AR 里做测试</span></div><button class="myon-check" data-myon-step="ar" aria-pressed="${!!t.ar}">${t.ar?'✓ 测完了':'测完了，点这里'}</button></li>
      </ol>
      ${s.todayDone?'':'<p class="hint">两步都完成，今天就能点亮一颗星 ⭐</p>'}
    </section>
    <div class="stats"><div><strong>${s.current}</strong><span>天连续完成</span></div><div><strong>${s.best}</strong><span>天最长连续</span></div><div><strong>${s.total}</strong><span>天累计完成</span></div></div>
    <section class="card myon-section"><h2>最近 7 天</h2>${week()}</section>
    <section class="card myon-section"><h2>连续徽章</h2>${badges(streakGoals,s.best,'天')}</section>
    <section class="card myon-section"><h2>累计徽章</h2>${badges(totalGoals,s.total,'天')}</section>`;
    app.querySelectorAll('[data-myon-step]').forEach(b=>b.onclick=()=>{let m=store(),d=today(),x=m.days[d]||={};x[b.dataset.myonStep]=!x[b.dataset.myonStep];x.updatedAt=Date.now();window.LearningApp.commit();page()});
    refreshDot();
  }
  function merge(incoming){let m=store();
    for(let [d,x] of Object.entries(incoming?.days||{})){if(!valid(d)||!x||typeof x!=='object')continue;let mine=m.days[d]||={};mine.read=!!(mine.read||x.read);mine.ar=!!(mine.ar||x.ar);mine.updatedAt=Math.max(Number(mine.updatedAt)||0,Number(x.updatedAt)||0)}
    let have=new Set(m.entries.map(x=>x.id));for(let x of incoming?.entries||[])if(x&&typeof x.id==='string'&&!have.has(x.id)){m.entries.push(x);have.add(x.id)}
    refreshDot()}
  const btn=document.createElement('button');btn.id='myon-nav';btn.textContent='myON 阅读';
  document.querySelector('#reading-nav').after(btn);btn.onclick=page;
  document.querySelector('header nav').addEventListener('click',e=>{let b=e.target.closest('button');if(b&&b!==btn)btn.classList.remove('active')},true);
  refreshDot();setInterval(refreshDot,60000);
  window.MyonReading={page,stats,merge};
})();
