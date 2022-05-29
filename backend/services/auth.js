const jwt= require('jsonwebtoken')
require("dotenv").config()
function generateToken(userInfo){
    if(!userInfo){
        return ;
    }
    return jwt.sign(userInfo,process.env.JWT_SECRET,{
        expiresIn:'3h'
    })

}
module.exports.generateToken=generateToken