
const c=document.getElementById("game"), ctx=c.getContext("2d");

const roster=[
 {name:"Chris Dempsey",nick:"DEMPS",num:"35",role:"Pylon Mode",color:"#e8eef0",trim:"#20c4c9",accent:"#e24d4d",speed:60,hustle:85,shot:55,pass:1,stick:45,special:"1% BACKHAND",desc:"Slow feet. Big heart. Cold beer.",sprite:"cage"},
 {name:"Andy Duran",nick:"FREIGHT TRAIN",num:"8",role:"Two-Way D",color:"#f6f3e8",trim:"#0e8f42",accent:"#c8102e",speed:80,hustle:92,shot:82,pass:78,stick:76,special:"BONE CRUSHER",desc:"Hits. Blocks. Chirps. Sets the tone.",sprite:"mexico"},
 {name:"Lenny Owens",nick:"SILK HANDS",num:"08",role:"Playmaker",color:"#efe5cf",trim:"#f0b23e",accent:"#111",speed:94,hustle:82,shot:60,pass:94,stick:92,special:"ANKLE PASS",desc:"Pass harder than his slap shot.",sprite:"visor"},
 {name:"Suman Chakrabarti",nick:"SHOE",num:"19",role:"Smile Boost",color:"#20a64a",trim:"#ffd53b",accent:"#e3242b",speed:52,hustle:75,shot:45,pass:95,stick:72,special:"SMILE BOOST",desc:"Slow as molasses. Passes on time.",sprite:"redglasses"},
 {name:"Avery Duran",nick:"BONES",num:"11",role:"Game Breaker",color:"#11151b",trim:"#48a6c8",accent:"#d9d9d9",speed:97,hustle:100,shot:84,pass:90,stick:90,special:"BONES MODE",desc:"18 years old. Pure speed. Pure hustle.",sprite:"cage"},
 {name:"Mark Townsend",nick:"TOWNSIE",num:"38",role:"Chaos Goalie",color:"#d9dde2",trim:"#2d65b2",accent:"#fff",speed:58,hustle:88,shot:20,pass:45,stick:55,special:"FLOP SAVE",desc:"Glove side vacation. Yells a lot.",sprite:"goalie"},
 {name:"Hudson Townsend",nick:"HUDSIE",num:"13",role:"Team Protector",color:"#d8e0e7",trim:"#17834c",accent:"#111",speed:78,hustle:91,shot:68,pass:80,stick:87,special:"DEFEND DAD",desc:"Two-way threat. Protects Townsie.",sprite:"visor"},
 {name:"Kaden Chakrabarti",nick:"HONEY BADGER",num:"23",role:"Left Wing",color:"#07182b",trim:"#27c7c9",accent:"#ffffff",speed:93,hustle:97,shot:78,pass:92,stick:98,special:"PHONE BOOTH",desc:"18. 5'7. Handles in traffic. Never backs down.",sprite:"cage"}
];

let mode="select", sel=0, keys={}, last=performance.now(), shake=0, flash=0;
let player, mate, puck, goalie, defenders, particles, popups;
let score=0,timeLeft=75,msg="",msgT=0,cool=0,hitMeter=0,combo=0,firePuck=0;

function resetState(){
 player={x:145,y:270,vx:0,vy:0,face:1,boost:0,hasPuck:false,anim:0};
 mate={x:320,y:210,vx:0,vy:0,face:1};
 puck={x:260,y:270,vx:0,vy:0,heldBy:null};
 goalie={x:850,y:270,dir:1};
 defenders=[{x:510,y:180,vx:0,vy:0,stun:0,down:0},{x:610,y:350,vx:0,vy:0,stun:0,down:0}];
 particles=[]; popups=[];
}
resetState();

function start(){mode="play";score=0;timeLeft=75;cool=0;hitMeter=0;combo=0;firePuck=0;resetState();say("SCORE 3. HIT 2. WIN SATURDAY.",2);}
addEventListener("keydown",e=>{
 const k=e.key.toLowerCase(); keys[k]=true;
 if(mode==="select"){
  if(k==="arrowleft"||k==="a")sel=(sel+roster.length-1)%roster.length;
  if(k==="arrowright"||k==="d")sel=(sel+1)%roster.length;
  if(e.key==="Enter")start();
 }else{
  if(e.key==="Escape")mode="select";
  if(e.code==="Space")shoot();
  if(k==="x")pass();
  if(e.key==="Shift")checkOrSpecial();
  if(mode==="done"&&e.key==="Enter")start();
 }
});
addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);

function say(t,n=1){msg=t;msgT=n;popups.push({t,x:480,y:155,life:n,col:"#ffdc5e",s:28});}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
function txt(t,x,y,s=16,col="#fff",a="left"){ctx.fillStyle=col;ctx.font=`bold ${s}px monospace`;ctx.textAlign=a;ctx.fillText(t,x,y);}
function rect(x,y,w,h,col){ctx.fillStyle=col;ctx.fillRect(x,y,w,h);}
function burst(x,y,col,n){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*7,vy:(Math.random()-.5)*7,t:1,col,size:2+Math.random()*4});}
function iceSpray(x,y,dir,n=12){for(let i=0;i<n;i++)particles.push({x,y,vx:-dir*(Math.random()*5+1),vy:(Math.random()-.5)*5,t:.55,col:"#ffffff",size:2});}
function fireTrail(x,y,n=5){for(let i=0;i<n;i++)particles.push({x:x+(Math.random()-.5)*10,y:y+(Math.random()-.5)*10,vx:(Math.random()-.5)*2,vy:(Math.random()-.5)*2,t:.45,col:Math.random()>.5?"#ff4b00":"#ffdc5e",size:3});}

function bar(label,val,x,y,w=120){
 txt(label,x,y,13,"#ddd"); ctx.strokeStyle="#344"; ctx.strokeRect(x+55,y-11,w,9);
 ctx.fillStyle=val>=95?"#19d7d7":val>=85?"#5bd95b":val>=70?"#e5b03d":"#d95151";
 ctx.fillRect(x+55,y-11,w*val/100,9); txt(val,x+55+w+8,y,13,"#fff");
}

function card(p,x,y,w,h,on){
 rect(x,y,w,h,on?"#102a3d":"#11161d");
 ctx.strokeStyle=on?"#46d7ff":p.trim; ctx.lineWidth=on?5:2; ctx.strokeRect(x,y,w,h);
 if(on){ctx.globalAlpha=.18;ctx.fillStyle=p.trim;ctx.fillRect(x,y,w,h);ctx.globalAlpha=1;}
 drawPixelSkater(x+w/2,y+72,p,1.1,1,false,true);
 txt("#"+p.num,x+12,y+25,23,p.trim); txt(p.nick,x+w/2,y+24,15,"#f5dfb0","center"); txt(p.role,x+w/2,y+h-14,13,p.trim,"center");
}

function drawPixelSkater(x,y,p,s=1,face=1,down=false,idle=false){
 ctx.save(); ctx.translate(x,y); ctx.scale(s*face,s);
 if(down){ctx.rotate(-Math.PI/2);}
 const bob = idle ? Math.sin(Date.now()/160)*2 : 0;
 ctx.translate(0,bob);
 // skates shadow
 ctx.globalAlpha=.25; ctx.fillStyle="#000"; ctx.fillRect(-25,42,50,8); ctx.globalAlpha=1;
 // legs
 ctx.fillStyle="#111"; ctx.fillRect(-15,18,12,25); ctx.fillRect(3,18,12,25);
 ctx.fillStyle="#ddd"; ctx.fillRect(-18,42,18,4); ctx.fillRect(4,42,18,4);
 // jersey
 ctx.fillStyle=p.color; ctx.strokeStyle=p.trim; ctx.lineWidth=3; ctx.fillRect(-18,-25,36,43); ctx.strokeRect(-18,-25,36,43);
 ctx.fillStyle=p.trim; ctx.fillRect(-18,-6,36,6); ctx.fillStyle=p.accent; ctx.fillRect(-18,5,36,4);
 // arms
 ctx.fillStyle=p.color; ctx.strokeStyle=p.trim; ctx.lineWidth=2;
 ctx.fillRect(-30,-18,12,28); ctx.strokeRect(-30,-18,12,28); ctx.fillRect(18,-18,12,28); ctx.strokeRect(18,-18,12,28);
 // helmet/head
 ctx.fillStyle="#111"; ctx.beginPath(); ctx.arc(0,-42,16,0,Math.PI*2); ctx.fill();
 ctx.strokeStyle=p.trim; ctx.lineWidth=3; ctx.strokeRect(-12,-50,24,14);
 if(p.sprite==="redglasses"){ctx.strokeStyle="#ff2424";ctx.lineWidth=3;ctx.strokeRect(-10,-45,8,6);ctx.strokeRect(2,-45,8,6);}
 if(p.sprite==="cage"||p.sprite==="goalie"){ctx.strokeStyle="#cfd8df";ctx.lineWidth=1;for(let i=-8;i<=8;i+=4){ctx.beginPath();ctx.moveTo(i,-50);ctx.lineTo(i,-36);ctx.stroke();}}
 if(p.sprite==="mexico"){ctx.fillStyle="#c8102e";ctx.fillRect(-6,-25,12,43);}
 if(p.sprite==="goalie"){ctx.fillStyle=p.trim;ctx.fillRect(-34,16,14,38);ctx.fillRect(20,16,14,38);}
 ctx.fillStyle=p.trim; ctx.font="bold 14px monospace"; ctx.textAlign="center"; ctx.fillText(p.num,0,2);
 // stick right-hand visual
 ctx.strokeStyle="#d6c9aa"; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(-6,6); ctx.lineTo(34,42); ctx.stroke();
 ctx.strokeStyle="#111"; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(34,42); ctx.lineTo(48,42); ctx.stroke();
 ctx.restore();
}

function drawGoalie(){drawPixelSkater(goalie.x,goalie.y,roster[5],1.15,-1,false);}

function rink(){
 const g=ctx.createLinearGradient(0,80,0,460); g.addColorStop(0,"#dceff8"); g.addColorStop(1,"#bcd8e8");
 ctx.fillStyle="#ddecf5"; ctx.fillRect(0,0,960,540); ctx.fillStyle=g; ctx.fillRect(30,80,900,380);
 ctx.strokeStyle="#93b9ce"; ctx.lineWidth=3; ctx.strokeRect(30,80,900,380);
 ctx.strokeStyle="#d33"; ctx.beginPath(); ctx.moveTo(145,80); ctx.lineTo(145,460); ctx.moveTo(815,80); ctx.lineTo(815,460); ctx.stroke();
 ctx.strokeStyle="#315"; ctx.strokeRect(865,210,45,120);
 ctx.globalAlpha=.18; ctx.strokeStyle="#fff";
 for(let i=0;i<14;i++){ctx.beginPath();ctx.moveTo((i*73)%930+30,90);ctx.lineTo(((i*73)+180)%930+30,450);ctx.stroke();}
 ctx.globalAlpha=1;
 // crowd boards
 rect(30,60,900,20,"#172531"); txt("SMDC  •  NO PRACTICE  •  JUST SATURDAYS  •  SMDC",480,75,14,"#f0dbb2","center");
}

function attachPuckToPlayer(){
 const stickX=player.x+player.face*38, stickY=player.y+40;
 puck.x+=(stickX-puck.x)*0.72; puck.y+=(stickY-puck.y)*0.72; puck.vx=player.vx*3; puck.vy=player.vy*3;
}
function tryPossession(){
 if(!player.hasPuck&&dist(puck,player)<42){player.hasPuck=true;puck.heldBy="player";say("PUCK POSSESSION",.45);}
 defenders.forEach(d=>{if(player.hasPuck&&d.down<=0&&d.stun<=0&&Math.hypot(d.x-player.x,d.y-player.y)<36){if(Math.random()>.62){player.hasPuck=false;puck.heldBy=null;puck.vx=-player.face*4;puck.vy=(Math.random()-.5)*5;say("POKE CHECK!",.55);}}});
}
function shotPowerAndAim(p){
 const zoneBoost=player.x>720?1.55:player.x>560?1.25:.92;
 const anglePenalty=Math.max(.62,1-(Math.abs(player.y-270)/190)*.38);
 const hitBoost=1+hitMeter/150+(firePuck>0?.35:0);
 return (6+p.shot/8)*zoneBoost*anglePenalty*hitBoost;
}
function shoot(){
 const p=roster[sel];
 if(player.hasPuck||dist(puck,player)<72){
  const power=shotPowerAndAim(p), targetY=270+(player.y-270)*.22+(Math.random()-.5)*(28-p.shot/5);
  puck.heldBy=null;player.hasPuck=false;puck.vx=player.face*power;puck.vy=(targetY-puck.y)*.08;
  const zone=player.x>720?"DANGER ZONE":player.x>560?"SLOT SHOT":"LONG RANGE";
  if(hitMeter>80){firePuck=1.4;shake=8;flash=.18;say("ON FIRE POWER SHOT!",1);}
  else say(`${zone}: ${p.nick} FIRES!`,.9);
  hitMeter=0;burst(puck.x,puck.y,p.trim,16);
 }
}
function pass(){
 const p=roster[sel];
 if(player.hasPuck||dist(puck,player)<78){
  puck.heldBy=null; player.hasPuck=false; mate.hasPuck=false; mate.passHold=0;
  let dx=mate.x-puck.x,dy=mate.y-puck.y,m=Math.hypot(dx,dy)||1;
  puck.vx=dx/m*(5+p.pass/12); puck.vy=dy/m*(5+p.pass/12);
  say(p.nick==="HONEY BADGER"?"SAUCER THROUGH TRAFFIC!":"PASS!",1);
  burst(puck.x,puck.y,p.trim,7);
 }
}
function checkOrSpecial(){
 const p=roster[sel]; let hit=false;
 defenders.forEach(d=>{
  if(d.down<=0&&Math.hypot(d.x-player.x,d.y-player.y)<74){
   const impact=Math.hypot(player.vx,player.vy)+p.hustle/65;
   d.stun=1.1+impact*.2;d.down=.65+impact*.12;d.vx=player.face*(5+impact);d.vy=(d.y-player.y)*.12;
   combo++;hitMeter=Math.min(100,hitMeter+32);shake=9;flash=.13;
   say(combo>1?`BOOM! ${combo}x HIT!`:"BOOM! HIT STUN!",.8);burst(d.x,d.y,"#ff3333",25);iceSpray(d.x,d.y,player.face,22);hit=true;
  }
 });
 if(hit)return;
 if(cool>0)return;cool=5;say(p.special+"!",1.2);burst(player.x,player.y,p.trim,18);
 if(p.nick==="HONEY BADGER"){player.boost=1.4;defenders.forEach(d=>{if(Math.hypot(d.x-player.x,d.y-player.y)<180){d.stun=1.2;d.down=.35;}});}
 else if(p.nick==="FREIGHT TRAIN"){player.boost=1.2;defenders.forEach(d=>{if(dist(d,player)<140){d.stun=1.5;d.down=.6;combo++;}});}
 else if(p.nick==="BONES"){player.boost=1.6;}
 else if(p.nick==="SILK HANDS"){goalie.dir*=-1;puck.vx+=5;}
 else if(p.nick==="SHOE"){puck.vx=8;puck.vy=0;}
 else if(p.nick==="DEMPS"){if(Math.random()<.25){puck.heldBy=null;player.hasPuck=false;puck.vx=13;puck.vy=(Math.random()-.5)*8;}}
}


function teammateReceivePuck(){
 if(!mate.hasPuck && !player.hasPuck && dist(puck,mate)<34){
   mate.hasPuck=true;
   mate.passHold=0.65;
   puck.heldBy="mate";
   puck.vx=0; puck.vy=0;
   say("PASS CONNECTED!",.65);
 }
 if(mate.hasPuck){
   const stickX=mate.x+34, stickY=mate.y+38;
   puck.x+=(stickX-puck.x)*0.72;
   puck.y+=(stickY-puck.y)*0.72;
   puck.vx=mate.vx*3; puck.vy=mate.vy*3;
   mate.passHold-=1/60;
   if(mate.passHold<=0){
     mate.hasPuck=false;
     puck.heldBy=null;
     puck.vx=8;
     puck.vy=(270-puck.y)*0.04;
     say("ONE-TIMER!",.6);
   }
 }
}

function clampDefender(d){
 d.x=Math.max(70,Math.min(780,d.x));
 d.y=Math.max(115,Math.min(425,d.y));
}

function update(dt){
 if(mode!=="play")return;
 const p=roster[sel];timeLeft-=dt;cool=Math.max(0,cool-dt);msgT=Math.max(0,msgT-dt);player.boost=Math.max(0,player.boost-dt);shake=Math.max(0,shake-dt*35);flash=Math.max(0,flash-dt);firePuck=Math.max(0,firePuck-dt);
 if(timeLeft<=0){mode="done";say(score>=3?"MISSION COMPLETE":"SHIFT OVER",9);return;}
 let ax=0,ay=0;if(keys.a||keys.arrowleft)ax--;if(keys.d||keys.arrowright)ax++;if(keys.w||keys.arrowup)ay--;if(keys.s||keys.arrowdown)ay++;
 const m=Math.hypot(ax,ay)||1;if(ax)player.face=Math.sign(ax);
 let sp=(p.speed/100)*(player.boost>0?1.75:1);if(p.nick==="HONEY BADGER")sp*=1.08;
 player.vx+=(ax/m)*sp*.85;player.vy+=(ay/m)*sp*.85;player.vx*=.86;player.vy*=.86;player.x+=player.vx*5;player.y+=player.vy*5;
 player.x=Math.max(45,Math.min(880,player.x));player.y=Math.max(95,Math.min(445,player.y));
 if(Math.abs(player.vx)+Math.abs(player.vy)>1.4){hitMeter=Math.min(100,hitMeter+.3);if(Math.random()<.22)iceSpray(player.x,player.y,player.face,1);}
 mate.x+=(player.x-80-mate.x)*.025;mate.y+=(player.y-75-mate.y)*.025;
 defenders.forEach(d=>{d.stun=Math.max(0,d.stun-dt);d.down=Math.max(0,d.down-dt);if(d.down<=0&&d.stun<=0){let dx=player.x-d.x,dy=player.y-d.y,dm=Math.hypot(dx,dy)||1;d.vx+=dx/dm*.18;d.vy+=dy/dm*.18;}else{d.vx*=.92;d.vy*=.92;}d.vx*=.85;d.vy*=.85;d.x+=d.vx;d.y+=d.vy;clampDefender(d);});
 tryPossession(); teammateReceivePuck(); if(player.hasPuck)attachPuckToPlayer(); else if(mate.hasPuck){} else{puck.x+=puck.vx;puck.y+=puck.vy;puck.vx*=.985;puck.vy*=.985;}
 if(firePuck>0)fireTrail(puck.x,puck.y,4);
 if(puck.y<90||puck.y>450)puck.vy*=-.75;puck.y=Math.max(90,Math.min(450,puck.y));if(puck.x<35){puck.x=35;puck.vx*=-.6;}
 goalie.y+=goalie.dir*2.3;if(goalie.y<190||goalie.y>350)goalie.dir*=-1;
 if(puck.x>860&&puck.y>210&&puck.y<330&&Math.abs(puck.y-goalie.y)>38){score++;combo++;shake=12;flash=.2;say(score>=3?"MISSION COMPLETE":`GOAL! ${combo}x`,1.4);burst(890,puck.y,"#ffdc5e",45);puck.x=260;puck.y=270;puck.vx=puck.vy=0;player.hasPuck=false;puck.heldBy=null;if(score>=3)mode="done";}
 else if(puck.x>830&&Math.abs(puck.y-goalie.y)<45){puck.vx=-Math.abs(puck.vx)*.9-3;player.hasPuck=false;puck.heldBy=null;say("SAVE! GLOVE SIDE?",.8);}
 particles.forEach(q=>{q.x+=q.vx;q.y+=q.vy;q.t-=dt;});particles=particles.filter(q=>q.t>0);
 popups.forEach(p=>{p.y-=20*dt;p.life-=dt;});popups=popups.filter(p=>p.life>0);
}

function drawSelect(){
 rect(0,0,960,540,"#070b10");txt("SATURDAY MORNING DROP IN CREW",480,40,32,"#f0dbb2","center");txt("HITZ-STYLE PLAYER SELECT",480,70,19,"#28c9d4","center");
 roster.forEach((p,i)=>card(p,42+(i%4)*227,98+Math.floor(i/4)*150,205,130,i===sel));
 const p=roster[sel];rect(42,405,876,84,"#07090d");ctx.strokeStyle="#344e64";ctx.strokeRect(42,405,876,84);
 txt(`${p.name} "${p.nick}" #${p.num}`,60,430,18,"#fff");txt(p.desc,60,456,15,"#ddd");txt("SPECIAL: "+p.special,60,482,16,p.trim);
 bar("SPD",p.speed,520,430);bar("HST",p.hustle,520,458);bar("STK",p.stick,700,430);bar("PASS",p.pass,700,458);
 txt("ENTER = START",480,388,22,"#ffdc5e","center");txt("WE DON'T HAVE PRACTICE. WE HAVE SATURDAYS.",480,520,18,"#f0dbb2","center");
}
function drawPlay(){
 ctx.save(); if(shake>0)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
 rink();const p=roster[sel];drawGoalie();
 defenders.forEach(d=>drawPixelSkater(d.x,d.y,{num:"",color:"#555",trim:d.stun>0?"#ff3333":"#aaa",accent:"#222",sprite:"cage"},1,-1,d.down>0));
 drawPixelSkater(mate.x,mate.y,{...p,num:"AI"},.9,1,false);
 drawPixelSkater(player.x,player.y,p,1.25,player.face,false);
 ctx.fillStyle=firePuck>0?"#ff3b00":"#111";ctx.beginPath();ctx.ellipse(puck.x,puck.y,firePuck>0?16:12,firePuck>0?8:6,0,0,Math.PI*2);ctx.fill();
 if(player.hasPuck){ctx.strokeStyle=p.trim;ctx.lineWidth=2;ctx.beginPath();ctx.arc(player.x,player.y,46,0,Math.PI*2);ctx.stroke();} if(mate.hasPuck){ctx.strokeStyle='#ffdc5e';ctx.lineWidth=2;ctx.beginPath();ctx.arc(mate.x,mate.y,38,0,Math.PI*2);ctx.stroke();}
 particles.forEach(q=>{ctx.globalAlpha=Math.max(0,q.t);ctx.fillStyle=q.col;ctx.fillRect(q.x,q.y,q.size,q.size);ctx.globalAlpha=1;});
 ctx.restore();
 rect(0,0,960,72,"rgba(0,0,0,.85)");txt(`${p.name} "${p.nick}" #${p.num}`,20,28,18);txt(`GOALS ${score}/3`,20,55,18,p.trim);
 txt(`TIME ${Math.ceil(timeLeft)}`,480,42,22,"#fff","center");txt(`SPECIAL ${cool<=0?"READY":Math.ceil(cool)}`,935,28,16,p.trim,"right");txt(`HITZ ${Math.round(hitMeter)}`,935,55,16,"#ffdc5e","right");
 if(hitMeter>80)txt("FIRE SHOT READY",480,68,14,"#ff5533","center");
 popups.forEach(p=>txt(p.t,p.x,p.y,p.s,p.col,"center"));
 if(flash>0){ctx.globalAlpha=flash;rect(0,0,960,540,"#fff");ctx.globalAlpha=1;}
}
function drawDone(){drawPlay();rect(0,0,960,540,"rgba(0,0,0,.72)");txt(msg,480,245,52,"#ffdc5e","center");txt("ENTER: PLAY AGAIN   ESC: ROSTER",480,305,23,"#fff","center");}
function loop(now){const dt=Math.min(.033,(now-last)/1000);last=now;update(dt);if(mode==="select")drawSelect();else if(mode==="play")drawPlay();else drawDone();requestAnimationFrame(loop);}
requestAnimationFrame(loop);
