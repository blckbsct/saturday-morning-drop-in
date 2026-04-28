
const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

const roster=[
 {name:"Chris Dempsey",nick:"DEMPS",num:"35",role:"Pylon Mode",color:"#e8eef0",trim:"#20c4c9",speed:60,hustle:85,shot:55,pass:1,stick:45,special:"1% BACKHAND",desc:"Slow feet. Big heart. Cold beer."},
 {name:"Andy Duran",nick:"FREIGHT TRAIN",num:"8",role:"Two-Way D",color:"#f6f3e8",trim:"#0e8f42",speed:80,hustle:92,shot:82,pass:78,stick:76,special:"BONE CRUSHER",desc:"Hits. Blocks. Chirps. Sets the tone."},
 {name:"Lenny Owens",nick:"SILK HANDS",num:"08",role:"Playmaker",color:"#efe5cf",trim:"#f0b23e",speed:94,hustle:82,shot:60,pass:94,stick:92,special:"ANKLE PASS",desc:"Pass harder than his slap shot."},
 {name:"Suman Chakrabarti",nick:"SHOE",num:"19",role:"Smile Boost",color:"#20a64a",trim:"#ffd53b",speed:52,hustle:75,shot:45,pass:95,stick:72,special:"SMILE BOOST",desc:"Slow as molasses. Passes on time."},
 {name:"Avery Duran",nick:"BONES",num:"11",role:"Game Breaker",color:"#11151b",trim:"#48a6c8",speed:97,hustle:100,shot:84,pass:90,stick:90,special:"BONES MODE",desc:"18 years old. Pure speed. Pure hustle."},
 {name:"Mark Townsend",nick:"TOWNSIE",num:"38",role:"Chaos Goalie",color:"#d9dde2",trim:"#2d65b2",speed:58,hustle:88,shot:20,pass:45,stick:55,special:"FLOP SAVE",desc:"Glove side vacation. Yells a lot."},
 {name:"Hudson Townsend",nick:"HUDSIE",num:"13",role:"Team Protector",color:"#d8e0e7",trim:"#17834c",speed:78,hustle:91,shot:68,pass:80,stick:87,special:"DEFEND DAD",desc:"Two-way threat. Protects Townsie."},
 {name:"Kaden Chakrabarti",nick:"HONEY BADGER",num:"23",role:"Left Wing",color:"#07182b",trim:"#27c7c9",speed:93,hustle:97,shot:78,pass:92,stick:98,special:"PHONE BOOTH",desc:"18. 5'7. Handles in traffic. Never backs down."}
];

let selected=0,mode="select",keys={},last=performance.now();
let player={x:160,y:270,vx:0,vy:0}, puck={x:270,y:270,vx:0,vy:0};
let goalie={x:850,y:270,dir:1}, score=0,timeLeft=60,msg="PRESS START",msgTimer=0,cooldown=0;

addEventListener("keydown",e=>{
 const k=e.key.toLowerCase(); keys[k]=true;
 if(mode==="select"){
   if(k==="arrowleft"||k==="a") selected=(selected+roster.length-1)%roster.length;
   if(k==="arrowright"||k==="d") selected=(selected+1)%roster.length;
   if(e.key==="Enter") start();
 } else {
   if(e.key==="Escape") mode="select";
   if(e.code==="Space") shoot();
   if(e.key==="Shift") special();
   if(mode==="done" && e.key==="Enter") start();
 }
});
addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);

function start(){
 mode="play"; score=0; timeLeft=60; cooldown=0;
 player={x:140,y:270,vx:0,vy:0}; puck={x:260,y:270,vx:0,vy:0}; goalie={x:850,y:270,dir:1};
 msg="SCORE 3 GOALS"; msgTimer=1.5;
}

function drawText(txt,x,y,size=18,color="#fff",align="left"){
 ctx.fillStyle=color; ctx.font=`bold ${size}px monospace`; ctx.textAlign=align; ctx.fillText(txt,x,y);
}
function statBar(label,val,x,y,w=120){
 drawText(label,x,y,14,"#ddd");
 ctx.strokeStyle="#2b4252"; ctx.strokeRect(x+55,y-12,w,10);
 ctx.fillStyle=val>=95?"#22d6d6":val>=85?"#43d34b":val>=70?"#e0aa37":"#d04a3d";
 ctx.fillRect(x+55,y-12,w*(val/100),10);
 drawText(String(val),x+55+w+10,y,14,"#fff");
}
function card(p,x,y,w,h,active=false){
 ctx.fillStyle=active?"#112536":"#12151b"; ctx.fillRect(x,y,w,h);
 ctx.strokeStyle=active?"#4bdcff":p.trim; ctx.lineWidth=active?5:2; ctx.strokeRect(x,y,w,h);
 drawSkater(x+w/2,y+75,p,1.05);
 drawText(`#${p.num}`,x+12,y+25,24,p.trim);
 drawText(p.nick,x+w/2,y+24,16,"#f7e6c0","center");
 drawText(p.role,x+w/2,y+h-16,14,p.trim,"center");
}
function drawSkater(x,y,p,s=1){
 ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
 ctx.fillStyle=p.color; ctx.strokeStyle=p.trim; ctx.lineWidth=4;
 ctx.fillRect(-20,-26,40,48); ctx.strokeRect(-20,-26,40,48);
 ctx.fillStyle="#111"; ctx.fillRect(-17,22,13,28); ctx.fillRect(4,22,13,28);
 ctx.beginPath(); ctx.arc(0,-44,16,0,Math.PI*2); ctx.fill();
 ctx.strokeStyle="#ccc"; ctx.strokeRect(-12,-50,24,14);
 ctx.fillStyle=p.trim; ctx.font="bold 16px monospace"; ctx.textAlign="center"; ctx.fillText(p.num,0,4);
 ctx.strokeStyle="#d2c8b0"; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(-12,6); ctx.lineTo(34,48); ctx.stroke();
 ctx.restore();
}

function drawSelect(){
 ctx.fillStyle="#0b0f14"; ctx.fillRect(0,0,960,540);
 drawText("SATURDAY MORNING DROP IN CREW",480,42,34,"#f4dfb8","center");
 drawText("PLAYABLE ROSTER SELECT",480,72,20,"#30c9d3","center");
 drawText("WE DON'T HAVE PRACTICE. WE HAVE SATURDAYS.",480,520,18,"#f4dfb8","center");

 roster.forEach((p,i)=>{
   const cols=4, w=205,h=130, gap=22;
   const x=42+(i%cols)*(w+gap), y=100+Math.floor(i/cols)*150;
   card(p,x,y,w,h,i===selected);
 });

 const p=roster[selected];
 ctx.fillStyle="#07090d"; ctx.strokeStyle="#344e64"; ctx.lineWidth=2; ctx.fillRect(42,405,876,84); ctx.strokeRect(42,405,876,84);
 drawText(`${p.name} "${p.nick}"  #${p.num}`,60,430,18,"#fff");
 drawText(p.desc,60,458,15,"#d8d0c0");
 drawText(`SPECIAL: ${p.special}`,60,482,16,p.trim);
 statBar("SPD",p.speed,520,430); statBar("HST",p.hustle,520,458); statBar("STK",p.stick,700,430); statBar("PASS",p.pass,700,458);
 drawText("ENTER = START",480,388,22,"#ffdc5e","center");
}
function drawRink(){
 ctx.fillStyle="#dfeefa"; ctx.fillRect(0,0,960,540);
 ctx.fillStyle="#c6dced"; ctx.fillRect(30,80,900,380);
 ctx.strokeStyle="#8fb6cf"; ctx.lineWidth=3; ctx.strokeRect(30,80,900,380);
 ctx.strokeStyle="#e24b4b"; ctx.beginPath();ctx.moveTo(145,80);ctx.lineTo(145,460);ctx.moveTo(815,80);ctx.lineTo(815,460);ctx.stroke();
 ctx.strokeStyle="#315"; ctx.strokeRect(865,210,45,120);
}
function shoot(){
 const p=roster[selected], d=Math.hypot(puck.x-player.x,puck.y-player.y);
 if(d<70){ puck.vx=6+p.shot/10; puck.vy=(puck.y-player.y)*0.08; msg=`${p.nick}: SHOT!`; msgTimer=1; }
}
function special(){
 if(cooldown>0) return;
 const p=roster[selected]; cooldown=6; msg=p.special+"!"; msgTimer=1.4;
 if(p.nick==="HONEY BADGER"){ player.vx+=7; puck.vx+=4; goalie.dir*=-1; }
 else if(p.nick==="BONES"){ player.vx+=6; puck.vx+=3; }
 else if(p.nick==="FREIGHT TRAIN"){ player.vx+=5; }
 else if(p.nick==="SILK HANDS"){ puck.vx+=6; goalie.dir*=-1; }
 else if(p.nick==="SHOE"){ puck.vx=9; puck.vy=0; }
 else if(p.nick==="DEMPS"){ if(Math.random()<0.2){puck.vx=13;puck.vy=(Math.random()-0.5)*6;} }
 else if(p.nick==="TOWNSIE"){ puck.vx=8; }
 else { player.vx+=4; }
}
function update(dt){
 if(mode!=="play") return;
 const p=roster[selected]; timeLeft-=dt; cooldown=Math.max(0,cooldown-dt); msgTimer=Math.max(0,msgTimer-dt);
 if(timeLeft<=0){mode="done";msg=score>=3?"MISSION COMPLETE":"SHIFT OVER";return;}
 let ax=0,ay=0;
 if(keys.a||keys.arrowleft) ax--; if(keys.d||keys.arrowright) ax++; if(keys.w||keys.arrowup) ay--; if(keys.s||keys.arrowdown) ay++;
 const m=Math.hypot(ax,ay)||1;
 player.vx+=(ax/m)*(p.speed/100)*0.75; player.vy+=(ay/m)*(p.speed/100)*0.75;
 player.vx*=0.85; player.vy*=0.85; player.x+=player.vx*5; player.y+=player.vy*5;
 player.x=Math.max(40,Math.min(880,player.x)); player.y=Math.max(95,Math.min(445,player.y));
 if(Math.hypot(puck.x-player.x,puck.y-player.y)<35){puck.vx+=player.vx*0.4;puck.vy+=player.vy*0.4;}
 puck.x+=puck.vx; puck.y+=puck.vy; puck.vx*=0.985;puck.vy*=0.985;
 if(puck.y<90||puck.y>450)puck.vy*=-0.75; puck.y=Math.max(90,Math.min(450,puck.y));
 goalie.y+=goalie.dir*2.2;if(goalie.y<190||goalie.y>350)goalie.dir*=-1;
 if(puck.x>860&&puck.y>210&&puck.y<330&&Math.abs(puck.y-goalie.y)>38){score++; msg=score>=3?"MISSION COMPLETE":"GOAL!";msgTimer=1.5;puck.x=260;puck.y=270;puck.vx=puck.vy=0;if(score>=3)mode="done";}
 else if(puck.x>830&&Math.abs(puck.y-goalie.y)<45){puck.vx=-Math.abs(puck.vx)*0.9-3;msg="SAVE!";msgTimer=1;}
}
function drawPlay(){
 drawRink(); const p=roster[selected];
 drawSkater(850,goalie.y,roster[5],1.1);
 drawSkater(player.x,player.y,p,1.25);
 ctx.fillStyle="#111";ctx.beginPath();ctx.ellipse(puck.x,puck.y,12,6,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="rgba(0,0,0,.82)";ctx.fillRect(0,0,960,68);
 drawText(`${p.name} "${p.nick}"  #${p.num}`,20,28,18,"#fff");
 drawText(`SCORE ${score}/3`,20,55,18,p.trim);
 drawText(`TIME ${Math.ceil(timeLeft)}`,480,42,22,"#fff","center");
 drawText(`SPECIAL ${cooldown<=0?"READY":Math.ceil(cooldown)}`,935,42,18,p.trim,"right");
 if(msgTimer>0){drawText(msg,480,150,36,"#ffdc5e","center");}
}
function drawDone(){
 drawPlay(); ctx.fillStyle="rgba(0,0,0,.72)";ctx.fillRect(0,0,960,540);
 drawText(msg,480,245,54,"#ffdc5e","center");
 drawText("ENTER: PLAY AGAIN   ESC: ROSTER",480,305,24,"#fff","center");
}
function loop(now){
 const dt=Math.min(.033,(now-last)/1000);last=now;update(dt);
 if(mode==="select")drawSelect(); else if(mode==="play")drawPlay(); else drawDone();
 requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
