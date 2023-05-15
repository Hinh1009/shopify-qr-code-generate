import { MongoDBSessionStorage } from "@shopify/shopify-app-session-storage-mongodb"

const DB_PATH = `mongodb://localhost:27017/qr-codes`

export const mongoDBSessionStorage = new MongoDBSessionStorage(DB_PATH)

export const AppInstall = {
  async deleteSession(shopDomain) {
    const shopSession = await mongoDBSessionStorage.findSessionsByShop(shopDomain)
    if (shopSession.length > 0) {
      await mongoDBSessionStorage.deleteSession(
        shopDomain.map((session) => session._id)
      )
    }
  }
}