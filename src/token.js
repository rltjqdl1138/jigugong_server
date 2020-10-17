const jwt = require('jsonwebtoken')

const JWT_KEY = 'earthy2020'
const HEADER_KEY  = 'x-access-token'
const HEADER_ACCOUNT_KEY  = 'x-access-token'
const HEADER_SIGNUP_KEY  = 'auth-mobile-token'
const JWT_ACCOUNT_KEY = 'earthy2020'
const JWT_SIGNUP_KEY = 'earthy_mobile_2020'
const JWT_OPTION = {
    issuer:'jigugong.com'
}

const getKey = (type)=>{
    switch(type){
        case 'account':
            return JWT_ACCOUNT_KEY
        case 'mobile':
            return JWT_SIGNUP_KEY
        default:
            return JWT_KEY
    }
}
const getTokenType = (type)=>{
    switch(type){
        case 'account':
            return HEADER_ACCOUNT_KEY;
        case 'mobile':
            return HEADER_SIGNUP_KEY;
        default:
            return HEADER_KEY
    }
}
// create token Async
const signToken = (payload, type) =>
    new Promise( (resolve, reject) =>
        jwt.sign(payload, getKey(type), JWT_OPTION,
            (err, token) => err ? reject(err) : resolve(token)
))

// decode token Async
const verifyToken = (token, type) =>
    new Promise( (resolve, reject)=>
        jwt.verify( token, getKey(type),
            (err, decoded)=> err ? reject(err) : resolve(decoded)

))

const getMiddleware = (type, isAbort)=>{
    return async(req, res, next) =>{
        try{
            const token = req.headers[getTokenType(type)] || req.query.token
            const decoded = token ? await verifyToken(token, type) : null
            req.token = token
            req.decoded = decoded
            isAbort && !token ? res.status(400).end() : next()
        }catch(e){
            res.status(401).json({success:false, message:'Unsigned token'})
        }
    }
}



exports.code = signToken
exports.decode = verifyToken
exports.middleware = getMiddleware