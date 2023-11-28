const sequelize = require("../config/dbconnection");
var DataTypes = require('sequelize/lib/data-types');
const Sequelize=require("sequelize")
const Users=sequelize.define("users",{
    userid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    useremail:{
        type:DataTypes.TEXT,
        allowNull:false,
        unique:true,
        validate:{isEmail:true,notNull:true,notEmpty: true}
    },
    password:{
        allowNull:false,
        type:DataTypes.TEXT,
        validate:{notNull:true,notEmpty: true }
    },
    resettoken:{
        type:DataTypes.TEXT
    },
    otp:{
        type:DataTypes.TEXT   
    },
    tokenexpire:{
        type:DataTypes.TEXT
    }
})
const Texts=sequelize.define("texts",{
    textid:{
        allowNull:false,
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    text:{
        allowNull:false,
        type:DataTypes.TEXT,
        validate:{notNull:true,notEmpty: true }
    },
    sharedkey:{
        allowNull:false,
        type:DataTypes.TEXT,
        validate:{notNull:true,notEmpty: true }
    },
    linkcode:{
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
    }
    
})

Users.hasMany(Texts);
Texts.belongsTo(Users);
module.exports={Users,Texts}