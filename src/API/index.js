// * Import Router
const router = require('express').Router()

// * Register Router
router.get('/', (req, res) => res.json({success: true}))
router.use('/account', require('./API_Accountt'))
router.use('/payment', require('./API_Payment'))
module.exports = router