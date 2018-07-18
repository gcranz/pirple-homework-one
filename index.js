/*
 * Hello-Brave-New-World
 *
 * @author gcranz@arrow.com
 * @date 20180717.1647
 * @description a very simple service meant to provide a RESTful interface with JSON responses
 *
 */

//Dependencies
const config = require('./config');
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');

// responds to all requests with a string
const httpServer = http.createServer(function(req,res){
  unifiedServer(req,res);
});

// start the server
httpServer.listen(config.httpPort , function(){
  console.log("server is listening on port ",config.httpPort," in "+config.envName+" mode");
});

//instantiate the https server
let httpsServerOptions = {
  'key' : fs.readFileSync('./https/key.pem') ,
  'cert' : fs.readFileSync('./https/cert.pem')
}
let httpsServer = https.createServer(httpsServerOptions,function(req,res){
  unifiedServer(req,res);
});

// start the https server
httpsServer.listen(config.httpsPort , function(){
  console.log("server is listening on port ",config.httpsPort," in "+config.envName+" mode");
});

// All the server logic for http and https
let unifiedServer = function(req,res){

  // Get the URL and parse it
  let parsedUrl = url.parse(req.url,true);  

  // Get the path
  let path = parsedUrl.pathname;
  let trimmedPath = path.replace(/^\/+|\/+$/g, '');

  //get the query string s an obj
  let queryStringObject = parsedUrl.query;

  // get the http method
  let method = req.method.toLowerCase();

  // get the headers as an object
  let headers = req.headers;

  //get payload if there is any
  let decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data',function(data){
    buffer += decoder.write(data);
  });
  req.on('end',function(){
    buffer += decoder.end();

    //Choose the handler this request should go to
    //if one is not found use the not found handler
    let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    //construct data obj to send to handler
    let data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'payload' : buffer
    };

    //Route the request to the handler specified in the router
    chosenHandler(data,function(statusCode,payload){
      // use the status code called back by the handler or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // use the payload called back by the handler or default to empty obj
      payload = typeof(payload) == 'object' ? payload : {};

      // Convert the payload to a string
      let payloadString = JSON.stringify(payload);

      //return the response
      res.setHeader('Content-Type','application/json');
      res.writeHead(statusCode);

      // Send the response
      res.end(payloadString);
  
      // log response to console
      console.log('returning this reponse: ',statusCode,payloadString);
    });
  });
};


// Define handlers
let handlers = {};

//Date-Time-Stamp handler
handlers.dts = function(data,callback){
  let nowish = new Date();
  let reply = (nowish.getFullYear()*10000)+
              ((nowish.getMonth()+1)*100)+
              (nowish.getDate())+
              (nowish.getMinutes()*0.01)+
              (nowish.getSeconds()*0.0001)+
              (nowish.getMilliseconds()*0.00000001);

  //callback http status code & a payload object
  callback(200,{'dts':reply});
};

//Hello handler
handlers.hello = function(data,callback){
  callback(200,{'hello':'Hello-Brave-New-World'});
};

//ping handler
handlers.ping = function(data,callback){
  callback(200);
};

//not found handler (default)
handlers.notFound = function(data,callback){
  callback(404);
}; 

// Define a request router
let router = {
  'dts' : handlers.dts,
  'ping' : handlers.ping,
  'hello' : handlers.hello
};

