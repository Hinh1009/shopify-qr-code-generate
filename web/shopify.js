import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { MongoDBSessionStorage } from '@shopify/shopify-app-session-storage-mongodb'
// import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
// import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
import mongoose from "mongoose";
// const DB_PATH = `${process.cwd()}/database.sqlite`;
const DB_PATH = `mongodb://localhost:27017/qr-codes`
const db = mongoose.connect(DB_PATH, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connect success to mongodb')
}).catch((err) => {
  console.log('Have some errors: ', err)
}) 

let { restResources } = await import(
  `@shopify/shopify-api/rest/admin/${LATEST_API_VERSION}`
);

const shopify = shopifyApp({
  api: {
    // apiVersion: LATEST_API_VERSION,
    restResources,
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  // This should be replaced with your preferred storage strategy
  sessionStorage: new MongoDBSessionStorage(DB_PATH),
  // sessionStorage: new SQLiteSessionStorage(DB_PATH)
});

export default shopify;
