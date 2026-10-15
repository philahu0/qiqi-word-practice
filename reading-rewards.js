(function(){
 const basic=['花盆','路灯','秋千','长椅','信箱','鸟屋','浇水壶','小围栏','野餐桌','花园圆凳','踏脚石','小喷泉','向日葵盆栽','灯笼','吊床','花园拱门','蘑菇座椅','木路牌','多肉盆栽','星星座椅','花车','小风车','书本小桌','阅读椅'];
 const special=['UFO飞碟','火山模型','披萨小摊','蜜蚁蜂蜜罐','暑期工作手提箱','摄影相机','宝藏箱','幽灵帆船','侦探放大镜','急救箱','探险指南针','牛仔帽鞍架','梦境云朵','沙漠绿洲','企鹅冰屋','伞蜥模型','罗马石柱','彩色穹顶亭','雨云喷泉','闪电灯','猛犸象模型','巨鱿鱼喷泉','机器人','无人驾驶小车'];
 function catalog(){return (window.READINGS||[]).flatMap((r,i)=>[{id:r.id+'-basic',readingId:r.id,name:basic[i],index:i,kind:'basic',title:r.title},{id:r.id+'-special',readingId:r.id,name:special[i],index:i+24,kind:'special',title:r.title}])}
 function inventory(){let progress=window.LearningApp.read().reading||{};return catalog().filter(item=>{let p=progress[item.readingId];return p&&(item.kind==='basic'?p.attempts>0:p.attempts>0&&p.best>=4)})}
 function sprite(item){let i=item.index;return `<span class="reading-decor" role="img" aria-label="${window.LearningApp.escape(item.name)}" style="background-position:${i%6*20}% ${Math.floor(i/6)*100/7}%"></span>`}
 function panel(){let items=inventory(),esc=window.LearningApp.escape;return `<section class="reading-rewards"><h2>我的阅读装饰 · ${items.length} / 48</h2><p>每篇首次完成获得基础装饰；至少答对4题解锁主题装饰，各奖励一次。解锁小岛后，就能带它们去布置。</p><details><summary>查看已获得的装饰</summary><div class="decor-inventory">${items.length?items.map(item=>`<article>${sprite(item)}<strong>${esc(item.name)}</strong><small>${esc(item.title)}</small></article>`).join(''):'<p>完成第一篇阅读，领取花盆吧。</p>'}</div></details></section>`}
 window.ReadingRewards={catalog,inventory,sprite,panel};
})();