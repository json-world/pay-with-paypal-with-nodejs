'use strict';
const bodyParser = require('body-parser');
var Session = require('express-session');

var Session = Session({
	secret:'secrettokenhere',
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

	/*
    * performing login operation
    */
	app.post('/login', function(req, res){
		sessionInfo = req.session;

		const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		const email = req.body.email;
		const password = req.body.password;

		var response = {};

		if(! regEx.test(email)){
			response.process = false;
			response.message = "Enter valid Email.";
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end(JSON.stringify(result));
		}else{
			const data={
				"email" : req.body.email,
				"password" : req.body.password
			}		

			helper.isUserExists(data,function(result){

				if(result.isUserExists === true){

					/*
					* Storing data into Session
					*/ 
					sessionInfo.sessionData = {
						userID:result.id,
						name:result.name,
					};
				}
				res.writeHead(200, {'Content-Type': 'text/plain'});
				res.end(JSON.stringify(result));			
			});
		}
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

			/*
			* Fetching products and showing onto home page 
			*/

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
			/*
			* call to paynow helper method to call paypal sdk
			*/
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
				res.render('executePayement',{
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
							
			res.render('executePayement',{
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
