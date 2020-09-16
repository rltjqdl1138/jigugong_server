const OrientDBClient = require("orientjs").OrientDBClient;
const Key = require('../../resource/security/KeyOrientDB.json')

// DB Configuration
const option = {
    name: Key.db_name,
    username: Key.db_user,
    password: Key.db_password
}

/*
 * @class   dbModel
 * @brief   Parents class for OrientDB
 * @author  jigugong Inc, Kim ki seop
 * 
 * @method  logWithTime
 *     @brief   Write console log with time
 *     @params  {String}    text - Log message
 *     @return  No Return
 * 
 * @method  secondToString
 *     @params  {Number}    time
 *     @return  {String}    Converted time
 * 
 *     @description - convert <second> to <hour>:<minite>:<second>
 *          @example    secondToString(3670) -> '01:01:10'
 * 
**/

class dbModel{
    constructor(host="localhost", port=2424, usage='Basic'){
        this._initializeDB(host, port, usage)
    }
    _initializeDB = async(host, port, usage)=>{
        try{
            this.db = await OrientDBClient.connect({host, port})
            this.dbSession = await this.db.session(option);
            this.logWithTime(`[Database] Initialize Database for \x1b[97m${usage}\x1b[0m`)
        }
        catch(e){
            this.logWithTime('[Database] \x1b[31mInitialization Error\x1b[0m')
            this.dbSession ? this.dbSession.close() : this.logWithTime(`[Database] \x1b[31mDB Client is not created\n\t* name:${option.name}\n\t* user:${option.username}\n\t* password:${option.password})`)
            console.log('')
            this.db ? this.db.close() : this.logWithTime(`[Database] \x1b[31mDB Session is not created\n\t* Session: ${host}:${port}\x1b[0m`)
            console.log('')
        }
    }
    _formating=(number) => `${number < 10 ? '0':''}${number}`

    logWithTime = (text)=>{
        const LogDate = new Date()
        console.log(`\x1b[96m${LogDate.getFullYear()}.${this._formating(LogDate.getMonth()+1)}.${this._formating(LogDate.getDate())} ${this._formating(LogDate.getHours())}:${this._formating(LogDate.getMinutes())}:${this._formating(LogDate.getSeconds())}\x1b[0m ${text}`)
    }
    secondToString = (_time)=>{
        const rawtime = Math.floor(_time)
        const min = Math.floor(rawtime/60)
        const second = rawtime % 60
        return `${this._formating(min)}:${this._formating(second)}`
    }
}

module.exports = dbModel