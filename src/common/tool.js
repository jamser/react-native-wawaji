/*时间戳转换*/
import {api} from './api.config'
function monthTransfer(str){
    if (str == '') {
        return false
    }
    let time = new Date(str)
    let Y,M,D,H,Minu;
    Y = time.getFullYear()
    M = time.getMonth()+1 < 10 ? '0'+(time.getMonth()+1):time.getMonth()+1
    D = time.getDate() < 10 ? '0' + time.getDate() : time.getDate()
    return Y+"-"+M+"-"+D
}
function monthTransferTwo(str){
    if (str == '') {
        return false
    }
    let time = new Date(str)
    let Y,M,D,H,Minu;
    Y = time.getFullYear()
    M = time.getMonth()+1 < 10 ? '0'+(time.getMonth()+1):time.getMonth()+1
    D = time.getDate() < 10 ? '0' + time.getDate() : time.getDate()
    return Y+"."+M+"."+D
}
function hourTransfer(str){
    if (str == '') {
        return false
    }
    let time = new Date(str)
    let H,M,S;
    H = time.getHours() <10?'0'+time.getHours():time.getHours();
    M = time.getMinutes() <10 ?'0'+time.getMinutes():time.getMinutes()
    S = time.getSeconds() <10 ?'0'+time.getSeconds():time.getSeconds()
    return H+":"+M+":"+S
}
function consoleDebug(meg){
    let debug = api.isDebuger
    if(debug) {
        console.log(meg + new Date())
    }
}
export {monthTransfer, hourTransfer, consoleDebug,monthTransferTwo}