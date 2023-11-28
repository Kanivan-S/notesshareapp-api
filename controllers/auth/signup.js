
var logger=require("../../utils/log")(module);

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const {jwtDetails }= require("../../config/config")
const saltRounds = 10 
const {Users,Texts}=require("../../models/model")
const FormData = require('form-data');
const axios = require('axios');
var crypto = require('crypto');
const mailfns=require("../../utils/mail");
const otpGenerator = require('otp-generator');

const CreateAccount = async (req, res) => {
    
    try{
        const mail = req.body.mail
        const password = req.body.password
        const recaptchatoken=req.body.recaptchatoken;
        const formData = new FormData();
        formData.append('secret', process.env.RECAPTCHA_KEY)
        formData.append('response', recaptchatoken);
        const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });
        if (response.data!=null && response.data.success) {
            if(password!=req.body.copypassword) {return res.status(400).send({ message: "passwords doesn't match" });}
            else{
                const data=await Users.findOne({
                    where:{useremail:mail}
                })
                if(data) return res.status(403).send({message:"Account already exists"})
                else{
                    // bcrypt.genSalt(saltRounds,async (err, salt) => {
                    //     if(err){
                    //         logger.error(err);
                    //         return res.status(500).send({ message: "server error" });
                    //     }
                    //     bcrypt.hash(
                    //         password, 
                    //         salt ,
                    //         async (err, hash) => {
                    //             if(err){
                    //                 logger.error(err);
                    //                 return res.status(500).send({  message: "server error" });
                    //             }
                    //             else {
                    //                 const data=await Users.create({
                    //                     useremail:mail,
                    //                     password:hash,
                    //                 })
                    //                 const tokenData={role:"registered",userid:data.userid}
                    //                 let token = jwt.sign(tokenData, jwtDetails.secret, {
                    //                     expiresIn: jwtDetails.jwtExpiration,
                    //                 });
                    //                 return res.status(200).send({message:"Account created",accessToken:token})
                    //             }
                    //     });
                        
                        
                    // });
                    const hash = crypto.createHash('sha256').update(password).digest('base64');
                    const OTP = otpGenerator.generate(6, {digits:true,upperCaseAlphabets: false,lowerCaseAlphabets:false, specialChars: false });
                    const hashedotp = crypto.createHash('sha256').update(OTP).digest('base64');
                    const data=await Users.create({
                        useremail:mail,
                        password:hash,
                        otp:hashedotp,
                        tokenexpire:(Date.now()+(2*60*1000)).toString()
                    })
                    await mailfns.sendOTP(req,res,OTP,data.useremail);
                }
            }
        }  
        else{
            return res.status(403).json({ message: 'reCAPTCHA verification failed' });
        } 
    }
    catch (err) {
        logger.error(err);
        return res.status(500).send({message:"Server error"})
    }
}
module.exports = CreateAccount 
