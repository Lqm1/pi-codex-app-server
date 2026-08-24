import QRCode from "qrcode";

export const renderPairingQrCode = async (
  pairingPayload: string
): Promise<string> => await QRCode.toString(pairingPayload, { margin: 2 });
