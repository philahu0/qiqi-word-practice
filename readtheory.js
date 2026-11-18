(function(){
  // ReadTheory 每日阅读：去 ReadTheory 完成测验 → 回来输入最新的 Knowledge Points，比上次多才算今天完成。
  // 每周（周一到周日）有 2 个能量电池，可以补上最近 7 天里漏掉的一天，连续天数不断。
  // 奖励是 99 只小企鹅贴纸：每完成一天领 1 只；连续天数里程碑各再送 2 只。企鹅可以摆到小岛上。
  const RT_URL='https://readtheory.org/auth/login',DAILY=1,BATTERIES=2,app=document.querySelector('#app'),esc=window.LearningApp.escape;
  const PENGUINS=99,BONUS=2;
  const streakGoals=[[3,'连续3天'],[7,'连续一周'],[14,'连续两周'],[30,'连续一个月'],[60,'连续两个月']];
  const dayNum=d=>Date.UTC(+d.slice(0,4),+d.slice(5,7)-1,+d.slice(8,10))/864e5;
  const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Hong_Kong'});
  const valid=d=>/^\d{4}-\d{2}-\d{2}$/.test(d);
  function store(){let state=window.LearningApp.read();state.readtheory||={};state.readtheory.days||={};state.readtheory.lexile||=[];state.readtheory.quizzes||=[];return state.readtheory}
  // 之前记录过的最大 Knowledge Points（不含 before 当天及之后）
  const kpBefore=before=>Math.max(0,...Object.entries(store().days).filter(([d,x])=>valid(d)&&d<before&&Number.isFinite(x?.kp)).map(([,x])=>x.kp));
  const lastKpBefore=before=>{let e=Object.entries(store().days).filter(([d,x])=>valid(d)&&d<before&&Number.isFinite(x?.kp)).sort((a,b)=>b[0].localeCompare(a[0]))[0];return e?{date:e[0],kp:e[1].kp}:null};
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
  function penguinCount(){let s=stats();return Math.min(PENGUINS,s.total+BONUS*reached(streakGoals,s.best))}
  const penguin=(i,label)=>`<span class="rt-penguin" role="img" aria-label="${esc(label||'小企鹅 No.'+(i+1))}" style="background-position:${(i%10)/9*100}% ${Math.floor(i/10)/9*100}%"></span>`;
  function goalRow(goals,value){return `<div class="rt-badges">${goals.map(([n,label])=>`<div class="rt-badge ${value>=n?'earned':''}"><span>${value>=n?'🐧':'🔒'}</span><small>${label}${value>=n?' · +'+BONUS:''}</small></div>`).join('')}</div><p class="hint">每达成一个里程碑，多送 ${BONUS} 只小企鹅。</p>`}
  function collection(){let n=penguinCount();return `<section class="card rt-section rt-collection"><h2>🐧 小企鹅收藏 · ${n} / ${PENGUINS}</h2><p class="hint">每完成一天 ReadTheory 领 1 只新企鹅，可以去小岛「布置装饰」里摆上。</p><div class="rt-penguins">${Array.from({length:n},(_,i)=>`<div class="rt-penguin-cell">${penguin(i)}<small>No.${i+1}</small></div>`).join('')}${n<PENGUINS?`<div class="rt-penguin-cell locked">${penguin(n,'下一只企鹅')}<small>下一只</small></div>`:''}</div></section>`}
  // 蓝思值登山：山脚 0L（BR），山顶 1400L；输入蓝思值后企鹅爬到对应位置
  const LEX_MAX=1400,LEX_STEP=200,TRAIL=[[60,282],[175,258],[105,224],[205,196],[140,164],[228,138],[178,106],[236,78],[250,44]];
  const lexList=()=>store().lexile.filter(x=>x&&valid(x.date)&&Number.isFinite(x.value)).sort((a,b)=>a.date.localeCompare(b.date)||a.at-b.at);
  function trailPoint(v){let segs=[],total=0;for(let i=1;i<TRAIL.length;i++){let [x0,y0]=TRAIL[i-1],[x1,y1]=TRAIL[i],l=Math.hypot(x1-x0,y1-y0);segs.push([x0,y0,x1,y1,l]);total+=l}
    let d=Math.max(0,Math.min(1,v/LEX_MAX))*total;for(let [x0,y0,x1,y1,l] of segs){if(d<=l){let t=l?d/l:0;return [x0+(x1-x0)*t,y0+(y1-y0)*t]}d-=l}return TRAIL.at(-1)}
  function lexileSection(){
    let list=lexList(),cur=list.at(-1)?.value,first=list[0]?.value,[px,py]=trailPoint(cur||0),next=cur==null?LEX_STEP:Math.min(LEX_MAX,(Math.floor(cur/LEX_STEP)+1)*LEX_STEP);
    let flags=[];for(let v=LEX_STEP;v<=LEX_MAX;v+=LEX_STEP){let [x,y]=trailPoint(v),got=cur!=null&&cur>=v;flags.push(`<g><path d="M${x} ${y}V${y-16}" stroke="#3b2a1e" stroke-width="2"/><path d="M${x} ${y-16}l13 4-13 4z" fill="${got?'#ff6b6b':'#fff'}" stroke="#3b2a1e" stroke-width="1.6" stroke-linejoin="round"/><text x="${x+(x>200?-6:6)}" y="${y+12}" text-anchor="${x>200?'end':'start'}" font-size="11" font-weight="700" paint-order="stroke" stroke="#fff" stroke-width="3" fill="${got?'#c2410c':'#5b6b7a'}">${v}L</text></g>`)}
    return `<section class="card rt-section rt-mountain"><h2>🏔️ 蓝思值登山</h2>
      <div class="rt-mtn"><svg viewBox="0 -34 400 334" role="img" aria-label="蓝思值登山图，目前 ${cur==null?'未记录':cur+'L'}">
        <defs><linearGradient id="rt-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3ff"/><stop offset="1" stop-color="#eef8ff"/></linearGradient><linearGradient id="rt-rock" x1="0" x2="1"><stop offset="0" stop-color="#9bb7a0"/><stop offset=".5" stop-color="#7fa386"/><stop offset=".51" stop-color="#6b8f73"/><stop offset="1" stop-color="#5f8267"/></linearGradient></defs>
        <rect y="-34" width="400" height="334" fill="url(#rt-sky)"/><circle cx="340" cy="52" r="22" fill="#ffe27a"/>
        <path d="M0 300L70 170L130 230L190 150L240 210L300 120L400 260V300z" fill="#c9dbe8"/>
        <path d="M10 300L250 30L392 300z" fill="url(#rt-rock)" stroke="#3b2a1e" stroke-width="3" stroke-linejoin="round"/>
        <path d="M250 30L214 71L228 63L240 77L253 62L268 74z" fill="#fff" stroke="#3b2a1e" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M0 300Q100 270 200 286T400 280V300z" fill="#84c95b" stroke="#3b2a1e" stroke-width="2.4"/>
        <polyline points="${TRAIL.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#fff6dd" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="${TRAIL.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#b98a52" stroke-width="2" stroke-dasharray="5 6" stroke-linecap="round"/>
        ${flags.join('')}
        <text x="${TRAIL[0][0]-6}" y="296" text-anchor="end" font-size="11" font-weight="700" fill="#2f5a2a">BR</text>
        <path d="M250 30V12" stroke="#3b2a1e" stroke-width="2.4"/><path d="M250 12l18 5-18 5z" fill="#ffd23f" stroke="#3b2a1e" stroke-width="2" stroke-linejoin="round"/>
      </svg>${cur!=null?`<div class="rt-climber" style="left:${px/4}%;top:${(py+34)/3.34}%">${penguin(5,'登山的小企鹅')}<b class="rt-climber-label">${cur}L</b></div>`:''}</div>
      <div class="rt-lex-summary">${cur==null?'<p class="hint">还没有记录蓝思值。在 ReadTheory 的个人进度里可以看到 Lexile，填进来，小企鹅就会开始爬山。</p>':`<strong>${cur}L</strong>${first!=null&&cur>first?`<em>比起点 +${cur-first}L</em>`:''}<p class="hint">${cur>=LEX_MAX?'已经登上山顶，太厉害了！':'再升 '+(next-cur)+'L 就到达 '+next+'L 小旗。'}</p>`}</div>
      <form id="rt-lex-form" class="rt-kp-form"><label>更新蓝思值（Lexile）<input name="lexile" inputmode="numeric" placeholder="例如 650L" autocomplete="off"></label><button class="primary">更新</button></form>
      <p id="rt-lex-message" class="hint" role="status">${list.length?'上次更新：'+esc(list.at(-1).date):''}</p>
    </section>`}
  function saveLexile(e){e.preventDefault();let raw=String(new FormData(e.target).get('lexile')||'').trim().toUpperCase().replace(/[\sL]/g,''),msg=document.querySelector('#rt-lex-message'),old=lexList().at(-1)?.value;
    let n=raw==='BR'?0:Number(raw);if(!/^(BR|\d{1,4})$/.test(raw)||n>2000){msg.textContent='请输入蓝思值，例如 650L（只填数字也可以）。';return}
    if(old!=null&&n<old&&!confirm('新的蓝思值比上次（'+old+'L）低，确定要更新吗？'))return;
    let m=store(),d=today(),same=m.lexile.find(x=>x.date===d);if(same){same.value=n;same.at=Date.now()}else m.lexile.push({date:d,value:n,at:Date.now()});
    window.LearningApp.commit();page();let flagsBefore=old==null?0:Math.floor(Math.min(old,LEX_MAX)/LEX_STEP),flagsNow=Math.floor(Math.min(n,LEX_MAX)/LEX_STEP),el=document.querySelector('#rt-lex-message');
    el.textContent=old==null?'小企鹅出发啦！目前在 '+n+'L。':n>old?'小企鹅往上爬了 '+(n-old)+'L！'+(flagsNow>flagsBefore?' 🚩 到达 '+flagsNow*LEX_STEP+'L 小旗！':''):'已更新为 '+n+'L。';
    document.querySelector('.rt-mountain')?.scrollIntoView({block:'nearest'})}
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
    let s=stats(),t=store().days[today()]||{};
    app.innerHTML=`<div class="eyebrow">READTHEORY · 每日阅读</div><h1>ReadTheory 阅读</h1>
    <section class="card rt-today ${s.todayDone?'complete':''}">
      <h2>${s.todayDone?'🎉 今天的阅读任务完成啦！':'📖 今天的阅读任务：完成 ReadTheory 测验，让 Knowledge Points 涨起来'}</h2>
      <div class="rt-go"><a class="button primary" href="${RT_URL}" target="_blank" rel="noopener">打开 ReadTheory ↗</a><span class="hint">在新窗口打开，用自己的账号登录；做完测验后看一下 Knowledge Points，回来填上</span></div>
      <form id="rt-kp-form" class="rt-kp-form"><label>做完测验后，输入 ReadTheory 上现在的 Knowledge Points<input name="kp" inputmode="numeric" pattern="[0-9,]*" placeholder="例如 1250" autocomplete="off" value="${t.kp??''}"></label><button class="primary">${s.todayDone&&t.kp!=null?'更新':'提交'}</button></form>
      <p id="rt-kp-message" class="hint" role="status">${(l=>l?'上次记录：'+l.kp.toLocaleString('en-US')+' 分（'+esc(l.date)+'）。今天输入的分数要比这个多，才算完成。'+(t.kp!=null?' 今天已记录 '+t.kp.toLocaleString('en-US')+' 分。':''):t.kp!=null?'今天记下了起点 '+t.kp.toLocaleString('en-US')+' 分，明天的分数要比它多。':'第一次记录：输入现在的分数作为起点，以后每天都要比上一次多。')(lastKpBefore(today()))}</p>
      ${s.todayDone?'':'<p class="hint">分数比上次多，就能点亮今天的星星 ⭐，再领 1 只新企鹅 🐧</p>'}
    </section>
    ${lexileSection()}
    ${collection()}
    <div class="stats"><div><strong>${s.current}</strong><span>天连续完成</span></div><div><strong>${s.best}</strong><span>天最长连续</span></div><div><strong>${s.total}</strong><span>天累计完成</span></div></div>
    <section class="card rt-section"><h2>最近 7 天 · 能量电池</h2>${week()}</section>
    <section class="card rt-section"><h2>连续完成 · 里程碑</h2>${goalRow(streakGoals,s.best)}${(n=>n?`<div class="progress"><i style="width:${Math.min(100,s.best/n[0]*100)}%"></i></div><p class="hint">再连续 ${n[0]-s.best} 天达成「${n[1]}」，再送 ${BONUS} 只企鹅</p>`:'<p class="hint">连续里程碑全部达成！</p>')(streakGoals.find(g=>s.best<g[0]))}</section>`;
    app.querySelectorAll('[data-rt-battery]').forEach(b=>b.onclick=()=>{let d=b.dataset.rtBattery;if(!valid(d)||d>=today())return;let m=store(),x=m.days[d]||={};if(x.battery)delete x.battery;else{if(count(x)>=DAILY||!batteriesLeft(d))return;x.battery=true}x.updatedAt=Date.now();window.LearningApp.commit();page()});
    app.querySelector('#rt-lex-form').onsubmit=saveLexile;
    app.querySelector('#rt-kp-form').onsubmit=e=>{e.preventDefault();let raw=String(new FormData(e.target).get('kp')||'').replace(/[,，\s]/g,''),n=Number(raw),msg=document.querySelector('#rt-kp-message'),d=today(),prev=kpBefore(d);
      if(!/^\d+$/.test(raw)||n>10000000){msg.textContent='请输入 ReadTheory 上看到的 Knowledge Points（只填数字）。';return}
      let m=store(),x=m.days[d]||={},first=!Object.entries(m.days).some(([k,y])=>k<d&&Number.isFinite(y?.kp));
      if(!first&&n<=prev){msg.textContent='这个数字没有比上次（'+prev.toLocaleString('en-US')+' 分）多。先去 ReadTheory 完成一篇测验，再回来输入新的分数吧。';return}
      let had=penguinCount();x.kp=n;x.done=DAILY;delete x.battery;x.updatedAt=Date.now();window.LearningApp.commit();page();let got=penguinCount()-had,h=app.querySelector('.rt-today h2');
      document.querySelector('#rt-kp-message').textContent=(first?'已记下起点 '+n.toLocaleString('en-US')+' 分。':'比上次多了 '+(n-prev).toLocaleString('en-US')+' 分，真棒！')+(got>0?' 获得 '+got+' 只新企鹅 🐧':'');if(got>0)h.textContent+=' 获得 '+got+' 只新企鹅 🐧'};
    refreshDot();
  }
  function merge(incoming){let m=store();
    for(let [d,x] of Object.entries(incoming?.days||{})){if(!valid(d)||!x||typeof x!=='object')continue;let mine=m.days[d]||={};mine.done=Math.max(count(mine),count(x));if(Number.isFinite(x.kp))mine.kp=Math.max(Number.isFinite(mine.kp)?mine.kp:0,x.kp);if(x.battery)mine.battery=true;mine.updatedAt=Math.max(Number(mine.updatedAt)||0,Number(x.updatedAt)||0)}
    for(let x of incoming?.quizzes||[])if(x&&valid(x.date)&&Number.isFinite(x.total)&&!m.quizzes.some(y=>y.date===x.date&&y.total===x.total))m.quizzes.push({date:x.date,total:x.total,at:Number(x.at)||0});
    for(let x of incoming?.lexile||[])if(x&&valid(x.date)&&Number.isFinite(x.value)&&!m.lexile.some(y=>y.date===x.date&&y.value===x.value))m.lexile.push({date:x.date,value:x.value,at:Number(x.at)||0});
    refreshDot()}
  const btn=document.createElement('button');btn.id='rt-nav';btn.textContent='ReadTheory';
  document.querySelector('#reading-nav').after(btn);btn.onclick=page;
  document.querySelector('header nav').addEventListener('click',e=>{let b=e.target.closest('button');if(b&&b!==btn)btn.classList.remove('active')},true);
  refreshDot();setInterval(refreshDot,60000);
  window.ReadTheoryPractice={page,stats,merge};
})();
