import QRCode from "qrcode";
import { generateQrcodeDestinationUrl, qrCodesHandlers } from "../qr-codes-db.js";
import { getQrCodeOr404 } from '../helpers/qr-codes.js'

export default function applyQrCodePublicEndpoints(app) {
  /*
    The URL for a QR code image.
    The image is generated dynamically so that users can change the configuration for a QR code.
    This way changes to the QR code won't break the redirection.
  */
  console.log('avbnvn')
  app.get("/qrcodes/:id/image", async (req, res) => {
    try {
      // const qrcode = await getQrCodeOr404(req, res, false);
      const id = req.params.id
      const qrcode = await qrCodesHandlers.findById(id)

      // const destinationUrl = `https://worth-bin-renaissance-mitsubishi.trycloudflare.com/qrcodes/645c45f9995c08349e9e5d83/scan`
      if (qrcode) {
        const destinationUrl = generateQrcodeDestinationUrl(qrcode);
        res
          .status(200)
          .set("Content-Type", "image/png")
          .set(
            "Content-Disposition",
            `inline; filename="qr_code_${qrcode._id}.png"`
          )
          .send(await QRCode.toBuffer(destinationUrl));
      }
    } catch (error) {
      console.log('ERRORRRR:', error)
    }
  });

  /* The URL customers are taken to when they scan the QR code */
  app.get("/qrcodes/:id/scan", async (req, res) => {
    const id = req.params.id
    const qrcode = await qrCodesHandlers.findById(id)

    if (qrcode) {
      res.redirect(await qrCodesHandlers.handleCodeScan(qrcode));
    }
  });
}