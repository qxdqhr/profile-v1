/**
 * 通用文件服务性能监控API
 * 提供缓存状态、数据库性能、系统健康等监控数据
 */

import { NextRequest, NextResponse } from 'next/server';
import { cacheManager } from '@/services/universalFile/cache/CacheManager';
import { performanceMonitor } from '@/services/universalFile/monitoring/PerformanceMonitor';
import { queryOptimizer } from '@/services/universalFile/db/middleware/queryOptimizer';
import { ApiResponse } from '@/services/universalFile/types/api';

/**
 * GET /api/universal-file/monitoring
 * 获取系统监控数据
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';

    let data: any;

    switch (type) {
      case 'overview':
        // 综合概览
        data = {
          cache: cacheManager.getStats(),
          performance: performanceMonitor.getStats(),
          database: queryOptimizer.getQueryStats(),
          system: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            nodeVersion: process.version,
            platform: process.platform
          }
        };
        break;

      case 'cache':
        // 缓存详细信息
        data = {
          stats: cacheManager.getStats(),
          // 注意：在生产环境中可能需要限制缓存项的返回数量
          items: [] // 暂时不返回具体缓存项以保护隐私
        };
        break;

      case 'performance':
        // 性能详细信息
        data = {
          stats: performanceMonitor.getStats(),
          report: performanceMonitor.generateReport(),
          slowRequests: performanceMonitor.getSlowRequests(10),
          errorRequests: performanceMonitor.getErrorRequests().slice(0, 10)
        };
        break;

      case 'database':
        // 数据库性能信息
        data = {
          stats: queryOptimizer.getQueryStats(),
          report: queryOptimizer.generateReport(),
          slowQueries: queryOptimizer.getSlowQueries(10),
          frequentQueries: queryOptimizer.getFrequentQueries(10)
        };
        break;

      case 'health':
        // 健康检查
        const cacheStats = cacheManager.getStats();
        const perfStats = performanceMonitor.getStats();
        const dbStats = queryOptimizer.getQueryStats();
        
        const healthScore = calculateOverallHealthScore(cacheStats, perfStats, dbStats);
        
        data = {
          score: healthScore,
          status: healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'warning' : 'critical',
          checks: {
            cache: {
              hitRate: cacheStats.hitRate,
              status: cacheStats.hitRate >= 70 ? 'good' : 'poor'
            },
            performance: {
              averageResponseTime: perfStats.apiResponseTimes.average,
              status: perfStats.apiResponseTimes.average <= 500 ? 'good' : 'poor'
            },
            database: {
              averageQueryTime: dbStats.averageDuration,
              status: dbStats.averageDuration <= 100 ? 'good' : 'poor'
            }
          }
        };
        break;

      default:
        return NextResponse.json(
          { 
            success: false, 
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid monitoring type',
              details: { validTypes: ['overview', 'cache', 'performance', 'database', 'health'] }
            }
          } as ApiResponse,
          { status: 400 }
        );
    }

    const response: ApiResponse = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString()
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('监控数据获取失败:', error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : '监控数据获取失败'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/universal-file/monitoring
 * 执行监控操作（清理缓存、重置统计等）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, params } = body;

    let result: any;

    switch (action) {
      case 'clearCache':
        // 清空缓存
        await cacheManager.clear();
        result = { message: '缓存已清空' };
        break;

      case 'resetPerformanceStats':
        // 重置性能统计
        performanceMonitor.reset();
        result = { message: '性能统计已重置' };
        break;

      case 'resetDatabaseStats':
        // 重置数据库统计
        queryOptimizer.reset();
        result = { message: '数据库统计已重置' };
        break;

      case 'cleanupOldData':
        // 清理过期数据
        queryOptimizer.cleanup();
        result = { message: '过期数据已清理' };
        break;

      case 'warmupCache':
        // 预热缓存（需要传入预热数据）
        if (params?.items) {
          await cacheManager.warmup(params.items);
          result = { message: `缓存预热完成，预热了 ${params.items.length} 项` };
        } else {
          throw new Error('预热缓存需要提供items参数');
        }
        break;

      case 'generateReport':
        // 生成综合报告
        result = {
          performance: performanceMonitor.generateReport(),
          database: queryOptimizer.generateReport(),
          cache: cacheManager.getStats(),
          generatedAt: new Date().toISOString()
        };
        break;

      default:
        return NextResponse.json(
          { 
            success: false, 
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid action',
              details: { validActions: ['clearCache', 'resetPerformanceStats', 'resetDatabaseStats', 'cleanupOldData', 'warmupCache', 'generateReport'] }
            }
          } as ApiResponse,
          { status: 400 }
        );
    }

    const response: ApiResponse = {
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString()
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('监控操作执行失败:', error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : '监控操作执行失败'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * 计算总体健康评分
 */
function calculateOverallHealthScore(
  cacheStats: any,
  perfStats: any,
  dbStats: any
): number {
  let score = 100;

  // 缓存命中率权重：25%
  const cacheScore = Math.min(100, cacheStats.hitRate || 0);
  const cacheWeight = 0.25;

  // API响应时间权重：35%
  const avgResponseTime = perfStats.apiResponseTimes.average || 0;
  let perfScore = 100;
  if (avgResponseTime > 500) {
    perfScore = Math.max(0, 100 - (avgResponseTime - 500) / 10);
  }
  const perfWeight = 0.35;

  // 数据库性能权重：25%
  const avgQueryTime = dbStats.averageDuration || 0;
  let dbScore = 100;
  if (avgQueryTime > 100) {
    dbScore = Math.max(0, 100 - (avgQueryTime - 100) / 5);
  }
  const dbWeight = 0.25;

  // 错误率权重：15%
  const totalRequests = perfStats.apiResponseTimes.totalRequests || 1;
  const errorRequests = perfStats.fileOperations.uploads.failed + 
                       perfStats.fileOperations.downloads.failed || 0;
  const errorRate = errorRequests / totalRequests;
  const errorScore = Math.max(0, 100 - errorRate * 100);
  const errorWeight = 0.15;

  // 计算加权总分
  score = cacheScore * cacheWeight + 
          perfScore * perfWeight + 
          dbScore * dbWeight + 
          errorScore * errorWeight;

  return Math.round(score);
} 