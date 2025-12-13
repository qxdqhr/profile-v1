/**
 * ShowMasterpiece 模块 - 作品图片API代理
 * 
 * 代理文件，调用模块内的实际实现
 * 
 * @fileoverview 作品图片API代理
 */

// 直接从模块内导出API实现
export { GET } from '@/modules/showmasterpiece/api/collections/[id]/artworks/[artworkId]/image/route';