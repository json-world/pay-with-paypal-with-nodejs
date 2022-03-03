

"use strict";

const  mongodb=require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;
const assert = require('assert');
const MongoUrl='mongodb://localhost:27017/NodejsPaypal';

module.exports.onConnect = function(callback){	
	MongoClient.connect(MongoUrl, function(err, db) {
		assert.equal(null, err);
		callback(db,ObjectID);
	});
}