const db = require('./_DB')
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
                // TODO: crypto password
                const HashPassword = account.password

                // Set Data
                payload.id = account.id
                payload.password = HashPassword
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