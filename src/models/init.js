import mongoose from 'mongoose'

import config from '../config'

mongoose.Promise = global.Promise

export default () => {
  let maxConnections = 0

  return new Promise(resolve => {
    mongoose.connect(config.db)

    mongoose.connection.on('disconnected', () => {
      maxConnections ++
      console.log(maxConnections)

      if (maxConnections < 5) {
        mongoose.connect(config.db)
      } else {
        throw new Error('数据库失去链接了，快去检查吧！')
      }
    })

    mongoose.connection.on('error', err => {
      maxConnections ++

      if (maxConnections < 5) {
        mongoose.connect(config.db)
      } else {
        throw new Error('数据库链接出错了，快去检查吧！')
      }
    })

    mongoose.connection.once('open', () => {
      resolve()
      console.log('mongodb connected!')
    })
  })
}
