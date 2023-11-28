var logger=require("../utils/log")(module);
const express=require('express')
const  detailsvalidator=require("../validators/DetailsValidator");
const { validate } = require("../validators/index");
const fns=require("../controllers/fns/functions")
const router=express.Router()
router.post(
    "/sharetext",
    detailsvalidator.AddTextValidator,
    validate,
    fns.shareText
);

router.get("/getTextHistory",fns.getTextHistory);
router.get("/getText",fns.getText);
router.use(function(req, res, next) {
    return res.status(404).send({message:"Not Found"});
});
module.exports=router;