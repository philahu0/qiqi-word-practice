(function(){
  const URL='https://www.myon.com/index.html',app=document.querySelector('#app'),esc=window.LearningApp.escape;
  const bookGoals=[[1,'📗','第一本书'],[3,'🔖','小书虫'],[5,'📚','五本达成'],[10,'🏅','十本书'],[20,'🏆','阅读达人'],[30,'👑','书架小主人'],[50,'🌟','五十本传奇']];
  const minuteGoals=[[60,'⏱️','读满1小时'],[180,'🕒','读满3小时'],[300,'⌛','读满5小时'],[600,'🔥','读满10小时'],[1200,'🚀','读满20小时']];
  const streakGoals=[[3,'🌱','连读3天'],[7,'🌳','连读一周'],[14,'🌈','连读两周'],[30,'🎆','连读一个月']];
  const log=()=>(window.MYON_LOG||[]).filter(x=>x&&x.title&&/^\d{4}-\d{2}-\d{2}$/.test(x.date)).slice().sort((a,b)=>b.date.localeCompare(a.date));
  const dayNum=d=>Date.UTC(+d.slice(0,4),+d.slice(5,7)-1,+d.slice(8,10))/864e5;
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
    let entries=log(),s=stats(entries);
    app.innerHTML=`<div class="eyebrow">MYON · 课外阅读</div><h1>myON 阅读</h1><p>在 myON 上挑自己喜欢的书来读。读完把 myON 的阅读记录截图发给爸爸妈妈，记录更新后，这里的书架和徽章就会亮起来。</p>
    <div class="myon-go"><a class="button primary" href="${URL}" target="_blank" rel="noopener">去 myON 读书 ↗</a><span class="hint">会在新窗口打开，用学校给的账号登录</span></div>
    <div class="stats"><div><strong>${s.books}</strong><span>本书</span></div><div><strong>${s.minutes}</strong><span>分钟</span></div><div><strong>${s.week}</strong><span>近7天分钟</span></div><div><strong>${s.current}</strong><span>天连续阅读（最长 ${s.best} 天）</span></div></div>
    <section class="card myon-section"><h2>读书徽章</h2>${badges(bookGoals,s.books,'本')}</section>
    <section class="card myon-section"><h2>时长徽章</h2>${badges(minuteGoals,s.minutes,'分钟')}</section>
    <section class="card myon-section"><h2>连读徽章</h2>${badges(streakGoals,s.best,'天')}</section>
    <h2>我的书架</h2>${entries.length?`<div class="myon-shelf">${entries.map(x=>`<article class="myon-book"><strong>${esc(x.title)}</strong><small>${esc(x.date)} · ${Number(x.minutes)||0} 分钟${x.lexile?' · '+esc(String(x.lexile)):''}</small>${x.note?`<p>${esc(x.note)}</p>`:''}</article>`).join('')}</div>`:'<div class="empty"><p>书架还空着。去 myON 读第一本书吧！</p></div>'}`;
  }
  let btn=document.createElement('button');btn.id='myon-nav';btn.textContent='myON 阅读';
  document.querySelector('#reading-nav').after(btn);btn.onclick=page;
  document.querySelector('header nav').addEventListener('click',e=>{let b=e.target.closest('button');if(b&&b!==btn)btn.classList.remove('active')},true);
  window.MyonReading={page,stats,log};
})();
