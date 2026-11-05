const C=document.getElementById('c'),X=C.getContext('2d'),W=960,H=600,$=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=(a,b)=>a+Math.random()*(b-a);
const D={easy:{hp:.8,n:.8,spd:.85,dmg:.7,name:'EASY'},medium:{hp:1.1,n:1,spd:1,dmg:1,name:'MEDIUM'},hard:{hp:1.5,n:1.3,spd:1.2,dmg:1.4,name:'HARD'}};
const ZT={normal:{hp:30,sp:48,r:14,dmg:6,rate:1.1,f:8,skin:'#8fae7a',cloth:'#5a4a3a',eye:'#ffdd33',orb:1},
fast:{hp:18,sp:110,r:12,dmg:4,rate:.8,f:15,skin:'#b9c98c',cloth:'#7a2c2c',eye:'#ff7a3a',orb:1},
strong:{hp:85,sp:32,r:19,dmg:14,rate:1.6,f:5,skin:'#5f8a5c',cloth:'#33414f',eye:'#ff3d3d',orb:2},
boss:{hp:2200,sp:38,r:42,dmg:28,rate:1.5,f:3.5,skin:'#6f8f6a',cloth:'#3b2230',eye:'#ff2222',orb:1}};
let G=null,state='menu',diff='medium',mouse={x:480,y:200,down:false},keys={},last=0,t=0,seenTut=false,muted=false,amb=[],AC;
for(let i=0;i<7;i++)amb.push({x:rnd(0,W),y:90+i*72,type:['normal','fast','strong'][i%3],ph:rnd(0,6),sp:rnd(30,70)});

let SB,MB,drone=null,mT=0,mStep=0;
function audio(){if(!AC){AC=new(window.AudioContext||window.webkitAudioContext)();const cp=AC.createDynamicsCompressor();cp.connect(AC.destination);SB=AC.createGain();SB.gain.value=2.2;SB.connect(cp);MB=AC.createGain();MB.gain.value=1.5;MB.connect(cp)}if(AC.state==='suspended')AC.resume();return AC}
function snd(f,d,type='square',v=.06,s=0,delay=0){if(muted)return;try{audio();const o=AC.createOscillator(),g=AC.createGain(),n=AC.currentTime+delay;o.type=type;o.frequency.setValueAtTime(f,n);o.frequency.exponentialRampToValueAtTime(Math.max(30,f+s),n+d);g.gain.setValueAtTime(Math.min(1,v*5),n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g);g.connect(SB);o.start(n);o.stop(n+d)}catch(e){}}
function tone(f,t0,len,type,v,lpf){const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+Math.min(.03,len/3));g.gain.exponentialRampToValueAtTime(.0005,t0+len);if(lpf){const b=AC.createBiquadFilter();b.type='lowpass';b.frequency.value=lpf;o.connect(b);b.connect(g)}else o.connect(g);g.connect(MB);o.start(t0);o.stop(t0+len+.05)}
function thump(t0,v){const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.setValueAtTime(100,t0);o.frequency.exponentialRampToValueAtTime(36,t0+.18);g.gain.setValueAtTime(v,t0);g.gain.exponentialRampToValueAtTime(.001,t0+.32);o.connect(g);g.connect(MB);o.start(t0);o.stop(t0+.36)}
function tens(){if(!G||!['play','levelup','pause'].includes(state))return .12;return clamp(G.zs.length/18+G.wave/16+(G.boss?.4:0)+(G.fr.hp<30?.2:0),.12,1)}
function startMusic(){audio();if(drone)return;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=220;const dg=AC.createGain();dg.gain.value=.2;lp.connect(dg);dg.connect(MB);
[55,58.3,110.4].forEach((f,i)=>{const o=AC.createOscillator();o.type=i<2?'sawtooth':'triangle';o.frequency.value=f;o.connect(lp);o.start()});
const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=.15;lg.gain.value=90;l.connect(lg);lg.connect(lp.frequency);l.start();
drone={lp,dg};mT=AC.currentTime+.2;setInterval(sched,30)}
function sched(){if(!AC||!MB)return;const T=tens(),n=AC.currentTime;drone.dg.gain.setTargetAtTime(.12+.2*T,n,.5);
MB.gain.setTargetAtTime(muted?0:state==='pause'?.2:(state==='over'||state==='win')?.3:1.6,n,.3);
while(mT<n+.15){const bpm=80+T*50,dur=60/bpm/4;mstep(mStep,mT,T,dur);mT+=dur;mStep=(mStep+1)%32}}
function mstep(s,t0,T,dur){const b=s%16;
if(b===0)thump(t0,1.4);if(b===3)thump(t0,.95);if(T>.5&&(b===8||b===11))thump(t0,1);
if(b===0&&Math.random()<.7){const ch=[[220,233.1],[196,277.2],[164.8,233.1]][Math.floor(Math.random()*3)];ch.forEach(f=>tone(f,t0,dur*14,'sine',.12+.06*T,900))}
if(T>.25&&[0,2,5,7,10,12,14].includes(b)&&Math.random()<.3+T*.5){const sc=[220,233.1,261.6,311.1,329.6];tone(sc[(s*3+b)%5]*(T>.7&&b%4===2?2:1),t0,dur*1.6,'triangle',.08+.06*T,1600)}
if(G&&G.boss&&state==='play'&&b%2===0)tone(55,t0,dur*1.8,'sawtooth',.2,260);
if(Math.random()<.015)tone(1760+Math.random()*400,t0,.9,'sine',.05,null)}
const bg=(()=>{const b=document.createElement('canvas');b.width=W*2;b.height=H*2;const c=b.getContext('2d');c.scale(2,2);
c.fillStyle='#1b2024';c.fillRect(0,0,W,H);
for(let i=0;i<1400;i++){c.fillStyle='rgba('+(Math.random()<.5?'255,255,255':'0,0,0')+','+Math.random()*.05+')';c.fillRect(rnd(0,W),rnd(0,H),rnd(2,5),rnd(2,5))}
c.fillStyle='#252b30';c.fillRect(0,215,W,170);c.fillRect(395,0,170,H);
c.strokeStyle='#caa94a';c.lineWidth=3;c.setLineDash([22,18]);c.beginPath();c.moveTo(0,300);c.lineTo(W,300);c.moveTo(480,0);c.lineTo(480,H);c.stroke();c.setLineDash([]);
c.fillStyle='#2f363c';c.beginPath();c.arc(480,300,78,0,7);c.fill();c.strokeStyle='#3d464d';c.lineWidth=2;c.stroke();
c.strokeStyle='rgba(0,0,0,.55)';c.lineWidth=1.5;
for(let i=0;i<22;i++){let x=rnd(0,W),y=rnd(0,H);c.beginPath();c.moveTo(x,y);for(let j=0;j<5;j++){x+=rnd(-30,30);y+=rnd(-30,30);c.lineTo(x,y)}c.stroke()}
for(let i=0;i<30;i++){const x=rnd(0,W),y=rnd(0,H);if(Math.hypot(x-480,y-300)<130)continue;c.fillStyle=['#3a4046','#2d3236','#4a4440'][i%3];c.save();c.translate(x,y);c.rotate(rnd(0,3));c.fillRect(-6,-4,rnd(8,20),rnd(5,12));c.restore()}
for(let i=0;i<9;i++){c.fillStyle='rgba(90,10,10,.35)';c.beginPath();c.ellipse(rnd(0,W),rnd(0,H),rnd(10,30),rnd(6,18),rnd(0,3),0,7);c.fill()}
const car=(x,y,a,col)=>{c.save();c.translate(x,y);c.rotate(a);c.fillStyle='#0008';c.fillRect(-36,-20,76,46);c.fillStyle=col;c.fillRect(-38,-20,76,40);c.fillStyle='#10161a';c.fillRect(-14,-16,34,32);c.fillStyle='#ffffff18';c.fillRect(-14,-16,34,8);c.fillStyle='#d7c8a0';c.fillRect(34,-16,4,8);c.fillRect(34,8,4,8);c.restore()};
car(150,110,.1,'#7a3b2e');car(820,480,-.15,'#2e4c7a');car(130,500,1.5,'#6a6a58');car(830,95,1.4,'#4a4a52');
c.strokeStyle='#59636a';c.lineWidth=3;c.setLineDash([6,5]);c.strokeRect(10,10,W-20,H-20);c.setLineDash([]);
return b})();

const PS=new Image(),FI=new Image(),FW=204,FH=202;FI.src='assets/teman.png';
function newGame(){G={fr:{x:480,y:300,hp:100,max:100,shake:0,flash:0},p:{x:480,y:420,hp:100,max:100,a:-1.57,cd:0,flash:0,rec:0,down:0,inv:0,walk:0,hurt:0},
lvl:1,xp:0,need:5,dmgLv:0,accLv:0,rateLv:0,wave:0,queue:[],spawnT:0,markers:[],zs:[],bs:[],orbs:[],ps:[],txt:[],corpses:[],kills:0,banner:0,btxt:'',between:1.5,pending:0,boss:null,shots:0,hits:0,time:0,winT:0,warnT:0}}
const dmgV=()=>10+4*G.dmgLv,spread=()=>.22/(1+.5*G.accLv),cool=()=>.34*Math.pow(.86,G.rateLv),accP=()=>Math.round(100*(1-spread()/.5));

function startWave(){const g=G,d=D[diff];g.wave++;g.between=3.5;let n=Math.round((5+g.wave*2.2)*d.n),q=[];
for(let i=0;i<n;i++){const r=Math.random(),w=g.wave;q.push(w<4?'normal':w<7?(r<.25?'fast':r<.45?'strong':'normal'):(r<.3?'fast':r<.55?'strong':'normal'))}
if(g.wave===10){q=q.slice(0,7);q.splice(2,0,'boss');snd(55,1.2,'sawtooth',.14,-15);snd(80,1.2,'square',.08,-30,.15)}
g.queue=q;g.spawnT=2.2;g.banner=2.6;g.btxt=g.wave===10?'WAVE 10 – ZOMBIE BOSS':'WAVE '+g.wave}
function addMarker(type){const s=Math.floor(Math.random()*4),m={type,t:type==='boss'?2:1.2,max:type==='boss'?2:1.2};
if(s<2){m.sx=rnd(60,W-60);m.sy=s?H+40:-40;m.x=m.sx;m.y=s?H-16:16}else{m.sy=rnd(60,H-60);m.sx=s===2?-40:W+40;m.y=m.sy;m.x=s===2?16:W-16}
G.markers.push(m);snd(300,.12,'triangle',.03)}
function mkZ(m){const T=ZT[m.type],d=D[diff],g=G,b=m.type==='boss';
const z={x:m.sx,y:m.sy,type:m.type,hp:T.hp*d.hp*(b?1:1+g.wave*.1),sp:T.sp*d.spd*(1+g.wave*.03),r:T.r,dmg:T.dmg*d.dmg,rate:T.rate,atk:.4,ph:rnd(0,6),hit:0,lunge:0,face:0,ch:3,wind:0,dash:0,ph2:false,pcd:0};
z.max=z.hp;if(b){g.boss=z}g.zs.push(z)}

function shoot(){const p=G.p,a=p.a+(Math.random()-.5)*2*spread();
G.bs.push({x:p.x+Math.cos(p.a)*42,y:p.y+Math.sin(p.a)*42,vx:Math.cos(a)*850,vy:Math.sin(a)*850,l:.75});
p.cd=cool();p.rec=1;p.flash=.07;G.shots++;snd(240,.08,'sawtooth',.05,-170);
G.ps.push({x:p.x,y:p.y,vx:Math.cos(p.a+1.6)*100,vy:Math.sin(p.a+1.6)*100,l:.4,m:.4,c:'#ffd27a',s:2})}
function burst(x,y,col,n,sp){for(let i=0;i<n;i++){const a=rnd(0,6.3),v=rnd(30,sp);G.ps.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:rnd(.25,.6),m:.6,c:col,s:rnd(1.5,3.5)})}}
function say(x,y,s,c){G.txt.push({x,y,s,c,l:.8})}

function kill(z){const g=G,T=ZT[z.type];g.kills++;g.corpses.push({x:z.x,y:z.y,a:z.face,type:z.type,ph:z.ph,l:1.6});burst(z.x,z.y,'#6a9a3a',z.type==='boss'?40:14,160);
const n=z.type==='boss'?10:T.orb;for(let i=0;i<n;i++)g.orbs.push({x:z.x+rnd(-14,14),y:z.y+rnd(-14,14),v:1,ph:rnd(0,6)});
snd(110,.18,'sawtooth',.06,-70);if(z.type==='boss'){g.winT=2.4;g.boss=null;snd(500,.6,'sine',.1,400)}}
function addXP(v){const g=G;if(g.lvl>=10)return;g.xp+=v;while(g.xp>=g.need&&g.lvl<10){g.xp-=g.need;g.lvl++;g.pending++;g.need=Math.round(3+g.lvl*1.6);if(g.lvl>=10)g.xp=0}if(g.pending>0)openLevel()}
function openLevel(){state='levelup';$('lvlSub').textContent='Level '+G.lvl+'. Pilih satu bonus, efeknya menumpuk sampai akhir.';
const o=[['dmgLv','DAMAGE','Damage '+dmgV()+' menjadi '+(dmgV()+4)],['accLv','AKURASI','Peluru lebih lurus: '+accP()+'% menjadi '+Math.round(100*(1-.22/(1+.5*(G.accLv+1))/.5))+'%'],['rateLv','KECEPATAN TEMBAK','Jeda tembak '+cool().toFixed(2)+' dtk menjadi '+(cool()*.86).toFixed(2)+' dtk']];
const el=$('cards');el.innerHTML='';o.forEach((c,i)=>{const b=document.createElement('button');b.className='card';b.innerHTML='<b>'+c[1]+'</b><i>'+c[2]+'</i>';b.onclick=()=>pick(c[0]);el.appendChild(b)});setOv('lvl');
snd(520,.12,'square',.07,0);snd(660,.12,'square',.07,0,.12);snd(880,.25,'square',.07,0,.24)}
function pick(k){G[k]++;G.pending--;snd(700,.1,'sine',.08,300);if(G.pending>0)openLevel();else{state='play';setOv(null)}}
function setOv(id){document.querySelectorAll('.ov').forEach(e=>e.classList.remove('on'));if(id)$(id).classList.add('on')}

function update(dt){const g=G,p=g.p,f=g.fr,d=D[diff];g.time+=dt;
if(p.down>0){p.down-=dt;if(p.down<=0){p.hp=p.max;p.inv=2;p.x=480;p.y=450}}
else{let mx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),my=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);const l=Math.hypot(mx,my);if(l){mx/=l;my/=l;p.walk+=dt*11}
p.x=clamp(p.x+mx*235*dt,22,W-22);p.y=clamp(p.y+my*235*dt,22,H-22);
const fx=p.x-f.x,fy=p.y-f.y,fd=Math.hypot(fx,fy);if(fd<46&&fd>.01){p.x=f.x+fx/fd*46;p.y=f.y+fy/fd*46}
p.a=Math.atan2(mouse.y-p.y,mouse.x-p.x);p.cd-=dt;if((mouse.down||keys[' '])&&p.cd<=0)shoot()}
p.rec=Math.max(0,p.rec-dt*9);p.flash-=dt;p.inv-=dt;p.hurt-=dt;f.shake=Math.max(0,f.shake-dt*4);f.flash-=dt;g.banner-=dt;
const alive=g.zs.length+g.queue.length+g.markers.length;
if(!alive&&g.wave<10&&!g.winT){g.between-=dt;if(g.between<=0)startWave()}
g.spawnT-=dt;if(g.queue.length&&g.spawnT<=0){const ty=g.queue.shift();addMarker(ty);g.spawnT=rnd(.5,1.1)*(ty==='boss'?3:1)}
for(let i=g.markers.length-1;i>=0;i--){const m=g.markers[i];m.t-=dt;if(m.t<=0){mkZ(m);g.markers.splice(i,1)}}
let near=false;
for(let i=0;i<g.zs.length;i++){const z=g.zs[i];z.hit-=dt;z.lunge=Math.max(0,z.lunge-dt*4);z.pcd-=dt;let spd=z.sp;
if(z.type==='boss'){z.ch-=dt;if(z.ch<=0){z.wind=.8;z.ch=6}if(z.wind>0){z.wind-=dt;spd=0;if(z.wind<=0)z.dash=.6}if(z.dash>0){z.dash-=dt;spd=z.sp*6}
if(!z.ph2&&z.hp<z.max/2){z.ph2=true;for(let k=0;k<4;k++)addMarker('fast');g.banner=2;g.btxt='BOSS MARAH!'}}
const dx=f.x-z.x,dy=f.y-z.y,dist=Math.hypot(dx,dy)||1;z.face=Math.atan2(dy,dx);
if(dist<150)near=true;
if(dist>z.r+28){z.x+=dx/dist*spd*dt;z.y+=dy/dist*spd*dt}
else{z.atk-=dt;if(z.atk<=0){f.hp-=z.dmg;f.shake=1;f.flash=.2;z.lunge=1;z.atk=z.rate;snd(90,.16,'sawtooth',.08,-30);burst(f.x,f.y,'#c0392b',6,90);say(f.x+rnd(-20,20),f.y-30,'-'+Math.round(z.dmg),'#ff6b6b')}}
if(p.down<=0&&p.inv<=0&&z.pcd<=0&&Math.hypot(p.x-z.x,p.y-z.y)<z.r+13){p.hp-=z.dmg*.6;z.pcd=.9;p.hurt=.2;z.lunge=1;snd(150,.12,'square',.07,-80);if(p.hp<=0){p.down=3;p.hp=0;burst(p.x,p.y,'#3cc6c0',16,150)}}
for(let j=i+1;j<g.zs.length;j++){const w=g.zs[j],ex=w.x-z.x,ey=w.y-z.y,ed=Math.hypot(ex,ey),mn=(z.r+w.r)*.8;if(ed<mn&&ed>.01){const k=(mn-ed)*.5;z.x-=ex/ed*k;z.y-=ey/ed*k;w.x+=ex/ed*k;w.y+=ey/ed*k}}}
g.warnT-=dt;if(near&&g.warnT<=0){g.warnT=.9;snd(440,.1,'triangle',.04)}g.near=near;
for(let i=g.bs.length-1;i>=0;i--){const b=g.bs[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.l-=dt;let gone=b.l<=0||b.x<-10||b.x>W+10||b.y<-10||b.y>H+10;
if(!gone)for(const z of g.zs){if(Math.hypot(z.x-b.x,z.y-b.y)<z.r+4){const dm=Math.round(dmgV()*rnd(.9,1.1));z.hp-=dm;z.hit=.1;z.x+=b.vx*.004;z.y+=b.vy*.004;g.hits++;burst(b.x,b.y,'#9ccc5a',5,120);say(z.x+rnd(-8,8),z.y-z.r-4,dm,'#ffe28a');snd(130,.07,'square',.04,-60);gone=true;if(z.hp<=0){kill(z);g.zs.splice(g.zs.indexOf(z),1)}break}}
if(gone)g.bs.splice(i,1)}
for(let i=g.orbs.length-1;i>=0;i--){const o=g.orbs[i];if(p.down>0)continue;const dx=p.x-o.x,dy=p.y-o.y,dd=Math.hypot(dx,dy);if(dd<85){o.x+=dx/dd*280*dt;o.y+=dy/dd*280*dt}
if(dd<18){g.orbs.splice(i,1);snd(700,.1,'sine',.06,500);say(o.x,o.y-10,'+1 XP','#ffd23f');addXP(o.v)}}
for(let i=g.ps.length-1;i>=0;i--){const q=g.ps[i];q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.93;q.vy*=.93;q.l-=dt;if(q.l<=0)g.ps.splice(i,1)}
for(let i=g.txt.length-1;i>=0;i--){const q=g.txt[i];q.y-=34*dt;q.l-=dt;if(q.l<=0)g.txt.splice(i,1)}
for(let i=g.corpses.length-1;i>=0;i--){g.corpses[i].l-=dt;if(g.corpses[i].l<=0)g.corpses.splice(i,1)}
if(f.hp<=0){f.hp=0;finish(false)}else if(g.winT>0){g.winT-=dt;if(g.winT<=0)finish(true)}}

function finish(win){state=win?'win':'over';const g=G;$('endT').textContent=win?'MENANG! Boss tumbang':'Temanmu tidak selamat';
$('endS').innerHTML=(win?'Kamu melindungi temanmu sampai akhir.':'Zombie berhasil menjangkau temanmu.')+'<br>Level '+g.lvl+' | Wave '+g.wave+'/10 | Zombie dikalahkan: '+g.kills+'<br>Akurasi tembakan: '+(g.shots?Math.round(100*g.hits/g.shots):0)+'% | Bonus: Damage x'+g.dmgLv+', Akurasi x'+g.accLv+', Tembak x'+g.rateLv;
setOv('end');snd(win?600:100,.8,win?'sine':'sawtooth',.1,win?500:-50)}

function drawZ(x,y,a,ty,ph,tm,hit,lunge,wind){const T=ZT[ty],r=T.r,s=Math.sin(tm*T.f+ph),k=Math.cos(tm*T.f+ph);
X.save();X.translate(x,y);X.fillStyle='rgba(0,0,0,.35)';X.beginPath();X.ellipse(2,4,r*1.1,r*.9,0,0,7);X.fill();X.rotate(a+s*.1);
for(const sd of[-1,1]){X.fillStyle='#26262b';X.beginPath();X.ellipse(-r*.3+sd*s*r*.45,sd*r*.42,r*.4,r*.22,0,0,7);X.fill()}
for(const sd of[-1,1]){const ex=r*1.25+lunge*r*.6+sd*k*r*.15,ey=sd*r*.55;X.strokeStyle=T.skin;X.lineWidth=r*.34;X.lineCap='round';X.beginPath();X.moveTo(r*.1,sd*r*.8);X.lineTo(ex,ey);X.stroke();X.fillStyle='#5b3b3b';X.beginPath();X.arc(ex,ey,r*.2,0,7);X.fill()}
X.fillStyle=T.cloth;X.beginPath();X.ellipse(0,0,r*.72,r*.98,0,0,7);X.fill();
X.fillStyle='rgba(0,0,0,.28)';X.fillRect(-r*.5,-r*.25,r*.45,r*.3);X.fillStyle='#7d1b1b';X.beginPath();X.arc(-r*.1,r*.4,r*.22,0,7);X.fill();
if(ty==='boss'){X.fillStyle='#cfc7b0';for(let i=-2;i<=2;i++){X.beginPath();X.moveTo(-r*.5,i*r*.3-r*.1);X.lineTo(-r*1,i*r*.3);X.lineTo(-r*.5,i*r*.3+r*.1);X.fill()}}
X.fillStyle=T.skin;X.beginPath();X.arc(r*.18,0,r*.52,0,7);X.fill();X.fillStyle='rgba(60,0,0,.5)';X.beginPath();X.arc(r*.05,-r*.27,r*.16,0,7);X.fill();
X.fillStyle=T.eye;X.globalAlpha=.35;for(const sd of[-1,1]){X.beginPath();X.arc(r*.52,sd*r*.2,r*.22,0,7);X.fill()}X.globalAlpha=1;
for(const sd of[-1,1]){X.beginPath();X.arc(r*.52,sd*r*.2,r*.1,0,7);X.fill()}
X.fillStyle='#200';X.beginPath();X.ellipse(r*.66,0,r*.06,r*.15,0,0,7);X.fill();
if(hit>0||wind>0){X.fillStyle=wind>0?'rgba(255,40,40,.5)':'rgba(255,255,255,.65)';X.beginPath();X.arc(0,0,r*1.1,0,7);X.fill()}
X.restore()}

function drawFriend(){const f=G.fr,tm=G.time,sx=f.shake?rnd(-3,3)*f.shake:0;X.save();X.translate(f.x+sx,f.y);
X.fillStyle='rgba(60,198,192,'+(.1+.06*Math.sin(tm*2))+')';X.beginPath();X.ellipse(0,0,62,44,0,0,7);X.fill();
X.strokeStyle='rgba(60,198,192,.6)';X.lineWidth=2;X.setLineDash([8,6]);X.beginPath();X.ellipse(0,0,58+Math.sin(tm*2)*2,40,0,0,7);X.stroke();X.setLineDash([]);
for(let i=0;i<12;i++){const a=i/12*6.283;X.fillStyle='#8a7a5a';X.beginPath();X.ellipse(Math.cos(a)*52,Math.sin(a)*35,6,3.5,a+1.57,0,7);X.fill()}
X.fillStyle='#3e4851';X.fillRect(-44,-19,88,38);X.fillStyle='#4b5762';X.fillRect(-44,-19,88,4);
X.fillStyle='rgba(0,0,0,.3)';X.beginPath();X.ellipse(0,15,34,6,0,0,7);X.fill();
X.save();X.rotate(-Math.PI/2);X.scale(1+Math.sin(tm*2.4)*.025,1);if(FI.complete&&FI.width){const h=76,w=h*FI.width/FI.height;X.drawImage(FI,-w/2,-h/2,w,h)}
X.restore();
if(f.flash>0){X.fillStyle='rgba(255,40,40,.4)';X.beginPath();X.ellipse(0,0,40,22,0,0,7);X.fill()}
X.restore();
if(G.near){X.fillStyle='rgba(255,50,50,'+(.15+.15*Math.sin(G.time*14))+')';X.beginPath();X.ellipse(f.x,f.y,72,52,0,0,7);X.fill();X.fillStyle='#ff4d4d';X.font='bold 26px Bungee,Impact,sans-serif';X.textAlign='center';X.fillText('!',f.x,f.y-54)}
X.fillStyle='#efe9d8';X.font='bold 11px system-ui,sans-serif';X.textAlign='center';X.fillText('TEMAN',f.x,f.y+47);
X.fillStyle='rgba(0,0,0,.6)';X.fillRect(f.x-24,f.y+52,48,6);X.fillStyle='#e5484d';X.fillRect(f.x-24,f.y+52,48*f.hp/f.max,6)}

function drawPlayer(){const p=G.p;if(p.down>0){X.save();X.translate(p.x,p.y);X.rotate(1.57);X.globalAlpha=.6;X.fillStyle='#3f8f3a';X.fillRect(-9,-14,18,28);X.fillStyle='#2e7a30';X.beginPath();X.arc(0,-14,8,0,7);X.fill();X.restore();X.fillStyle='#fff';X.font='bold 12px system-ui';X.textAlign='center';X.fillText('Bangkit '+Math.ceil(p.down)+'...',p.x,p.y-30);return}
X.save();if(p.inv>0&&Math.floor(G.time*12)%2)X.globalAlpha=.4;X.translate(p.x,p.y);X.fillStyle='rgba(0,0,0,.35)';X.beginPath();X.ellipse(2,4,18,15,0,0,7);X.fill();X.rotate(p.a);
const s=Math.sin(p.walk),rc=p.rec*4,ol='#14301a',hurt=p.hurt>0;X.lineJoin='round';X.lineWidth=1.5;X.strokeStyle=ol;
for(const sd of[-1,1]){X.fillStyle='#3b2a1e';X.fillRect(-7+sd*s*5,sd*8-3,11,6);X.strokeRect(-7+sd*s*5,sd*8-3,11,6)}
X.fillStyle='#7a4a22';X.fillRect(-19,-9,13,18);X.strokeRect(-19,-9,13,18);X.fillStyle='#5a3416';X.fillRect(-17,-9,2,18);X.fillRect(-12,-9,2,18);
X.fillStyle=hurt?'#fff':'#3f8f3a';X.beginPath();X.moveTo(-9,-16);X.lineTo(7,-13);X.lineTo(7,13);X.lineTo(-9,16);X.closePath();X.fill();X.stroke();
X.fillStyle=hurt?'#fff':'#2f7a2f';X.fillRect(-9,-6,10,12);
X.lineCap='round';X.strokeStyle=ol;X.lineWidth=7;X.beginPath();X.moveTo(3,12);X.lineTo(19-rc,4);X.moveTo(3,-12);X.lineTo(27-rc,2);X.stroke();
X.strokeStyle=hurt?'#fff':'#3f8f3a';X.lineWidth=4.5;X.beginPath();X.moveTo(3,12);X.lineTo(19-rc,4);X.moveTo(3,-12);X.lineTo(27-rc,2);X.stroke();
X.fillStyle='#16191b';X.fillRect(12-rc,-3,30,6);X.fillStyle='#3a4046';X.fillRect(18-rc,-3,9,2.5);X.fillStyle='#16191b';X.fillRect(20-rc,2,5,7);X.fillStyle='#555d66';X.fillRect(38-rc,-2,5,4);
X.fillStyle='#e0a37a';X.beginPath();X.arc(19-rc,4,3.2,0,7);X.fill();X.beginPath();X.arc(27-rc,2,3.2,0,7);X.fill();
if(p.flash>0){X.fillStyle='#ffe14a';X.beginPath();X.moveTo(44,0);X.lineTo(60,-9);X.lineTo(53,0);X.lineTo(60,9);X.closePath();X.fill();X.fillStyle='rgba(255,230,90,.35)';X.beginPath();X.arc(48,0,17,0,7);X.fill()}
X.lineWidth=1.5;X.strokeStyle=ol;X.fillStyle=hurt?'#fff':'#3a9a3a';X.beginPath();X.arc(0,0,9.5,0,7);X.fill();X.stroke();
X.fillStyle=hurt?'#fff':'#2c7a2d';X.beginPath();X.arc(-1,0,6,0,7);X.fill();X.fillStyle='#5cc25c';X.beginPath();X.arc(2,-3,3,3.6,5.2);X.fill();X.fillStyle='#4a2c16';X.fillRect(6,-3,3,6);
X.restore()}

function bar(x,y,w,h,v,col,lab){X.fillStyle='rgba(0,0,0,.65)';X.fillRect(x,y,w,h);X.fillStyle=col;X.fillRect(x,y,w*clamp(v,0,1),h);X.strokeStyle='rgba(255,255,255,.5)';X.strokeRect(x,y,w,h);X.fillStyle='#fff';X.font='bold 11px system-ui,sans-serif';X.textAlign='left';X.fillText(lab,x+6,y+h-4)}

function drawGame(){const g=G;
X.drawImage(bg,0,0,W,H);
const lg=(x,y,c)=>{const q=X.createRadialGradient(x,y,0,x,y,330);q.addColorStop(0,c);q.addColorStop(1,'rgba(0,0,0,0)');X.fillStyle=q;X.fillRect(0,0,W,H)};
const fl=.1+.09*Math.sin(g.time*5);lg(40,40,'rgba(255,60,60,'+fl+')');lg(920,560,'rgba(70,120,255,'+(.19-fl)+')');
for(const c of g.corpses){X.globalAlpha=clamp(c.l/1.6,0,1)*.7;X.fillStyle='#4a1010';X.beginPath();X.ellipse(c.x,c.y,ZT[c.type].r*1.1,ZT[c.type].r*.8,0,0,7);X.fill();X.save();X.translate(c.x,c.y);X.scale(1,.55);X.translate(-c.x,-c.y);drawZ(c.x,c.y,c.a,c.type,c.ph,0,0,0,0);X.restore();X.globalAlpha=1}
for(const o of g.orbs){const b=1+.2*Math.sin(g.time*8+o.ph);X.fillStyle='rgba(255,210,63,.25)';X.beginPath();X.arc(o.x,o.y,11*b,0,7);X.fill();X.fillStyle='#ffd23f';X.beginPath();X.arc(o.x,o.y,5.5,0,7);X.fill();X.fillStyle='#fff8d0';X.beginPath();X.arc(o.x-1.5,o.y-1.5,2,0,7);X.fill()}
drawFriend();
for(const m of g.markers){const k=m.t/m.max,pl=.5+.5*Math.sin(g.time*18);X.save();X.translate(m.x,m.y);X.fillStyle='rgba(255,60,60,'+(.5+.5*pl)+')';X.beginPath();const s=m.type==='boss'?20:11;
if(m.sy<0)X.rotate(3.14);else if(m.sx<0)X.rotate(1.57);else if(m.sx>W)X.rotate(-1.57);
X.moveTo(0,-s*(1+(1-k)*.4));X.lineTo(s,s);X.lineTo(-s,s);X.closePath();X.fill();X.fillStyle='#fff';X.fillRect(-1.5,-s*.2,3,s*.7);X.restore()}
for(const z of g.zs){drawZ(z.x,z.y,z.face,z.type,z.ph,g.time,z.hit,z.lunge,z.wind);if(z.hp<z.max&&z.type!=='boss'){X.fillStyle='rgba(0,0,0,.6)';X.fillRect(z.x-z.r,z.y-z.r-9,z.r*2,4);X.fillStyle='#8fd14f';X.fillRect(z.x-z.r,z.y-z.r-9,z.r*2*z.hp/z.max,4)}}
drawPlayer();
X.lineCap='round';for(const b of g.bs){X.strokeStyle='rgba(255,225,60,.5)';X.lineWidth=6;X.beginPath();X.moveTo(b.x-b.vx*.06,b.y-b.vy*.06);X.lineTo(b.x,b.y);X.stroke();X.strokeStyle='#ffe14a';X.lineWidth=3.5;X.beginPath();X.moveTo(b.x-b.vx*.045,b.y-b.vy*.045);X.lineTo(b.x,b.y);X.stroke();X.strokeStyle='#fffbd0';X.lineWidth=1.5;X.beginPath();X.moveTo(b.x-b.vx*.025,b.y-b.vy*.025);X.lineTo(b.x,b.y);X.stroke()}
for(const q of g.ps){X.globalAlpha=clamp(q.l/q.m,0,1);X.fillStyle=q.c;X.fillRect(q.x-q.s/2,q.y-q.s/2,q.s,q.s)}X.globalAlpha=1;
X.font='bold 14px Bungee,Impact,sans-serif';X.textAlign='center';for(const q of g.txt){X.globalAlpha=clamp(q.l*2,0,1);X.fillStyle='#000';X.fillText(q.s,q.x+1,q.y+1);X.fillStyle=q.c;X.fillText(q.s,q.x,q.y)}X.globalAlpha=1;
if(g.fr.hp<g.fr.max*.3){const v=X.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.85);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(200,0,0,'+(.25+.15*Math.sin(g.time*6))+')');X.fillStyle=v;X.fillRect(0,0,W,H)}
if(state==='play'){let on=false;for(const z of g.zs)if(Math.hypot(z.x-mouse.x,z.y-mouse.y)<z.r+8)on=true;const rr=9+spread()*70;X.strokeStyle=on?'#ff4d4d':'#efe9d8';X.lineWidth=2;X.beginPath();X.arc(mouse.x,mouse.y,rr,0,7);X.moveTo(mouse.x-rr-6,mouse.y);X.lineTo(mouse.x-rr+4,mouse.y);X.moveTo(mouse.x+rr-4,mouse.y);X.lineTo(mouse.x+rr+6,mouse.y);X.moveTo(mouse.x,mouse.y-rr-6);X.lineTo(mouse.x,mouse.y-rr+4);X.moveTo(mouse.x,mouse.y+rr-4);X.lineTo(mouse.x,mouse.y+rr+6);X.stroke()}
bar(16,14,280,20,g.fr.hp/g.fr.max,'#e5484d','TEMAN '+Math.ceil(g.fr.hp)+'/'+g.fr.max);bar(16,40,180,12,g.p.hp/g.p.max,'#3cc6c0','KAMU');bar(16,58,180,12,g.lvl>=10?1:g.xp/g.need,'#ffb347','LV '+g.lvl+(g.lvl>=10?' MAKS':''));
X.fillStyle='#efe9d8';X.textAlign='right';X.font='bold 16px Bungee,Impact,sans-serif';X.fillText('WAVE '+g.wave+'/10',W-16,30);X.font='bold 13px system-ui,sans-serif';X.fillText('Zombie tersisa: '+(g.zs.length+g.queue.length+g.markers.length),W-16,50);X.fillText(D[diff].name,W-16,68);
X.textAlign='left';X.font='bold 13px system-ui,sans-serif';X.fillStyle='rgba(0,0,0,.55)';X.fillRect(10,H-34,380,24);X.fillStyle='#ffe28a';X.fillText('DAMAGE '+dmgV()+'    AKURASI '+accP()+'%    TEMBAK '+(1/cool()).toFixed(1)+'/dtk',18,H-17);
if(g.boss){const b=g.boss;bar(W/2-200,14,400,18,b.hp/b.max,'#b01e6a','ZOMBIE BOSS')}
if(g.banner>0){X.globalAlpha=clamp(g.banner,0,1);X.textAlign='center';X.font='44px Bungee,Impact,sans-serif';X.fillStyle='#000';X.fillText(g.btxt,W/2+3,H/2-117);X.fillStyle='#ffb347';X.fillText(g.btxt,W/2,H/2-120);X.globalAlpha=1}}

function drawMenu(){X.drawImage(bg,0,0,W,H);const lg=(x,y,c)=>{const q=X.createRadialGradient(x,y,0,x,y,400);q.addColorStop(0,c);q.addColorStop(1,'rgba(0,0,0,0)');X.fillStyle=q;X.fillRect(0,0,W,H)};lg(40,40,'rgba(255,60,60,'+(.15+.1*Math.sin(t*5))+')');lg(920,560,'rgba(70,120,255,.12)');for(const z of amb)drawZ(z.x,z.y,0,z.type,z.ph,t,0,0,0)}

function loop(ts){const dt=Math.min(.033,(ts-last)/1000||0);last=ts;t+=dt;X.setTransform(2,0,0,2,0,0);X.imageSmoothingEnabled=true;X.imageSmoothingQuality='high';
if(state==='play')update(dt);else if(state==='menu'||state==='tut'||state==='dif')for(const z of amb){z.x+=z.sp*dt;if(z.x>W+50)z.x=-50}
if(G&&(state==='play'||state==='levelup'||state==='pause'||state==='over'||state==='win'))drawGame();else drawMenu();requestAnimationFrame(loop)}

function begin(){newGame();state='play';setOv(null)}
function pauseT(){if(state==='play'){state='pause';setOv('pause')}else if(state==='pause'){state='play';setOv(null)}}
function toMenu(){state='menu';G=null;setOv('menu')}
$('bStart').onclick=()=>{setOv('dif');state='dif';snd(400,.1,'square',.05)};
$('bBack').onclick=()=>{setOv('menu');state='menu'};
document.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{diff=b.dataset.d;if(seenTut)begin();else{setOv('tut');state='tut'}});
$('bGo').onclick=()=>{seenTut=true;begin()};
$('bRetry').onclick=begin;$('bMenu').onclick=toMenu;$('bRes').onclick=pauseT;$('bRe2').onclick=begin;$('bMn2').onclick=toMenu;$('bPau').onclick=pauseT;
$('bSnd').onclick=e=>{muted=!muted;e.target.textContent='Suara: '+(muted?'mati':'nyala')};
const setM=e=>{const r=C.getBoundingClientRect();mouse.x=(e.clientX-r.left)*W/r.width;mouse.y=(e.clientY-r.top)*H/r.height};
C.addEventListener('mousemove',setM);C.addEventListener('mousedown',e=>{setM(e);mouse.down=true});window.addEventListener('mouseup',()=>mouse.down=false);
C.addEventListener('touchstart',e=>{setM(e.touches[0]);mouse.down=true;e.preventDefault()},{passive:false});C.addEventListener('touchmove',e=>{setM(e.touches[0]);e.preventDefault()},{passive:false});C.addEventListener('touchend',()=>mouse.down=false);
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();keys[k]=true;if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();
if((k==='p'||k==='escape')&&!e.repeat)pauseT();if(state==='levelup'&&'123'.includes(k)&&k){const b=$('cards').children[+k-1];if(b)b.click()}});
window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
window.addEventListener('blur',()=>{keys={};mouse.down=false;if(state==='play')pauseT()});
window.addEventListener('pointerdown',startMusic,{once:true});window.addEventListener('keydown',startMusic,{once:true});
requestAnimationFrame(loop);
