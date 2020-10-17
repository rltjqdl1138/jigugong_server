const url = require('url')
const router = require('express').Router()


const PaymentDB = require('../Database').Payment
const db = new PaymentDB()
const {PaymentService} = require('../Services/Import')
const jwt = require('../token')
const AccountMiddleware = jwt.middleware('account', true)

const registerCreditCard = async(req, res)=>{
    let CreditCard, dbResponse
    const {card_number, expiry, birth, pwd_2digit, name} = req.body
    const AccountID = req.decoded.id
    const nowTime = String(Date.now())
    const id = `CREDIT_${card_number.slice(0,4)}_${nowTime}`

    try{ CreditCard = await PaymentService.createBillingKey({customer_uid:id, card_number, expiry, birth, pwd_2digit}) }
    catch(e){ console.log(e); return res.status(403).json({success:false, status:403}) }

    try{  dbResponse = await db.createCreditCard({id, number:card_number, expiry, AccountID, name: name ? name:CreditCard.card_name, bank:CreditCard.card_name}) }
    catch(e){ return res.status(500).json({success:false, status:500}) }
    dbResponse ?
        db.logWithTime(`[Payment] Register CreditCard <${id}> to ${AccountID}`) :
        db.logWithTime(`[Payment] Fail to register CreditCard ${id}`)

    return dbResponse ?
        res.status(200).json({success:true, status:200}) :
        res.status(500).json({success:false, status:500})
}

const getCreditCard = async(req, res)=>{
    const dbResponse = await db.getCreditCard('rltjqdl1138@naver.com')
    const data = dbResponse.map(({id, number, expiry, name, bank})=>{
        const hidden = number.slice(0,4) + '-XXXX-XXXX-' + number.slice(15,20)
        return {id, number:hidden, expiry, name, bank}
    })
    res.json({success:dbResponse?true:false, data})
}

router.use('/', AccountMiddleware)
router.get('/card', getCreditCard)
router.post('/card',registerCreditCard)
module.exports = router