(function(){
  const URL='https://www.myon.com/index.html',app=document.querySelector('#app'),esc=window.LearningApp.escape;
  const bookGoals=[[1,'📗','第一本书'],[3,'🔖','小书虫'],[5,'📚','五本达成'],[10,'🏅','十本书'],[20,'🏆','阅读达人'],[30,'👑','书架小主人'],[50,'🌟','五十本传奇']];
  const minuteGoals=[[60,'⏱️','读满1小时'],[180,'🕒','读满3小时'],[300,'⌛','读满5小时'],[600,'🔥','读满10小时'],[1200,'🚀','读满20小时']];
  const streakGoals=[[3,'🌱','连读3天'],[7,'🌳','连读一周'],[14,'🌈','连读两周'],[30,'🎆','连读一个月']];
  const valid=x=>x&&x.title&&/^\d{4}-\d{2}-\d{2}$/.test(x.date);
  function store(){let state=window.LearningApp.read();state.myon||={entries:[]};state.myon.entries||=[];return state.myon}
  const all=()=>[...(window.MYON_LOG||[]).filter(valid).map((x,i)=>({...x,id:'static-'+i,confirmed:true,fixed:true})),...store().entries.filter(valid)].sort((a,b)=>b.date.localeCompare(a.date)||(b.createdAt||0)-(a.createdAt||0));
  const log=()=>all().filter(x=>x.confirmed);
  const dayNum=d=>Date.UTC(+d.slice(0,4),+d.slice(5,7)-1,+d.slice(8,10))/864e5;
  const shift=(d,n)=>new Date((dayNum(d)+n)*864e5).toISOString().slice(0,10);
  const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Hong_Kong'});
  function stats(entries){
    let books=new Set(entries.map(x=>x.title.trim().toLowerCase())).size,minutes=entries.reduce((n,x)=>n+(Number(x.minutes)||0),0);
    let days=[...new Set(entries.map(x=>x.date))].map(dayNum).sort((a,b)=>a-b),best=0,run=0,prev=null;
    for(let d of days){run=prev!==null&&d-prev===1?run+1:1;best=Math.max(best,run);prev=d}
    let now=dayNum(today()),current=0;if(days.length&&now-days[days.length-1]<=1){current=1;for(let i=days.length-1;i>0&&days[i]-days[i-1]===1;i--)current++}
    let weekStart=now-6,week=entries.filter(x=>dayNum(x.date)>=weekStart).reduce((n,x)=>n+(Number(x.minutes)||0),0);
    return {books,minutes,best,current,week};
  }
  function badges(goals,value,unit){let next=goals.find(g=>value<g[0]);return `<div class="myon-badges">${goals.map(([n,icon,name])=>`<div class="myon-badge ${value>=n?'earned':''}" title="${n}${unit}"><span>${value>=n?icon:'🔒'}</span><small>${name}</small></div>`).join('')}</div>${next?`<div class="progress"><i style="width:${Math.min(100,value/next[0]*100)}%"></i></div><p class="hint">距离「${next[2]}」还差 ${next[0]-value} ${unit}</p>`:'<p class="hint">这一组徽章全部点亮！</p>'}`}
  function setNav(){document.querySelectorAll('header nav button').forEach(b=>b.classList.toggle('active',b.id==='myon-nav'))}
  function page(){
    window.LearningApp.leave();setNav();
    let entries=log(),pending=all().filter(x=>!x.confirmed),s=stats(entries),t=today(),titles=[...new Set(all().map(x=>x.title))],recent=titles.slice(0,4);
    app.innerHTML=`<div class="eyebrow">MYON · 课外阅读</div><h1>myON 阅读</h1><p>在 myON 上挑自己喜欢的书来读。读完回到这里打卡，爸爸妈妈确认后，书架和徽章就会亮起来。</p>
    <div class="myon-go"><a class="button primary" href="${URL}" target="_blank" rel="noopener">去 myON 读书 ↗</a><span class="hint">会在新窗口打开，用学校给的账号登录</span></div>
    <form class="card myon-section myon-form" id="myon-form"><h2>读完打卡</h2>
      ${recent.length?`<div class="myon-field"><span>点一下最近读的书</span><div class="myon-chips">${recent.map(t=>`<button type="button" class="myon-chip" data-myon-title="${esc(t)}">${esc(t)}</button>`).join('')}</div></div>`:''}
      <label class="myon-field"><span>${recent.length?'或者输入新书名':'书名'}</span><input name="title" required maxlength="80" placeholder="例如 Magic Tree House" autocomplete="off" list="myon-titles"></label><datalist id="myon-titles">${titles.map(t=>`<option value="${esc(t)}">`).join('')}</datalist>
      <div class="myon-field"><span>读了多少分钟</span><div class="myon-chips">${[10,15,20,30,45,60].map(m=>`<label class="myon-chip"><input type="radio" name="minutes" value="${m}" ${m===20?'checked':''}>${m}</label>`).join('')}</div></div>
      <div class="myon-field"><span>哪天读的</span><div class="myon-chips">${[0,1,2].map(n=>`<label class="myon-chip"><input type="radio" name="date" value="${shift(t,-n)}" ${n===0?'checked':''}>${['今天','昨天','前天'][n]}</label>`).join('')}</div></div>
      <div class="myon-field"><span>喜欢吗</span><div class="myon-chips">${[['😍','超喜欢'],['🙂','还不错'],['😐','一般']].map(([e,w],i)=>`<label class="myon-chip"><input type="radio" name="rating" value="${3-i}" ${i===0?'checked':''}>${e} ${w}</label>`).join('')}</div></div>
      <label class="myon-field"><span>想说一句吗（可以不写）</span><input name="note" maxlength="200" placeholder="这本书讲了… / 我最喜欢…"></label>
      <button class="primary myon-submit">提交打卡</button><p id="myon-message" class="hint" role="status"></p></form>
    ${pending.length?`<section class="card myon-section myon-pending"><div class="myon-pending-head"><h2>等待爸爸妈妈确认 · ${pending.length}</h2>${pending.length>1?'<button class="primary" data-myon-confirm-all="1">全部确认 ✓</button>':''}</div>${pending.map(x=>`<div class="myon-pending-item"><div><strong>${esc(x.title)}</strong><small>${esc(x.date)} · ${x.minutes} 分钟${x.rating?' · '+['','😐','🙂','😍'][x.rating]:''}</small>${x.note?`<p>${esc(x.note)}</p>`:''}</div><div class="myon-actions"><button class="primary" data-myon-confirm="${esc(x.id)}">家长确认 ✓</button><button class="outline" data-myon-delete="${esc(x.id)}">删除</button></div></div>`).join('')}</section>`:''}
    <div class="stats"><div><strong>${s.books}</strong><span>本书</span></div><div><strong>${s.minutes}</strong><span>分钟</span></div><div><strong>${s.week}</strong><span>近7天分钟</span></div><div><strong>${s.current}</strong><span>天连续阅读（最长 ${s.best} 天）</span></div></div>
    <section class="card myon-section"><h2>读书徽章</h2>${badges(bookGoals,s.books,'本')}</section>
    <section class="card myon-section"><h2>时长徽章</h2>${badges(minuteGoals,s.minutes,'分钟')}</section>
    <section class="card myon-section"><h2>连读徽章</h2>${badges(streakGoals,s.best,'天')}</section>
    <h2>我的书架</h2>${entries.length?`<div class="myon-shelf">${entries.map(x=>`<article class="myon-book"><strong>${esc(x.title)}</strong><small>${esc(x.date)} · ${Number(x.minutes)||0} 分钟${x.rating?' · '+['','😐','🙂','😍'][x.rating]:''}${x.lexile?' · '+esc(String(x.lexile)):''}</small>${x.fixed?'':`<button class="myon-undo" data-myon-unconfirm="${esc(x.id)}">撤销确认</button>`}${x.note?`<p>${esc(x.note)}</p>`:''}</article>`).join('')}</div>`:'<div class="empty"><p>书架还空着。去 myON 读第一本书吧！</p></div>'}`;
    app.querySelector('#myon-form').onsubmit=submit;
    app.querySelectorAll('[data-myon-confirm],[data-myon-delete],[data-myon-unconfirm],[data-myon-confirm-all]').forEach(b=>b.onclick=act);
    app.querySelectorAll('[data-myon-title]').forEach(b=>b.onclick=()=>{let i=app.querySelector('[name=title]');i.value=b.dataset.myonTitle;app.querySelectorAll('[data-myon-title]').forEach(x=>x.classList.toggle('picked',x===b))});
  }
  function submit(e){e.preventDefault();let f=new FormData(e.target),title=String(f.get('title')).trim(),note=String(f.get('note')).trim(),date=String(f.get('date')),minutes=Number(f.get('minutes')),rating=Number(f.get('rating'))||undefined;
    if(!title||!/^\d{4}-\d{2}-\d{2}$/.test(date)||date>today()||!(minutes>0)){document.querySelector('#myon-message').textContent='先点一本书，或者输入书名。';return}
    store().entries.push({id:'m'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),date,title,minutes,note,rating,confirmed:false,createdAt:Date.now()});window.LearningApp.commit();page();document.querySelector('#myon-message').textContent='打卡成功！请爸爸妈妈确认 ✓'}
  function act(e){let d=e.currentTarget.dataset,m=store();if(d.myonConfirmAll){m.entries.forEach(x=>{if(!x.confirmed){x.confirmed=true;x.confirmedAt=Date.now()}});window.LearningApp.commit();page();return}let id=d.myonConfirm||d.myonDelete||d.myonUnconfirm,x=m.entries.find(y=>y.id===id);if(!x)return;
    if(d.myonDelete){if(!confirm('删除这条打卡「'+x.title+'」？'))return;m.entries=m.entries.filter(y=>y!==x)}
    else if(d.myonConfirm){x.confirmed=true;x.confirmedAt=Date.now()}
    else{if(!confirm('撤销「'+x.title+'」的确认？'))return;x.confirmed=false}
    window.LearningApp.commit();page()}
  let btn=document.createElement('button');btn.id='myon-nav';btn.textContent='myON 阅读';
  document.querySelector('#reading-nav').after(btn);btn.onclick=page;
  document.querySelector('header nav').addEventListener('click',e=>{let b=e.target.closest('button');if(b&&b!==btn)btn.classList.remove('active')},true);
  function merge(incoming){let m=store(),have=new Set(m.entries.map(x=>x.id));for(let x of incoming?.entries||[]){if(!valid(x)||typeof x.id!=='string'||have.has(x.id)||!(Number(x.minutes)>0))continue;m.entries.push({id:x.id,date:x.date,title:String(x.title).slice(0,80),minutes:Number(x.minutes),note:String(x.note||'').slice(0,200),rating:[1,2,3].includes(x.rating)?x.rating:undefined,confirmed:!!x.confirmed,createdAt:Number(x.createdAt)||Date.now(),confirmedAt:Number(x.confirmedAt)||undefined});have.add(x.id)}}
  window.MyonReading={page,stats,log,all,merge};
})();
