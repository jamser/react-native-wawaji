export default  function fetchHeader(token){
    let heraders = {'Content-Type': 'application/json','Authorization':'Bearer ' + token,'api-version':global.versioncode}
    return heraders
}