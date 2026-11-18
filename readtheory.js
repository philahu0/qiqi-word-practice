(function(){
  // ReadTheory 每日阅读：去 ReadTheory 完成测验 → 回来输入最新的 Knowledge Points，比上次多才算今天完成。
  // 每周（周一到周日）有 2 个能量电池，可以补上最近 7 天里漏掉的一天，连续天数不断。
  // 奖励是 99 只小企鹅贴纸：只有输入了更高的 Knowledge Points 的那天才领 1 只；能量电池只保住连续天数，不给企鹅。
  // 连续天数里程碑各再送 2 只，在输入新分数时发放（记在 bonus 里，已发的不会收回）。企鹅可以摆到小岛上。
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
  const kpDays=()=>Object.entries(store().days).filter(([d,x])=>valid(d)&&count(x)>=DAILY).length;
  function bonusKeys(){let m=store();if(!Array.isArray(m.bonus)){m.bonus=streakGoals.filter(g=>stats().best>=g[0]).map(g=>'streak-'+g[0])}return m.bonus}
  function grantBonus(){let keys=bonusKeys(),best=stats().best;for(let g of streakGoals)if(best>=g[0]&&!keys.includes('streak-'+g[0]))keys.push('streak-'+g[0])}
  function penguinCount(){return Math.min(PENGUINS,kpDays()+BONUS*bonusKeys().length)}
  // 99 只企鹅的名字，按贴纸图上的顺序
  const NAMES=["刷刷","暖暖","困困","跳跳","呼噜","毛毛","莓莓","团扇","小画家","灯灯","鱼鱼","小渔","魔术师","闪闪","饼饼","欢欢","嗨嗨","咕嘟","博士","报报","航航","偷笑","叶叶","心心","甜甜","乖乖","嘻嘻","瓜瓜","侦探","大厨","光光","剑剑","远远","团团","酥酥","红红","蓝蓝","指挥家","摇摇","纺纺","琴琴","酷酷","未来","咔咔","嚓嚓","拍拍","围围","招招","布丁","糕糕","沙沙","堡堡","泡泡","咕咕","洋洋","熊熊","笑笑","彩彩","壶壶","茶茶","小法师","公主","涂涂","笔笔","算算","珠珠","数数","呆呆","盘盘","点点","钓钓","灰灰","球球","松松","糖糖","汤汤","码码","包包","安安","滑滑","板板","歌歌","唱唱","提提","弦弦","花火","杯杯","胖胖","豆豆","抱抱","果果","圆圆","拜拜","礼礼","冠军","花花","眨眨","飞飞","雪雪"];
  const pname=i=>NAMES[i]||'小企鹅';
  const penguin=(i,label)=>`<span class="rt-penguin" role="img" aria-label="${esc(label||pname(i))}" style="background-position:${(i%10)/9*100}% ${Math.floor(i/10)/9*100}%"></span>`;
  function goalRow(goals,value){return `<div class="rt-badges">${goals.map(([n,label])=>`<div class="rt-badge ${value>=n?'earned':''}"><span class="rt-badge-icon">${value>=n?penguin(1,'小企鹅'):'🔒'}</span><small>${label}${value>=n?' · +'+BONUS:''}</small></div>`).join('')}</div><p class="hint">每达成一个连续里程碑，多送 ${BONUS} 只小企鹅。用电池补上的日子，要等下次输入更高的分数时才发。</p>`}
  function collection(){let n=penguinCount();return `<section class="card rt-section rt-collection"><h2><span class="rt-inline-penguin">${penguin(1,'')}</span>小企鹅收藏 · ${n} / ${PENGUINS}</h2><p class="hint">每天输入更高的 Knowledge Points 领 1 只新企鹅，可以去小岛「布置装饰」里摆上。</p><div class="rt-penguins">${Array.from({length:n},(_,i)=>`<div class="rt-penguin-cell">${penguin(i)}<small>${esc(pname(i))}</small></div>`).join('')}${n<PENGUINS?`<div class="rt-penguin-cell locked">${penguin(n,'下一只企鹅')}<small>下一只</small></div>`:''}</div></section>`}
  // 蓝思值登山：山脚 0L（BR），山顶 1200L；输入蓝思值后企鹅爬到对应位置
  const LM=()=>window.LexileMountain,LEX_MAX=1200,LEX_STEP=200;
  const lexList=()=>store().lexile.filter(x=>x&&valid(x.date)&&Number.isFinite(x.value)).sort((a,b)=>a.date.localeCompare(b.date)||a.at-b.at);
  function lexileSection(){
    let list=lexList(),cur=list.at(-1)?.value,first=list[0]?.value,[px,py]=LM().point(cur||0),next=cur==null?LEX_STEP:Math.min(LEX_MAX,(Math.floor(cur/LEX_STEP)+1)*LEX_STEP),top=cur!=null&&cur>=LEX_MAX;
    return `<section class="card rt-section rt-mountain"><h2>🏔️ 蓝思值登山</h2>
      <div class="rt-mtn">${LM().svg(cur)}${cur!=null?`<div class="rt-climber ${top?'at-top':''}" style="left:${px/LM().W*100}%;top:${py/LM().H*100}%">${penguin(5,'登山的小企鹅')}<b class="rt-climber-label">${top?'🏆 ':''}${cur}L</b></div>`:''}</div>
      <div class="rt-lex-summary">${cur==null?'<p class="hint">还没有记录蓝思值。在 ReadTheory 的个人进度里可以看到 Lexile，填进来，小企鹅就会开始爬山。</p>':`<strong>${cur}L</strong>${first!=null&&cur>first?`<em>比起点 +${cur-first}L</em>`:''}<p class="hint">${cur>=LEX_MAX?'已经登上山顶，太厉害了！':'再升 '+(next-cur)+'L 就到达 '+next+'L 小旗。'}</p>`}</div>
      <form id="rt-lex-form" class="rt-kp-form"><label>更新蓝思值（Lexile）<input name="lexile" inputmode="numeric" placeholder="例如 650L" autocomplete="off"></label><button class="primary">更新</button></form>
      <p id="rt-lex-message" class="hint" role="status">${list.length?'上次更新：'+esc(list.at(-1).date):''}</p>
    </section>`}
  function saveLexile(e){e.preventDefault();let raw=String(new FormData(e.target).get('lexile')||'').trim().toUpperCase().replace(/[\sL]/g,''),msg=document.querySelector('#rt-lex-message'),old=lexList().at(-1)?.value;
    let n=raw==='BR'?0:Number(raw);if(!/^(BR|\d{1,4})$/.test(raw)||n>2000){msg.textContent='请输入蓝思值，例如 650L（只填数字也可以）。';return}
    if(old!=null&&n<old&&!confirm('新的蓝思值比上次（'+old+'L）低，确定要更新吗？'))return;
    let m=store(),d=today(),same=m.lexile.find(x=>x.date===d);if(same){same.value=n;same.at=Date.now()}else m.lexile.push({date:d,value:n,at:Date.now()});
    window.LearningApp.commit();page();let flagsBefore=old==null?0:Math.floor(Math.min(old,LEX_MAX)/LEX_STEP),flagsNow=Math.floor(Math.min(n,LEX_MAX)/LEX_STEP),el=document.querySelector('#rt-lex-message');
    el.textContent=old==null?'小企鹅出发啦！目前在 '+n+'L。':n>old?'小企鹅往上爬了 '+(n-old)+'L！'+(flagsNow>flagsBefore?(flagsNow*LEX_STEP>=LEX_MAX?' 🏔️ 登上山顶啦！':' 🚩 到达 '+flagsNow*LEX_STEP+'L 小旗！'):''):'已更新为 '+n+'L。';
    document.querySelector('.rt-mountain')?.scrollIntoView({block:'nearest'})}
  function stickers(){return Array.from({length:penguinCount()},(_,i)=>({id:'rt-penguin-'+(i+1),kind:'readtheory',name:pname(i),index:i}))}
  if(window.ReadingRewards){let RR=window.ReadingRewards,baseInventory=RR.inventory,baseSprite=RR.sprite,baseDisplay=RR.display;
    RR.inventory=()=>[...baseInventory(),...stickers()];
    RR.sprite=item=>item?.kind==='readtheory'?penguin(item.index,item.name):baseSprite(item);
    RR.display=item=>item?.kind==='readtheory'?RR.sprite(item):baseDisplay(item)}
  function week(){let days=store().days,now=dayNum(today());return `<div class="rt-week">${[6,5,4,3,2,1,0].map(n=>{let d=new Date((now-n)*864e5).toISOString().slice(0,10),x=days[d],c=count(x),w='日一二三四五六'[new Date(d+'T00:00:00Z').getUTCDay()],label=n?'周'+w:'今天';
      if(c>=DAILY)return `<div class="rt-day full"><small>${label}</small><span>⭐</span></div>`;
      if(x?.battery)return `<button class="rt-day battery" data-rt-battery="${d}" title="已用能量电池补打卡，点一下退回电池"><small>${label}</small><span>🔋</span></button>`;
      return `<div class="rt-day"><small>${label}</small><span>·</span></div>`}).join('')}</div>
`}
  // 漏打卡提醒：只从第一次打卡那天往后算，最近 7 天里没完成、且那一周还有电池的日子
  function missedDays(){let days=store().days,first=Object.keys(days).filter(d=>valid(d)&&(done(days[d])||Number.isFinite(days[d]?.kp))).sort()[0];if(!first)return [];let now=dayNum(today()),out=[];
    for(let n=1;n<=6;n++){let d=new Date((now-n)*864e5).toISOString().slice(0,10);if(d>first&&!done(days[d])&&batteriesLeft(d))out.push(d)}return out.reverse()}
  function batteryReminder(){let list=missedDays();if(!list.length)return '';let wd=d=>'周'+'日一二三四五六'[new Date(d+'T00:00:00Z').getUTCDay()]+'（'+(+d.slice(5,7))+'/'+(+d.slice(8,10))+'）';
    return `<section class="card rt-section rt-battery-alert"><h2>🔋 有 ${list.length} 天忘记打卡了</h2><p>用能量电池补上，连续天数就不会断。每周有 ${BATTERIES} 个电池。</p><div class="rt-battery-list">${list.map(d=>`<button class="primary" data-rt-battery="${d}">用电池补上 ${wd(d)}</button>`).join('')}</div></section>`}
  // 领到新企鹅的弹窗
  function celebrate(from,got,newBonus){
    document.querySelector('.rt-celebrate')?.remove();
    let names=newBonus.map(k=>streakGoals.find(g=>'streak-'+g[0]===k)?.[1]).filter(Boolean);
    let box=document.createElement('div');box.className='rt-celebrate';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','获得新企鹅');
    box.innerHTML=`<div class="rt-celebrate-card"><div class="rt-confetti" aria-hidden="true">${Array.from({length:18},(_,i)=>`<i style="left:${(i*37)%100}%;animation-delay:${(i%6)*.12}s;background:${['#ffd23f','#ff7ab0','#4fd1c5','#7ad36f','#ff9f43','#8fb8ff'][i%6]}"></i>`).join('')}</div>
      <h2>🎉 获得 ${got} 只新企鹅！</h2>
      <div class="rt-celebrate-penguins">${Array.from({length:got},(_,i)=>`<div style="animation-delay:${.15+i*.18}s">${penguin(from+i)}<small>${esc(pname(from+i))}</small></div>`).join('')}</div>
      <p>${names.length?'今天读完 1 只，加上「'+names.join('、')+'」连续奖励 '+names.length*BONUS+' 只。':'今天的 Knowledge Points 涨了，真棒！'}</p>
      <div class="rt-celebrate-actions"><button class="primary" data-celebrate="island">去小岛摆上</button><button data-celebrate="ok">好的</button></div></div>`;
    let close=()=>{box.remove();document.removeEventListener('keydown',esc_)},esc_=e=>{if(e.key==='Escape')close()};
    box.onclick=e=>{let b=e.target.closest('[data-celebrate]');if(e.target===box||b?.dataset.celebrate==='ok')close();if(b?.dataset.celebrate==='island'){close();document.querySelector('#mastered-nav')?.click()}};
    document.addEventListener('keydown',esc_);document.body.append(box);box.querySelector('[data-celebrate="ok"]').focus()}
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
      <p id="rt-kp-message" class="hint" role="status">${(l=>l?'上次记录：'+l.kp.toLocaleString('en-US')+' 分（'+esc(l.date)+'）'+(t.kp!=null?' · 今天：'+t.kp.toLocaleString('en-US')+' 分':''):'')(lastKpBefore(today()))}</p>
    </section>
    ${batteryReminder()}
    <div class="stats"><div><strong>${s.current}</strong><span>天连续完成</span></div><div><strong>${s.best}</strong><span>天最长连续</span></div><div><strong>${s.total}</strong><span>天累计完成</span></div></div>
    <section class="card rt-section"><h2>最近 7 天</h2>${week()}</section>
    <section class="card rt-section"><h2>连续完成 · 里程碑</h2>${goalRow(streakGoals,s.best)}${(n=>n?`<div class="progress"><i style="width:${Math.min(100,s.best/n[0]*100)}%"></i></div><p class="hint">再连续 ${n[0]-s.best} 天达成「${n[1]}」，再送 ${BONUS} 只企鹅</p>`:'<p class="hint">连续里程碑全部达成！</p>')(streakGoals.find(g=>s.best<g[0]))}</section>
    ${lexileSection()}
    ${collection()}`;
    app.querySelectorAll('[data-rt-battery]').forEach(b=>b.onclick=()=>{let d=b.dataset.rtBattery;if(!valid(d)||d>=today())return;let m=store(),x=m.days[d]||={};if(x.battery)delete x.battery;else{if(count(x)>=DAILY||!batteriesLeft(d))return;x.battery=true}x.updatedAt=Date.now();window.LearningApp.commit();page()});
    app.querySelector('#rt-lex-form').onsubmit=saveLexile;
    app.querySelector('#rt-kp-form').onsubmit=e=>{e.preventDefault();let raw=String(new FormData(e.target).get('kp')||'').replace(/[,，\s]/g,''),n=Number(raw),msg=document.querySelector('#rt-kp-message'),d=today(),prev=kpBefore(d);
      if(!/^\d+$/.test(raw)||n>10000000){msg.textContent='请输入 ReadTheory 上看到的 Knowledge Points（只填数字）。';return}
      let m=store(),x=m.days[d]||={},first=!Object.entries(m.days).some(([k,y])=>k<d&&Number.isFinite(y?.kp));
      if(!first&&n<=prev){msg.textContent='这个数字没有比上次（'+prev.toLocaleString('en-US')+' 分）多。先去 ReadTheory 完成一篇测验，再回来输入新的分数吧。';return}
      let had=penguinCount(),bonusBefore=[...bonusKeys()];x.kp=n;x.done=DAILY;delete x.battery;x.updatedAt=Date.now();grantBonus();window.LearningApp.commit();page();let got=penguinCount()-had,h=app.querySelector('.rt-today h2');if(got>0)celebrate(had,got,bonusKeys().filter(k=>!bonusBefore.includes(k)));
      document.querySelector('#rt-kp-message').textContent=(first?'已记下起点 '+n.toLocaleString('en-US')+' 分。':'比上次多了 '+(n-prev).toLocaleString('en-US')+' 分，真棒！')+(got>0?' 获得 '+got+' 只新企鹅！':'');if(got>0)h.textContent+=' 获得 '+got+' 只新企鹅！'};
    refreshDot();
  }
  function merge(incoming){let m=store();
    if(Array.isArray(incoming?.bonus)){let keys=bonusKeys();for(let k of incoming.bonus)if(typeof k==='string'&&/^streak-\d+$/.test(k)&&!keys.includes(k))keys.push(k)}
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
