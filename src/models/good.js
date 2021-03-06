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
  if (!this.created) this.created = Date.now()
  next()
})

mongoose.model('Good', goodSechema)
