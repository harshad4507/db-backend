const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.auth = async (req, res, next) =>{
    try{
        const token = req.cookies.token ||
        req.body.token ||
        req.header("Authorization").replace("Bearer ", "");

        if(!token){
            return res.status(401).json({
                success: false,
                message: "Token missing"
            });
        }

        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET); 

            console.log(decoded);
            req.user = decoded;
            next();
        }catch(error){
            return res.status(401).json({
                success: false,
                message: "token is invalid"
            });
        }
    }catch(error){
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }
};