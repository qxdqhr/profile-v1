/**
 * 薄兼容层（Phase H2）：实现已迁至 sa2kit/business/webTools/qrCode。
 * 正式入口：/tools/qr-code
 */
export {
  QRCodeImage,
  QRCodeImageWithDownload,
  QRCodeDemoPage,
} from 'sa2kit/business/webTools/qrCode';
export type * from 'sa2kit/business/webTools/qrCode/domain';
export {
  downloadQRCodeAsPng,
  downloadQRCodeAsSvg,
  isValidUrl,
} from 'sa2kit/business/webTools/qrCode/domain';
