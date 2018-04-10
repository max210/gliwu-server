import goodModel from '../models/good'

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
      const result = await goodModel.find(params).sort({productPrice: sort}).skip(skip).limit(pageSize).exec()
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
      const result = await goodModel.find({ productType }).sort({productPrice: sort}).skip(skip).limit(pageSize).exec()
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
      const result = await goodModel.find(params).skip(skip).limit(pageSize).exec()
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
    const result = await goodModel.find({ productType }).skip(skip).limit(pageSize).exec()
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
