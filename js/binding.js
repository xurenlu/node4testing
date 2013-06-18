var n4t = n4t || {};
n4t.fs = require("fs");
n4t.App  = function(options){

	var self = this;
	self.filePath = ko.observable(options.filePath||"");
	//self.filePath.change = 
	self.initialContent = ko.observable(options.initialContent||"");
	self.dirty = ko.observable(false);
	self.isFromFile = ko.observable(false);
	self.noticeCss= ko.observable("");
	self.fileContent = ko.observable("");//硬盘上的文件的内容;
	self.resultData = ko.observable("<hr>");
	
	self.httpServerPort = ko.observable(8894);
	self.httpProxyPort = ko.observable(8893);
	self.proxyChecked = ko.observable(false);
	self.httpChecked = ko.observable(false);
	//ko.observable(false);
	self.httpRunning = ko.observable(false);
	self.proxyRunning = ko.observable(false);
	self.currentProxyRule = ko.observable(
		['clear_proxy_rule();',
	'push_proxy_rule({host:"dos.com",path:"http://s.com/a",body:"is from /a",headers:{Server:"notNginx"}});',
	'push_proxy_rule({host:"log.mmstat.com",callback:function(req){',
		'query_string = qs.parse(req.path);',
		'if(query_string["gokey"]){',
		'var clickUrl = query_string["gokey"];',
		'var clickParams = qs.parse(clickUrl);',
		'matched_params.push(clickParams);',
		'log(clickParams);',
		'}else{',
		'log(req.path);',
		'}',
 		'}})'].join("\n"));
	self.updateProxyRules = function(){
		eval(self.currentProxyRule());
	}
	self.checkProxyServer = function(){
		setTimeout(function(){
			var checked= self.proxyChecked();
			if(checked){
				console.log(window.proxyServer.listen(self.httpProxyPort()));

				self.proxyRunning(true);
			}else{
				window.proxyServer.close();
				self.proxyRunning(false);
			}
		},50);
		return true;
	}
	self.checkHttpServer=function(){
		setTimeout(function(){
			var checked = self.httpChecked();
			if(checked){
				console.log("http server started");
				console.log(window.http_server.listen(self.httpServerPort()));
				self.httpRunning(true);
			}else{
				console.log("http server closed");
				window.http_server.close();
				self.httpRunning(false);
			}
		},50);
		return true;
	}
	self.checkHttpJsQuery = function(){
		return true;
	}
	self.startHttpProxy=function(){

	}
	self.startHttpServer = function(){

	}
	self.httpProxyRunning=function(){
		return self.httpRunning;
	}
	self.httpServerRunning=function(){
		return self.proxyRunning;
	}
	self.openFile=function(){
		var path = self.filePath();
		n4t.fs.readFile(path, 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            window.editor.setValue(data);
			window.editor.refresh();
			self.initialContent(data);
			self.changed();
			self.fileContent(data);
        });

		//console.log(self.filePath());
	};
	self.noticeCssChange =function(){
		
		if(
			self.isFromFile() && (self.initialContent()!=window.editor.getValue() )
			 ) {
			//console.log("alert-error");
			return "alert alert-error";
		}else{
			
			if(self.isFromFile()){
				//console.log("alert alert-success");
				return "alert alert-success";
			}else{
				console.log(" no css");
				return "";
			}
			
			
		}

	};
	self.changed	=function(){
		self.isFromFile(true);
		//self.initialContent(window.editor.getValue());
		var newValue  = window.editor.getValue();
		$(".noticeCss").removeClass("alert").removeClass("alert-error").removeClass("alert-success").addClass(n4tapp.noticeCssChange());
		if(newValue!=self.initialContent()){
			self.dirty(true);
		}
	};
	self.chooseNewFile = function(){
		$("#openFile").click();
	};
	self.saveFile = function(){
		if(self.filePath()!="" ){
			var val = window.editor.getValue();
			n4t.fs.writeFileSync(self.filePath(),val);
		}
	}
	self.showSave=function(){
		return false;
		var curValue = window.editor.getValue();
		if(!self.isFromFile()){
			return false;
		}
		if(curValue==self.initialContent() ){
			return false;
		}else
			return true;
	}
	self.chooseFileToSaveAs=function(){
		$("#saveFileAs").trigger("click");
	}
	self.revert = function(){
		window.editor.setValue(self.fileContent);

	};
	self.runTest = function(){
		try{
			eval(window.editor.getValue());
			nodeunit.run({"suit 1":tests});
		}catch(e){
			console.log(e);
		}

	};
	self.runPlot=function(){
		
		var fs = require("fs");
var oldData = JSON.parse(fs.readFileSync("/Users/renlu/Temp/app.nw/data/old.json"));
var newData = JSON.parse(fs.readFileSync("/Users/renlu/Temp/app.nw/data/new.json"));
var options = {
			"xAxis":{"Categories":[]},
			chart: {
                type: 'column'
            },
              title: {
                text: 'Column chart with negative values'
            },
              credits: {
                enabled: false
            },

        };
var xAxis = {};
for(var c in oldData){
	xAxis[c]="";
}
for(var c in newData){
	xAxis[c]="";
}
//console.log(xAxis);

for(var c in xAxis){
	options["xAxis"]["Categories"].push(c);
}
//console.log(options);
var new_serie_data  =[]; 
for(var c in options["xAxis"]["Categories"]){
	var temp=0;
	if(oldData[options["xAxis"]["Categories"][c]]){
		temp = oldData[options["xAxis"]["Categories"][c]];
	}
	new_serie_data.push(temp);
}
var series = [];
series.push({"name":"old","data":new_serie_data});
console.log(series);
var new_serie_data  =[]; 
for(var c in options["xAxis"]["Categories"]){
	var temp=0;
	if(newData[options["xAxis"]["Categories"][c]]){
		temp = newData[options["xAxis"]["Categories"][c]];
	}
	new_serie_data.push(temp);
}
series.push({"name":"new","data":new_serie_data});
options["series"] = series;

	$("#placeholder1").highcharts(options);
options["yAxis"]={min:0,"title":{text:"percentage"}};
options["tooltip"]= { pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
 shared: true};
 options["plotOptions"]= {column: {stacking: 'percent'}};
//console.log(series);

		//$("#placeholder").html(JSON.stringify(options).replace(/\n/g,"<br>"));

		$("#placeholder2").highcharts(options);
	};

}
$(document).ready(function(){
	var n4tapp = new n4t.App({filePath:"",initialContent:""});
	//console.log(n4tapp);
    ko.applyBindings(n4tapp, $("#wrap")[0]);
    $("#openFile").change(function(){
    	n4tapp.openFile();
    	n4tapp.filePath($(this).val());
    });
    
    $("#saveFileAs").change(function(){
    	var newPath = $(this).val();
    	n4tapp.filePath(newPath);
    	n4tapp.saveFile();
		n4tapp.changed();    	
		n4tapp.openFile();
    });
    var editor = window.editor = CodeMirror.fromTextArea(document.getElementById("code"), {
mode:"javascript",

lineNumbers : true,
matchBrackets : true,
smartIndent:true,
//mode : "application/x-httpd-php",
indentUnit : 2,
indentWithTabs : true,
lineWrapping : true,
tabSize:2,
enterMode : "keep",
theme : "monokai",
styleActiveLine : true,
styleSelectedText : true,
highlightSelectionMatches : true,
viewportMargin : Infinity,
keyMap : "vim",
showCursorWhenSelecting : true
}
);


var charWidth = editor.defaultCharWidth(), basePadding = 4;
editor.on("renderLine", function(cm, line, elt) {
    if(line.text=="\t") return;
    var off = CodeMirror.countColumn(line.text, null, cm.getOption("tabSize")) * charWidth;
    elt.style.paddingLeft = (basePadding + off) + "px";
});
editor.refresh();


    window.editor.on("change",function(){
    	n4tapp.changed();
    	
    });
    window.n4tapp= n4tapp;
});