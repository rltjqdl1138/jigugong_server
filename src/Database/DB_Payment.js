const db = require('./_DB')

/*
 * @class   dbModel
 * @brief   class for Access Account database
 * @author  jigugong Inc, Kim ki seop
 * 
 * @method  createAccount
 *     @brief   Create Account on Database, ( Not include duplication check )
 *     @params  {Object}    payload
 *         @property    {Object}    account
 *             @property    {String}    id - ID
 *             @property    {String}    password - (Only required original account)
 *             @property    {String}    platform - 'original' or 'facebook' or 'google' or 'naver'
 *         @property    {String}    name
 *         @property    {String}    mobile
 *         @property    {String}    nickname
 *     @return  {Object}    account - Success
 *     @return  {Object}    null    - Fail
 *     
 * @method  getAccount
 *     @brief   Get Account information by ID and platform
 *     @params  {Object}    account
 *         @property    {String}    id
 *         @property    {String}    platform
 *     @return  {Object}    account - Success
 *     @return  {Object}    null    - Fail
 * 
 * @method  duplicatedCheck
 *     @params  {String}    key - Property of Account
 *     @params  {Object}    value - Value for duplication Check ( key is "account" )
 *         @property    {String}    id
 *         @property    {String}    platform
 *     @params  {String}    value - Value for duplication Check ( key isn't "account" )
 *     @return  {Integer}    The number of data in database
**/


class PaymentDB extends db{
    constructor(host, port, usage){ super(host, port, usage) }

    createCreditCard = async (payload)=>{
        try{
            const {dbSession} = this
            const {id, number, expiry, AccountID, name, bank} = payload
            const nowTime = String(Date.now())
            const result = await dbSession.command(
                'INSERT INTO CreditCard SET id=:id, number=:number, expiry=:expiry, AccountID=:AccountID, name=:name, bank=:bank, createdTime=:createdTime, updatedTime=:updatedTime',
                {params: {id, number, expiry, AccountID, name, bank, createdTime:nowTime, updatedTime:nowTime}}).one()
            return result
        }
        catch(e){
            console.log(e)
            return false
        }
    }
    getCreditCard = async (AccountID)=>{
        try{
            const {dbSession} = this
            const result = await dbSession.query('SELECT * FROM CreditCard where AccountID=:AccountID',{params:{AccountID}}).all()
            return result
        }catch(e){
            console.log(e)
            return false
        }
    }
}



module.exports = PaymentDB