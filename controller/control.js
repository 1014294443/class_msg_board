var md5 = require("../models/md5.js");
var db = require("../models/db.js");
var sd = require("silly-datetime");
var formidable = require("formidable");
var path = require("path");
var fs = require("fs");
var gm = require("gm")
exports.showHome = function(req,res){
    db.getAllCount("msg_board",function(result){
        var login = req.session.login;
        console.log(login);
        if(login=="1"){
            db.find("user",{"uname":req.session.uname},function(err,data){
                res.render("Home",{"msg":2,"uname":req.session.uname,"uphoto":data[0].uphoto,"allPage":Math.ceil(result / 6)});
            })

        }else{
            res.render("Home", {"msg":1,"allPage":Math.ceil(result / 6)});
        }
    })
}
exports.showLogin = function(req,res){
    res.render("login");
}
exports.doLogin = function(req,res){
    req.session.a=1;
    var uname = req.query.uname;
    var pwd = req.query.pwd;
    pwd = md5(pwd);
    db.find("user",{"uname":uname},function(err,result){
        if (err){console.log("查询失败");return};
        if(result.length==0){
            console.log("没有此用户,请先注册");
            res.send("-1");
            return;
        }
        var oldpwd = result[0].pwd;
        if(oldpwd==pwd){
            console.log("登陆成功");
            req.session.uname=result[0].uname;
            req.session.login = "1";
            res.send("1");
            /*res.redirect("/");*/
        }else{
            console.log("密码不正确");
            res.send("-2");
            return;
        }
    })
}
exports.showRegist = function(req,res){
    res.render("regist")
}
exports.doRegist = function(req,res){
    var uname = req.query.uname;
    var pwd = req.query.pwd;
    pwd = md5(pwd);
    var insertObj = {
        "uname":uname,
        "pwd":pwd,
        "uphoto":"./images/a.jpg"
    }
    db.find("user",{"uname":uname},function(err,result){
        if(result.length!=0){
            res.send("-1");
            console.log("用户名已存在");
            return;
        }
        db.insertOne("user",insertObj,function(err2,data){
            if(err2){
                console.log("注册失败")
                res.send("-2");
                return;
            }
            req.session.uname=uname;
            req.session.login = "1";
            res.send("1");
        })
    })
}
exports.out = function(req,res){
    req.session.uname = undefined;
    req.session.login = undefined;
    res.redirect("/")
}
exports.insert_msg = function(req,res){
    var uname = req.query.uname;
    var msg = req.query.msg;
    var time = sd.format(new Date(),"YYYY-MM-DD HH:mm:ss")
    var insertObj = {
        "uname":uname,
        "msg":msg,
        "time":time
    }
    if(msg==""){
        console.log("输入内容不能为空");
        res.send("-1")
        return;
    }
    db.insertOne("msg_board",insertObj,function(err,result){
        if(err){
            console.log("插入失败");
            res.send("-2");
            return;
        }
        console.log("信息插入成功");
        res.send("1");
    })
}
exports.find_msg = function(req,res){
    var page = parseInt(req.query.page);
    db.find("msg_board",{},{"pageSize":6,"page":page,"sort":{"time":-1}},function(err1,result){
        if(result){
            (function cb(i){
                if(i==result.length){
                    res.send({"result":result});
                    return;
                }
                db.find("user",{"uname":result[i].uname},function(err2,result2){
                    result[i].uphoto = result2[0].uphoto;

                    cb(i+1)
                })
            })(0)
        }
    })
}
exports.find_mymsg = function(req,res){
    var uname = req.query.uname;
    var uphoto = req.query.uphoto
    db.find("msg_board",{"uname":uname},function(err,result){
        res.render("mymsg",{"result":result,"uname":uname,"uphoto":uphoto});
    })
}
exports.msgList = function(req,res){
    var uname = req.query.uname
    db.find("msg_board",{},{sort:{"time":-1}},function(err,result){
        res.render("msglist", {"msg":result,"uname": uname})
    })
}
exports.changePhoto = function(req,res){
    var uname = req.query.uname;
    res.render("setAvactor",{"uname":uname})
}
exports.cutPhoto = function(req,res){

    var form = new formidable.IncomingForm();
    form.uploadDir = "./avactor";
    form.parse(req,function(err,fields,file){
        if(err){
            console.log("这里报错",err);
            return
        }
        var uname = fields.uname;
        var fname = file.uphoto.name;
        var extname = path.extname(fname);
        var time = sd.format(new Date(),"YYYYMMDDHHmmss");
        var random = parseInt(Math.random()*10000)+10000;
        var oldpath = file.uphoto.path;
        var newpath = "./avactor/"+time+random+extname;
        fs.rename(oldpath,newpath,function(err){
            if(err){
                return;
            };
            res.render("cut",{"uphoto":time+random+extname,"uname":uname})
        })
    })
}
exports.doCut = function(req,res){
    var w = parseInt(req.query.w);
    var h = parseInt(req.query.h);
    var l = parseInt(req.query.l);
    var t = parseInt(req.query.t);
    var imgsrc = req.query.imgsrc;
    var uname = req.query.uname;
    gm("./avactor/"+imgsrc).crop(w,h,l,t).write("./avactor/cut"+imgsrc,function(err){
        if(err){
            console.log("doCut错误",err);
            res.send("-1")
        }
        db.updateMany("user",{"uname":uname},{$set:{"uphoto":"./cut"+imgsrc}},function(err,result){
            if(err){
                console.log(err);
                return;
            }
        })
        res.send("1");
    })
}