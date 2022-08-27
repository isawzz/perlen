const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http').Server(app);
const path = require('path');
const fs = require('fs');

app.use(express.static(path.join(__dirname, 'public'))); //Serve public directory
app.use(cors());
// app.get('/', (req, res) => {
// 	res.header("Access-Control-Allow-Origin", "*");
// 	res.header("Access-Control-Allow-Headers", "X-Requested-With");
// 	res.sendFile(path.join(__dirname, +'public/index.html'));
// });
//#endregion


//#region trial 1 NO
// var request = require('request');
// var url = "https://www.telecave.net/edu/callme.php";
// // var url = "https://www.telecave.net/edu/callme.php?message=hallo&n1=4&n2=3";

// app.get("/hallo", function (request, response) {
// 	request.get({ url: url, headers: request.headers, body: request.body }, function (err, res, body) {
// 		if (!err) {
// 			console.log('response', res, body)
// 			response.status(200).send(res) // JSON.stringify(res) if res is in json
// 		}
// 	})
// })
//#endregion

const request = require('request-promise');
const long_article = 'Long article text goes here';
const r = request({
	method: 'POST',
	uri: `https://www.telecave.net/aroot/games/api.php`,
	json: true,
});

// app.get("/hallo", function (req, res) {
request(r)
	.then((parsedBody) => { console.log(parsedBody); })
	.catch((err) => { console.log('ERROR'); });
// });


// var PORT = 3000;
// http.listen(process.env.PORT || PORT, () => { console.log('listening on port ' + PORT); });



