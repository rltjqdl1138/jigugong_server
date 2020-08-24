const fs = require('fs')

//
// * Read & Write from RAW *
// 
const _ReadCoupon = () => new Promise((resolve,reject) =>
    fs.readFile(`${__dirname}/coupon`, (err, data) => {
        if(err) return reject(err)
        const {list} = JSON.parse(data)
        if(!list || list.length === undefined)
            return reject('empty')
        return resolve( list )
    })
)
const _WriteCoupon = (data) => new Promise((resolve, reject) => {
    fs.writeFile(`${__dirname}/coupon`, JSON.stringify({list:data}),
        err => err ? reject(err) : resolve()
    )
})
const _ReadShop = () => new Promise((resolve,reject) =>
    fs.readFile(`${__dirname}/shop`, 
        (err, data) => err ? reject(err) : resolve(JSON.parse(data))
    )
)
const _WriteShop = (data) => new Promise((resolve, reject) => {
    fs.writeFile(`${__dirname}/shop`, JSON.stringify(data),
        err => err ? reject(err) : resolve()
    )
})

const SelectCoupon = async(key, value)=>{
    const coupon = await _ReadCoupon()
    return key && value ? coupon.reduce((result, e, index) => e[key] === value ? [...result, {...e, index}] : result, []) : coupon   
}
const SelectShop = async(key, value)=>{
    const shop = await _ReadShop()
    switch(key){
        case 'id':
            return shop[value] ? {...shop[value], id: value} : {}
        case 'name':
            return Object.keys(shop).find(e=>e.name === value)
        default:
            return Object.keys(shop).map(e => ({...shop[e], id:e}))
    }
}

const InsertCoupon = async ({number, name, cost, shop})=>{
    const coupon = await _ReadCoupon()
    if( !number || !name || !cost || !shop)
        return false;
    const createTime = String(Date.now())
    await _WriteCoupon( [...coupon, {state:0, number, name, cost, shop, createTime}])
    return true
}
const InsertShop = async ({ id, name })=>{
    const shop = await _ReadCoupon()
    if( !id || !name )
        return false;
    else if(shop[id])
        return false
    await _WriteCoupon( [...coupon, {state:0, number, name, cost, shop}])
    return true
}
const UpdateCoupon = async (number, payload)=>{
    if( !number )
        return false

    const coupon = await _ReadCoupon()
    const _target = (await SelectCoupon('number', number))[0]

    if(!_target)
        return false

    coupon[_target.index] = {...coupon[_target.index], ...payload}

    await _WriteCoupon(coupon)
    return true
}
const UpdateShop = async (id, payload)=>{
    const shop = await _ReadShop()
    if(!id || !shop[id])
        return false
    shop[id] = {...shop[id], ...payload}
    await _WriteShop(shop)
    return true

}
exports.SelectCoupon = SelectCoupon;
exports.SelectShop = SelectShop;
exports.InsertCoupon = InsertCoupon
exports.InsertShop = InsertShop;
exports.UpdateCoupon = UpdateCoupon
exports.UpdateShop = UpdateShop