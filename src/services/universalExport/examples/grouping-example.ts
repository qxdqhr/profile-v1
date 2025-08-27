/**
 * 通用导出服务分组功能使用示例
 * 
 * 演示如何使用分组功能导出Excel文件，实现单元格合并效果
 */

import { UniversalExportService } from '../UniversalExportService';
import type { ExportConfig, ExportField, GroupingConfig } from '../types';

// ============= 示例数据 =============

interface OrderData {
  id: number;
  customerPhone: string;
  customerQQ: string;
  customerName: string;
  productName: string;
  quantity: number;
  price: number;
  orderDate: string;
  status: string;
}

// 模拟订单数据 - 同一用户有多个订单
const sampleOrderData: OrderData[] = [
  {
    id: 1,
    customerPhone: '13800138001',
    customerQQ: '123456789',
    customerName: '张三',
    productName: '产品A',
    quantity: 2,
    price: 100,
    orderDate: '2024-01-01',
    status: '已完成'
  },
  {
    id: 2,
    customerPhone: '13800138001',
    customerQQ: '123456789',
    customerName: '张三',
    productName: '产品B',
    quantity: 1,
    price: 200,
    orderDate: '2024-01-02',
    status: '已完成'
  },
  {
    id: 3,
    customerPhone: '13800138001',
    customerQQ: '123456789',
    customerName: '张三',
    productName: '产品C',
    quantity: 3,
    price: 150,
    orderDate: '2024-01-03',
    status: '进行中'
  },
  {
    id: 4,
    customerPhone: '13900139001',
    customerQQ: '987654321',
    customerName: '李四',
    productName: '产品A',
    quantity: 1,
    price: 100,
    orderDate: '2024-01-04',
    status: '已完成'
  },
  {
    id: 5,
    customerPhone: '13900139001',
    customerQQ: '987654321',
    customerName: '李四',
    productName: '产品D',
    quantity: 2,
    price: 300,
    orderDate: '2024-01-05',
    status: '已完成'
  }
];

// ============= 字段配置 =============

const exportFields: ExportField[] = [
  {
    key: 'customerPhone',
    label: '客户手机号',
    type: 'string',
    enabled: true,
    width: 15,
    alignment: 'left'
  },
  {
    key: 'customerQQ',
    label: '客户QQ号',
    type: 'string',
    enabled: true,
    width: 12,
    alignment: 'left'
  },
  {
    key: 'customerName',
    label: '客户姓名',
    type: 'string',
    enabled: true,
    width: 10,
    alignment: 'left'
  },
  {
    key: 'id',
    label: '订单ID',
    type: 'number',
    enabled: true,
    width: 8,
    alignment: 'center'
  },
  {
    key: 'productName',
    label: '产品名称',
    type: 'string',
    enabled: true,
    width: 15,
    alignment: 'left'
  },
  {
    key: 'quantity',
    label: '数量',
    type: 'number',
    enabled: true,
    width: 8,
    alignment: 'center'
  },
  {
    key: 'price',
    label: '单价',
    type: 'number',
    enabled: true,
    width: 10,
    alignment: 'right',
    formatter: (value: number) => `¥${value.toFixed(2)}`
  },
  {
    key: 'orderDate',
    label: '订单日期',
    type: 'date',
    enabled: true,
    width: 12,
    alignment: 'center'
  },
  {
    key: 'status',
    label: '订单状态',
    type: 'string',
    enabled: true,
    width: 10,
    alignment: 'center'
  }
];

// ============= 分组配置示例 =============

/**
 * 示例1: 按客户手机号分组，合并单元格
 */
const phoneGroupingConfig: GroupingConfig = {
  enabled: true,
  fields: [
    {
      key: 'customerPhone',
      label: '客户手机号',
      mode: 'merge',
      valueProcessing: 'first',
      showGroupHeader: false,
      mergeCells: true // 启用单元格合并
    }
  ],
  preserveOrder: true,
  nullValueHandling: 'separate',
  nullGroupName: '未知客户'
};

/**
 * 示例2: 按客户手机号+QQ号分组，多级分组
 */
const customerGroupingConfig: GroupingConfig = {
  enabled: true,
  fields: [
    {
      key: 'customerPhone',
      label: '客户手机号',
      mode: 'merge',
      valueProcessing: 'first',
      showGroupHeader: false,
      mergeCells: true
    },
    {
      key: 'customerQQ',
      label: '客户QQ号',
      mode: 'merge',
      valueProcessing: 'first',
      showGroupHeader: false,
      mergeCells: true
    }
  ],
  preserveOrder: true,
  nullValueHandling: 'separate',
  nullGroupName: '未知客户'
};

/**
 * 示例3: 按客户分组，显示分组头
 */
const customerWithHeaderGroupingConfig: GroupingConfig = {
  enabled: true,
  fields: [
    {
      key: 'customerPhone',
      label: '客户手机号',
      mode: 'separate',
      valueProcessing: 'first',
      showGroupHeader: true,
      groupHeaderTemplate: '客户: {value}',
      mergeCells: false
    }
  ],
  preserveOrder: true,
  nullValueHandling: 'separate',
  nullGroupName: '未知客户'
};

// ============= 导出配置 =============

/**
 * Excel导出配置 - 带分组
 */
const excelExportConfig: ExportConfig = {
  id: 'order-export-grouped',
  name: '订单导出（分组）',
  description: '按客户分组的订单导出，支持单元格合并',
  format: 'excel',
  fields: exportFields,
  grouping: phoneGroupingConfig, // 使用分组配置
  fileNameTemplate: '订单导出_分组_{date}',
  includeHeader: true,
  delimiter: ',',
  encoding: 'utf-8',
  addBOM: true,
  maxRows: 10000,
  createdAt: new Date(),
  updatedAt: new Date(),
  moduleId: 'order-management',
  businessId: 'order-export',
  createdBy: 'system'
};

/**
 * CSV导出配置 - 带分组
 */
const csvExportConfig: ExportConfig = {
  ...excelExportConfig,
  id: 'order-export-grouped-csv',
  format: 'csv',
  fileNameTemplate: '订单导出_分组_{date}'
};

// ============= 使用示例函数 =============

/**
 * 示例1: 基本分组导出（Excel）
 */
export async function exportOrdersWithGrouping(): Promise<void> {
  console.log('🚀 开始分组导出示例...');
  
  // 创建导出服务实例
  const exportService = new UniversalExportService();
  
  try {
    // 执行导出
    const result = await exportService.export({
      configId: excelExportConfig,
      dataSource: async () => sampleOrderData,
      callbacks: {
        onProgress: (progress) => {
          console.log(`📊 导出进度: ${progress.progress}% (${progress.processedRows}/${progress.totalRows})`);
        },
        onSuccess: (result) => {
          console.log('✅ 导出成功:', {
            fileName: result.fileName,
            fileSize: result.fileSize,
            exportedRows: result.exportedRows,
            duration: result.duration
          });
          
          // 下载文件
          downloadFile(result.fileBlob, result.fileName);
        },
        onError: (error) => {
          console.error('❌ 导出失败:', error);
        }
      }
    });
    
  } catch (error) {
    console.error('💥 导出异常:', error);
  }
}

/**
 * 示例2: 多级分组导出
 */
export async function exportOrdersWithMultiLevelGrouping(): Promise<void> {
  console.log('🚀 开始多级分组导出示例...');
  
  const exportService = new UniversalExportService();
  
  // 使用多级分组配置
  const multiLevelConfig: ExportConfig = {
    ...excelExportConfig,
    id: 'order-export-multi-level',
    grouping: customerGroupingConfig
  };
  
  try {
    const result = await exportService.export({
      configId: multiLevelConfig,
      dataSource: async () => sampleOrderData,
      callbacks: {
        onProgress: (progress) => {
          console.log(`📊 多级分组导出进度: ${progress.progress}%`);
        },
        onSuccess: (result) => {
          console.log('✅ 多级分组导出成功:', result.fileName);
          downloadFile(result.fileBlob, result.fileName);
        },
        onError: (error) => {
          console.error('❌ 多级分组导出失败:', error);
        }
      }
    });
    
  } catch (error) {
    console.error('💥 多级分组导出异常:', error);
  }
}

/**
 * 示例3: CSV分组导出
 */
export async function exportOrdersToCSVWithGrouping(): Promise<void> {
  console.log('🚀 开始CSV分组导出示例...');
  
  const exportService = new UniversalExportService();
  
  try {
    const result = await exportService.export({
      configId: csvExportConfig,
      dataSource: async () => sampleOrderData,
      callbacks: {
        onSuccess: (result) => {
          console.log('✅ CSV分组导出成功:', result.fileName);
          downloadFile(result.fileBlob, result.fileName);
        },
        onError: (error) => {
          console.error('❌ CSV分组导出失败:', error);
        }
      }
    });
    
  } catch (error) {
    console.error('💥 CSV分组导出异常:', error);
  }
}

/**
 * 示例4: 动态分组配置
 */
export async function exportOrdersWithDynamicGrouping(groupByField: string): Promise<void> {
  console.log(`🚀 开始动态分组导出示例 (按${groupByField}分组)...`);
  
  const exportService = new UniversalExportService();
  
  // 动态创建分组配置
  const dynamicGroupingConfig: GroupingConfig = {
    enabled: true,
    fields: [
      {
        key: groupByField,
        label: exportFields.find(f => f.key === groupByField)?.label || groupByField,
        mode: 'merge',
        valueProcessing: 'first',
        showGroupHeader: false,
        mergeCells: true
      }
    ],
    preserveOrder: true,
    nullValueHandling: 'separate'
  };
  
  const dynamicConfig: ExportConfig = {
    ...excelExportConfig,
    id: `order-export-by-${groupByField}`,
    grouping: dynamicGroupingConfig
  };
  
  try {
    const result = await exportService.export({
      configId: dynamicConfig,
      dataSource: async () => sampleOrderData,
      callbacks: {
        onSuccess: (result) => {
          console.log(`✅ 按${groupByField}分组导出成功:`, result.fileName);
          downloadFile(result.fileBlob, result.fileName);
        },
        onError: (error) => {
          console.error(`❌ 按${groupByField}分组导出失败:`, error);
        }
      }
    });
    
  } catch (error) {
    console.error(`💥 按${groupByField}分组导出异常:`, error);
  }
}

// ============= 工具函数 =============

/**
 * 下载文件
 */
function downloadFile(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 创建测试数据（更多数据）
 */
export function createLargeTestData(userCount: number = 10, ordersPerUser: number = 5): OrderData[] {
  const testData: OrderData[] = [];
  let orderId = 1;
  
  for (let i = 0; i < userCount; i++) {
    const customerPhone = `138${String(i).padStart(8, '0')}`;
    const customerQQ = `${1000000000 + i}`;
    const customerName = `用户${i + 1}`;
    
    for (let j = 0; j < ordersPerUser; j++) {
      testData.push({
        id: orderId++,
        customerPhone,
        customerQQ,
        customerName,
        productName: `产品${String.fromCharCode(65 + (j % 26))}`,
        quantity: Math.floor(Math.random() * 5) + 1,
        price: Math.floor(Math.random() * 500) + 50,
        orderDate: `2024-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        status: ['已完成', '进行中', '已取消'][Math.floor(Math.random() * 3)]
      });
    }
  }
  
  return testData;
}

// ============= 使用说明 =============

/**
 * 使用说明:
 * 
 * 1. 基本分组导出：
 *    exportOrdersWithGrouping();
 * 
 * 2. 多级分组导出：
 *    exportOrdersWithMultiLevelGrouping();
 * 
 * 3. CSV分组导出：
 *    exportOrdersToCSVWithGrouping();
 * 
 * 4. 动态分组导出：
 *    exportOrdersWithDynamicGrouping('customerPhone');
 *    exportOrdersWithDynamicGrouping('status');
 * 
 * 5. 大数据量测试：
 *    const largeData = createLargeTestData(100, 10); // 100个用户，每人10个订单
 *    // 然后将largeData作为dataSource使用
 */
