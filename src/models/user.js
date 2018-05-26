import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSechema = new mongoose.Schema({
  created: String,
  githubId: String,
  name: String,
  email: String,
  pass: String,
  likes: Array
})

userSechema.pre('save', function(next) {
  if (!this.created) this.created = new Date()
  next()
})

// 密码加盐加密
userSechema.pre('save', function(next) {
  if (!this.isModified('pass')) return next()

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err)

    bcrypt.hash(this.pass, salt, (err, hash) => {
      if (err) return next(err)

      this.pass = hash
      next()
    })
  })
})

// 实例的方法
userSechema.methods = {
  comparePassword: (_pass, pass) => {
    return new Promise((resolve, reject) => {
      bcrypt.compare(_pass, pass, (err, isMatch) => {
        if (err) {
          reject(err)
        } else {
          resolve(isMatch)
        }
      })
    })
  }
}

mongoose.model('User', userSechema)
