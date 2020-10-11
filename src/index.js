// * Import Router
const router = require('express').Router()
const { json } = require('body-parser')
const fs = require('fs')




// * Register Router
router.get('/', (req, res) => res.json({success: true}))
router.use('/api', require('./API'))
router.use('/coupon', require('./Coupon'))
module.exports = router
