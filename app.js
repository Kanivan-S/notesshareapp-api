var logger=require("./utils/log")(module)
const express = require('express');
const app = express();
const cors=require('cors');
const con=require("./config/dbconnection")
const  utils=require('./utils');
const authroutes=require("./routes/auth")
const fnroutes=require("./routes/routes");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const {Users,Texts}=require("./models/model");
const fns=require("./controllers/fns/functions")
app.use(cors());//update it when u integrate with frontend
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// DB-Connection 
con.
  sync().
  then(() => {
    logger.info("Synced db.");
  })
  .catch((err) => {
    logger.error(err);
    logger.info("Failed to sync db: " + err.message);
  });


//allow login-signup routes without jwt Authorization
app.use('/api/auth',upload.none(), authroutes); 
// Authorizing requests
app.use((req,res,next)=>{
  const token = req.headers.authorization 
  if(!token || token==="Bearer no_token") {res.locals.id=-1;next();}
  else{
    const data = utils.token.verifyToken(token)  
    if(data!==null){ 
      res.locals.userid=data.userid;
      next(); 
    }
    else{
      return res.status(401).send({message:"un-authorised , give me token!!"})
    }
  }
})

app.use("/api",upload.none(),fnroutes);

app.use(function(req, res, next) {
  return res.status(404)
});

app.listen(3000, (err) => {
  if (!err) logger.info("App Started!!")
  else logger.error("Error Starting") ;
})
