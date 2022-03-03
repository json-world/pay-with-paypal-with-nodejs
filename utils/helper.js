'use strict';
let Mongodb = require("./db"),
	paypal = require('paypal-rest-sdk');

// paypal auth configuration
let config = {
  "port" : 5000,
  "api" : {
    "host" : "api.sandbox.paypal.com",
	"port" : "",            
	//"mode" : "live",     // uncomment this line when payment is in live environment...
    "client_id" : "AaLCmuqgAo-jy6t30kWVWWB7fxlKUSwWSmAV7VnMpl0OcT_aqiqfFoVFx1UAYWQfmNp_-OKoMqcmOQid",  // your paypal application client id
    "client_secret" : "EB0A3e12aOixakr5i0ZKMTnnCuhSnwmoWGgXSewICz7Rw-GTiWfuyDBOccuVy5z-gXHG7lTSGv8jUM_4" // your paypal application secret id
  }
}
paypal.configure(config.api);
 
let self={
	insertPayment:function(data,callback){
		var response={};
		Mongodb.onConnect(function(db,ObjectID){
			db.collection('payments').insertOne(data,function(err, result) {
				if(err){
					response.isPaymentAdded = false;
					response.message = "Something went Wrong,try after sometime.";
				}else{
					response.isPaymentAdded = true;
					response.id=result.ops[0]._id;
					response.message = "Payment added.";
				}
				callback(response);	
			});
		});
	},	
	getAllProducts:function(data,callback){
		Mongodb.onConnect(function(db,ObjectID){
			db.collection('products').find().toArray(function(err, result){
				callback(result);
				db.close();
			});
		});
	},
	payNow:function(paymentData,callback){
		var response ={};

		/* JSON for Paypal starts */
		const payment = {
			"intent": "authorize",
			"payer": {
				"payment_method": "paypal"
			},
			"redirect_urls": {
				"return_url": "http://127.0.0.1:3000/execute",
				"cancel_url": "http://127.0.0.1:3000/cancel"
			},
			"transactions": [{
				"amount": {
					"total": paymentData.data.price,
					"currency": "USD"
				},
				"description": paymentData.data.productName
			}]
		};
		/* JSON for Paypal ends */

		/* Creating Paypal Payment for Paypal starts */
		paypal.payment.create(payment, function (error, payment) {
			if (error) {
				console.log(error);
			} else {
		    	if(payment.payer.payment_method === 'paypal') {
		    		response.paymentId = payment.id;
		    		var redirectUrl;
		    		response.payment = payment;
		    		for(var i=0; i < payment.links.length; i++) {
		    			var link = payment.links[i];
		    			if (link.method === 'REDIRECT') {
		    				redirectUrl = link.href;
		    			}
		    		}
		    		response.redirectUrl = redirectUrl;
		    	}
		    }
		    callback(error,response);
		});
	},
	getResponse:function(data,PayerID,callback){

		var response = {};
		
		const serverAmount = parseFloat(data.paypalData.payment.transactions[0].amount.total);
		const clientAmount = parseFloat(data.clientData.price);
		const paymentId = data.paypalData.paymentId;
		const details = {
			"payer_id": PayerID 
		};

		response.userData= {
			userID : data.sessionData.userID,
			name : data.sessionData.name
		};

		if (serverAmount !== clientAmount) {
			response.error = true;
			response.message = "Payment amount doesn't matched.";
			callback(response);
		} else{
			
			paypal.payment.execute(paymentId, details, function (error, payment) {
				if (error) {
					console.log(error);
					response.error = false;
					response.message = "Payment Successful.";
					callback(response);
				} else {

					const insertPayment={
					    userId : data.sessionData.userID,
					    paymentId : paymentId,
					    createTime : payment.create_time,
					    state : payment.state,
					    currency : "USD",
					    amount: serverAmount,
					    createAt : new Date().toISOString()
					}

					self.insertPayment(insertPayment,function(result){

						if(! result.isPaymentAdded){
							response.error = true;
							response.message = "Payment Successful, but not stored.";
							callback(response);
						}else{
							response.error = false;
							response.message = "Payment Successful.";
							callback(response);
						};
					});
				};
			});
		};
    }
}
module.exports = self;