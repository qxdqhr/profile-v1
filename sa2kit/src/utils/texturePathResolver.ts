/**
 * MMD 纹理路径解析工具
 * 
 * 功能说明：
 * - 处理 PMX/PMD 文件中的纹理路径
 * - 支持 Windows 路径（反斜杠）转换
 * - 支持中文路径和 URL 编码
 * - 自动映射纹理到正确的子目录
 * - 处理特殊文件名和路径格式
 */

import { TEXTURE_SUBDIRECTORIES } from '../constants/defaults'

/**
 * 纹理路径解析器选项
 */
export interface TexturePathResolverOptions {
  /** 模型基础路径 */
  basePath: string
  /** 模型文件路径（用于相对路径计算）*/
  modelPath?: string
  /** 纹理子目录配置（可选，默认使用标准配置）*/
  subdirectories?: {
    texture?: string
    sphere?: string
    toon?: string
    extra?: string
  }
  /** 自定义路径修正函数（可选）*/
  customPathFixer?: (path: string) => string
  /** 是否启用调试日志（默认: false）*/
  debug?: boolean
}

/**
 * 纹理路径解析器类
 */
export class TexturePathResolver {
  private options: Required<Omit<TexturePathResolverOptions, 'customPathFixer' | 'modelPath'>> & {
    customPathFixer?: (path: string) => string
    modelPath?: string
  }

  constructor(options: TexturePathResolverOptions) {
    this.options = {
      basePath: options.basePath,
      modelPath: options.modelPath,
      subdirectories: {
        texture: options.subdirectories?.texture || TEXTURE_SUBDIRECTORIES.texture,
        sphere: options.subdirectories?.sphere || TEXTURE_SUBDIRECTORIES.sphere,
        toon: options.subdirectories?.toon || TEXTURE_SUBDIRECTORIES.toon,
        extra: options.subdirectories?.extra || TEXTURE_SUBDIRECTORIES.extra,
      },
      customPathFixer: options.customPathFixer,
      debug: options.debug || false,
    }
  }

  /**
   * 解析纹理路径
   * 
   * @param texturePath - 原始纹理路径（来自 PMX/PMD 文件）
   * @returns 修正后的纹理路径
   */
  resolve(texturePath: string): string {
    let fixedUrl = texturePath

    // 1. 应用自定义路径修正函数（如果提供）
    if (this.options.customPathFixer) {
      fixedUrl = this.options.customPathFixer(fixedUrl)
    }

    // 2. 统一路径分隔符（Windows -> Unix）
    fixedUrl = fixedUrl.replace(/\\/g, '/')

    // 3. 解码 URL 编码（处理中文路径）
    try {
      fixedUrl = decodeURIComponent(fixedUrl)
    } catch (e) {
      // URL 解码失败，保持原样
    }

    // 4. 检查路径是否已经包含子目录
    const hasSubdir = this.hasSubdirectory(fixedUrl)
    if (hasSubdir) {
      this.log('路径已包含子目录，跳过映射:', fixedUrl)
      return this.normalizePath(fixedUrl)
    }

    // 5. 根据文件名判断应该在哪个子目录
    const fileName = this.getFileName(fixedUrl)
    const subdir = this.detectSubdirectory(fileName)

    // 6. 插入子目录
    if (subdir) {
      fixedUrl = this.insertSubdirectory(fixedUrl, subdir)
      this.log('插入子目录:', { original: texturePath, fixed: fixedUrl, subdir })
    }

    return this.normalizePath(fixedUrl)
  }

  /**
   * 检查路径是否已包含子目录
   */
  private hasSubdirectory(path: string): boolean {
    const subdirs = Object.values(this.options.subdirectories)
    const pattern = new RegExp(`/(${subdirs.join('|')})/[^/]+$`, 'i')
    return pattern.test(path)
  }

  /**
   * 获取文件名（路径的最后一部分）
   */
  private getFileName(path: string): string {
    return path.split('/').pop() || ''
  }

  /**
   * 根据文件名检测应该使用的子目录
   */
  private detectSubdirectory(fileName: string): string | null {
    const lowerFileName = fileName.toLowerCase()

    // Sphere 球形贴图 (spa-*.bmp, spa-*.png, km.png 等)
    if (
      lowerFileName.startsWith('spa-') ||
      lowerFileName.startsWith('sph-') ||
      lowerFileName === 'km.png'
    ) {
      return this.options.subdirectories.sphere ?? null
    }

    // Toon 卡通渲染贴图 (toon-*.bmp, s*.bmp 等)
    if (lowerFileName.startsWith('toon-') || /^s\d+\.bmp$/.test(lowerFileName)) {
      return this.options.subdirectories.toon ?? null
    }

    // Extra 额外纹理（可自定义识别规则）
    // 示例：包含特定关键词的文件
    if (
      lowerFileName.includes('_02') ||
      lowerFileName.includes('extra') ||
      lowerFileName.includes('special')
    ) {
      return this.options.subdirectories.extra ?? null
    }

    // Texture 标准纹理（默认）
    if (
      lowerFileName.endsWith('.png') ||
      lowerFileName.endsWith('.jpg') ||
      lowerFileName.endsWith('.jpeg') ||
      lowerFileName.endsWith('.bmp') ||
      lowerFileName.endsWith('.tga') ||
      lowerFileName.endsWith('.psd')
    ) {
      return this.options.subdirectories.texture ?? null
    }

    return null
  }

  /**
   * 在路径中插入子目录
   */
  private insertSubdirectory(path: string, subdir: string): string {
    const basePath = this.options.basePath.replace(/\/$/, '') // 移除尾部斜杠
    const fileName = this.getFileName(path)

    // 如果路径已经包含 basePath，只需在文件名前插入子目录
    if (path.includes(basePath)) {
      return path.replace(new RegExp(`(${this.escapeRegExp(basePath)}/)([^/]+)$`), `$1${subdir}/$2`)
    }

    // 否则，构建完整路径
    return `${basePath}/${subdir}/${fileName}`
  }

  /**
   * 规范化路径（移除多余的斜杠等）
   */
  private normalizePath(path: string): string {
    // 保存开头的斜杠（绝对路径标记）
    const isAbsolute = path.startsWith('/')
    const normalized = path.replace(/\/+/g, '/') // 移除连续的斜杠
    // 如果原路径是绝对路径，保留开头的斜杠
    return isAbsolute ? normalized : normalized.replace(/^\//, '')
  }

  /**
   * 转义正则表达式特殊字符
   */
  private escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * 调试日志
   */
  private log(...args: any[]): void {
    if (this.options.debug) {
      console.log('[TexturePathResolver]', ...args)
    }
  }
}

/**
 * 便捷函数：解析纹理路径
 * 
 * @param texturePath - 原始纹理路径
 * @param options - 解析器选项
 * @returns 修正后的纹理路径
 * 
 * @example
 * ```typescript
 * const fixedPath = resolveTexturePath('tex\body.png', {
 *   basePath: '/models/miku',
 * })
 * console.log(fixedPath) // '/models/miku/tex/body.png'
 * ```
 */
export function resolveTexturePath(
  texturePath: string,
  options: TexturePathResolverOptions
): string {
  const resolver = new TexturePathResolver(options)
  return resolver.resolve(texturePath)
}

/**
 * 创建纹理路径解析器
 * 
 * @param options - 解析器选项
 * @returns 纹理路径解析器实例
 * 
 * @example
 * ```typescript
 * const resolver = createTexturePathResolver({
 *   basePath: '/models/miku',
 *   debug: true,
 * })
 * 
 * const path1 = resolver.resolve('tex\body.png')
 * const path2 = resolver.resolve('spa-6.bmp')
 * ```
 */
export function createTexturePathResolver(
  options: TexturePathResolverOptions
): TexturePathResolver {
  return new TexturePathResolver(options)
}

