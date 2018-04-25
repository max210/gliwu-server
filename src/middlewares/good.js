import mongoose from 'mongoose'

const Good = mongoose.model('Good')

export const getGoods = async (ctx, next) => {
  const page = parseInt(ctx.query.page),
        pageSize = parseInt(ctx.query.pageSize),
        productType = parseInt(ctx.query.productType),
        sort = parseInt(ctx.query.sort),
        minPrice = parseInt(ctx.query.minPrice),
        maxPrice = parseInt(ctx.query.maxPrice),
        skip = (page - 1) * pageSize,
        params = { productType: productType, productPrice: {$gte: minPrice, $lte: maxPrice} }

  // 有排序和价格区间时
  if (sort && maxPrice) {
    try {
      const result = await Good.find(params).sort({productPrice: sort}).skip(skip).limit(pageSize).exec()
      ctx.body = {
        status: 0,
        msg: 'success',
        length: result.length,
        data: result
      }
      return
    } catch (e) {
      ctx.body = { status: 1, msg: '获取失败' }
      return
    }
  }

  // 只有排序时
  if (!maxPrice && sort) {
    try {
      const result = await Good.find({ productType }).sort({productPrice: sort}).skip(skip).limit(pageSize).exec()
      ctx.body = {
        status: 0,
        msg: 'success',
        length: result.length,
        data: result
      }
      return
    } catch (e) {
      ctx.body = { status: 1, msg: '获取失败' }
      return
    }
  }

  // 只有价格区间时
  if (maxPrice && !sort) {
    try {
      const result = await Good.find(params).skip(skip).limit(pageSize).exec()
      ctx.body = {
        status: 0,
        msg: 'success',
        length: result.length,
        data: result
      }
      return
    } catch (e) {
      ctx.body = { status: 1, msg: '获取失败' }
      return
    }
  }

  // 没有价格区间和排序时
  try {
    const result = await Good.find({ productType }).skip(skip).limit(pageSize).exec()
    ctx.body = {
      status: 0,
      msg: 'success',
      length: result.length,
      data: result
    }
  } catch (e) {
    ctx.body = { status: 1, msg: '获取失败' }
  }

}

// -----管理员商品管理 ------

// 获得所有商品
export const getAllGoods = async (ctx, next) => {
  const page = parseInt(ctx.query.page)
  const pageSize = parseInt(ctx.query.pageSize)
  const skip = (page - 1) * pageSize

  try {
    const goods = await userModel.find().skip(skip).limit(pageSize).exec()
    ctx.body = { status: 0, msg: '获取成功', data: goods }
  } catch (e) {
    ctx.body = { status: 1, msg: '获取失败' }
  }
}

// 增加商品
export const newGood = async (ctx, next) => {
  const productType = (ctx.request.body.productType).trim(),
        productName = (ctx.request.body.productName).trim(),
        productImg = (ctx.request.body.productImg).trim(),
        productPrice = (ctx.request.body.productPrice).trim(),
        productDesc = (ctx.request.body.productDesc).trim()

  const good = new Good({
    productType,
    productName,
    productImg,
    productPrice,
    productDesc
  })

  try {
    await good.save()
    ctx.body = { status: 0, msg: '创建商品成功' }
  } catch (e) {
    ctx.body = { status: 1, msg: '创建商品失败' }
  }
}

// 删除商品
export const delateGood = async (ctx, next) => {
  const _id = ctx.query.productId

  try {
    await Good.remove({ _id })
    ctx.body = { status: 0, msg: '删除成功' }
  } catch (e) {
    ctx.body = { status: 1, msg: '删除失败' }
  }
}

// 修改商品
export const updateGood = async (ctx, next) => {
  const _id = ctx.query.productId,
        productType = ctx.query.productType,
        productName = ctx.query.productName,
        productImg = ctx.query.productImg,
        productPrice = ctx.query.productPrice,
        productDesc = ctx.query.productDesc

  try {
    await userModel.updateOne({ _id }, { productType, productName, productImg, productPrice, productDesc }).exec()
    ctx.body = { status: 0, msg: '更新商品成功' }
  } catch (e) {
    ctx.body = { status: 1, msg: '更新商品失败' }
  }
}
