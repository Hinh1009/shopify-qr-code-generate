import QRCode from "qrcode";
import { qrCodesHandlers } from "../qr-codes-db.js";
import { getQrCodeOr404 } from '../helpers/qr-codes.js'

export default function applyQrCodePublicEndpoints(app) {
  /*
    The URL for a QR code image.
    The image is generated dynamically so that users can change the configuration for a QR code.
    This way changes to the QR code won't break the redirection.
  */

  app.get("/qrcodes/:id/image", async (req, res) => {
    const qrcode = await getQrCodeOr404(req, res, false);
    // const id = req.params.id
    // const qrcode = await qrCodesHandlers.findById(id)
    if (qrcode) {
      const destinationUrl = qrCodesHandlers.generateQrcodeDestinationUrl(qrcode);
      res
        .status(200)
        .set("Content-Type", "image/png")
        .set(
          "Content-Disposition",
          `inline; filename="qr_code_${qrcode._id}.png"`
        )
        .send(await QRCode.toBuffer(destinationUrl));
    }
  });

  /* The URL customers are taken to when they scan the QR code */
  app.get("/qrcodes/:id/scan", async (req, res) => {
    const qrcode = await getQrCodeOr404(req, res, false);

    if (qrcode) {
      res.redirect(await qrCodesHandlers.handleCodeScan(qrcode));
    }
  });
}