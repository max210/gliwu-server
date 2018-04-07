import mongoose from 'mongoose'

const goodSechema = new mongoose.Schema({
  created: String,
  productType: Number,
  productName: String,
  productImg: String,
  productPrice: Number,
  productLink: String,
  productDesc: String
})

goodSechema.pre('save', function(next) {
  if (!this.created) this.created = new Date
  next()
})

const Good = mongoose.model('Good', goodSechema)

export default Good
