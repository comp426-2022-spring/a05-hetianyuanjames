// Place your server entry point code here
const express = require('express')
const morgan = require('morgan')
const minimist = require('minimist')
const app = express()
const fs = require('fs')
const db = require("./src/services/database.js")
// const res = require('express/lib/response')

const args = minimist(process.argv.slice(2))
args["help", "port", "debug", "log"]

const help = (`
server.js [options]
--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.
--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.
--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.
--help	Return this message and exit.
`)

if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}

// port default to 5555
const port = args.port || process.env.PORT || 5000;
const log = (args.log != "false");

app.use(express.json())
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }))

// const server = app.listen(port, () => {
//     console.log('App is running on port %PORT%'.replace('%PORT%', port))
// })

//Log user interaction to database
if (log == true) {
    const WRITESTREAM = fs.createWriteStream('access.log', { flags: 'a' });
    app.use(morgan('combined', { stream: WRITESTREAM }));
}

app.use((req, res, next) => {
    let logData = {
        remoteaddr: req.ip,
        remoteuser: req.user,
        time: Date.now(),
        method: req.method,
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        status: res.statusCode,
        referer: req.headers['referer'],
        useragent: req.headers['user-agent']
    }
    const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const info = stmt.run(logData.remoteaddr, logData.remoteuser, logData.time, logData.method, logData.url, logData.protocol, logData.httpversion, logData.status, logData.referer, logData.useragent);
    next();
})

// coin flip functions
function coinFlip() {
    return (Math.floor(Math.random() * 2) == 0) ? 'heads' : 'tails';
}


function coinFlips(flips) {
    const coins = [];    
    for (let i = 0; i < flips; i++)
    coins[i] = coinFlip();
    return coins;
}

function countFlips(array) {
    let head = 0;
    let tail = 0;
    for( let i = 0; i < array.length; i++)
      if(array[i] == "heads")
        head ++;
      else
        tail ++;
    const count = `{ tails: ${tail}, heads: ${head} }` ;
    return count;
}


function flipACoin(call) {
    let flip = coinFlip();
    return {call: call, flip: flip, result: flip == call ? "win" : "lose" };
}


app.get('/app/', (req, res) => {
    res.contentType('application/json');
    res.status(200).json({message: "Your API works! (200)"});
})

app.get('/app/flip/', (req, res) => {
    res.contentType('application/json');
    res.status(200).json({ "flip" : coinFlip()});
})

app.get('/app/flip/coin', (req, res) => {
    res.contentType('application/json');
    res.status(200).json({ "flip" : coinFlip()});
})

app.get('/app/flips/:number([0-9]{1,3})', (req, res) =>{
    const arrayOfFlips = coinFlips(req.params.number);
    const counted = countFlips(arrayOfFlips)
    res.contentType('application/json');
    res.status(200).json({"raw": arrayOfFlips, "summary": counted});
})

app.post('/app/flip/coins/', (req, res, next) => {
    const flips = coinFlips(req.body.number)
    const count = countFlips(flips)
    res.contentType('application/json');
    res.status(200).json({"raw":flips,"summary":count})
})

app.get('/app/flip/call/:guess(heads|tails)/', (req, res) =>{
    res.contentType('application/json');
    res.status(200).json(flipACoin(req.params.guess));
})

app.post('/app/flip/call/', (req, res, next) => {
    res.contentType('application/json');
    res.status(200).json(flipACoin(req.body.guess));
})

app.use(function(req, res){
    res.contentType('text/plain');
    res.status(404).end(404 + ' ' + "Error not found");
})