// * Import Router
const router = require('express').Router()
const fs = require('fs')

// * Register Router
router.get('/', (req, res) => res.json({success: true}))
router.use('/coupon', require('./Coupon'))
router.get('/test', (req, res)=>{
    fs.readFile(`${__dirname}/test.html`, (err, data)=>{
        if(err) return res.status(404).end()
        res.writeHeader(200, {"Content-Type": "text/html"});  
        res.write(data);  
        res.end();
    })
})
router.get('/test.css', (req, res)=>{
    fs.readFile(`${__dirname}/test.css`, (err, data)=>{
        if(err) return res.status(404).end()
        res.writeHeader(200, {"Content-Type": "text/css"});  
        res.write(data);  
        res.end();
    })
})

router.get('/image', (req, res)=>{
    fs.readFile(`${__dirname}/coupon/coupon.png`, (err, data)=>{
        if(err) return res.status(404).end()
        res.writeHeader(200, {"Content-Type": "image/png"});  
        res.write(data);  
        res.end();
    })
})
module.exports = router