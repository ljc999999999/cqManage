const express = require("express");
const dbHelper = require("./02.抽取mongo");
const path=require('path')
const multer  = require('multer')
const upload = multer({ dest: 'views/imgs' })
const bodyParser=require('body-parser')


const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static("views"));
app.get("/herolist", (req, res) => {
  // 获取query数据
  const query = req.query.query;
  //获取页码
  console.log(req.query);
  
  const pagenum = parseInt(req.query.pagenum);
//   console.log(pagenum);
  
  //获取页容量
  const pagesize = parseInt(req.query.pagesize)
//   const pagesize = parseInt(req.query.pagesize)
//   console.log(pagesize);
  
  //查询数据
  dbHelper.find("cqlist", {}, result => {
     result=result.reverse()
    const temArr = result.filter(v => {
        // console.log(v);
        
      if (v.heroName.indexOf(query) != -1 || v.skillName.indexOf(query) != -1
      ) {
        return true;
      }
    });
    // console.log(temArr);
    
    //获取当前页起始数
    const startIndex=(pagenum-1)*pagesize
    // console.log(startIndex);
    
    //获取当前页最后数
    const endIndex=startIndex+pagesize
    // console.log(endIndex);
    
    //获取当前页数据
    let list=[];
    for(let i=startIndex;i<endIndex;i++){
        if(temArr[i]){
            list.push(temArr[i])
        }
    }
    //获取总页数
    const totalpage=Math.ceil(temArr.length/pagesize)
    res.send({
        list,
        totalpage
    })
  });
});
app.get('/heroDetail',(req,res)=>{
    const id=req.query.id
    dbHelper.find('cqlist',{_id:dbHelper.ObjectId(id)},result=>{
        res.send(result[0])
    })
});
app.post('/heroAdd', upload.single('heroIcon'),(req, res)=> {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    console.log(req.file);
    const heroName=req.body.heroName
    const skillName=req.body.skillName
    const heroIcon=path.join('imgs',req.file.filename)
    // console.log(req.body);
    dbHelper.insertOne('cqlist',{
        heroName,
        skillName,
        heroIcon
    },result=>{
        res.send({
            msg:'新增成功',
            code:200
        })
    })
    
    
  })
app.post('/updatehero',upload.single('heroIcon'),(req,res)=>{
    const heroName=req.body.heroName;
    const skillName=req.body.skillName;
    console.log(req.file);
    console.log(req.body);
    
    const id=req.body.id
    let updateData={
        heroName,
        skillName
    }
    if(req.file){
        const heroIcon=path.join('imgs',req.file.filename);
        updateData.heroIcon=heroIcon
      
    }
    dbHelper.updateOne('cqlist',{_id:dbHelper.ObjectId(id)},
        updateData
    ,result=>{
        res.send({
            msg:'修改成功',
            code:200
        })
    })
 
})
app.get('/heroDelete',(req,res)=>{
    const id=req.query.id
    dbHelper.deleteOne('cqlist',{_id:dbHelper.ObjectId(id)},result=>{
        res.send({
            msg:'删除成功',
            code:200
        })
    })
})
app.post('/register',(req,res)=>{
    const username=req.body.username
    console.log(username);
    const password=req.body.password
    console.log(password);
    dbHelper.find('userlist',{username:req.body.username},result=>{
        if(result.length===0){
            dbHelper.insertOne('userlist',req.body,result=>{
                res.send({
                    msg:"账户注册成功",
                    code:200
                })
            })
        }else{
            res.send({
                msg:"账号已注册",
                code:100
            })
        }
    })
    
})
app.listen(8989);
