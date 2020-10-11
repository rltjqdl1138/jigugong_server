const router = require('express').Router()
const {PaymentService} = require('../Services/Import')

router.get('/', (req,res)=>{
    res.json({success:true})
})
module.exports = router