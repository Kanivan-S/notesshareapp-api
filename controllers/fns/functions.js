const {Users,Texts}=require("../../models/model")
var logger=require("../../utils/log")(module);
const sequelize=require("../../config/dbconnection");
const shareText=async(req,res)=>{
    try{
        const text=req.body.text;
        const sharedkey=req.body.sharedkey;
        const userUserid=res.locals.userid;
        const data=await Texts.create({
            text:text,
            sharedkey:sharedkey,
            userUserid:userUserid
        })
        return res.status(200).send({message:"added successfully",linkcode:data.linkcode,link:"url"+data.linkcode})
    }
    catch(err){
        logger.error(err);
        return res.status(500).send({  message: "Server Error" });
    }
}
const getTextHistory=async(req,res)=>{
    try{
        const userUserid=res.locals.userid;
        if(userUserid==-1){ return res.status(400).send({message:"no history for anonymous!"});}
        else{
            const data=await Texts.findAll({
                where:{
                    userUserid:userUserid
                },
                attributes:['linkcode','updatedAt'],
                order:[['updatedAt','DESC']]
            },
           )
            return res.status(200).send({message:"fetched successfully",data:data});
        }
        
    }
    catch(err){
        logger.error(err);
        return res.status(500).send({  message: "Server Error" });
    }
}
const  getText=async (req,res)=>{
    try{
        const linkcode=req.query["linkcode"];
        if(linkcode!=null){
            const data=await Texts.findOne({
                where:{linkcode:linkcode},
                order:[['updatedAt','DESC']]
            },
            )
            return res.status(200).send({message:"fetched successfully",data:data})
        }
        else{
            return res.status(404).send({message:"invalid page!"})
        }
    }
    catch(err){
        logger.error(err);
        return res.status(500).send({  message: "Server Error" });
    }

}
module.exports={shareText,getTextHistory,getText}