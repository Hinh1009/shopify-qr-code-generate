import mongoose from "mongoose";
import shopify from "./shopify.js";
import { formatQrCodeResponse, getShopUrlFromSession, parseQrCodeBody } from "./helpers/qr-codes.js";
import QRCode from "qrcode";

// const DEFAULT_DB_FILE = `mongodb://localhost:27017/qr-codes`
const DEFAULT_PURCHASE_QUANTITY = 1

/* init qr codes collection */
const qrCodesSchema = new mongoose.Schema({
  shopDomain: String,
  title: {
    type: String,
    required: true
  },
  productId: String,
  variantId: String,
  handle: String,
  discountId: String,
  discountCode: String,
  destination: String,
  scans: Number
})

export const qrCodesTable = mongoose.model('qr_codes', qrCodesSchema)

/* CRUD apis */
export const qrCodesHandlers = {
  // insert data
  async create(req, res, next) {
    try {
      const data = await parseQrCodeBody(req)
      const shopDomain = await getShopUrlFromSession(req, res)
      const item = await qrCodesTable.create({...data, shopDomain})
      res.json(item)
    }
    catch (err) {
      next(err)
    }
  },

  // find all qrcodes
  async findList(req, res, next) {
    try {
      const response = await qrCodesTable.find()
      const items = await formatQrCodeResponse(req,res, response)
      res.json(items)
    } catch (error) {
      next(error)
    }
  },

  // find by Id
  async findById(req, res, next) {
    try {
      const id = req.params.id
      const response = await qrCodesTable.findById(id)
      const item = await formatQrCodeResponse(req, res, [response])
      res.json(item?.[0])
    } catch (error) {
      next(error)
    }
  },

  // update data
  async update(req, res, next) {
    try {
      let data = req.body
      let id = req.params.id
      if (!id) {
        throw new Error('Missing ID')
      }
      let item = await qrCodesTable.findByIdAndUpdate(
        id,
        data,
        {
          new: true,
          runValidators: true,
          useFindAndModify: false,
        }
      )
      res.json(item)

    } catch (error) {
      next(error)
    }
  },

  //delete
  async delete(req, res, next) {
    try {
      let id = req.params.id

      let item = await qrCodesTable.findByIdAndDelete(id)

      res.json(item)
    } catch (error) {
      next(error)
    }
  },

  // generateQrcodeDestinationUrl
  generateQrcodeDestinationUrl: function (qrcode) {
    return `${shopify.api.config.hostScheme}://${shopify.api.config.hostName}/qrcodes/${qrcode._id}/scan`
  },

  /* QR code scan */
  async __increaseScanCount(qrcode) {
    const id = qrcode._id
    const item = await qrCodesTable.findByIdAndUpdate(id, {scans : {$inc: 1}})
    res.json(item)
  } ,
  /* The behavior when a QR code is scanned */
  async handleCodeScan(qrcode) {
    await this.__increaseScanCount(qrcode)
    const url = new URL(qrcode.shopDomain)
    switch (qrcode.destination) {
      /* The QR code redirects to the product view */
      case 'product':
        return this.__goToProductCheckout(url, qrcode)

      /* The QR code redirects to the checkout view */
      case "checkout":
        return this.__goToProductView(url, qrcode)

      default:
        throw `Unrecognized destination "${qrcode.destination}"`
    }
  },

  __addImageUrl: function (qrcode) {
    try {
      qrcode.imageUrl = this.__generateQrcodeImageUrl(qrcode);
    } catch (err) {
      console.error(err);
    }

    return qrcode;
  },

  __generateQrcodeImageUrl: function (qrcode) {
    return `${shopify.api.config.hostScheme}://${shopify.api.config.hostName}/qrcodes/${qrcode._id}/image`;
  },

  __goToProductView: function (url, qrcode) {
    return productViewURL({
      discountCode: qrcode.discountCode,
      host: url.toString(),
      productHandle: qrcode.handle,
    });
  },

  __goToProductCheckout: function (url, qrcode) {
    return productCheckoutURL({
      discountCode: qrcode.discountCode,
      host: url.toString(),
      variantId: qrcode.variantId,
      quantity: DEFAULT_PURCHASE_QUANTITY,
    });
  },

  // async addQRCodePreview(req, res, next) {
  //   try {
  //     const id =req.params.id
  //     const qrcode = await qrCodesTable.findById(id)
  //     if(qrcode) {
  //       const destinationUrl = this.generateQrcodeDestinationUrl(qrcode)
  //     res
  //       .status(200)
  //       .set("Content-Type", "image/png")
  //       .set(
  //         "Content-Disposition",
  //         `inline; filename="qr_code_${qrcode._id}.png"`
  //       )
  //       .send(await QRCode.toBuffer(destinationUrl));
  //     }
  //   } catch (error) {
  //     next(error)
  //   }
  // },

  // async getURLAfterScan(req, res, next) {
  //   try {
  //     const id = req.params.id
  //     const qrcode = await qrCodesTable.findById(id)
  //     if(qrcode) {
  //       res.redirect(await qrCodesHandlers.handleCodeScan(qrcode));
  //     }
  //   } catch (error) {
  //     next(error)
  //   }
  // }
}

/* Generate the URL to a product page */
function productViewURL({ host, productHandle, discountCode }) {
  const url = new URL(host);
  const productPath = `/products/${productHandle}`;

  /* If this QR Code has a discount code, then add it to the URL */
  if (discountCode) {
    url.pathname = `/discount/${discountCode}`;
    url.searchParams.append("redirect", productPath);
  } else {
    url.pathname = productPath;
  }

  return url.toString();
}

/* Generate the URL to checkout with the product in the cart */
function productCheckoutURL({ host, variantId, quantity = DEFAULT_PURCHASE_QUANTITY, discountCode }) {
  const url = new URL(host);
  const id = variantId.replace(
    /gid:\/\/shopify\/ProductVariant\/([0-9]+)/,
    "$1"
  );

  /* The cart URL resolves to a checkout URL */
  url.pathname = `/cart/${id}:${quantity}`;

  if (discountCode) {
    url.searchParams.append("discount", discountCode);
  }

  return url.toString();
}