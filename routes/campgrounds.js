var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var User = require("../models/user");
var Notification = require("../models/notification");
var middleware = require("../middleware");


//INDEX - show all campgrounds
router.get("/", function(req, res){
	
	//eval(require('locus')); //freezes the code at this point in order to debug
	
	//handling search queries (if the search bar is not empty)
	var noMatch = null;
	if(req.query.search){  //query instead of req.body is used for get requests 
		const regex = new RegExp(escapeRegex(req.query.search), 'gi'); //instantiating a regex
		Campground.find({name:regex}, function(err, allCampgrounds){
		   if(err){
			   console.log(err);
		   } else {
			   
			   if(allCampgrounds.length < 1){
				   noMatch = "Found no campground by that name!";
			   }
			  	res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch:noMatch}); //int the second arg we are sending the data to the next                                                                                                //page
		   }
		});
	}
	
	else{
    	// Get all campgrounds from DB
		Campground.find({}, function(err, allCampgrounds){
		   if(err){
			   console.log(err);
		   } else {
			  res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch:noMatch}); //int the second arg we are sending the data to the next page
		   }
		});
	}
});

//CREATE - add new campground to DB and generate new notification for followers (very inefficient!!)
router.post("/", middleware.isLoggedIn, async function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, image: image, description: desc, author:author}

    try {
      let campground = await Campground.create(newCampground);
      let user = await User.findById(req.user._id).populate('followers').exec();
      let newNotification = {
        username: req.user.username,
        campgroundId: campground.id
      }
      for(const follower of user.followers) { //a new type of for loop
        let notification = await Notification.create(newNotification);
        follower.notifications.push(notification);
        follower.save();
      }

      //redirect back to campgrounds page
      res.redirect(`/campgrounds/${campground.id}`);
    } catch(err) {
      req.flash('error', err.message);
      res.redirect('back');
    }
});
// router.post("/", middleware.isLoggedIn, function(req, res){
//     // get data from form and add to campgrounds array
//     var name = req.body.name;
//     var image = req.body.image;
//     var desc = req.body.description;
//     var author = {
// 		//the session adds the user var to req
//         id: req.user._id,
//         username: req.user.username
//     }
//     var newCampground = {name: name, image: image, description: desc, author:author}
//     // Create a new campground and save to DB
//     Campground.create(newCampground, function(err, newlyCreated){
//         if(err){
//             console.log(err);
//         } else {
//             //redirect back to campgrounds page
//             req.flash("success", "Successfully created a camp!");
//             res.redirect("/campgrounds");
//         }
//     });
// });

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});


// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash('error', 'Camground not found');
			res.redirect('back');
        } else {
            console.log(foundCampground)
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id",middleware.checkCampgroundOwnership, function(req, res){
    // find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err){
           res.redirect("/campgrounds");
       } else {
           //redirect somewhere(show page)
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id",middleware.checkCampgroundOwnership, function(req, res){
   Campground.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/campgrounds");
      } else {
          res.redirect("/campgrounds");
      }
   });
});

//regular expression
function escapeRegex(text) {
	return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};


module.exports = router;