(function(){
  // myON 每日提醒：去 myON 读一本书 → 完成 AR 测试 → 回来点两下完成。
  const MYON_URL='https://www.myon.com/index.html',app=document.querySelector('#app'),esc=window.LearningApp.escape;
  const streakGoals=[[3,'🌱','连续3天'],[7,'🌳','连续一周'],[14,'🌈','连续两周'],[30,'🎆','连续一个月'],[60,'👑','连续两个月']];
  const wordGoals=[[10000,'📗','1万字'],[25000,'📘','2.5万字'],[50000,'📚','5万字'],[100000,'🏅','10万字'],[250000,'🥈','25万字'],[500000,'🥇','50万字'],[1000000,'👑','百万字大王']];
  const fmt=n=>n>=10000?(n/10000).toFixed(n%10000?1:0).replace(/\.0$/,'')+' 万':String(n);
  const dayNum=d=>Date.UTC(+d.slice(0,4),+d.slice(5,7)-1,+d.slice(8,10))/864e5;
  const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Hong_Kong'});
  const valid=d=>/^\d{4}-\d{2}-\d{2}$/.test(d);
  function store(){let state=window.LearningApp.read();state.myon||={};state.myon.days||={};state.myon.entries||=[];state.myon.words||=[];return state.myon}
  const words=()=>store().words.filter(x=>x&&valid(x.date)&&Number.isFinite(x.total)).sort((a,b)=>a.date.localeCompare(b.date)||a.at-b.at);
  const latest=()=>words().at(-1)?.total||0;
  const done=x=>!!(x&&x.read&&x.ar);
  function stats(){
    let days=store().days,list=Object.keys(days).filter(d=>valid(d)&&done(days[d])).map(dayNum).sort((a,b)=>a-b),best=0,run=0,prev=null;
    for(let d of list){run=prev!==null&&d-prev===1?run+1:1;best=Math.max(best,run);prev=d}
    let now=dayNum(today()),current=0;if(list.length&&now-list[list.length-1]<=1){current=1;for(let i=list.length-1;i>0&&list[i]-list[i-1]===1;i--)current++}
    return {total:list.length,best,current,todayDone:done(days[today()])};
  }
  function wordSection(){
    let list=words(),total=latest(),next=wordGoals.find(g=>total<g[0]),prevGoal=[...wordGoals].reverse().find(g=>total>=g[0]),now=dayNum(today()),base=[...list].reverse().find(x=>dayNum(x.date)<=now-7),gain=base?total-base.total:null;
    return `<section class="card myon-section myon-words"><h2>AR 总字数 · 阅读里程碑</h2>
      <div class="myon-word-total"><strong>${total.toLocaleString('en-US')}</strong><span>字</span>${gain!==null&&gain>0?`<em>近7天 +${gain.toLocaleString('en-US')}</em>`:''}</div>
      ${next?`<div class="progress myon-word-bar"><i style="width:${Math.min(100,(total-(prevGoal?.[0]||0))/(next[0]-(prevGoal?.[0]||0))*100)}%"></i></div><p class="hint">下一个里程碑「${next[1]} ${next[2]}」，还差 ${(next[0]-total).toLocaleString('en-US')} 字</p>`:'<p class="hint">全部里程碑达成，太厉害了！</p>'}
      <div class="myon-badges">${wordGoals.map(([n,icon,name])=>`<div class="myon-badge ${total>=n?'earned':''}"><span>${total>=n?icon:'🔒'}</span><small>${name}</small></div>`).join('')}</div>
      <form id="myon-word-form" class="myon-word-form"><label>更新 AR 总字数<input name="total" inputmode="numeric" pattern="[0-9,]*" placeholder="在 AR 里看到的总字数" autocomplete="off"></label><button class="primary">更新</button></form>
      <p id="myon-word-message" class="hint" role="status">${list.length?'上次更新：'+esc(list.at(-1).date):'在 AR 的阅读记录里找到「总字数 / Words Read」，填进来就行。'}</p>
    </section>`}
  function saveWords(e){e.preventDefault();let raw=String(new FormData(e.target).get('total')||'').replace(/[,，\s]/g,''),n=Number(raw),msg=document.querySelector('#myon-word-message'),old=latest(),before=wordGoals.filter(g=>old>=g[0]).length;
    if(!/^\d+$/.test(raw)||n<=0||n>100000000){msg.textContent='请输入 AR 里看到的总字数（只填数字）。';return}
    if(n<old&&!confirm('新数字比上次（'+old.toLocaleString('en-US')+'）小，确定要更新吗？'))return;
    let m=store(),d=today(),same=m.words.find(x=>x.date===d);if(same){same.total=n;same.at=Date.now()}else m.words.push({date:d,total:n,at:Date.now()});
    window.LearningApp.commit();page();let gained=wordGoals.filter(g=>n>=g[0]).slice(before);
    document.querySelector('#myon-word-message').textContent=gained.length?'🎉 解锁新里程碑：'+gained.map(g=>g[1]+' '+g[2]).join('、')+'！':'已更新为 '+n.toLocaleString('en-US')+' 字'+(old&&n>old?'，比上次多 '+(n-old).toLocaleString('en-US')+' 字':'')}
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
    ${wordSection()}
    <div class="stats"><div><strong>${s.current}</strong><span>天连续完成</span></div><div><strong>${s.best}</strong><span>天最长连续</span></div><div><strong>${s.total}</strong><span>天累计完成</span></div></div>
    <section class="card myon-section"><h2>最近 7 天</h2>${week()}</section>
    <section class="card myon-section"><h2>连续徽章</h2>${badges(streakGoals,s.best,'天')}</section>`;
    app.querySelector('#myon-word-form').onsubmit=saveWords;
    app.querySelectorAll('[data-myon-step]').forEach(b=>b.onclick=()=>{let m=store(),d=today(),x=m.days[d]||={};x[b.dataset.myonStep]=!x[b.dataset.myonStep];x.updatedAt=Date.now();window.LearningApp.commit();page()});
    refreshDot();
  }
  function merge(incoming){let m=store();
    for(let [d,x] of Object.entries(incoming?.days||{})){if(!valid(d)||!x||typeof x!=='object')continue;let mine=m.days[d]||={};mine.read=!!(mine.read||x.read);mine.ar=!!(mine.ar||x.ar);mine.updatedAt=Math.max(Number(mine.updatedAt)||0,Number(x.updatedAt)||0)}
    for(let x of incoming?.words||[])if(x&&valid(x.date)&&Number.isFinite(x.total)&&!m.words.some(y=>y.date===x.date&&y.total===x.total))m.words.push({date:x.date,total:x.total,at:Number(x.at)||0});
    let have=new Set(m.entries.map(x=>x.id));for(let x of incoming?.entries||[])if(x&&typeof x.id==='string'&&!have.has(x.id)){m.entries.push(x);have.add(x.id)}
    refreshDot()}
  const btn=document.createElement('button');btn.id='myon-nav';btn.textContent='myON 阅读';
  document.querySelector('#reading-nav').after(btn);btn.onclick=page;
  document.querySelector('header nav').addEventListener('click',e=>{let b=e.target.closest('button');if(b&&b!==btn)btn.classList.remove('active')},true);
  refreshDot();setInterval(refreshDot,60000);
  window.MyonReading={page,stats,merge};
})();
