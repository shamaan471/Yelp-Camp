var mongoose = require("mongoose");
var Campground = require("./models/campground"); //'./' means the current directory 
var Comment   = require("./models/comment");
var User   = require("./models/user");


//the functions are nested as callbacks because in java script the separate functions are called in no particular order
function seedDB(){
   //Remove all campgrounds
   Campground.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed campgrounds!");
    }); 
	
	User.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed users!");
    });
	
	Comment.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed comments!");
    });
	
}

module.exports = seedDB;