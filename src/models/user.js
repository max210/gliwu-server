import mongoose from 'mongoose'

const userSechema = new mongoose.Schema({
  created: String,
  name: String,
  email: String,
  pass: String
})

userSechema.pre('save', function(next) {
  if (!this.created) this.created = new Date
  next()
})

const User = mongoose.model('User', userSechema)

export default User
