// * Import Modules
const router = require('express').Router()
const AccountDB = require('../Database').Account
const db = new AccountDB()
const jwt = require('../token')

const AccountMiddleware = jwt.middleware('account', true)
const MobileMiddleware = jwt.middleware('mobile', true)
const {MessageService} = require('../Services/NaverCloudPlatform')

const Signup = async(req, res)=>{
    const mobileToken = req.decoded
    const {account, name, mobile, nickname} = req.body
    const _parsedURL = req.path.split('/')
    account.platform = _parsedURL[2] ? _parseURL[2] : 'original'

    switch(true){
        case !mobileToken:
        case !mobileToken.mobile:
            return res.status(401).end()

        case !account:
        case !name:
        case !mobile:
        case !nickname:
            return res.status(403).end()

        case mobileToken.mobile !== mobile:
            return res.status(401).end()
        case account.platform === 'original':
            if(!account.password)
                return res.status(400).end()
            // TODO: Hash
            else
                account.password = account.password
    }
    if(!account)
        return res.status(400).end()
    else if(!name || !mobile || !nickname)
        return res.status(400).end()
    
    // * Duplicated Check
    if(await db.duplicatedCheck('account', account) !== 0)
        return res.status(403).json({success:false, message:'account duplicated'})
    else if(await db.duplicatedCheck('mobile', mobile) !== 0)
        return res.status(403).json({success:false, message:'mobile duplicated'})
    else if(await db.duplicatedCheck('nickname', nickname) !== 0)
        return res.status(403).json({success:false, message:'nickname duplicated'})
    const result = await db.createAccount({account, name, mobile, nickname})
    console.log(result)
    const token = await jwt.code({id:account.id, platform:account.platform}, 'account')
    console.log(token)
    result && token ? res.json({success:true, token}) : res.json({success:false})
}

const CheckAuth = (req,res) => res.json({success:true})
const duplicatedCheck = async(req, res)=>{
    const _parsedURL = req.path.split('/')
    const key = _parsedURL[2]

    // Trouble Shooting : parameter Check
    switch(true){
        // * Value isn't
        case _parsedURL.length !== 4:
            return res.status(400).end()

        // * Available keys *
        case key === 'account':
        case key === 'nickname':
        case key === 'mobile':
        case key === 'code':
            break;

        // * Non-Available keys *
        default:
            return res.status(400).end()

    }
    const value = key === 'account'?{id:_parsedURL[3], platform:req.query.platform} : decodeURI(decodeURIComponent(_parsedURL[3]))
    const data = await db.duplicatedCheck(key, value)

    // Non-Duplicated
    if(data === 0 ) return res.status(200).json({success:true})
    // Duplicated
    else if(data > 0) return res.status(200).json({success:false})
    // someting wrong
    res.status(400).end()
}

const Signin = async(req, res)=>{
    const _parsedURL = req.path.split('/')
    const platform = _parsedURL[2] ? _parseURL[2] : 'original'
    const {id, password} = req.body
    if(!platform || !id || (platform==='original' && !password))
        return res.status(400).end()

    // 1. Get from Database
    const account = await db.getAccount({id, platform})
    // Not Registered
    if(!account)
        return res.status(401).end()

    // 2. Authentication
    switch(platform){
        case 'original':
            // Password Check
            const Hash = password // Hash
            if(Hash !== account.password)
                return res.status(401).end()
            break;
        case 'naver':

        case 'facebook':

        case 'google':

        default:
            return res.status(400).end()
    }
    const token = await jwt.code({id, platform}, 'account')
    res.json({success:true, token})
}

const SendMessageForAuth = async (req, res)=>{
    const {mobile, countryCode} = req.body
    console.log(mobile, countryCode)
    if(!mobile.length || mobile.length < 10 || mobile.length > 11)
        return res.status(400)
    const result = await MessageService.sendMessage(mobile, countryCode)
    res.send({success:result})
}
const CheckMessageForAuth = async(req, res)=>{
    const {mobile, countryCode, key} = req.query
    if(!mobile || !key || parseInt(key) < 100000 || parseInt(key) > 999999) 
        res.status(400).end()

    //const result = await MessageService.checkKey((countryCode?countryCode:'82'), mobile, key)
    const result = true
    if(!result)
        return res.status(403).json({success:false})
    const token = await jwt.code({mobile, countryCode: countryCode?countryCode:'82'}, 'mobile')
    res.json({success:result, token})
}

// * Mobile Auth *
router.get('/mobile-auth', CheckMessageForAuth)
router.post('/mobile-auth', SendMessageForAuth)
router.get('/duplicate-check/*', duplicatedCheck)
router.get('/', async (req, res) => res.json({success:true}))
router.post('/auth/*', Signin)

// Need Account Middleware
router.use('/auth', AccountMiddleware)
router.get('/auth', CheckAuth)

// Need Account Middleware
router.use('/', MobileMiddleware)
router.post('/', Signup)


module.exports = router