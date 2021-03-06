// server.js......................................
// where your node app starts
// init project
const express = require('express');
const app = express();
const path = require('path');
// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
    response.sendFile(__dirname + '/views/da/index.html');
});
// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
    console.log('Your app is listening on port ' + listener.address().port);
});

//let's go
/*[(async () => {
    await require("./glitch-deploy")({
        ftp: {
            password: process.env.DEPLOY_PASS,
            user: process.env.DEPLOY_USER,
            host: process.env.DEPLOY_HOST
        },
        clear: 1,
        verbose: 0,
        env: true
    });
})()];*/

console.log(process.env.TESTVAR)