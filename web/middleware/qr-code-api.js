/*
  The custom REST API to support the app frontend.
  Handlers combine application data from qr-codes-db.js with helpers to merge the Shopify GraphQL Admin API data.
  The Shop is the Shop that the current user belongs to. For example, the shop that is using the app.
  This information is retrieved from the Authorization header, which is decoded from the request.
  The authorization header is added by App Bridge in the frontend code.
*/

import express from 'express'
import shopify from '../shopify.js'
import { qrCodesHandlers } from '../qr-codes-db.js'

const SHOP_DATA_QUERY = `
  query shopData($first: Int!) {
    shop {
      url
    }
    codeDiscountNodes(first: $first) {
      edges {
        node {
          id
          codeDiscount {
            ... on DiscountCodeBasic {
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
            }
            ... on DiscountCodeBxgy {
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
            }
            ... on DiscountCodeFreeShipping {
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export default function applyQrCodeApiEndpoints(app) {
  app.use(express.json())

  app.get('/api/shop-data', async (req, res) => {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    /* Fetch shop data, including all available discounts to list in the QR code form */
    const shopData = await client.query({
      data: {
        query: SHOP_DATA_QUERY,
        variables: {
          first: 25,
        },
      },
    });

    res.send(shopData.body.data)
  })

  app.post('/api/qrcodes', qrCodesHandlers.create)
  app.get('/api/qrcodes', qrCodesHandlers.findList)
  app.get('/api/qrcodes/:id', qrCodesHandlers.findById)
  app.patch('/api/qrcodes/:id', qrCodesHandlers.update)
  app.delete('/api/qrcodes/:id', qrCodesHandlers.delete)
  // app.get("/qrcodes/:id/image", qrCodesHandlers.addQRCodePreview)
  // app.get('/qrcodes/:id/scan', qrCodesHandlers.getURLAfterScan)
}