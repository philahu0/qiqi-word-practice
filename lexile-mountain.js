(function(){
  // 蓝思值登山插画：圆润绿色山体、雪顶、云朵、树、石头、小木桥和蜿蜒的沙土小路。
  // 坐标系 400×560；LexileMountain.point(v) 返回蓝思值 v 在小路上的位置。
  const W=400,H=560,MAX=1400,STEP=200,O='#3b2a1e';
  const TRAIL=[[70,548],[250,488],[96,430],[262,362],[126,306],[244,256],[160,214],[246,168],[196,134],[238,104],[252,80]];
  const DENSE=(()=>{let out=[TRAIL[0]],start=TRAIL[0];for(let i=1;i<TRAIL.length-1;i++){let c=TRAIL[i],n=TRAIL[i+1],end=[(c[0]+n[0])/2,(c[1]+n[1])/2];for(let k=1;k<=24;k++){let t=k/24,u=1-t;out.push([u*u*start[0]+2*u*t*c[0]+t*t*end[0],u*u*start[1]+2*u*t*c[1]+t*t*end[1]])}start=end}out.push(TRAIL.at(-1));return out})();
  const SEGS=[];let TOTAL=0;for(let i=1;i<DENSE.length;i++){let [x0,y0]=DENSE[i-1],[x1,y1]=DENSE[i],l=Math.hypot(x1-x0,y1-y0);SEGS.push([x0,y0,x1,y1,l]);TOTAL+=l}
  function at(f){let d=Math.max(0,Math.min(1,f))*TOTAL;for(let [x0,y0,x1,y1,l] of SEGS){if(d<=l){let t=l?d/l:0;return [x0+(x1-x0)*t,y0+(y1-y0)*t]}d-=l}return TRAIL.at(-1)}
  const point=v=>at((Number(v)||0)/MAX);
  // 平滑小路：用二次曲线连接各转折点的中点
  function smooth(pts){let d=`M${pts[0][0]} ${pts[0][1]}`;for(let i=1;i<pts.length-1;i++){let [x,y]=pts[i],[nx,ny]=pts[i+1];d+=`Q${x} ${y} ${(x+nx)/2} ${(y+ny)/2}`}let l=pts.at(-1);return d+`L${l[0]} ${l[1]}`}
  const cloud=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="8" rx="38" ry="12" fill="#fff"/><circle cx="-16" cy="2" r="14" fill="#fff"/><circle cx="4" cy="-6" r="18" fill="#fff"/><circle cx="22" cy="2" r="12" fill="#fff"/></g>`;
  const tree=(x,y,s,c1,c2)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0V-26" stroke="#7a4a22" stroke-width="5" stroke-linecap="round"/><path d="M0 -14l-8 -8M0 -18l7 -7" stroke="#7a4a22" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="0" cy="-40" rx="15" ry="26" fill="${c1}"/><path d="M0 -66C12 -60 16 -44 14 -32C12 -20 6 -16 0 -14z" fill="${c2}"/></g>`;
  const rock=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-22 0L-18 -14L-4 -20L14 -16L22 -4L18 0z" fill="#cdb79a"/><path d="M-4 -20L14 -16L22 -4L8 -8z" fill="#e6d5bd"/><path d="M-22 0L-18 -14L-6 -8L-2 0z" fill="#b39c7f"/></g>`;
  const bush=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="20" ry="9" fill="#3f8f4a"/><circle cx="-8" cy="-5" r="8" fill="#4ea456"/><circle cx="6" cy="-7" r="9" fill="#58b25f"/></g>`;
  const flowers=(x,y)=>`<g><circle cx="${x}" cy="${y}" r="3.2" fill="#fff"/><circle cx="${x}" cy="${y}" r="1.3" fill="#ffd23f"/><circle cx="${x+9}" cy="${y+4}" r="3" fill="#ff9aa8"/><circle cx="${x+9}" cy="${y+4}" r="1.2" fill="#fff4b0"/><circle cx="${x-7}" cy="${y+6}" r="2.6" fill="#ffb15c"/></g>`;
  const birds=`<path d="M118 226q6-6 12 0q6-6 12 0M150 238q4-4 8 0q4-4 8 0M96 246q4-4 8 0q4-4 8 0" fill="none" stroke="#5b6b7a" stroke-width="2" stroke-linecap="round"/>`;
  function flag(v,cur){let [x,y]=point(v),got=cur!=null&&cur>=v,right=x<200;return `<g><path d="M${x} ${y-2}V${y-30}" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/><path d="M${x+1} ${y-30}l20 6-20 7z" fill="#e8463c" stroke="#a52a22" stroke-width="1.4" stroke-linejoin="round"/><text x="${right?x+12:x-10}" y="${y+16}" text-anchor="${right?'start':'end'}" font-size="15" font-weight="800" paint-order="stroke" stroke="#fff" stroke-width="4" stroke-linejoin="round" fill="${got?'#b23a2e':'#3d4f63'}">${v}L</text></g>`}
  function svg(cur){
    let trail=smooth(TRAIL),b0=at(.13),b1=at(.19),flags=[];for(let v=STEP;v<MAX;v+=STEP)flags.push(flag(v,cur));
    let top=point(MAX),summit=cur!=null&&cur>=MAX;
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="蓝思值登山图，目前 ${cur==null?'未记录':cur+'L'}" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="lm-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd6f7"/><stop offset=".7" stop-color="#d9f0fc"/><stop offset="1" stop-color="#eef8fd"/></linearGradient>
        <linearGradient id="lm-hill" x1="0" x2="1"><stop offset="0" stop-color="#6fc062"/><stop offset=".55" stop-color="#4ea653"/><stop offset="1" stop-color="#2f7d44"/></linearGradient>
        <linearGradient id="lm-shade" x1="0" x2="1"><stop offset="0" stop-color="#2e7a45" stop-opacity="0"/><stop offset="1" stop-color="#1f5f37" stop-opacity=".55"/></linearGradient>
        <radialGradient id="lm-sun" cx="40%" cy="35%"><stop offset="0" stop-color="#fff3a0"/><stop offset="1" stop-color="#ffc93c"/></radialGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#lm-sky)"/>
      <circle cx="328" cy="118" r="34" fill="url(#lm-sun)"/>${cloud(70,108,1)}${cloud(220,62,.8)}${cloud(350,190,.9)}${cloud(40,190,.7)}${birds}
      <path d="M0 340Q40 300 80 318Q120 290 170 318L230 300Q300 280 340 310Q380 296 400 312V560H0z" fill="#a9cbe8"/>
      <path d="M-20 560C30 430 120 300 200 170C222 132 236 100 252 76C268 100 288 140 312 186C350 260 392 330 420 380V560z" fill="url(#lm-hill)"/>
      <path d="M252 76C268 100 288 140 312 186C350 260 392 330 420 380V560H300C330 460 300 360 280 260C268 190 262 130 252 76z" fill="url(#lm-shade)"/>
      <path d="M300 230q-10 40 6 80M330 300q-14 34 0 72M276 160q-6 26 4 48" fill="none" stroke="#2a6b3e" stroke-width="4" stroke-linecap="round" opacity=".45"/>
      <path d="M252 76C242 90 230 110 218 132L230 126L238 140L250 124L262 138L272 124L284 132C274 112 262 92 252 76z" fill="#fff"/><path d="M252 76C262 92 274 112 284 132L272 124L262 138L256 120z" fill="#d6e6f1"/>
      <path d="M-20 560C60 500 150 470 240 486C320 500 380 470 420 456V560z" fill="#5db35a"/>
      ${tree(36,470,1,'#4ea653','#3b8a45')}${tree(62,486,1.1,'#ff9a3c','#e5782a')}${tree(352,460,1.1,'#5cb85c','#3f9a49')}${tree(376,476,.9,'#ff9fb3','#e87d96')}${tree(330,488,.95,'#6cc06a','#4ea653')}
      ${rock(300,520,1.1)}${rock(320,322,.8)}${bush(150,512,1)}${bush(360,540,1.2)}${bush(52,396,.8)}${flowers(70,522)}${flowers(320,548)}${flowers(96,380)}
      <path d="${trail}" fill="none" stroke="#e2c38f" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${trail}" fill="none" stroke="#f3dfb6" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${trail}" fill="none" stroke="#c9a46a" stroke-width="2.4" stroke-dasharray="6 7" stroke-linecap="round"/>
      <path d="M${b0[0]} ${b0[1]}L${b1[0]} ${b1[1]}" stroke="#6b3e1b" stroke-width="26"/><path d="M${b0[0]} ${b0[1]}L${b1[0]} ${b1[1]}" stroke="#b9773d" stroke-width="22" stroke-dasharray="5 2.5"/>
      ${flags.join('')}
      <path d="M${top[0]} ${top[1]}V${top[1]-44}" stroke="${O}" stroke-width="3" stroke-linecap="round"/><path d="M${top[0]+1} ${top[1]-44}q14 -6 30 2q-4 8 0 16q-16 -6 -30 0z" fill="#ffd23f" stroke="#c99a12" stroke-width="1.6" stroke-linejoin="round"/>
      ${summit?'':`<text x="${top[0]-12}" y="${top[1]+14}" text-anchor="end" font-size="15" font-weight="800" paint-order="stroke" stroke="#fff" stroke-width="4" stroke-linejoin="round" fill="#3d4f63">${MAX}L</text>`}
      ${summit?`<g>${[[200,40,'#ffd23f'],[300,48,'#4fd1c5'],[214,96,'#ff7ab0'],[296,104,'#ffd23f'],[186,70,'#7ad36f'],[318,76,'#ff9f43']].map(([x,y,c],i)=>i%2?`<path d="M${x} ${y-6}l2 4 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z" fill="${c}"/>`:`<path d="M${x} ${y}q6-6 12 0" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>`).join('')}</g>`:''}
    </svg>`}
  window.LexileMountain={svg,point,W,H,MAX,STEP};
})();
