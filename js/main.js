/* Main javascript  */

$(function(){
    // Load native UI library
    var gui = require('nw.gui');

    //instantiate markgiu app and bind it to DOM
    var markGiuApp = new markgiu.AppGui();
    markGiuApp.bindChoosers('#choosefile', '#savefileas');
    ko.applyBindings(markGiuApp, $("#wrap")[0]);
    markGiuApp.addTabNew();
    //show window
    gui.Window.get().show();
    //console.log(gui.App.argv[0]);
    window.argv=gui.App.argv;
    gui.App.on('open', function(path) {
    	markGiuApp.openFile(path);
  		console.log('[msg]Opening: ' + path);
	});
    //setInterval(function(){$('pre code').each(function(i, e) {hljs.highlightBlock(e)});},1000);
});
function viewInHtml(){
   

    		bootbox.alert("<textarea rows='16' cols='180' style='width:500px'>"+$(".section_to_print").html().replace("<","&lt;").replace(/>/g,"&gt;")+"</textarea>");
    		//alert("hello");
}

var kibo = new Kibo();
kibo.down(['ctrl o','command o','alt o'], function(){
	$("#choosefile").click();
});
kibo.down(["ctrl s",'command s','alt s'],function(){
	$("#savefileas").click();
});
kibo.down("any",function(){

	console.log(kibo.lastKey());
});
