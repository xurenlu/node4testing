var net = require('net');
var qs = require("qs");
var express = require ("express");

var local_port = 8893;
var intercept_rules = [];

function test_rule(options){
    var matched_rule;
    intercept_rules.forEach(function(rule){
        var keys = Object.keys(rule),
            match = false;
        // TODO headers matching and regex support
        keys.forEach(function(key){
            if(options[key]){ 
                if(rule[key] instanceof RegExp){
                    match = rule[key].test(options[key]);
                } else {
                    match = options[key] == rule[key];
                }
            }
        });
        if(match){
            matched_rule = rule;
        }
    });
    return matched_rule;
}

function push_proxy_rule(options){
    intercept_rules.push(options);
}
function clear_proxy_rule(){
    intercept_rules=[];
}
function get_proxy_rules(){
    return intercept_rules;
}
function log(arg,level){

    console.log(arg);
}
var matched_params = [];
push_proxy_rule({host:"dos.com",path:"http://s.com/a",body:"is from /a",headers:{Server:"notNginx"}});
push_proxy_rule({host:"log.mmstat.com",callback:function(req){
    query_string = qs.parse(req.path);
    if(query_string["gokey"]){
        var clickUrl = query_string["gokey"];
        var clickParams = qs.parse(clickUrl);
        matched_params.push(clickParams);
        log(clickParams);
    }else{
        log(req.path);
    }
  //console.log(req.path); 
}})

var app = express();
app.use(express.bodyParser());

app.get('/matched_params', function(req, res){
    res.end(JSON.stringify(matched_params));
});
app.get("/reset_matched_params",function(req,res){
    var msg = {code:200,"msg":"done"};
    matched_params=[];
    res.end(JSON.stringify(msg));
});
app.post("/exec_js",function(req,res){
    console.log(req.body.js);
    console.log(req.body.url);
    var js = req.body.js;
    var url = req.body.url;
    var gui = require("nw.gui");
    var currentWindow = window;
    setTimeout(function(){
        var win = gui.Window.get(window.open(url));
        win.on("loaded",function(){
            console.log("try to append script node");
            var sc = win.window.document.createElement("script");
            sc.innerHTML= js;
            win.window.document.body.appendChild(sc);
            console.log("script node append to body");
            win.close();
        });
        //eval(req.body.js);
    },50);
    var msg = {code:200,"msg":"done"};
    res.end(JSON.stringify(msg)); 

});
app.all("/",function(req,res){
    res.end("Welcome to node4Testing;");

});
//app.listen(8894);
window.http_server = http.createServer(app);


//在本地创建一个server监听本地local_port端口
var netServer = net.createServer(function(client) {
    //首先监听浏览器的数据发送事件，直到收到的数据包含完整的http请求头
    var buffer = new Buffer(0);
    client.on('data', function(data) {
        buffer = buffer_add(buffer, data);
        if(buffer_find_body(buffer) == -1)
            return;
        var req = parse_request(buffer);
        if(req === false)
            return;
        client.removeAllListeners('data');
        var host = req.host;
        var options = {host:req.host,path:req.path,port:req.port,method:req.method};
        //console.log(options);
        var match_rule = test_rule(options);
        var body = "";
        if(match_rule){
            body = match_rule.body || "";
        }
        //var match_rule
        if(match_rule&&match_rule["body"]){
            client.write("HTTP/1.1 200 OK\n");
            var headers = match_rule.headers||{};
            for(var idx in headers){
                client.write(idx+" :"+headers[idx]+"\n");
            }
            client.write("\n");
            client.write(body);
            client.end("");
        }else{
            if(match_rule&&match_rule["callback"]){
                match_rule.callback(req);
            }
            relay_connection(req);
        }
    });
    //从http请求头部取得请求信息后，继续监听浏览器发送数据，同时连接目标服务器，并把目标服务器的数据传给浏览器
    function relay_connection(req) {
        //console.log(req.method + ' ' + req.host + ':' + req.port + ",path:" + req.path);
        //如果请求不是CONNECT方法（GET, POST），那么替换掉头部的一些东西
        if(req.method != 'CONNECT') {
            //先从buffer中取出头部
            var _body_pos = buffer_find_body(buffer);
            if(_body_pos < 0)
                _body_pos = buffer.length;
            var header = buffer.slice(0, _body_pos).toString('utf8');
            //替换connection头
            header = header.replace(/(proxy\-)?connection\:.+\r\n/ig, '').replace(/Keep\-Alive\:.+\r\n/i, '').replace("\r\n", '\r\nConnection: close\r\n');
            //替换网址格式(去掉域名部分)
            if(req.httpVersion == '1.1') {
                var url = req.path.replace(/http\:\/\/[^\/]+/, '');
                if(url.path != url)
                    header = header.replace(req.path, url);
            }
            buffer = buffer_add(new Buffer(header, 'utf8'), buffer.slice(_body_pos));
        }
        //建立到目标服务器的连接
        var server = net.createConnection(req.port, req.host);
        //交换服务器与浏览器的数据
        client.on("data", function(data) {
            server.write(data);
        });
        server.on("data", function(data) {
            client.write(data);
        });
        if(req.method == 'CONNECT')
            client.write(new Buffer("HTTP/1.1 200 Connection established\r\nConnection: close\r\n\r\n"));
        else
            server.write(buffer);
    }
});
//netServer.listen(local_port);
window.proxyServer = netServer;

//处理各种错误

process.on('uncaughtException', function(err) {
    console.log("\nError!!!!");
    console.log(err);
});
/**
 * 从请求头部取得请求详细信息
 * 如果是 CONNECT 方法，那么会返回 { method,host,port,httpVersion}
 * 如果是 GET/POST 方法，那么返回 { metod,host,port,path,httpVersion}
 */
function parse_request(buffer) {
    var s = buffer.toString('utf8');
    var method = s.split('\n')[0].match(/^([A-Z]+)\s/)[1];
    if(method == 'CONNECT') {
        var arr = s.match(/^([A-Z]+)\s([^\:\s]+)\:(\d+)\sHTTP\/(\d\.\d)/);
        if(arr && arr[1] && arr[2] && arr[3] && arr[4])
            return {
                method : arr[1],
                host : arr[2],
                port : arr[3],
                httpVersion : arr[4]
            };
    } else {
        var arr = s.match(/^([A-Z]+)\s([^\s]+)\sHTTP\/(\d\.\d)/);
        if(arr && arr[1] && arr[2] && arr[3]) {
            var host = s.match(/Host\:\s+([^\n\s\r]+)/)[1];
            if(host) {
                var _p = host.split(':', 2);
                return {
                    method : arr[1],
                    host : _p[0],
                    port : _p[1] ? _p[1] : 80,
                    path : arr[2],
                    httpVersion : arr[3]
                };
            }
        }
    }
    return false;
}
/**
 * 两个buffer对象加起来
 */
function buffer_add(buf1, buf2) {
    var re = new Buffer(buf1.length + buf2.length);
    buf1.copy(re);
    buf2.copy(re, buf1.length);
    return re;
}
/**
 * 从缓存中找到头部结束标记("\r\n\r\n")的位置
 */
function buffer_find_body(b) {
    for(var i = 0, len = b.length - 3; i < len; i++) {
        if(b[i] == 0x0d && b[i + 1] == 0x0a && b[i + 2] == 0x0d && b[i + 3] == 0x0a) {
            return i + 4;
        }
    }
    return -1;
}
