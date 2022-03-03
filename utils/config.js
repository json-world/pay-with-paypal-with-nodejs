let express = require("express"),
	path= require('path'); 

let method=config.prototype;

function config(app){
	
	app.set('view engine', 'ejs');
	app.engine('html', require('ejs').renderFile);
	app.set('views', (__dirname + '/../views'));
	app.use(express.static(path.join('publicData')));
}

method.get_config=function(){
	return this;
}

module.exports = config;