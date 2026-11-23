const express=require('express');const http=require('http');const {Server}=require('socket.io');
const app=express();const server=http.createServer(app);const io=new Server(server);
app.use(express.static('public'));app.get('/health',(req,res)=>res.json({ok:true}));
const rooms={};
io.on('connection',socket=>{
 socket.on('joinRoom',({room,character})=>{room=String(room||'').trim().slice(0,16);if(!room)return;socket.join(room);socket.data.room=room;socket.data.character=character||{name:'Adventurer'};rooms[room]=rooms[room]||{players:{},messages:[]};rooms[room].players[socket.id]={...socket.data.character};socket.emit('roomState',{players:Object.values(rooms[room].players),messages:rooms[room].messages.slice(-40)});io.to(room).emit('playersUpdate',Object.values(rooms[room].players));io.to(room).emit('message',{name:'System',text:`${socket.data.character.name||'Adventurer'} joined the realm.`,system:true});});
 socket.on('message',text=>{const room=socket.data.room;if(!room||!rooms[room])return;const msg={name:socket.data.character?.name||'Adventurer',text:String(text||'').slice(0,500)};rooms[room].messages.push(msg);io.to(room).emit('message',msg);});
 socket.on('move',pos=>{const room=socket.data.room;if(room)socket.to(room).emit('playerMove',{id:socket.id,name:socket.data.character?.name||'Adventurer',pos});});
 socket.on('disconnect',()=>{const room=socket.data.room;if(room&&rooms[room]){delete rooms[room].players[socket.id];io.to(room).emit('playersUpdate',Object.values(rooms[room].players));io.to(room).emit('message',{name:'System',text:`${socket.data.character?.name||'Adventurer'} left the realm.`,system:true});if(!Object.keys(rooms[room].players).length)delete rooms[room];}});
});
const port=process.env.PORT||3000;server.listen(port,'0.0.0.0',()=>console.log('Shattered Realms listening on '+port));
