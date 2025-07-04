/**
 * 服务器诊断工具
 * 用于排查503错误和服务器状态问题
 */

interface DiagnosticResult {
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
  timestamp: number;
}

interface ServerHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  checks: DiagnosticResult[];
  recommendations: string[];
}

export class ServerDiagnostics {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * 运行完整的服务器健康检查
   */
  async runHealthCheck(): Promise<ServerHealth> {
    console.log('🔍 开始服务器健康检查...');
    
    const checks: DiagnosticResult[] = [];
    const recommendations: string[] = [];

    // 1. 基础连通性检查
    checks.push(await this.checkBasicConnectivity());
    
    // 2. API端点检查
    checks.push(await this.checkApiEndpoints());
    
    // 3. 数据库连接检查
    checks.push(await this.checkDatabaseConnection());
    
    // 4. 服务器响应时间检查
    checks.push(await this.checkResponseTime());
    
    // 5. 文件上传能力检查
    checks.push(await this.checkUploadCapability());

    // 分析结果并生成建议
    const errorCount = checks.filter(c => c.status === 'error').length;
    const warningCount = checks.filter(c => c.status === 'warning').length;

    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (errorCount === 0 && warningCount === 0) {
      overall = 'healthy';
    } else if (errorCount === 0) {
      overall = 'degraded';
    } else {
      overall = 'unhealthy';
    }

    // 生成建议
    if (errorCount > 0) {
      recommendations.push('🚨 发现严重问题，需要立即处理');
      
      const hasConnectivityIssue = checks.some(c => 
        c.message.includes('连接') && c.status === 'error'
      );
      const hasDatabaseIssue = checks.some(c => 
        c.message.includes('数据库') && c.status === 'error'
      );
      const hasTimeoutIssue = checks.some(c => 
        c.message.includes('超时') && c.status === 'error'
      );

      if (hasConnectivityIssue) {
        recommendations.push('🌐 检查网络连接和防火墙设置');
        recommendations.push('🔄 检查反向代理(nginx/cloudflare)配置');
        recommendations.push('⚙️ 验证服务器进程是否正在运行');
      }

      if (hasDatabaseIssue) {
        recommendations.push('🗄️ 检查数据库服务状态');
        recommendations.push('🔑 验证数据库连接字符串和权限');
        recommendations.push('💾 检查数据库磁盘空间');
      }

      if (hasTimeoutIssue) {
        recommendations.push('⏱️ 增加服务器超时配置');
        recommendations.push('🚀 优化应用性能');
        recommendations.push('📊 检查服务器资源使用情况');
      }
    }

    return {
      overall,
      checks,
      recommendations
    };
  }

  /**
   * 检查基础连通性
   */
  private async checkBasicConnectivity(): Promise<DiagnosticResult> {
    try {
      console.log('🔍 检查基础连通性...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${this.baseUrl}/api/mikutap/background-music?test=connectivity`, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return {
        status: response.ok ? 'success' : 'error',
        message: response.ok 
          ? '✅ 服务器连通性正常' 
          : `❌ 服务器连通性异常 (状态码: ${response.status})`,
        details: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        },
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        status: 'error',
        message: `❌ 服务器连接失败: ${error instanceof Error ? error.message : '未知错误'}`,
        details: { error: String(error) },
        timestamp: Date.now()
      };
    }
  }

  /**
   * 检查API端点
   */
  private async checkApiEndpoints(): Promise<DiagnosticResult> {
    try {
      console.log('🔍 检查API端点...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${this.baseUrl}/api/mikutap/background-music?configId=default&test=true`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 503) {
        return {
          status: 'error',
          message: '❌ API服务不可用 (503错误)',
          details: {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            possibleCauses: [
              '数据库连接失败',
              '服务器资源不足',
              '应用程序崩溃',
              '代理服务器配置问题'
            ]
          },
          timestamp: Date.now()
        };
      }

      return {
        status: response.ok ? 'success' : 'warning',
        message: response.ok 
          ? '✅ API端点响应正常' 
          : `⚠️ API端点响应异常 (状态码: ${response.status})`,
        details: {
          status: response.status,
          statusText: response.statusText
        },
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        status: 'error',
        message: `❌ API端点检查失败: ${error instanceof Error ? error.message : '未知错误'}`,
        details: { error: String(error) },
        timestamp: Date.now()
      };
    }
  }

  /**
   * 检查数据库连接
   */
  private async checkDatabaseConnection(): Promise<DiagnosticResult> {
    try {
      console.log('🔍 检查数据库连接...');
      
      // 尝试一个简单的数据库查询
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch(`${this.baseUrl}/api/mikutap/background-music?configId=test&limit=1`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 503) {
        return {
          status: 'error',
          message: '❌ 数据库连接可能有问题 (服务返回503)',
          details: {
            suggestion: '检查数据库服务状态、连接字符串、网络连通性'
          },
          timestamp: Date.now()
        };
      }

      return {
        status: response.ok ? 'success' : 'warning',
        message: response.ok 
          ? '✅ 数据库连接正常' 
          : `⚠️ 数据库查询异常 (状态码: ${response.status})`,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        status: 'error',
        message: `❌ 数据库连接检查失败: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: Date.now()
      };
    }
  }

  /**
   * 检查响应时间
   */
  private async checkResponseTime(): Promise<DiagnosticResult> {
    try {
      console.log('🔍 检查服务器响应时间...');
      
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${this.baseUrl}/api/mikutap/background-music?configId=default&test=performance`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      let status: 'success' | 'warning' | 'error';
      let message: string;

      if (responseTime < 1000) {
        status = 'success';
        message = `✅ 响应时间良好 (${responseTime}ms)`;
      } else if (responseTime < 5000) {
        status = 'warning';
        message = `⚠️ 响应时间较慢 (${responseTime}ms)`;
      } else {
        status = 'error';
        message = `❌ 响应时间过慢 (${responseTime}ms)`;
      }

      return {
        status,
        message,
        details: {
          responseTime,
          httpStatus: response.status
        },
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        status: 'error',
        message: `❌ 响应时间检查失败: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: Date.now()
      };
    }
  }

  /**
   * 检查文件上传能力
   */
  private async checkUploadCapability(): Promise<DiagnosticResult> {
    try {
      console.log('🔍 检查文件上传能力...');
      
      // 创建一个小的测试文件
      const testData = new Uint8Array(1024); // 1KB测试数据
      for (let i = 0; i < testData.length; i++) {
        testData[i] = i % 256;
      }
      const testBlob = new Blob([testData], { type: 'audio/wav' });

      const formData = new FormData();
      formData.append('test', 'true');
      formData.append('file', testBlob, 'test.wav');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${this.baseUrl}/api/mikutap/background-music`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 503) {
        return {
          status: 'error',
          message: '❌ 文件上传服务不可用 (503错误)',
          details: {
            suggestion: '检查服务器磁盘空间、内存使用、进程状态'
          },
          timestamp: Date.now()
        };
      }

      return {
        status: response.status < 500 ? 'success' : 'error',
        message: response.status < 500 
          ? '✅ 文件上传功能可用' 
          : `❌ 文件上传功能异常 (状态码: ${response.status})`,
        details: {
          status: response.status
        },
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        status: 'error',
        message: `❌ 文件上传能力检查失败: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: Date.now()
      };
    }
  }

  /**
   * 生成诊断报告
   */
  generateReport(health: ServerHealth): string {
    const { overall, checks, recommendations } = health;
    
    let report = `📊 服务器健康检查报告\n`;
    report += `时间: ${new Date().toLocaleString()}\n`;
    report += `总体状态: ${overall === 'healthy' ? '🟢 健康' : overall === 'degraded' ? '🟡 降级' : '🔴 不健康'}\n\n`;

    report += `📋 检查项目:\n`;
    checks.forEach((check, index) => {
      const icon = check.status === 'success' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
      report += `${index + 1}. ${icon} ${check.message}\n`;
    });

    if (recommendations.length > 0) {
      report += `\n💡 建议:\n`;
      recommendations.forEach((rec, index) => {
        report += `${index + 1}. ${rec}\n`;
      });
    }

    return report;
  }
}

// 导出单例
export const serverDiagnostics = new ServerDiagnostics(); 