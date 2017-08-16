var express = require("express");
var session = require("express-session");
var control = require("./controller")
var app = express();
app.use(session({
    secret:"keyboard cat",
    resave:false,
    saveUninitialized:true
}))
app.set("view engine","ejs");
app.use(express.static("./public"));
app.use(express.static("./avactor"));
app.listen(4000);
app.get("/",control.showHome);
app.get("/login",control.showLogin);
app.get("/doLogin",control.doLogin);
app.get("/regist",control.showRegist);
app.get("/doRegist",control.doRegist);
app.get("/out",control.out);
app.get("/insert",control.insert_msg);
app.get("/du",control.find_msg);
app.get("/mymsg",control.find_mymsg);
app.get("/msglist",control.msgList)
app.get("/changePhoto",control.changePhoto);
app.post("/cut",control.cutPhoto);
app.get("/doCut",control.doCut);