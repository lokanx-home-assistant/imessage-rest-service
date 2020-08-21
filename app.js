/* 
 * 1. Deploy this code to a server running Node.js
 * 2. Run `npm install`
 * 3. Add your ACCESS_TOKEN and ALLOWED_IPS to your environment vars
 * 4. Fire up with `npm start`
 */

'use strict';

const IMESSAGE_CMD = __dirname + '/imessage.sh'
const TITLE_MESSAGE_CONCATENATION_DEFAULT = ' - ';
const PORT_DEFAULT = 8888;

// Read .emv file into process.env
const dotenv = require('dotenv');
dotenv.config();

// Get rest service configuration 
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const ALLOWED_IPS = process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.replace(/  +/g, ' ').split(/[\s,;|]+/) : null;
const IGNORE_TITLES = process.env.IGNORE_TITLES ? process.env.IGNORE_TITLES.split(/[,;|]+/) : null;
const PORT = Number.parseInt(process.env.PORT, 10) || PORT_DEFAULT;
const TITLE_MESSAGE_CONCATENATION = process.env.TITLE_MESSAGE_CONCATENATION ? process.env.TITLE_MESSAGE_CONCATENATION.replace(/&nbsp;/g, ' ') : TITLE_MESSAGE_CONCATENATION_DEFAULT;

// Imports dependencies and set up http server
const { exec } = require('child_process');
const https = require('https');
const fs = require('fs');
const 
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()); // creates express http server

https.createServer({
  key: fs.readFileSync(__dirname + '/server.key'),
  cert: fs.readFileSync(__dirname + '/server.cert')
}, app).listen(PORT, () => {
  console.log('HTTPS webhook is listening on port: ' + PORT + (ALLOWED_IPS ? ', allowed: IPs: ' + ALLOWED_IPS : ''));
});

// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {  
  // Client IP check
  if (!isClientAllowed(req)) {
    res.sendStatus(403);
    return;
  }

  // Parse the request body from the POST
  let body = req.body;
  const accessToken = body.accessToken || req.headers['x-access-token'] || null;

  // Access token check
  if (!!ACCESS_TOKEN && accessToken !== ACCESS_TOKEN) {
    res.sendStatus(403);
    return;
  }

  const title = filterTitle(body.title);
  const message = body.message
  const number = body.number || null;

  console.log('About to process: ' + JSON.stringify(body));
  
  if (!number) {
    res.status(500).send('No number...');
    return;
  }

  if (!message) {
    res.status(500).send('No message...');
    return;
  }

  const completeMessage = title ? (title + TITLE_MESSAGE_CONCATENATION + message) : message;

  console.log('About to send message: \'' + completeMessage + '\', to: ' + number);

  sendMessage(completeMessage, number, (sendResponse) => {
    res.status((sendResponse === true ? 200 : 500)).send(JSON.stringify(sendResponse))
  });
  
 });

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {
  if (isClientAllowed(req)) {
    res.sendStatus(200);    
  } else {
    res.sendStatus(403);      
  }
});

function isClientAllowed(req) {
  var remoteIps = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(':');

  if (!ALLOWED_IPS || ALLOWED_IPS.length === 0) {
    return true;
  }

  for(let i = 0; i < remoteIps.length; i++) {
    if (ALLOWED_IPS.includes(remoteIps[i])) {
      return true
    }
  }

  return false;
}

function filterTitle(title) {
  if (!title || (!IGNORE_TITLES || IGNORE_TITLES.length === 0)) {
    return title;
  }

  if (IGNORE_TITLES.includes(title)) {
    return null;
  }

  return title;
}

function sendMessage(message, number, callback) {
  const command = IMESSAGE_CMD + ' "' + number + '" "' + message.replace(/"/g, '\\"') + '"';

  exec(command, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        callback(`error: ${error.message}`);
        return;
    }

    if (stderr) {
        console.log(`stderr: ${stderr}`);
        callback(`stderr: ${stderr}`);
        return;
    }

    callback(true);
  });
}

