const {transporter}=require("../config/config");

const logger=require("../utils/log")(module);

const sendMail = async (html,subject,to) => {
    
    var mailOptions={
        to ,
        subject,  
        html 
    };

    transporter.sendMail(mailOptions, async (err, info) => {
        if (err) {logger.error(err);return false;}
    })
    return true;

}

const sendOTP=async(req,res,OTP,receiver_mailid)=>{
    try{
        const expireTime='12.323';
        const html =  `<h3>OTP : </h3> 
        <p><a> ${OTP} </a></p>` ; 
        const subject = `OTP for text share app ; Expires on ${expireTime}`; 
        const isSend =await sendMail(html, subject,"neonlite90@gmail.com");
        console.log(isSend);
        if (isSend) {
            return res.status(200).send({ message: "OTP sent for the registered mail!",mail:receiver_mailid })
        }
        else {
            logger.error("Mail not sent - Error");
            return res.status(500).send({ message: "Server Error." })
        }
    }
    catch(err){

        return res.status(500).send({ message: "Mail sending Error" })   ;
    }
}


module.exports = {
    sendMail,
    sendOTP
}