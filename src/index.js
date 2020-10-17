// * Import Router
const router = require('express').Router()
const { json } = require('body-parser')
const fs = require('fs')



// * Register Router
router.get('/', (req, res) => res.json({success: true}))
router.get('/html',(req, res)=>{
    fs.readFile(`${__dirname}/../resource/html/postcode.html`, (err, data)=>{
        if(err) {
            console.log(err)
            return res.status(404).end()}
        res.writeHeader(200, {"Content-Type": "text/html"});  
        res.write(data);  
        res.end();
    })
})
router.use('/api', require('./API'))
router.use('/coupon', require('./Coupon'))
module.exports = router
