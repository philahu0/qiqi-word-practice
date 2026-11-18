(function(){
  // ReadTheory 每日阅读：去 ReadTheory 完成 1 篇阅读测验 → 回来点一下完成。
  // 每周（周一到周日）有 2 个能量电池，可以补上最近 7 天里漏掉的一天，连续天数不断。
  // 奖励是 100 只小企鹅贴纸：每完成一天领 1 只；累计测验里程碑、连续天数里程碑各再送 2 只。企鹅可以摆到小岛上。
  const RT_URL='https://readtheory.org/auth/login',DAILY=1,BATTERIES=2,app=document.querySelector('#app'),esc=window.LearningApp.escape;
  const PENGUINS=100,BONUS=2;
  const streakGoals=[[3,'连续3天'],[7,'连续一周'],[14,'连续两周'],[30,'连续一个月'],[60,'连续两个月']];
  const quizGoals=[[10,'10篇'],[25,'25篇'],[50,'50篇'],[100,'100篇'],[200,'200篇'],[365,'365篇'],[500,'500篇']];
  const dayNum=d=>Date.UTC(+d.slice(0,4),+d.slice(5,7)-1,+d.slice(8,10))/864e5;
  const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Hong_Kong'});
  const valid=d=>/^\d{4}-\d{2}-\d{2}$/.test(d);
  function store(){let state=window.LearningApp.read();state.readtheory||={};state.readtheory.days||={};state.readtheory.quizzes||=[];return state.readtheory}
  const quizzes=()=>store().quizzes.filter(x=>x&&valid(x.date)&&Number.isFinite(x.total)).sort((a,b)=>a.date.localeCompare(b.date)||a.at-b.at);
  const latest=()=>quizzes().at(-1)?.total||0;
  const count=x=>Math.min(DAILY,Math.max(0,Math.floor(Number(x?.done)||0)));
  const done=x=>count(x)>=DAILY||!!x?.battery;
  const weekOf=d=>{let n=dayNum(d);return n-((new Date(n*864e5).getUTCDay()+6)%7)};
  const batteriesUsed=d=>{let w=weekOf(d),days=store().days;return Object.keys(days).filter(k=>valid(k)&&days[k]?.battery&&count(days[k])<DAILY&&weekOf(k)===w).length};
  const batteriesLeft=d=>Math.max(0,BATTERIES-batteriesUsed(d));
  function stats(){
    let days=store().days,list=Object.keys(days).filter(d=>valid(d)&&done(days[d])).map(dayNum).sort((a,b)=>a-b),best=0,run=0,prev=null;
    for(let d of list){run=prev!==null&&d-prev===1?run+1:1;best=Math.max(best,run);prev=d}
    let now=dayNum(today()),current=0;if(list.length&&now-list[list.length-1]<=1){current=1;for(let i=list.length-1;i>0&&list[i]-list[i-1]===1;i--)current++}
    return {total:list.length,best,current,todayDone:done(days[today()])};
  }
  const reached=(goals,v)=>goals.filter(g=>v>=g[0]).length;
  function penguinCount(){let s=stats();return Math.min(PENGUINS,s.total+BONUS*(reached(quizGoals,latest())+reached(streakGoals,s.best)))}
  const penguin=(i,label)=>`<span class="rt-penguin" role="img" aria-label="${esc(label||'小企鹅 No.'+(i+1))}" style="background-position:${(i%10)/9*100}% ${Math.floor(i/10)/9*100}%"></span>`;
  function goalRow(goals,value){return `<div class="rt-badges">${goals.map(([n,label])=>`<div class="rt-badge ${value>=n?'earned':''}"><span>${value>=n?'🐧':'🔒'}</span><small>${label}${value>=n?' · +'+BONUS:''}</small></div>`).join('')}</div><p class="hint">每达成一个里程碑，多送 ${BONUS} 只小企鹅。</p>`}
  function collection(){let n=penguinCount();return `<section class="card rt-section rt-collection"><h2>🐧 小企鹅收藏 · ${n} / ${PENGUINS}</h2><p class="hint">每完成一天 ReadTheory 领 1 只新企鹅，可以去小岛「布置装饰」里摆上。</p><div class="rt-penguins">${Array.from({length:n},(_,i)=>`<div class="rt-penguin-cell">${penguin(i)}<small>No.${i+1}</small></div>`).join('')}${n<PENGUINS?`<div class="rt-penguin-cell locked">${penguin(n,'下一只企鹅')}<small>下一只</small></div>`:''}</div></section>`}
  function quizSection(){
    let list=quizzes(),total=latest(),next=quizGoals.find(g=>total<g[0]),prevGoal=[...quizGoals].reverse().find(g=>total>=g[0]),now=dayNum(today()),base=[...list].reverse().find(x=>dayNum(x.date)<=now-7),gain=base?total-base.total:null;
    return `<section class="card rt-section"><h2>ReadTheory 累计测验 · 阅读里程碑</h2>
      <div class="rt-quiz-total"><strong>${total}</strong><span>篇</span>${gain!==null&&gain>0?`<em>近7天 +${gain}</em>`:''}</div>
      ${next?`<div class="progress rt-quiz-bar"><i style="width:${Math.min(100,(total-(prevGoal?.[0]||0))/(next[0]-(prevGoal?.[0]||0))*100)}%"></i></div><p class="hint">下一个里程碑「${next[1]}」再送 ${BONUS} 只企鹅，还差 ${next[0]-total} 篇</p>`:'<p class="hint">全部里程碑达成，太厉害了！</p>'}
      ${goalRow(quizGoals,total)}
      <form id="rt-quiz-form" class="rt-quiz-form"><label>更新累计完成的测验数<input name="total" inputmode="numeric" pattern="[0-9,]*" placeholder="在 ReadTheory 里看到的测验总数" autocomplete="off"></label><button class="primary">更新</button></form>
      <p id="rt-quiz-message" class="hint" role="status">${list.length?'上次更新：'+esc(list.at(-1).date):'在 ReadTheory 的个人进度里找到已完成的测验总数（Quizzes），填进来就行。'}</p>
    </section>`}
  function saveQuizzes(e){e.preventDefault();let raw=String(new FormData(e.target).get('total')||'').replace(/[,，\s]/g,''),n=Number(raw),msg=document.querySelector('#rt-quiz-message'),old=latest(),before=penguinCount();
    if(!/^\d+$/.test(raw)||n<=0||n>100000){msg.textContent='请输入 ReadTheory 里看到的测验总数（只填数字）。';return}
    if(n<old&&!confirm('新数字比上次（'+old+'）小，确定要更新吗？'))return;
    let m=store(),d=today(),same=m.quizzes.find(x=>x.date===d);if(same){same.total=n;same.at=Date.now()}else m.quizzes.push({date:d,total:n,at:Date.now()});
    window.LearningApp.commit();page();let gained=penguinCount()-before;
    document.querySelector('#rt-quiz-message').textContent=gained>0?'🎉 达成新里程碑！获得 '+gained+' 只小企鹅，快去小岛摆上吧':'已更新为 '+n+' 篇'+(old&&n>old?'，比上次多 '+(n-old)+' 篇':'')}
  function stickers(){return Array.from({length:penguinCount()},(_,i)=>({id:'rt-penguin-'+(i+1),kind:'readtheory',name:'小企鹅 No.'+(i+1),index:i}))}
  if(window.ReadingRewards){let RR=window.ReadingRewards,baseInventory=RR.inventory,baseSprite=RR.sprite,baseDisplay=RR.display;
    RR.inventory=()=>[...baseInventory(),...stickers()];
    RR.sprite=item=>item?.kind==='readtheory'?penguin(item.index,item.name):baseSprite(item);
    RR.display=item=>item?.kind==='readtheory'?RR.sprite(item):baseDisplay(item)}
  function week(){let days=store().days,now=dayNum(today());return `<div class="rt-week">${[6,5,4,3,2,1,0].map(n=>{let d=new Date((now-n)*864e5).toISOString().slice(0,10),x=days[d],c=count(x),w='日一二三四五六'[new Date(d+'T00:00:00Z').getUTCDay()],label=n?'周'+w:'今天';
      if(c>=DAILY)return `<div class="rt-day full"><small>${label}</small><span>⭐</span></div>`;
      if(x?.battery)return `<button class="rt-day battery" data-rt-battery="${d}" title="已用能量电池补打卡，点一下退回电池"><small>${label}</small><span>🔋</span></button>`;
      if(n&&batteriesLeft(d))return `<button class="rt-day can-fill" data-rt-battery="${d}" title="用一个能量电池补打卡"><small>${label}</small><span>🔋补</span></button>`;
      return `<div class="rt-day"><small>${label}</small><span>·</span></div>`}).join('')}</div>
    <p class="hint">🔋 本周能量电池还剩 ${batteriesLeft(today())} / ${BATTERIES} 个：漏掉的日子点「🔋补」就能补打卡，连续天数不会断；点 🔋 可以退回。</p>`}
  function setNav(){document.querySelectorAll('header nav button').forEach(b=>b.classList.toggle('active',b.id==='rt-nav'))}
  function refreshDot(){let ok=stats().todayDone;btn.classList.toggle('rt-due',!ok);btn.title=ok?'今天的 ReadTheory 已完成':'今天还没完成 ReadTheory 阅读测验'}
  function page(){
    window.LearningApp.leave();setNav();
    let s=stats(),c=count(store().days[today()]);
    app.innerHTML=`<div class="eyebrow">READTHEORY · 每日阅读</div><h1>ReadTheory 阅读</h1>
    <section class="card rt-today ${s.todayDone?'complete':''}">
      <h2>${s.todayDone?'🎉 今天的阅读任务完成啦！':'📖 今天的阅读任务：完成 '+DAILY+' 篇 ReadTheory 测验'}</h2>
      <div class="rt-go"><a class="button primary" href="${RT_URL}" target="_blank" rel="noopener">打开 ReadTheory ↗</a><span class="hint">在新窗口打开，用自己的账号登录；读完文章做完题，回来点一下</span></div>
      <ol class="rt-steps">${Array.from({length:DAILY},(_,i)=>`<li class="${c>i?'checked':''}"><div><strong>${DAILY>1?'第 '+(i+1)+' 篇':'今天的 1 篇'}</strong></div><button class="rt-check" data-rt-quiz="${i+1}" aria-pressed="${c>i}">${c>i?'✓ 做完了':'做完了，点这里'}</button></li>`).join('')}</ol>
      ${s.todayDone?'':'<p class="hint">做完就能点亮今天的星星 ⭐，再领 1 只新企鹅 🐧</p>'}
    </section>
    ${collection()}
    ${quizSection()}
    <div class="stats"><div><strong>${s.current}</strong><span>天连续完成</span></div><div><strong>${s.best}</strong><span>天最长连续</span></div><div><strong>${s.total}</strong><span>天累计完成</span></div></div>
    <section class="card rt-section"><h2>最近 7 天 · 能量电池</h2>${week()}</section>
    <section class="card rt-section"><h2>连续完成 · 里程碑</h2>${goalRow(streakGoals,s.best)}${(n=>n?`<div class="progress"><i style="width:${Math.min(100,s.best/n[0]*100)}%"></i></div><p class="hint">再连续 ${n[0]-s.best} 天达成「${n[1]}」，再送 ${BONUS} 只企鹅</p>`:'<p class="hint">连续里程碑全部达成！</p>')(streakGoals.find(g=>s.best<g[0]))}</section>`;
    app.querySelector('#rt-quiz-form').onsubmit=saveQuizzes;
    app.querySelectorAll('[data-rt-battery]').forEach(b=>b.onclick=()=>{let d=b.dataset.rtBattery;if(!valid(d)||d>=today())return;let m=store(),x=m.days[d]||={};if(x.battery)delete x.battery;else{if(count(x)>=DAILY||!batteriesLeft(d))return;x.battery=true}x.updatedAt=Date.now();window.LearningApp.commit();page()});
    app.querySelectorAll('[data-rt-quiz]').forEach(b=>b.onclick=()=>{let m=store(),x=m.days[today()]||={},had=penguinCount(),i=Number(b.dataset.rtQuiz);x.done=count(x)>=i?i-1:i;x.updatedAt=Date.now();window.LearningApp.commit();page();let got=penguinCount()-had;if(got>0){let h=app.querySelector('.rt-today h2');h.textContent+=' 获得 '+got+' 只新企鹅 🐧'}});
    refreshDot();
  }
  function merge(incoming){let m=store();
    for(let [d,x] of Object.entries(incoming?.days||{})){if(!valid(d)||!x||typeof x!=='object')continue;let mine=m.days[d]||={};mine.done=Math.max(count(mine),count(x));if(x.battery)mine.battery=true;mine.updatedAt=Math.max(Number(mine.updatedAt)||0,Number(x.updatedAt)||0)}
    for(let x of incoming?.quizzes||[])if(x&&valid(x.date)&&Number.isFinite(x.total)&&!m.quizzes.some(y=>y.date===x.date&&y.total===x.total))m.quizzes.push({date:x.date,total:x.total,at:Number(x.at)||0});
    refreshDot()}
  const btn=document.createElement('button');btn.id='rt-nav';btn.textContent='ReadTheory';
  document.querySelector('#reading-nav').after(btn);btn.onclick=page;
  document.querySelector('header nav').addEventListener('click',e=>{let b=e.target.closest('button');if(b&&b!==btn)btn.classList.remove('active')},true);
  refreshDot();setInterval(refreshDot,60000);
  window.ReadTheoryPractice={page,stats,merge};
})();
