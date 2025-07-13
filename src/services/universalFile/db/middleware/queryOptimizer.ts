/**
 * 数据库查询优化中间件
 * 监控查询性能，提供查询优化建议
 */

import { performanceMonitor } from '../../monitoring/PerformanceMonitor';

/**
 * 查询性能信息
 */
interface QueryPerformance {
  /** 查询SQL */
  sql: string;
  /** 执行时间（毫秒） */
  duration: number;
  /** 参数 */
  params?: any[];
  /** 时间戳 */
  timestamp: number;
  /** 查询类型 */
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'UNKNOWN';
  /** 是否为慢查询 */
  isSlow: boolean;
}

/**
 * 查询优化建议
 */
interface QueryOptimizationSuggestion {
  /** 原始查询 */
  originalQuery: string;
  /** 问题描述 */
  issue: string;
  /** 优化建议 */
  suggestion: string;
  /** 严重程度 */
  severity: 'low' | 'medium' | 'high';
}

/**
 * 查询优化器类
 */
export class QueryOptimizer {
  private queryHistory: QueryPerformance[] = [];
  private readonly maxHistorySize = 1000;
  private readonly slowQueryThreshold = 1000; // 1秒

  /**
   * 监控查询执行
   */
  async monitorQuery<T>(
    queryFn: () => Promise<T>,
    sql: string,
    params?: any[]
  ): Promise<T> {
    const startTime = Date.now();
    let result: T;
    let error: Error | null = null;

    try {
      result = await queryFn();
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
      throw err;
    } finally {
      const duration = Date.now() - startTime;
      const queryType = this.getQueryType(sql);
      const isSlow = duration > this.slowQueryThreshold;

      // 记录查询性能
      const queryPerf: QueryPerformance = {
        sql,
        duration,
        params,
        timestamp: Date.now(),
        type: queryType,
        isSlow
      };

      this.addQueryToHistory(queryPerf);

      // 记录到性能监控器
      performanceMonitor.recordDatabaseQuery(duration, error !== null);

      // 如果是慢查询，记录警告
      if (isSlow) {
        console.warn(`慢查询检测 (${duration}ms):`, {
          sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
          duration,
          params: params?.slice(0, 3) // 只记录前3个参数
        });
      }
    }

    return result!;
  }

  /**
   * 获取查询类型
   */
  private getQueryType(sql: string): QueryPerformance['type'] {
    const upperSql = sql.trim().toUpperCase();
    
    if (upperSql.startsWith('SELECT')) return 'SELECT';
    if (upperSql.startsWith('INSERT')) return 'INSERT';
    if (upperSql.startsWith('UPDATE')) return 'UPDATE';
    if (upperSql.startsWith('DELETE')) return 'DELETE';
    
    return 'UNKNOWN';
  }

  /**
   * 添加查询到历史记录
   */
  private addQueryToHistory(queryPerf: QueryPerformance): void {
    this.queryHistory.push(queryPerf);

    // 如果历史记录过多，删除最旧的
    if (this.queryHistory.length > this.maxHistorySize) {
      this.queryHistory.shift();
    }
  }

  /**
   * 获取查询统计信息
   */
  getQueryStats() {
    const now = Date.now();
    const oneHourAgo = now - 3600000; // 1小时前
    const recentQueries = this.queryHistory.filter(q => q.timestamp > oneHourAgo);

    const stats = {
      total: recentQueries.length,
      byType: {} as Record<string, number>,
      slowQueries: recentQueries.filter(q => q.isSlow).length,
      averageDuration: 0,
      maxDuration: 0,
      minDuration: Infinity
    };

    if (recentQueries.length > 0) {
      // 按类型统计
      recentQueries.forEach(q => {
        stats.byType[q.type] = (stats.byType[q.type] || 0) + 1;
      });

      // 计算时间统计
      const durations = recentQueries.map(q => q.duration);
      stats.averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      stats.maxDuration = Math.max(...durations);
      stats.minDuration = Math.min(...durations);
    }

    return stats;
  }

  /**
   * 获取慢查询列表
   */
  getSlowQueries(limit: number = 20): QueryPerformance[] {
    return this.queryHistory
      .filter(q => q.isSlow)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * 获取频繁查询列表
   */
  getFrequentQueries(limit: number = 20): Array<{
    sql: string;
    count: number;
    averageDuration: number;
    totalDuration: number;
  }> {
    const queryMap = new Map<string, QueryPerformance[]>();

    // 按SQL分组
    this.queryHistory.forEach(q => {
      const normalizedSql = this.normalizeSql(q.sql);
      if (!queryMap.has(normalizedSql)) {
        queryMap.set(normalizedSql, []);
      }
      queryMap.get(normalizedSql)!.push(q);
    });

    // 计算统计信息
    const result = Array.from(queryMap.entries()).map(([sql, queries]) => {
      const totalDuration = queries.reduce((sum, q) => sum + q.duration, 0);
      return {
        sql,
        count: queries.length,
        averageDuration: totalDuration / queries.length,
        totalDuration
      };
    });

    // 按总执行时间排序
    return result
      .sort((a, b) => b.totalDuration - a.totalDuration)
      .slice(0, limit);
  }

  /**
   * 规范化SQL（去除参数值）
   */
  private normalizeSql(sql: string): string {
    return sql
      .replace(/\$\d+/g, '?') // 替换参数占位符
      .replace(/\s+/g, ' ') // 压缩空白字符
      .trim();
  }

  /**
   * 分析查询并提供优化建议
   */
  analyzeQueries(): QueryOptimizationSuggestion[] {
    const suggestions: QueryOptimizationSuggestion[] = [];
    const frequentQueries = this.getFrequentQueries(10);
    const slowQueries = this.getSlowQueries(10);

    // 分析频繁查询
    frequentQueries.forEach(fq => {
      if (fq.count > 50) { // 执行次数过多
        suggestions.push({
          originalQuery: fq.sql,
          issue: `查询执行频率过高 (${fq.count}次)`,
          suggestion: '考虑添加缓存或合并查询',
          severity: fq.count > 100 ? 'high' : 'medium'
        });
      }

      if (fq.averageDuration > 500) { // 平均耗时过长
        suggestions.push({
          originalQuery: fq.sql,
          issue: `平均查询时间过长 (${fq.averageDuration.toFixed(2)}ms)`,
          suggestion: '检查索引优化或查询逻辑',
          severity: fq.averageDuration > 1000 ? 'high' : 'medium'
        });
      }
    });

    // 分析慢查询
    slowQueries.forEach(sq => {
      suggestions.push({
        originalQuery: sq.sql,
        issue: `慢查询检测 (${sq.duration}ms)`,
        suggestion: '优化SQL语句，添加合适的索引',
        severity: sq.duration > 3000 ? 'high' : 'medium'
      });
    });

    // 查找N+1查询问题
    const selectQueries = this.queryHistory.filter(q => q.type === 'SELECT');
    const recentSelects = selectQueries.slice(-100); // 检查最近100次SELECT查询
    
    const patternMap = new Map<string, number>();
    recentSelects.forEach(q => {
      const pattern = this.extractQueryPattern(q.sql);
      patternMap.set(pattern, (patternMap.get(pattern) || 0) + 1);
    });

    patternMap.forEach((count, pattern) => {
      if (count > 20) { // 相同模式查询过多
        suggestions.push({
          originalQuery: pattern,
          issue: `可能存在N+1查询问题 (${count}次相似查询)`,
          suggestion: '使用JOIN查询或预加载相关数据',
          severity: count > 50 ? 'high' : 'medium'
        });
      }
    });

    return suggestions;
  }

  /**
   * 提取查询模式（用于检测N+1问题）
   */
  private extractQueryPattern(sql: string): string {
    return sql
      .replace(/\$\d+/g, '?') // 替换参数
      .replace(/\d+/g, 'N') // 替换数字
      .replace(/(['"][^'"]*['"])/g, 'STRING') // 替换字符串
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 生成性能报告
   */
  generateReport() {
    const stats = this.getQueryStats();
    const slowQueries = this.getSlowQueries(5);
    const frequentQueries = this.getFrequentQueries(5);
    const suggestions = this.analyzeQueries();

    return {
      summary: {
        totalQueries: stats.total,
        slowQueries: stats.slowQueries,
        averageDuration: stats.averageDuration,
        maxDuration: stats.maxDuration,
        queryTypes: stats.byType
      },
      topSlowQueries: slowQueries.map(q => ({
        sql: q.sql.substring(0, 100) + (q.sql.length > 100 ? '...' : ''),
        duration: q.duration,
        timestamp: q.timestamp
      })),
      mostFrequentQueries: frequentQueries,
      optimizationSuggestions: suggestions.slice(0, 10), // 最多显示10个建议
      healthScore: this.calculateHealthScore()
    };
  }

  /**
   * 计算数据库健康评分
   */
  private calculateHealthScore(): number {
    const stats = this.getQueryStats();
    let score = 100;

    // 慢查询率扣分
    if (stats.total > 0) {
      const slowQueryRate = stats.slowQueries / stats.total;
      score -= slowQueryRate * 30; // 慢查询率每10%扣3分
    }

    // 平均响应时间扣分
    if (stats.averageDuration > 100) {
      score -= Math.min(20, (stats.averageDuration - 100) / 50); // 超过100ms每50ms扣1分，最多扣20分
    }

    // 最大响应时间扣分
    if (stats.maxDuration > 5000) {
      score -= 20; // 有超过5秒的查询扣20分
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * 清理历史数据
   */
  cleanup(): void {
    const oneWeekAgo = Date.now() - 7 * 24 * 3600000; // 一周前
    this.queryHistory = this.queryHistory.filter(q => q.timestamp > oneWeekAgo);
  }

  /**
   * 重置统计信息
   */
  reset(): void {
    this.queryHistory = [];
  }
}

/**
 * 单例查询优化器实例
 */
export const queryOptimizer = new QueryOptimizer();

/**
 * 查询监控装饰器
 */
export function monitorQuery(sql?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const queryName = sql || `${target.constructor.name}.${propertyName}`;
      
      return queryOptimizer.monitorQuery(
        () => method.apply(this, args),
        queryName,
        args
      );
    };

    return descriptor;
  };
} 