// import shopify from "../shopify.js";

import { shopDomainHandlers } from "../qr-codes-db.js"

// import { AppInstall } from "../app-installed.js"

export const checkShopInit = async(req, res, next) => {
  try {
    const shop = req.query.shop
    const shops = []
    await shopDomainHandlers.findAll().then(async(res) => {
      res?.map((shop) => {
        shops.push(shop.shopDomain)
      })
      if (!shops.includes(shop)) {
        await shopDomainHandlers.create({shopDomain: shop})
      }
    })
    await next()
  } catch (error) {
    next(error)
  }
}