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
	self.proxyRunning =false;
	//ko.observable(false);
	self.httpRunning = ko.observable(false);
	self.checkProxyServer = function(){
		return true;
	}
	self.checkHttpServer=function(){
		return true;
	}
	self.checkHttpJsQuery = function(){
		return true;
	}
	self.startHttpProxy=function(){

	}
	self.startHttpServer = function(){

	}
	self.httpProxyRunning=function(){}
	self.httpServerRunning=function(){}
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