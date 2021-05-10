const express = require('express');
const app = express();
const path = require('path');

//Serve public directory
app.use(express.static(path.join(__dirname, 'public')));


app.listen(3000, ()=>{
	console.log('listening on port 3000');
});







