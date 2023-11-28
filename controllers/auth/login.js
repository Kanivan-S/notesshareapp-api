const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const {jwtDetails }= require("../../config/config")
const {Users,Texts}=require("../../models/model")
var logger=require("../../utils/log")(module);
const axios = require('axios');
const dotenv = require('dotenv');
const FormData = require('form-data');
const crypto = require('crypto');
const otpGenerator = require('otp-generator');


const mailfns=require("../../utils/mail");

const Login = async (req, res) => {
    try{
        const mail=req.body.mail;
        const password=req.body.password;
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
            const data=await Users.findOne({
                where:{useremail:mail}
            })
            if(data){
                // bcrypt.compare(password, data.password, function(err, result) {
                //     if(err){
                //         return res.status(500).send({message:"Server Error"})
                //     }
                //     else{
                //         if (result === true) {
                //             const tokenData={role:"registered",userid:data.userid}
                //             let token = jwt.sign(tokenData, jwtDetails.secret, {
                //                 expiresIn: jwtDetails.jwtExpiration,
                //             });
                //             return res.status(200).json({message:"Login success",accessToken:token,});
                //         }
                //         else{
                //             return res.status(400).send({ message:"Wrong Password"})
                //         }
                //     }
                // });
                const hash = crypto.createHash('sha256').update(password).digest('base64');
                if (hash === data.password) {
                    const OTP = otpGenerator.generate(6, {digits:true,upperCaseAlphabets: false,lowerCaseAlphabets:false, specialChars: false });
                    const hashedotp = crypto.createHash('sha256').update(OTP).digest('base64');
                    await data.update({
                        otp:hashedotp,
                        tokenexpire:(Date.now()+(2*60*1000)).toString()
                    })
                    await mailfns.sendOTP(req,res,OTP,data.useremail);
                }
                else{
                    return res.status(400).send({ message:"Wrong Password"})
                }
            }
            else{
                return res.status(400).send({ message:"User not Found"})
            }
        } else {
            return res.status(403).json({ message: 'reCAPTCHA verification failed' });
        }
    }   
    catch(err){
        logger.error(err);
        return res.status(500).send({  message: "Server Error" });
    }
}

module.exports = Login 