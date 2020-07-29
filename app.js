var express   		= require("express"),
    app         	= express(),
    bodyParser  	= require("body-parser"), //to get the names in the forms
    mongoose    	= require("mongoose"),
    flash       	= require("connect-flash"), //for the error and success messages
    passport    	= require("passport"),	//for built-in user authentication
    LocalStrategy 	= require("passport-local"),
    methodOverride 	= require("method-override"), //to use the put request in place of post
    Campground  	= require("./models/campground"),
    Comment     	= require("./models/comment"),
    User        	= require("./models/user"),
    seedDB      	= require("./seeds")
    
//requiring routes
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index")
    
mongoose.connect(process.env.DATABASEURL, {  //the first arguement is defined in the command
	useNewUrlParser: true,
	useCreateIndex: true
}).then(() => {	
	console.log("Connected to db!");	
}).catch( err => { //if only one param of call back then brackets not required around param
	console.log("ERROR:",err.message);
});
	   
// mongodb+srv://shamaan321:pk4710086@yelpcamp.gpjna.mongodb.net/YelpCamp?retryWrites=true&w=majority
// mongodb://localhost/yelp_camp_v11
//export DATABASEURL="mongodb://localhost/yelp_camp_v11"


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs"); //no need to add .ejs when locating ejs files
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method")); //this will be used in the froms request 
app.use(flash());
//seedDB(); //seed the database

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//setting up flash messages to be used and also notifications 
app.use(async function(req, res, next){ //async required for await
   res.locals.currentUser = req.user;
   if(req.user) {
    try {
      let user = await User.findById(req.user._id).populate('notifications', null, { isRead: false }).exec(); //only find unread notifications
      res.locals.notifications = user.notifications.reverse();
    } catch(err) {
      console.log(err.message);
    }
   }
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});
// app.use(function(req, res, next){
//    res.locals.currentUser = req.user;
//    res.locals.error = req.flash("error");
//    res.locals.success = req.flash("success");
//    next();
// });

//locating the routes to be used
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);


app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The YelpCamp Server Has Started!");
});