/* Main javascript  */

$(function(){
    // Load native UI library
   // var gui = require('nw.gui');

    //instantiate markgiu app and bind it to DOM
    var markGiuApp = new markgiu.AppGui();
    markGiuApp.bindChoosers('#choosefile', '#savefileas');
    ko.applyBindings(markGiuApp, $("#wrap")[0]);
    
    //show window
    //gui.Window.get().show();
    //console.log(gui.App.argv[0]);
    /**
    window.argv=gui.App.argv;
    if(window.argv.length>0){
        var arg_index;
        for(arg_index in window.argv){
            markGiuApp.openFile(window.argv[arg_index]);
        }
    }else{
        markGiuApp.addTabNew();    
    }
    */
    /**
    gui.App.on('open', function(path) {
    	markGiuApp.openFile(path);
  		console.log('[msg]Opening: ' + path);
	});*/
   // $('pre code').each(function(i, e) {hljs.highlightBlock(e)});
    //setInterval(function(){$('pre code').each(function(i, e) {hljs.highlightBlock(e)});},1000);
});



var kibo = new Kibo();
kibo.down(['ctrl o','command o','alt o'], function(){
	//$("#choosefile").click();
});
kibo.down(["ctrl s",'command s','alt s'],function(){
	//$("#savefileas").click();
});
kibo.down("any",function(){

	//console.log(kibo.lastKey());
});



