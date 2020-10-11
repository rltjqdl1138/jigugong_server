const { Iamporter, IamporterError } = require('iamporter');


/*
 * @Object  Key
 * @brief   Load Setting for <Import>
 *     @property    {String}    apiKey - public access key in <Import>
 *     @property    {String}    secretKey - secret key in <Import>
**/
const Key = require('../../resource/security/KeyImport.json')
const API_KEY = Key.apiKey
const API_SECRET_KEY = Key.secretKey


/*
 * @class   ImportService
 * @brief   For Payment in <Import>
 * @author  Earthy Inc, Kim ki seop
 * 
 * @Method  createBillingKey
 *      @description    Create BillingKey for payment
 *      @params {Object}    payload
 *          @proerty {String}   customer_uid - custom ID of billingKey
 *          @proerty {String}   card_number - card number (ex) '1234-5678-1234-5678'
 *          @proerty {String}   expiry - exire date (ex) '2020-09-01'
 *          @proerty {String}   birth - 6digit of birth (ex) '950630'
 *          @proerty {String}   pwd_2digit - 2digit of password (ex) '00'
 *      @return {Promise}
 *          @resolve {Object}
 *          @reject {Error}
 * 
 * @Method  payWithBillingKey
 *      @description    Request Payment with billingKey
 *      @params {Object}    payload
 *          @proerty {String}   customer_uid - 
 *          @proerty {String}   merchant_uid - 
 *          @proerty {Integer}  amount - 
 *      @return {Promise}
 *          @resolve {Object}
 *          @reject {Error}
 * 
 * @Method  payWithoutBillingKey
 *      @description    Request Payment without billingKey
 *      @params {Object}    payload
 *          @proerty {String}   merchant_uid - 
 *          @proerty {Integer}  amount - 
 *          @proerty {String}   card_number - 
 *          @proerty {String}   expiry - 
 *          @proerty {String}   birth - 
 *          @proerty {String}   pwd_2digit - 
 *      @return {Promise}
 *          @resolve {Object}
 *          @reject {Error}
**/
class ImportService{
    constructor(){
        this._Initialize()
    }
    _Initialize(){
        try{
            const LogDate = new Date()
            if(!API_KEY || typeof API_KEY !=='string' || !API_SECRET_KEY || typeof API_SECRET_KEY !== 'string'){
                console.log('\x1b[91m[Import] Key Property is dismiss \n * Check /resource/security/KeyImport.json')
                if(!Key.apiKey)  console.log('\t* accessKey')
                if(!Key.secretKey)  console.log('\t* secretKey')
                console.log(`\x1b[0m`)
                return false
            }
            const iamporter = new Iamporter({
                apiKey: API_KEY,
                secret: API_SECRET_KEY })
            this.session = iamporter
            console.log(`\x1b[96m${LogDate.getFullYear()}.${LogDate.getMonth()+1}.${LogDate.getDate()} ${LogDate.getHours()}:${LogDate.getMinutes()}:${LogDate.getSeconds()}\x1b[0m [Import] Ready to Payment Service`)
            console.log(`\t* API Key: ${this.session.apiKey}`)
            console.log(`\t* Secret Key: ${this.session.secret.slice(0,10)}...`)
            console.log('')
        }catch(e){

        }   
    }
    createBillingKey = (payload) => new Promise((resolve, reject) => {
        const {customer_uid, card_number, expiry, birth, pwd_2digit} = payload
        switch(true){
            case !customer_uid:
            case typeof customer_uid !== 'string':
            
            case !card_number:
            case typeof card_number !== 'string':
            case card_number.length !== 19:
            
            case !expiry:
            case typeof expiry !== 'string':
            case expiry.length !== 7:
            
            case !birth:
            case typeof birth !== 'string':
            case birth.length !== 6:

            case !pwd_2digit:
            case typeof pwd_2digit !== 2:
                reject()
            default:
                break;
        }
        this.session.createSubscription({
            'customer_uid': customer_uid,
            'card_number':  card_number,
            'expiry':       expiry,
            'birth':        birth,
            'pwd_2digit':   pwd_2digit
        }).then( result => resolve(result)
        ).catch( err => err instanceof IamporterError ? reject(err) : reject(err) )
    })

    payWithBillingKey = (payload) => new Promise((resolve, reject) => {
        const {customer_uid, merchant_uid, amount} = payload
        switch(true){
            case !customer_uid:
            case typeof customer_uid !== 'string':

            case !merchant_uid:
            case typeof merchant_uid !== 'string':

            case !amount:
            case typeof amount !== 'number':
                reject()
            default:
                break
        }
        this.session.paySubscription({
            'customer_uid': customer_uid,
            'merchant_uid': merchant_uid,
            'amount':       amount
        }).then( result => resolve(result)
        ).catch( err => err instanceof IamporterError ? reject(err) : reject(err) )
    })

    payWithoutBillingKey = (payload) => new Promise((resolve, reject)=>{
        const {merchant_uid, card_number, expiry, birth, pwd_2digit, amount} = payload

        this.session.payOnetime({
            'merchant_uid': merchant_uid,
            'amount':       amount,
            'card_number':  card_number,
            'expiry':       expiry,
            'birth':        birth,
            'pwd_2digit':   pwd_2digit
        }).then( result => resolve(result)
        ).catch( err => err instanceof IamporterError ? reject(err) : reject(err) )
    })
}
const iamport = new ImportService()
exports.PaymentService = iamport