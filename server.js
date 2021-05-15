const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const base = require('./public/BASE/base.js');


app.use(express.static(path.join(__dirname, 'public'))); //Serve public directory
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, +'public/index.html')); }); //chrome does this by default!

io.on('connection', (socket) => { 
	console.log('a user connected');
	socket.on('disconnect', ()=>{
		console.log('user disconnected!');
	}); 
	socket.on('message', message =>{
		console.log('message',message);
		if (base.isdef(process.env.PORT)) message='port defined'; else message='port UNDEFINED!!!';
		io.emit('message',message); //broadcast message to everryone connected!
	});
});
http.listen(process.env.PORT||3001, () => { console.log('listening on port 3001'); });







