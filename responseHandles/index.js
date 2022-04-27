const headers = require('../headers')
const errorHandle = (res, err) => {
  const errMsg = err ? err.message : '欄位未填寫正確，或無此 id'
  res.writeHead(400, headers);
  res.write(JSON.stringify({
    "status": "false",
    "message": errMsg
  }))
  res.end()
}
const successHandle = (res, data) => {
  res.writeHead(200, headers);
  res.write(JSON.stringify({
    "status": "success",
    "data": data
  }))
  res.end()
}
module.exports = {
  errorHandle,
  successHandle
}