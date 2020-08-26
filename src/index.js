// * Import Router
const router = require('express').Router()
const fs = require('fs')


// * Register Router
router.get('/', (req, res) => res.json({success: true}))
router.use('/coupon', require('./Coupon'))
module.exports = router