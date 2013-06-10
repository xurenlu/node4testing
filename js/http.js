var http = require('http');
var url = require('url');
var qs = require('querystring');
var fs = require('fs');
var rl = require('readline');

function httppost(pUrl,headers,body,onResponse) {
    var args = url.parse(pUrl);
    //console.log(args);
    var options = args;
    if(headers)options.headers = headers;
    options.method = 'POST';
    if(!body)options.method = 'GET';
    
    if(body){
        body = qs.stringify(body);
        options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    //console.log(options);
    var req = http.request(options, function(res) {
         if(res.statusCode!=200){
               onResponse(res);
               return;
          }
          var body = new Buffer(1024*10);
          var size = 0;
          res.on('data', function (chunk) {
            size+=chunk.length;
            if(size>body.length){//每次扩展10kb
                var ex = Math.ceil(size/(1024*10));
                var tmp = new Buffer(ex * 1024*10);
                body.copy(tmp);
                body = tmp;
            }
            chunk.copy(body,size - chunk.length);
          });
          res.on('end', function () {
            res.data = new Buffer(size);
            body.copy(res.data);
            res.body = res.data.toString();
            onResponse(res);
          });
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
    if(body){
        req.write(body);
    }
    req.end();
}

function httpget(pUrl,headers,onResponse) {
    httppost(pUrl,headers,null,onResponse);
}
/**
function d(){
    httppost("http://localhost:3000/contents/create",{},{"content[content]":"YES"},function(res){
        console.log(res.code);
        console.log(res.headers);
        console.log(res.body);
    });
}
function i(){
    httppost("http://localhost:8894/exec_js",{},{"user":"renlu.xu"},function(res){
        console.log(res.body);
    });
}
*/
