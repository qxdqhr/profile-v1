/**
 * QRCode 二维码工具模块
 * 提供将字符串或 URL 转换为二维码图片的能力
 */

// 组件导出
export { QRCodeImage, QRCodeImageWithDownload } from './components'

// 类型导出
export type {
  QRCodeImageProps,
  QRCodeErrorCorrectionLevel,
  QRCodeDownloadOptions,
} from './types'

// 工具函数导出
export {
  downloadQRCodeAsPng,
  downloadQRCodeAsSvg,
  isValidUrl,
} from './utils'

// 页面导出
export { default as QRCodeDemoPage } from './pages/QRCodeDemoPage'
