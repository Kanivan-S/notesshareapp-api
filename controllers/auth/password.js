var logger=require("../../utils/log")(module);
const bcrypt=require("bcrypt");
const crypto = require("crypto")
const { sendMail}= require("../../utils/mail")
const {Users,Texts}=require("../../models/model")
const {jwtDetails }= require("../../config/config")
const jwt = require("jsonwebtoken");

const saltRounds=10;


const verifyOTP=async(req,res)=>{
    try{
        const mail=req.body.mail;
        const otp=req.body.otp;
        const data=await Users.findOne({
            where:{useremail:mail}
        })
        if(data){
            const hash = crypto.createHash('sha256').update(otp).digest('base64');
            if(hash===data.otp){
                const tokenData={role:"registered",userid:data.userid}
                let token = jwt.sign(tokenData, jwtDetails.secret, {
                    expiresIn: jwtDetails.jwtExpiration,
                });
                return res.status(200).json({message:"OTP verified!",accessToken:token});
            }
            else{
                return res.status(403).send({ message:"Invalid OTP!"})
            }
        }
        else{
            return res.status(403).send({message:"User not found!"});
        }
    }
    catch(err){
        logger.error(err);
        return res.status(500).send({ message: "Server Error" });
    }
}
const ForgotPassword = async(req,res)=>{
    try{
      
        //check mail id in db - verify valid user
        const mail="";//maild id - to send verification link
        await sendVerificationLink(req,res,mail);
       
    }
    catch(err){
        logger.error(err);
        return res.status(500).send({ message: "Server Error" });
    }
}


const SetPassword=async (req,res)=>{
    try{
        //get linkcode and userid - check whether it is valid!
       
        var uid="";var linkCode="";var obj="";
        uid=req.body.userId;
        linkCode=req.body.linkCode;

        obj=""; //fetch entry from Verification using uid and linkCode
        if(!obj){
            return res.status(400).send({message:"Invalid Link"});
        } 
         //check the expireTime of the link
       
        else{
           
            if(obj.expireTime-Date.now()<0){
                return res.status(400).send({message:"Invaid link or Expired...."});
            }
            else{
                const newPassword=req.body.password;
                const confirmpassword=req.body.confirmpassword
                if(newPassword!==confirmpassword) {return res.status(400).send({message:"Invalid Credentials"})}
                else{
                    //set ExpireTime to zero - to make it invalid - one time use
                    await obj.update({
                        expireTime:0,
                    })
                    bcrypt.genSalt(saltRounds,async (err, salt) => {
                        bcrypt.hash(newPassword, salt,async (err, hash) => {
                            if(err){
                                logger.error(err);
                                return res.status(500).send({ message: "Server Error." });
                            }
                            else{
                                //update hash password in db table
                                return res.status(200).send({ message: "Success" });
                            }
                        });
                        if(err){
                            logger.error(err.message);
                            return res.status(500).send({ message: "Server Error." });
                        }
                    });
                }
            }
            
        }
    }
    catch(err){
        logger.error(err);
        return res.status(500).send({message:"Server Error!"});
    }
}

const sendVerificationLink=async(req,res,mail)=>{
    try{
        var id="";var oobj="";
        linkCode = crypto.randomBytes(lcode).toString("hex");//to generate random unique link
        const obj="";//find user in Verification table
        if(obj){
            //update linkCode and ExpireTime of link
            id="";//id of the entry
           
        }
        else{
            //create new entry if needed or send 401
            id="";//id of the entry
        }
        if(id){

            const link = process.env.DOMAIN_NAME+"/auth/password-set/"+id+"/"+ linkCode;
            const html =  `<h3>Reset Link: </h3> 
                            <p><a> ${link} </a></p>` ; 

            const subject = `Password Set-link ; Expires on ${oobj.expireTime}`; 

            const isSend =await sendMail(html, subject, oobj.mail);        
            if (isSend) {
                return res.status(200).send({ message: "Mail sent successfully" })
            }
            else {
                logger.error("Mail not sent - Error");
                return res.status(500).send({ message: "Server Error." })
            }
        }
        else{
            logger.error("Id not found - Error");
            return res.status(500).send({ message: "Server Error." })
        }
    }
    catch(err){
        logger.error(err);
        return res.status(500).send({ message: "Server Error." })   
    }
}
module.exports = {
    ForgotPassword,
    SetPassword ,
    sendVerificationLink,
    verifyOTP
}