'use strict';

let app = require("express")(),
    express = require("express"),
    http = require('http').Server(app);


let config =require('./utils/config.js')(app),
    db = require("./utils/db.js");

app.use('/static', express.static('publicData'))

require('./utils/routes.js')(app);


http.listen(3000,function(){
    console.log("App listening on port :3000");
});


