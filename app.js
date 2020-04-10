require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.use(session({
  secret:"This is my secret key",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex:true
});

const userSchema = new mongoose.Schema({
  email: String,
  password:String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const customerSchema = {
  _id: {
    type: String,
    required: true
  },
  roomNo: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  mobileNo: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  aadhaarNo: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zip: {
    type: String,
    required: true
  }
}
const Customer = mongoose.model("Customer", customerSchema);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/admin", (req, res) => {
  if(req.isAuthenticated()){
    res.render("admin");
  }
  else{
    res.redirect("/");
  }
});

app.get("/register", (req, res) => {
  if(req.isAuthenticated()){
    res.render("register");
  }
  else{
    res.redirect("/");
  }
});

app.get("/search", (req, res) => {
  if(req.isAuthenticated()){
    res.render("search", {
      option: "Search",
      buttonName: "Search",
      url: "search",
      alturl: "search"
    });
  }
  else{
    res.redirect("/");
  }
});

app.get("/update", (req, res) => {
  if(req.isAuthenticated()){
    res.render("search", {
      option: "Update",
      buttonName: "Search",
      url: "search",
      alturl: "update"
    });
  }
  else{
    res.redirect("/");
  }
});

app.get("/delete", (req, res) => {
  if(req.isAuthenticated()){
    res.render("search", {
      option: "Delete",
      buttonName: "Delete",
      url: "search",
      alturl: "delete"
    });
  }
  else{
    res.redirect("/");
  }
});

app.get("/logout",(req,res)=>{
  req.logout();
  res.redirect("/");
});

app.post("/", (req, res) => {

  // User.register({ username:req.body.username },req.body.password,(err,user)=>{
  //   if(err){
  //     console.log(err);
  //     res.redirect("/");
  //   }else{
  //     passport.authenticate("local")(req,res,()=>{
  //       res.redirect("/admin");
  //     });
  //   }
  // });
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user,(err)=>{
    if(err){
      console.log(err);
    }
    else{
      passport.authenticate("local")(req,res,()=>{
        res.redirect("/admin");
      });
    }
  });
});

app.post("/admin", (req, res) => {
  const userId = req.body.id;
  const roomNo = req.body.roomNo;
  const name = req.body.name;
  const aadhaarNo = req.body.aadhaarNo;
  const mobileNo = req.body.mobileNo;
  const address = req.body.address;
  const city = req.body.city;
  const state = req.body.state;
  const zip = req.body.zip;

  const customer = new Customer({
    _id: userId,
    roomNo: roomNo,
    name: name,
    mobileNo: mobileNo,
    address: address,
    aadhaarNo: aadhaarNo,
    city: city,
    state: state,
    zip: zip
  });

  customer.save().then(() => {
    res.render("success", {
      pageTitle: "Success",
      subTitle: "Success",
      subject: "added"
    });
  });
});

app.post("/search", (req, res) => {
  const userId = req.body.userId;
  const page = req.body.operation;
  console.log(page);
  if (page === "search" || page === "update") {
    Customer.findOne({
      _id: userId
    }, (err, foundList) => {
      if (!err) {
        if (foundList) {
          const userId = foundList._id;
          const roomNo = foundList.roomNo;
          const name = foundList.name;
          const aadhaarNo = foundList.aadhaarNo;
          const mobileNo = foundList.mobileNo;
          const address = foundList.address;
          const city = foundList.city;
          const state = foundList.state;
          const zip = foundList.zip;
          if (page === "search") {
            res.render("searchResults", {
              userId: userId,
              roomNo: roomNo,
              name: name,
              mobileNo: mobileNo,
              address: address,
              aadhaarNo: aadhaarNo,
              city: city,
              state: state,
              zip: zip
            });
          } else if (page === "update") {
            res.render("updatePage", {
              userId: userId,
              roomNo: roomNo,
              name: name,
              mobileNo: mobileNo,
              address: address,
              aadhaarNo: aadhaarNo,
              city: city,
              state: state,
              zip: zip
            });
          }
        } else {
          if (page === "search") {
            res.render("searchFailure", {
              url: "search"
            });
          } else if (page === "update") {
            res.render("searchFailure", {
              url: "update"
            });
          }
        }
      }
    });
  } else if (page === "delete") {
    Customer.deleteOne({
      _id: userId
    }, (err, result) => {
      if (!err) {
        if (result.deletedCount === 1) {
          res.render("success", {
            pageTitle: "Delete",
            subTitle: "Deleted",
            subject: "Deleted"
          });
        } else {
          res.render("searchFailure", {
            url: "delete"
          });
        }
      }
    });
  }
});

app.post("/searchResults", (req, res) => {
  res.redirect("/admin");
});

app.post("/updateResults", (req, res) => {
  const userId = req.body.id;
  const roomNo = req.body.roomNo;
  const name = req.body.name;
  const aadhaarNo = req.body.aadhaarNo;
  const mobileNo = req.body.mobileNo;
  const address = req.body.address;
  const city = req.body.city;
  const state = req.body.state;
  const zip = req.body.zip;


  Customer.updateOne({
    _id: userId
  }, {
    roomNo: roomNo,
    name: name,
    mobileNo: mobileNo,
    address: address,
    aadhaarNo: aadhaarNo,
    city: city,
    state: state,
    zip: zip
  }, (err, result) => {
    res.render("success", {
      pageTitle: "Update",
      subTitle: "Updated",
      subject: "updated"
    });
  });
});
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
