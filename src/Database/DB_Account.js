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


class AccountDB extends db{
    constructor(host, port, usage){ super(host, port, usage) }
    
    createAccount = async({account, name, mobile, nickname})=>{
        const {dbSession} = this
        const time = String(Date.now())
        const payload = {id:'', password:'', platform:'', name, mobile, nickname}

        payload.createdTime = time
        payload.updatedTime = time
        payload.code = '000000'
        payload.platform = account.platform
        
        switch(account.platform){
            case 'original':
                // Check input
                if(!account.id || typeof account.id !== 'string')
                    return null
                else if(!account.password || typeof account.password !== 'string')
                    return null

                // Set Data
                payload.id = account.id
                payload.password = account.password
                break
            case 'naver':
                return null
            
            case 'facebook':
                return null

            case 'google':
                return null

            default:
                return null
        }

        try{
            const dbResult = await dbSession.command('CREATE VERTEX Account SET id=:id, password=:password, platform=:platform, name=:name, mobile=:mobile, nickname=:nickname, code=:code, createdTime=:createdTime, updatedTime=:updatedTime',{params:payload}).one()
            this.logWithTime(`[Database] Sign Up Success - id:${dbResult.id} nickname:${dbResult.nickname}`)
            return dbResult
        }catch(e){
            this.logWithTime(`[Database] Sign Up Fail`)
            console.log(payload)
            return;
        }
    }
    getAccount = async({id, platform})=>{
        const {dbSession} = this
        const dbResult = await dbSession.query('SELECT * FROM Account WHERE id=:id and platform=:platform',{params:{id, platform}}).one()
        return dbResult
    }

    duplicatedCheck = async(key, value)=>{
        const {dbSession} = this
        let query = 'SELECT * FROM Account '
        switch(key){
            case 'account':
                if(!value.id || !value.id.length || !value.platform || !value.platform.length)
                    return;
                query = query + `where id='${value.id}' and platform='${value.platform}'`
                break;

            case 'mobile':
            case 'nickname':
            case 'code':
                query = query + `where ${key}='${value}'`
                break
            default:
                return;    
        }
        const result = await dbSession.query(query).all()
        return result.length
        
        
    }
}


module.exports = AccountDB