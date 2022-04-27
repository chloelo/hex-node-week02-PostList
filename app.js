const http = require('http')
const dotenv = require('dotenv')
const mongoose = require('mongoose');

const headers = require('./headers')
const { successHandle, errorHandle } = require('./responseHandles')
const Post = require('./model/posts')

dotenv.config({path:'./config.env'})
const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB)
  .then(() => console.log('資料庫連接成功'))
  .catch(err => console.log('error', err))

const requestListener = async (req, res) => {
  let body = ''
  req.on('data', (chunk) => {
    body += chunk
  })
  if (req.url === '/posts' && req.method === 'GET') {
    const posts = await Post.find()
    successHandle(res, posts)
  } else if (req.url === '/posts' && req.method === 'POST') {
    req.on('end', async () => {
      try {
        const data = JSON.parse(body)
        if (data.name && data.content) {
          const newPost = await Post.create({
            name: data.name,
            image: data.image,
            content: data.content,
            likes:  data.likes
          })
          successHandle(res, newPost)
        } else {
          errorHandle(res)
        }

      } catch (err) {
        errorHandle(res, err)
      }

    })
  } else if (req.url === '/posts' && req.method === 'DELETE') {
    const posts = await Post.deleteMany({})
    successHandle(res, posts)
  } else if (req.url.startsWith('/posts/') && req.method === 'DELETE') {
    try {
      const id = req.url.split('/').pop()
      await Post.findByIdAndDelete(id)
      successHandle(res, null)
    } catch (err) {
      errorHandle(res, err)
    }
  } else if (req.url.startsWith('/posts/') && req.method === 'PATCH') {
    req.on('end', async () => {
      try {
        const id = req.url.split('/').pop()
        const data = JSON.parse(body)
        await Post.findByIdAndUpdate(id, data)
        const updatePost = await Post.findById(id)
        successHandle(res, updatePost)
        
      } catch (err) {
        errorHandle(res, err)
      }
    })
  }
  else if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(JSON.stringify({
      "status": "false",
      "message": "無此網站路由"
    }))
    res.end();
  }
}
const server = http.createServer(requestListener)
server.listen(process.env.PORT)