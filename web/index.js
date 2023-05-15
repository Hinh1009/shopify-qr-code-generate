// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import shopify from "./shopify.js";
import GDPRWebhookHandlers from "./gdpr.js";
import applyQrCodeApiEndpoints from "./middleware/qr-code-api.js";
import applyQrCodePublicEndpoints from "./middleware/qr-code-public.js";
// import redirectToAuth from "./middleware/redirect-to-auth.js";
import { checkShopInit } from "./middleware/checkShopInit.js";


const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);
const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
// Set up Shopify authentication and webhook handling
// Redirect to auth
// If shop domain is not found, 500 Err - mss: 'No shop provided'
// If app is not embedded (embedded params = 0), use 3xx redirect => redirects the user to the grant screen.
// If app is embedded (embedded params = 1), use App Bridge redirect => redirects back to the same URL.

// app.get(shopify.config.auth.path, () => { console.log('123456') }, async (req, res) => {
//   return redirectToAuth(req, res, app)
// });
app.get(shopify.config.auth.path, (req, res, next) => {
  console.log('auth')
  next()
}, shopify.auth.begin())
app.get(
  shopify.config.auth.callbackPath,
  (req, res, next) => {
    console.log('call back auth')
    next()
  },
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

applyQrCodePublicEndpoints(app)

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

applyQrCodeApiEndpoints(app)

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", (req, res, next) => {
  console.log('Check app installed')
  next()
},
shopify.ensureInstalledOnShop(),
checkShopInit, async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT, (err) => {
  err
    ? console.log('Server has error: ', err)
    : console.log(`Server opened on port: ${PORT}`)
})