import mongoose from "mongoose";
import shopify from "./shopify.js";

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
  create: async function (data) {
    try {
      const item = await qrCodesTable.create(data)
      return item
    }
    catch (err) {
      next(err)
    }
  },

  // find all qrcodes
  findList: async function () {
    let items = await qrCodesTable.find()
    items.map((item) => {
      item = item._doc
      return __addImageUrl(item)
    }
    )
    return items
  },

  // find by Id
  findById: async function (id) {
    let response = await qrCodesTable.findById(id)
    response = response._doc
    return __addImageUrl(response)
  },

  // update data
  update: async function (id, data) {
    const item = await qrCodesTable.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    )
    return item
  },

  //delete
  delete: async function (id) {
    const item = await qrCodesTable.findByIdAndDelete(id)
    return item
  },

  /* QR code scan */
  __increaseScanCount: async function (qrcode) {
    const id = qrcode._id
    const item = await qrCodesTable.findByIdAndUpdate(id, { scans: { $inc: 1 } })
    res.json(item)
  },
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

function __addImageUrl(qrcode) {
  qrcode.imageUrl = __generateQrcodeImageUrl(qrcode);
  return qrcode;
}

function __generateQrcodeImageUrl(qrcode) {
  return `${shopify.api.config.hostScheme}://${shopify.api.config.hostName}/qrcodes/${qrcode._id}/image`;
}

export const generateQrcodeDestinationUrl = (qrcode) => {
  return `${shopify.api.config.hostScheme}://${shopify.api.config.hostName}/qrcodes/${qrcode._id}/scan`
}