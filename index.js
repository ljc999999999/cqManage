const express = require("express");
const dbHelper = require("./02.抽取mongo");
const path = require("path");
const multer = require("multer");
const upload = multer({ dest: "views/imgs" });
const bodyParser = require("body-parser");
const svgCaptcha = require("svg-captcha");
const cookieSession = require("cookie-session");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("views"));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);
app.use((req, res, next) => {
  //   console.log(req.session);
  console.log(req.url);
  if (req.url.indexOf("/hero") === 0) {
    if (req.session.username) {
      next();
    } else {
      res.send({
        msg: "请先登录",
        code: 400
      });
      
    }
  }else{
      next();
  }

  
});
app.get("/herolist", (req, res) => {
  // 获取query数据
  const query = req.query.query;
  //获取页码
  console.log(req.query);

  const pagenum = parseInt(req.query.pagenum);
  //   console.log(pagenum);

  //获取页容量
  const pagesize = parseInt(req.query.pagesize);
  //   const pagesize = parseInt(req.query.pagesize)
  //   console.log(pagesize);

  //查询数据
  dbHelper.find("cqlist", {}, result => {
    result = result.reverse();
    const temArr = result.filter(v => {
      // console.log(v);

      if (v.heroName.indexOf(query) != -1 || v.skillName.indexOf(query) != -1) {
        return true;
      }
    });
    // console.log(temArr);

    //获取当前页起始数
    const startIndex = (pagenum - 1) * pagesize;
    // console.log(startIndex);

    //获取当前页最后数
    const endIndex = startIndex + pagesize;
    // console.log(endIndex);

    //获取当前页数据
    let list = [];
    for (let i = startIndex; i < endIndex; i++) {
      if (temArr[i]) {
        list.push(temArr[i]);
      }
    }
    //获取总页数
    const totalpage = Math.ceil(temArr.length / pagesize);
    res.send({
      list,
      totalpage
    });
  });
});
app.get("/heroDetail", (req, res) => {
  const id = req.query.id;
  dbHelper.find("cqlist", { _id: dbHelper.ObjectId(id) }, result => {
    res.send(result[0]);
  });
});
app.post("/heroAdd", upload.single("heroIcon"), (req, res) => {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  console.log(req.file);
  const heroName = req.body.heroName;
  const skillName = req.body.skillName;
  const heroIcon = path.join("imgs", req.file.filename);
  // console.log(req.body);
  dbHelper.insertOne(
    "cqlist",
    {
      heroName,
      skillName,
      heroIcon
    },
    result => {
      res.send({
        msg: "新增成功",
        code: 200
      });
    }
  );
});
app.post("/heroupdate", upload.single("heroIcon"), (req, res) => {
  const heroName = req.body.heroName;
  const skillName = req.body.skillName;
  console.log(req.file);
  console.log(req.body);

  const id = req.body.id;
  let updateData = {
    heroName,
    skillName
  };
  if (req.file) {
    const heroIcon = path.join("imgs", req.file.filename);
    updateData.heroIcon = heroIcon;
  }
  dbHelper.updateOne(
    "cqlist",
    { _id: dbHelper.ObjectId(id) },
    updateData,
    result => {
      res.send({
        msg: "修改成功",
        code: 200
      });
    }
  );
});
app.get("/heroDelete", (req, res) => {
  const id = req.query.id;
  dbHelper.deleteOne("cqlist", { _id: dbHelper.ObjectId(id) }, result => {
    res.send({
      msg: "删除成功",
      code: 200
    });
  });
});
app.post("/register", (req, res) => {
  const username = req.body.username;
  console.log(username);
  const password = req.body.password;
  console.log(password);
  dbHelper.find("userlist", { username: req.body.username }, result => {
    if (result.length === 0) {
      dbHelper.insertOne("userlist", req.body, result => {
        res.send({
          msg: "账户注册成功",
          code: 200
        });
      });
    } else {
      res.send({
        msg: "账号已注册",
        code: 400
      });
    }
  });
});

app.get("/captcha", function(req, res) {
  //创建验证码
  var captcha = svgCaptcha.create();
  //
  req.session.vcode = captcha.text;
  console.log(captcha.text);
  //设置响应类型
  res.type("svg");
  //返回数据
  res.status(200).send(captcha.data);
});
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const vcode = req.body.vcode;
  console.log(vcode);

  if (req.session.vcode.toLocaleLowerCase() === vcode.toLocaleLowerCase()) {
    dbHelper.find("userlist", { username, password }, result => {
      req.session.username = username;
      if (result.length != 0) {
        res.send({
          msg: "欢迎回来",
          code: 200,
          username
        });
      } else {
        res.send({
          msg: "账户或密码错误！！",
          code: 400
        });
      }
    });
  } else {
    res.send({
      msg: "验证码错误！",
      code: 400
    });
  }
});
app.get('/logout',(req,res)=>{
    req.session=null;
    res.send({
        msg:'再见',
        code:200
    })
})

app.listen(8989);
