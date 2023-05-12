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
import { formatQrCodeResponse, getShopUrlFromSession, parseQrCodeBody } from '../helpers/qr-codes.js';

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

  app.post('/api/qrcodes', async (req, res) => {
    const dataForm = await parseQrCodeBody(req)
    const shopDomain = await getShopUrlFromSession(req, res)
    const data = {...dataForm, shopDomain} 
    const item = await qrCodesHandlers.create(data)
    return res.json(item)
  })

  app.get('/api/qrcodes', async (req, res) => {
    const result = await qrCodesHandlers.findList()
    const items = await formatQrCodeResponse(req, res, result)
    return res.json(items)
  })

  app.get('/api/qrcodes/:id', async (req, res) => {
    const result = await qrCodesHandlers.findById(req.params.id)
    const item = await formatQrCodeResponse(req, res, [result])
    return res.json(item?.[0]);
  })

  app.patch('/api/qrcodes/:id', async(req, res) => {
    const id = req.params.id
    if (!id) {
      throw new Error('Missing ID')
    }
    const data = await parseQrCodeBody(req)
    const response = await qrCodesHandlers.update(id, data)
    res.json(response)
  })

  app.delete('/api/qrcodes/:id', async(req, res) => {
    const id = req.params.id
    if(!id) {
      throw new Error('Missing ID')
    }
    const response = await qrCodesHandlers.delete(id)
    res.json(response)
  })
}