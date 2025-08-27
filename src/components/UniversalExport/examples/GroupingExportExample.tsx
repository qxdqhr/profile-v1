/**
 * 分组导出功能组件使用示例
 * 
 * 演示如何在React组件中使用更新后的导出配置编辑器，
 * 包含分组功能的完整配置和使用流程
 */

'use client';

import React, { useState } from 'react';
import { UniversalExportService } from '../../../services/universalExport';
import { ExportConfigEditor } from '../ExportConfigEditor';
import { UniversalExportButton } from '../UniversalExportButton';
import type { ExportConfig, ExportField } from '../../../services/universalExport';

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

const availableFields: ExportField[] = [
  {
    key: 'customerPhone',
    label: '客户手机号',
    type: 'string',
    enabled: true,
    width: 15,
    alignment: 'left',
    description: '客户的手机号码'
  },
  {
    key: 'customerQQ',
    label: '客户QQ号',
    type: 'string',
    enabled: true,
    width: 12,
    alignment: 'left',
    description: '客户的QQ号码'
  },
  {
    key: 'customerName',
    label: '客户姓名',
    type: 'string',
    enabled: true,
    width: 10,
    alignment: 'left',
    description: '客户的真实姓名'
  },
  {
    key: 'id',
    label: '订单ID',
    type: 'number',
    enabled: true,
    width: 8,
    alignment: 'center',
    description: '订单的唯一标识符'
  },
  {
    key: 'productName',
    label: '产品名称',
    type: 'string',
    enabled: true,
    width: 15,
    alignment: 'left',
    description: '购买的产品名称'
  },
  {
    key: 'quantity',
    label: '数量',
    type: 'number',
    enabled: true,
    width: 8,
    alignment: 'center',
    description: '购买的产品数量'
  },
  {
    key: 'price',
    label: '单价',
    type: 'number',
    enabled: true,
    width: 10,
    alignment: 'right',
    description: '产品的单价',
    formatter: (value: number) => `¥${value.toFixed(2)}`
  },
  {
    key: 'orderDate',
    label: '订单日期',
    type: 'date',
    enabled: true,
    width: 12,
    alignment: 'center',
    description: '订单的创建日期'
  },
  {
    key: 'status',
    label: '订单状态',
    type: 'string',
    enabled: true,
    width: 10,
    alignment: 'center',
    description: '订单的当前状态'
  }
];

// ============= 主组件 =============

export const GroupingExportExample: React.FC = () => {
  const [showConfigEditor, setShowConfigEditor] = useState(false);
  const [savedConfig, setSavedConfig] = useState<ExportConfig | null>(null);
  const [exportService] = useState(() => new UniversalExportService());

  // 处理配置保存
  const handleConfigSave = (config: ExportConfig) => {
    console.log('✅ 配置已保存:', config);
    setSavedConfig(config);
    setShowConfigEditor(false);
    
    // 这里可以将配置保存到服务器
    // await exportService.createConfig(config);
  };

  // 获取数据源
  const dataSource = async () => {
    console.log('📊 获取订单数据...');
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    return sampleOrderData;
  };

  // 默认配置（包含分组）
  const defaultConfig: ExportConfig = {
    id: 'order-export-grouped-demo',
    name: '订单导出（分组演示）',
    description: '按客户分组的订单导出演示，支持单元格合并',
    format: 'excel',
    fields: availableFields,
    grouping: {
      enabled: true,
      fields: [
        {
          key: 'customerPhone',
          label: '客户手机号',
          mode: 'merge',
          valueProcessing: 'first',
          showGroupHeader: false,
          mergeCells: true
        }
      ],
      preserveOrder: true,
      nullValueHandling: 'separate',
      nullGroupName: '未知客户'
    },
    fileNameTemplate: '订单导出_分组演示_{date}',
    includeHeader: true,
    delimiter: ',',
    encoding: 'utf-8',
    addBOM: true,
    maxRows: 10000,
    createdAt: new Date(),
    updatedAt: new Date(),
    moduleId: 'order-management',
    businessId: 'order-export-demo',
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 标题 */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          分组导出功能演示
        </h1>
        <p className="text-gray-600">
          演示如何使用导出配置编辑器创建分组导出配置，并执行分组导出
        </p>
      </div>

      {/* 示例数据预览 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">示例数据预览</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left font-medium text-gray-700">客户手机号</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">客户QQ号</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">客户姓名</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">订单ID</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">产品名称</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">数量</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">单价</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">订单日期</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">状态</th>
              </tr>
            </thead>
            <tbody>
              {sampleOrderData.map((order, index) => (
                <tr key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2 text-gray-900">{order.customerPhone}</td>
                  <td className="px-3 py-2 text-gray-900">{order.customerQQ}</td>
                  <td className="px-3 py-2 text-gray-900">{order.customerName}</td>
                  <td className="px-3 py-2 text-gray-900">{order.id}</td>
                  <td className="px-3 py-2 text-gray-900">{order.productName}</td>
                  <td className="px-3 py-2 text-gray-900">{order.quantity}</td>
                  <td className="px-3 py-2 text-gray-900">¥{order.price.toFixed(2)}</td>
                  <td className="px-3 py-2 text-gray-900">{order.orderDate}</td>
                  <td className="px-3 py-2 text-gray-900">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          注意：客户 "张三" 有3个订单，客户 "李四" 有2个订单。分组导出将同一客户的订单合并显示。
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        {/* 配置导出 */}
        <button
          onClick={() => setShowConfigEditor(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          配置分组导出
        </button>

        {/* 快速导出 */}
        <UniversalExportButton
          exportService={exportService}
          moduleId="order-management"
          businessId="order-export-demo"
          availableFields={availableFields}
          dataSource={dataSource}
          defaultConfig={savedConfig || defaultConfig}
          buttonText="执行分组导出"
          variant="primary"
          size="md"
          onExportSuccess={(result) => {
            console.log('🎉 导出成功:', result);
            alert(`导出成功！文件名：${result.fileName}`);
          }}
          onExportError={(error) => {
            console.error('❌ 导出失败:', error);
            alert(`导出失败：${error}`);
          }}
          onConfigSave={handleConfigSave}
        />
      </div>

      {/* 当前配置显示 */}
      {savedConfig && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-900 mb-2">当前导出配置</h3>
          <div className="text-sm text-green-800 space-y-1">
            <p><strong>配置名称:</strong> {savedConfig.name}</p>
            <p><strong>导出格式:</strong> {savedConfig.format.toUpperCase()}</p>
            <p><strong>分组状态:</strong> {savedConfig.grouping?.enabled ? '已启用' : '未启用'}</p>
            {savedConfig.grouping?.enabled && (
              <p><strong>分组字段:</strong> {savedConfig.grouping.fields.map(f => f.label).join(', ')}</p>
            )}
            <p><strong>启用字段:</strong> {savedConfig.fields.filter(f => f.enabled).length} / {savedConfig.fields.length}</p>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">使用说明</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <div>
            <strong>1. 配置分组导出：</strong>
            <p>点击"配置分组导出"按钮，在弹出的配置编辑器中：</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>勾选"启用分组"</li>
              <li>从下拉列表中选择要分组的字段（如：客户手机号）</li>
              <li>设置分组模式为"合并模式"以支持单元格合并</li>
              <li>如果选择Excel格式，可以勾选"合并单元格"</li>
            </ul>
          </div>
          <div>
            <strong>2. 执行导出：</strong>
            <p>配置完成后，点击"执行分组导出"按钮即可下载分组后的文件。</p>
          </div>
          <div>
            <strong>3. 查看效果：</strong>
            <p>在导出的Excel文件中，同一客户的多个订单将被分组显示，客户信息列会自动合并。</p>
          </div>
        </div>
      </div>

      {/* 配置编辑器 */}
      <ExportConfigEditor
        moduleId="order-management"
        businessId="order-export-demo"
        availableFields={availableFields}
        initialConfig={savedConfig || defaultConfig}
        onSave={handleConfigSave}
        onCancel={() => setShowConfigEditor(false)}
        visible={showConfigEditor}
      />
    </div>
  );
};

export default GroupingExportExample;
