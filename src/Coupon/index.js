// NPM packages
const router = require('express').Router()
const qr = require('qr-image');
const fs = require('fs')

// Earthy modules
const jwt = require('../token')
const Coupon = require('../Database/coupon.js');

// Temp modules
const CLIENT_URL = 'http://3.34.178.42'
const SERVER_URL = 'http://3.34.178.42:4000'
const MANAGER_ID = '@earthy'

const MS_SECOND = 1000
const MS_MINUTE = MS_SECOND * 60
const MS_HOUR = MS_MINUTE * 60
const MS_DAY = MS_HOUR * 24
const MS_WEEK = MS_DAY * 6
const MS_MONTH = MS_DAY * 29

// POST /coupon/activate
const _ActivateCoupon = async (req, res)=>{
    const {number, userName} = req.body
    const activatedTime = String(Date.now())
    
    if(!req.decoded || !req.decoded.id || req.decoded.id !== MANAGER_ID)
        return res.status(403).end()
    else if(!number || !userName)
        return res.status(404).end()

    const coupon = (await Coupon.SelectCoupon('number', number))[0]
    if(!coupon || coupon.state !== 0)
        return res.status(405).end()

    await Coupon.UpdateCoupon(number, {state: 1, userName, activatedTime})
    res.status(200).end()
}
// POST /coupon/use
const _UseCoupon = async (req, res)=>{
    const usedTime = String(Date.now())
    const {number, password} = req.body

    // Trouble Shoot in coupon
    const coupon = (await Coupon.SelectCoupon('number', number))[0]
    if( !coupon || coupon.state !== 1)
        return res.status(405).end()

    // Trouble Shoot in shop
    const shop = await Coupon.SelectShop('id', coupon.shop)
    if(!shop)
        return res.status(403).end()
    else if(req.decoded && req.decoded.id === coupon.shop)
        await Coupon.UpdateCoupon(number, {state: 2, usedTime})
    else if(password && password === shop.password)
        await Coupon.UpdateCoupon(number, {state: 2, usedTime})
    else
        return res.status(405).end()
    res.status(200).end()
}
// GET /coupon/use
const _RedirectUseCoupon = async(req, res)=>{
    try{
        const _coupon = await Coupon.SelectCoupon('number', req.decoded.number)
        if(!_coupon.length) throw Error('')
        res.redirect(`${CLIENT_URL}/coupon?token=${req.token}`)
    }catch(e){
        res.redirect(`${CLIENT_URL}`)
    }
}
const _GetQRCode = (req, res)=>{
    const {number} = req.query
    if(!number) return res.redirect(`${CLIENT_URL}`)
    const qrcode = qr.image(`${CLIENT_URL}/use?number=${number}`, { type: 'svg', parse_url:true });
    res.type('svg');
    qrcode.pipe(res);
}

const _CreateCoupon = async (req, res)=>{
    const {number, name, cost, shop} = req.body
    console.log(number, name, cost, shop, req.decoded.id)
    if(!req.decoded || !req.decoded.id || req.decoded.id !== MANAGER_ID)
        return res.status(404).end()
    if(!number || !name || !cost || !shop)
        return res.status(405).end()

    const coupon = await Coupon.SelectCoupon('number', number)
    const Shop = await Coupon.SelectShop('id', shop)
    console.log(coupon)
    console.log(Shop)
    if(!Shop)
        return res.status(404).end()
    else if(coupon.length)
        return res.status(403).send('Already Registered number')
    console.log('register')
    await Coupon.InsertCoupon({number, name, cost, shop})
    res.status(200).end()
}
const _CheckCoupon= async (number)=>{
    const coupon = (await Coupon.SelectCoupon('number', number))[0]
    if( !coupon ) throw Error('empty')
    const {state, name, cost, shop} = coupon
    return {number, state, name, cost, shop}
}
const _ListCoupons = async(id, date)=>{
    const nowTime = new Date()
    const OFFSET = nowTime.getHours()*MS_HOUR + nowTime.getMinutes()*MS_MINUTE + nowTime.getSeconds()*MS_SECOND + nowTime.getMilliseconds()

    let pivot = parseInt(String(nowTime.getTime())) - OFFSET
    switch(date){
        case 'today':   break;
        case 'week':    pivot = pivot - MS_WEEK; break;
        case 'month':   pivot = pivot - MS_MONTH; break;
        default:        pivot = 0;
    }
    let coupons = []
    if(id === MANAGER_ID){
        coupons = await Coupon.SelectCoupon()
        await coupons.reduce( (prev, item, index) => prev.then( async()=>
            coupons[index].link = `${SERVER_URL}/coupon/use?token=${(await jwt.code({number:item.number}))}`),
        Promise.resolve())
    }
    else{
        coupons = await Coupon.SelectCoupon('shop', id)
        
        // Extract { number, name, cost, usedTime } in already used coupons ( state === 2 )
        coupons = coupons.reduce((prev, e) => e.state !== 2 || (pivot && parseInt(e.usedTime)-pivot < 0 )? prev :
            [...prev, {number: e.number, name: e.name, cost: e.cost, usedTime:e.usedTime}], [] )
    }
    return {data:coupons, pivot}
}
const _LoadSampleImage = (req, res)=>{
    fs.readFile(`${__dirname}/coupon_sample.png`, (err, data)=>{
        if(err) return res.status(404).end()
        res.writeHeader(200, {"Content-Type": "image/png"});  
        res.write(data);
        res.end();
    })   
}


//                  //
// * Temp routers * //
//                  //
const getShop = async(req,res)=>{
    console.log(req.decoded)
    if(!req.decoded || !req.decoded.id || req.decoded.id !== MANAGER_ID)
        return res.status(403).end()
    return res.json({data: await Coupon.SelectShop()})
}
const updateCoupon = async(req, res)=>{
    const {number, state, name, cost, shop} = req.body
    if(!number)
        return res.status(404).end()
    else if(!state && !number && !name && !cost && !shop)
        return res.status(404).end()

    const coupon = (await Coupon.SelectCoupon('number', number))[0]
    if(!coupon)
        return res.status(404).end()
    res.status(200).end()
}
const Login = async (req, res)=>{
    const {id, password} = req.body
    if(!id || !password)
        return res.status(403).end()
    const shop = await Coupon.SelectShop('id',id)
    return !shop || shop.password !== password ? res.status(403).end() :
        res.json({ success:true, data: { ...shop, token: await jwt.code({ id }) }})
}
router.put('/', updateCoupon)
router.post('/auth', Login)

router.use('/shop', jwt.middleware)
router.get('/shop', getShop)




router.get('/image', _LoadSampleImage)
router.get('/qrcode', _GetQRCode)
router.use('/*', jwt.middleware)
router.post('/activate', _ActivateCoupon)
router.post('/use', _UseCoupon)
router.get('/use', _RedirectUseCoupon)
router.post('/',_CreateCoupon)
router.get('/', async (req,res)=>{
    try{
        // Check Coupon
        if(req.query.number)
            return res.json( await _CheckCoupon(req.query.number) )
        else if(req.decoded.number)
            return res.json( await _CheckCoupon(req.decoded.number) )
        // List Coupons
        else if(req.decoded.id)
            return res.json( await _ListCoupons (req.decoded.id, req.query.date) )
        throw Error('trouble')
    }catch(e){
        // Trouble Shooting
        return res.status(403).end()
    }
})

module.exports = router