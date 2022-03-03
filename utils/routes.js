'use strict';
const bodyParser = require('body-parser');
var Session = require('express-session');

var Session = Session({
	secret:'ilovejsonworld',
	saveUninitialized: true,
	resave: true
});
const helper = require('./helper');

var method=routes.prototype;

function routes(app){
	
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(Session);	
	var sessionInfo;


	/*
    * Rendering login page
    */
	app.get('/', function(req, res){
		res.redirect("/home");
		res.end();
	});


	app.get('/home',function(req, res){
		sessionInfo = req.session;
		sessionInfo.sessionData = {
			userID:1,
			name:"jsonworld"
		};

			var response ={};
		    const data={
				ID : sessionInfo.sessionData.userID,
				name : sessionInfo.sessionData.name
			};

			helper.getAllProducts(data,function(products){
				response.products = products;
				response.userData = {};
				response.userData.name = sessionInfo.sessionData.name;
				//console.log(response.userData.name,'pankaj----');
				res.render('home',{
					response : response
				});
			});
	});

	app.post('/paynow',function(req, res){
		sessionInfo = req.session;
		if (typeof sessionInfo.sessionData == "undefined" || sessionInfo.sessionData=="") {
			res.redirect("/");
			res.end();
		} else{
			const data ={
				userID : sessionInfo.sessionData.userID,
				data : req.body
			}
			helper.payNow(data,function(error,result){
				if(error){
					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.end(JSON.stringify(error));
				}else{
					sessionInfo.paypalData = result;
					sessionInfo.clientData = req.body;
					res.redirect(result.redirectUrl);
				}				
			});			
		}	
	});

	/*
	* payment success url 
	*/
	app.get('/execute',function(req, res){		
		sessionInfo = req.session;	
		var response = {};
		const PayerID = req.query.PayerID;
		if (typeof sessionInfo.sessionData == "undefined" || sessionInfo.sessionData=="") {
			res.redirect("/");
			res.end();
		} else{
			sessionInfo.state ="success";
			helper.getResponse(sessionInfo,PayerID,function(response) {
				res.render('successPayement',{
					response : response
				});
			});
		};
	});

	/*
	* payment cancel url 
	*/
	app.get('/cancel',function(req, res){
		sessionInfo = req.session;
		if (typeof sessionInfo.sessionData == "undefined" || sessionInfo.sessionData=="") {
			res.redirect("/");
			res.end();
		} else{
			var response ={};
			response.error = true;
			response.message = "Payment unsuccessful.";
			response.userData = {
				name : sessionInfo.sessionData.name
			};
							
			res.render('successPayement',{
				response : response
			});
		}
	});

	app.get('/logout',function(req, res){
		req.session.sessionData = ""; 		
		res.redirect("/");
	});


}

method.getroutes=function(){
	return this;
}

module.exports = routes;
