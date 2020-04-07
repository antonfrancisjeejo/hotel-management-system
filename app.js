const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://jeejo13:jeejo123@cluster0-q3jj1.mongodb.net/hotelDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const loginSchema = {
  name: String,
  password: String
};

const Login = mongoose.model("Login", loginSchema);

// const login = new Login({
//   name:"admin",
//   password:"admin"
// });
//
// login.save();

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
  res.render("admin");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/search", (req, res) => {
  res.render("search", {
    option: "Search",
    buttonName: "Search",
    url: "search",
    alturl: "search"
  });
});

app.get("/update", (req, res) => {
  res.render("search", {
    option: "Update",
    buttonName: "Search",
    url: "search",
    alturl: "update"
  });
});

app.get("/delete", (req, res) => {
  res.render("search", {
    option: "Delete",
    buttonName: "Delete",
    url: "search",
    alturl: "delete"
  });
});

app.post("/", (req, res) => {
  const userName = req.body.userName;
  const userPass = req.body.userPassword;
  if (userName === "admin") {
    Login.findOne({
      name: userName
    }, (err, foundList) => {
      if (foundList.password === userPass) {
        res.redirect("/admin");
      } else {
        res.render("failure");
      }
    });
  } else {
    res.render("failure");
  }
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
