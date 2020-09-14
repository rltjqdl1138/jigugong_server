const crypto = require('crypto')
const axios = require('axios')

/*
 * @Object  Key
 * @brief   Load Setting for <Naver Cloud Platform> and <Simple & Easy Notification Service>
 *     @property    {String}    accessKey - public access key in <Naver Cloud Platform>
 *     @property    {String}    secretKey - secret key in <Naver Cloud Platform>
 *     @property    {String}    serviceID - Project's service ID in <Simple & Easy Notification>
 *     @property    {String}    callingNumber - Sender's call number
**/
const Key = require('../../resource/security/KeyNaverCloudPlatform.json')

/*
 * @class   MessageService
 * @brief   For Authentication using Message, Access to <Simple & Easy Notification Service> on <Naver Cloud Platform>
 * @author  Earthy Inc, Kim ki seop
 * 
 * @Method  sendMessage
 *      @description    Send Authenticatio Message and Insert key into key table
 *      @params {String}    mobile - Mobile number
 *      @params {String}    countryCode - Country Code for mobile (default: '82')
 *      @return {Boolean}   Is success to send message
 *      @todo - Change Message's Context
 * 
 * @Method  checkKey
 *      @description    Verify / check 
 *      @params {String}    countryCode - Country Code for mobile
 *      @params {String}    mobile - Mobile number
 *      @params {Integer}   value - Key for verification
 *      @return {Boolean}   is parameter 'value' same with KeyTable's value
**/
class MessageService {
    constructor(){
        // Key Check
        if(!Key || !Key.accessKey || !Key.secretKey || !Key.serviceID || !Key.callingNumber){
            console.log('\x1b[91m[Naver Cloud Platform] Key Property is dismiss \n * Check /resource/security/KeyNaverCloudPltform.json')
            if(!Key.accessKey)  console.log('\t* accessKey')
            if(!Key.secretKey)  console.log('\t* secretKey')
            if(!Key.serviceID)  console.log('\t* serviceID')
            if(!Key.callingNumber) console.log('\t* callingNumber')
            console.log(`\x1b[0m`)
            return;
        }
        // Naver Cloud Platform Configuration
        this.accessKey = Key.accessKey
        this.secretKey = Key.secretKey
        this.serviceID = Key.serviceID
        this.callingNumber = Key.callingNumber

        // Naver Cloud Platform URL
        this.baseURL = 'https://sens.apigw.ntruss.com'
        this.url = `/sms/v2/services/${this.serviceID}/messages`

        const LogDate = new Date()
        const number = this.callingNumber.length === 8 ?
            `${this.callingNumber.slice(0,4)}-${this.callingNumber.slice(4,8)}` :
            `${this.callingNumber.slice(0,3)}-${this.callingNumber.slice(4, this.callingNumber.length-4)}-${this.callingNumber.slice(this.callingNumber.length-4,this.callingNumber.length)}`
        
        // Print Logs
        console.log(`\x1b[96m${LogDate.getFullYear()}.${LogDate.getMonth()+1}.${LogDate.getDate()} ${LogDate.getHours()}:${LogDate.getMinutes()}:${LogDate.getSeconds()}\x1b[0m [Naver Cloud Platform] Ready to Send Message`)
        console.log(`\t* Access Key: ${this.accessKey}`)
        console.log(`\t* Service ID: ${this.serviceID}`)
        console.log(`\t* Calling Num: \x1b[95m${number}\x1b[0m`)
        console.log('')
    }
    //Authentication Table
    _keyTable = {}
    _makeSignature = async (method, _timestamp, url)=>{
        const timestamp = typeof _timestamp === 'string' ? _timestamp : String(_timestamp)
        return crypto.createHmac('sha256', this.secretKey)
            .update(method).update(" ")
            .update(url).update("\n")
            .update(timestamp).update("\n")
            .update(this.accessKey)
            .digest('base64')
    }
    _appendKey = (countryCode, mobile, value)=>{
        const key = countryCode+'#'+mobile
        this._keyTable[key] = value
        setTimeout(() => this._deleteKey(countryCode, mobile, value), 180000)
    }
    _deleteKey = (countryCode, mobile, value) =>{
        const key = countryCode+'#'+mobile
        const LogDate = new Date()
        if(this.checkKey(countryCode, mobile, value)){
            this._keyTable[key] = null
            console.log(`\x1b[96m${LogDate.getFullYear()}.${LogDate.getMonth()+1}.${LogDate.getDate()} ${LogDate.getHours()}:${LogDate.getMinutes()}:${LogDate.getSeconds()}\x1b[0m [Naver Cloud Platform] Delete Key: ${countryCode}:${mobile}`)
        }
    }

    // * Methods *
    checkKey = (countryCode, mobile, value) => value && (value === this._keyTable[`${countryCode}#${mobile}`])

    sendMessage = async (mobile, countryCode='82')=>{
        // * Random key Generate: 100,000 ~ 999,999
        const key = String( Math.floor( Math.random()*899999 + 100000 ) )

        // * Coordinated Universal Time (UTC+0)
        const timestamp = await Date.now()

        // * Context
        const context = `[지구공 본인확인] 인증번호는 ${key} 입니다. 정확히 입력해주세요`

        // Header / Body For Naver cloud platform
        const signature = await this._makeSignature('POST', timestamp, this.url )
        const header = {
            'Content-Type':'application/json',
            'x-ncp-apigw-timestamp':timestamp,
            'x-ncp-iam-access-key':this.accessKey,
            'x-ncp-apigw-signature-v2':signature
        }
        const body = {
            "type":"SMS",
            "contentType":'COMM',
            "countryCode":countryCode,
            "from": this.callingNumber,
            "content":context,
            "messages":[{ to:mobile }]
        }
        
        try{
            await axios.post(this.baseURL+this.url, body, {headers:header})
            this._appendKey(countryCode, mobile, key)

            const LogDate = new Date()
            console.log(`\x1b[96m${LogDate.getFullYear()}.${LogDate.getMonth()+1}.${LogDate.getDate()} ${LogDate.getHours()}:${LogDate.getMinutes()}:${LogDate.getSeconds()}\x1b[0m [Naver Cloud Platform] Message Send: \x1b[97m${countryCode}:${mobile}\x1b[0m\t${key}`)
            return true
        }catch(e){
            console.log(e.response && e.response.data ? e.response.data : e)
            console.log(body)
            return false
        }
    }
    

}

exports.MessageService = new MessageService()