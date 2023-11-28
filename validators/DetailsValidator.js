const { body, header, param, query } = require("express-validator");
const { validate } = require(".");
var  logger=require("../utils/log")(module);

/**
  Refer : https://express-validator.github.io/docs 
 **/
const AddTextValidator=async (req, res, next) => {
	await body("text")
		.notEmpty()
		.withMessage("text not defined in body")
		.run(req);
	await body("sharedkey")
		.notEmpty()
		.withMessage("sharedkey not defined in body")
		.run(req);
	next();
}
module.exports={
    AddTextValidator
}
