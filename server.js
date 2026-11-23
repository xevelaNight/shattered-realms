const express=require('express');const http=require('http');const {Server}=require('socket.io');
const app=express(),server=http.createServer(app),io=new Server(server);app.use(express.static('public'));
const rooms={};const W=20,H=14;
function newWorld(){let map=[];for(let y=0;y<H;y++){let row=[];for(let x=0;x<W;x++){let r=Math.random();row.push(r<.11?'tree':r<.17?'water':r<.23?'rock':'grass')}map.push(row)}map[2][2]='grass';map[10][15]='grass';map[7][10]='grass';return map}
function roomState(code){let r=rooms[code];return {code,map:r.map,players:Object.values(r.players),log:r.log.slice(-15)}}
function broadcast(code){if(rooms[code])io.to(code).emit('state',roomState(code))}
io.on('connection',socket=>{
 socket.on('join',({code,name,race,klass})=>{code=(code||'').trim().toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);if(!code)code=Math.random().toString(36).slice(2,8).toUpperCase();if(!rooms[code])rooms[code]={map:newWorld(),players:{},log:['Die Nebel von Hollowwood ziehen auf.'],created:Date.now()};let r=rooms[code];let p={id:socket.id,name:(name||'Abenteurer').slice(0,24),race:race||'Human',klass:klass||'Warrior',x:2,y:2,hp:20};while(r.map[p.y][p.x]!=='grass'){p.x=Math.floor(Math.random()*W);p.y=Math.floor(Math.random()*H)}r.players[socket.id]=p;socket.join(code);socket.data.code=code;r.log.push(p.name+' betritt Hollowwood.');socket.emit('joined',{code});broadcast(code)});
 socket.on('move',({dx,dy})=>{let code=socket.data.code,r=rooms[code],p=r&&r.players[socket.id];if(!p)return;let x=p.x+dx,y=p.y+dy;if(x<0||y<0||x>=W||y>=H||['tree','water','rock'].includes(r.map[y][x]))return;p.x=x;p.y=y;if(x===15&&y===10)r.log.push(p.name+' entdeckt die alten Ruinen!');broadcast(code)});
 socket.on('chat',msg=>{let r=rooms[socket.data.code],p=r&&r.players[socket.id];if(!p)return;let s=String(msg||'').trim().slice(0,300);if(s)r.log.push(p.name+': '+s);broadcast(socket.data.code)});
 socket.on('roll',()=>{let r=rooms[socket.data.code],p=r&&r.players[socket.id];if(!p)return;let n=1+Math.floor(Math.random()*20);r.log.push(p.name+' würfelt einen D20: '+n+(n===20?' — Kritischer Erfolg!':n===1?' — Kritischer Fehlschlag!':''));broadcast(socket.data.code)});
 socket.on('disconnect',()=>{let code=socket.data.code,r=rooms[code];if(!r)return;let p=r.players[socket.id];if(p){r.log.push(p.name+' hat die Welt verlassen.');delete r.players[socket.id];broadcast(code)}if(!Object.keys(r.players).length&&Date.now()-r.created>60000)delete rooms[code]});
});
server.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('Shattered Realms listening on port '+(process.env.PORT||3000)));
