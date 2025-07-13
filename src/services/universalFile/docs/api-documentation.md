# 通用文件服务 API 文档

## 概述

通用文件服务提供了完整的文件管理功能，包括文件上传、下载、管理、分享等功能。所有API都遵循RESTful设计原则，返回标准化的JSON格式。

## 基础信息

- **基础URL**: `/api/universal-file`
- **认证方式**: 基于Session的认证
- **内容类型**: `application/json` (除文件上传接口使用 `multipart/form-data`)
- **字符编码**: UTF-8

## 响应格式

所有API响应都遵循统一格式：

```json
{
  "success": true,
  "data": {
    // 具体数据内容
  },
  "error": {
    "code": "ERROR_CODE",
    "message": "错误信息",
    "details": {}
  },
  "meta": {
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5,
    "requestId": "uuid",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### 成功响应
- `success`: 固定为 `true`
- `data`: 实际数据内容
- `meta`: 元数据信息（可选）

### 错误响应
- `success`: 固定为 `false`
- `error`: 错误详情
  - `code`: 错误代码
  - `message`: 用户友好的错误消息
  - `details`: 额外的错误详情

## 文件管理 API

### 1. 查询文件列表

**接口**: `GET /api/universal-file/files`

**描述**: 分页查询文件列表，支持多种过滤条件

**请求参数**:

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | number | 否 | 1 | 页码，从1开始 |
| pageSize | number | 否 | 20 | 每页大小，最大100 |
| orderBy | string | 否 | uploadTime | 排序字段 |
| orderDirection | string | 否 | desc | 排序方向：asc/desc |
| moduleId | string | 否 | - | 模块ID过滤 |
| businessId | string | 否 | - | 业务ID过滤 |
| folderId | string | 否 | - | 文件夹ID过滤 |
| mimeType | string | 否 | - | MIME类型过滤 |
| search | string | 否 | - | 文件名搜索关键词 |
| tags | string | 否 | - | 标签过滤，多个用逗号分隔 |
| sizeMin | number | 否 | - | 最小文件大小（字节） |
| sizeMax | number | 否 | - | 最大文件大小（字节） |
| uploadTimeStart | string | 否 | - | 上传开始时间（ISO 8601） |
| uploadTimeEnd | string | 否 | - | 上传结束时间（ISO 8601） |
| isDeleted | boolean | 否 | false | 是否查询已删除文件 |
| isTemporary | boolean | 否 | - | 是否查询临时文件 |
| uploaderId | string | 否 | - | 上传者ID过滤 |

**响应示例**:

```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "uuid",
        "originalName": "example.jpg",
        "storedName": "stored_name.jpg",
        "extension": "jpg",
        "mimeType": "image/jpeg",
        "size": 1024000,
        "md5Hash": "hash_value",
        "sha256Hash": "hash_value",
        "storagePath": "/path/to/file",
        "cdnUrl": "https://cdn.example.com/file",
        "folderId": "uuid",
        "moduleId": "gallery",
        "businessId": "business_123",
        "tags": ["tag1", "tag2"],
        "metadata": {"key": "value"},
        "isTemporary": false,
        "isDeleted": false,
        "accessCount": 10,
        "downloadCount": 5,
        "uploaderId": "user_123",
        "uploadTime": "2024-01-01T00:00:00.000Z",
        "lastAccessTime": "2024-01-01T12:00:00.000Z",
        "expiresAt": null,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "pageSize": 20,
      "totalPages": 5
    }
  }
}
```

### 2. 上传文件

**接口**: `POST /api/universal-file/files`

**描述**: 上传单个文件

**请求头**: `Content-Type: multipart/form-data`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | File | 是 | 要上传的文件 |
| folderId | string | 否 | 目标文件夹ID |
| moduleId | string | 否 | 模块ID |
| businessId | string | 否 | 业务ID |
| tags | string | 否 | 标签JSON数组字符串 |
| isTemporary | boolean | 否 | 是否为临时文件 |
| expiresAt | string | 否 | 过期时间（ISO 8601） |
| metadata | string | 否 | 元数据JSON字符串 |

**响应示例**:

```json
{
  "success": true,
  "data": {
    "fileId": "uuid",
    "originalName": "example.jpg",
    "size": 1024000,
    "mimeType": "image/jpeg",
    "url": "/storage/path/file",
    "cdnUrl": "https://cdn.example.com/file",
    "md5Hash": "hash_value",
    "uploadTime": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. 批量更新文件

**接口**: `PUT /api/universal-file/files`

**描述**: 批量更新文件信息

**请求体**:

```json
{
  "fileIds": ["uuid1", "uuid2"],
  "updateData": {
    "originalName": "new_name.jpg",
    "folderId": "new_folder_uuid",
    "tags": ["new_tag"],
    "metadata": {"key": "new_value"},
    "expiresAt": "2024-12-31T23:59:59.000Z"
  }
}
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "fileId": "uuid1",
        "success": true,
        "data": {
          // 更新后的文件信息
        }
      },
      {
        "fileId": "uuid2",
        "success": false,
        "error": "文件不存在"
      }
    ]
  }
}
```

### 4. 批量删除文件

**接口**: `DELETE /api/universal-file/files`

**描述**: 批量删除文件（逻辑删除）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fileIds | string | 是 | 文件ID列表，逗号分隔 |
| permanent | boolean | 否 | 是否物理删除 |

**响应示例**:

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "fileId": "uuid1",
        "success": true
      },
      {
        "fileId": "uuid2",
        "success": false,
        "error": "权限不足"
      }
    ]
  }
}
```

## 文件夹管理 API

### 1. 查询文件夹列表

**接口**: `GET /api/universal-file/folders`

**描述**: 查询文件夹列表

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| parentId | string | 否 | 父文件夹ID，空表示根目录 |
| moduleId | string | 否 | 模块ID过滤 |
| businessId | string | 否 | 业务ID过滤 |
| includeChildren | boolean | 否 | 是否包含子文件夹 |

**响应示例**:

```json
{
  "success": true,
  "data": {
    "folders": [
      {
        "id": "uuid",
        "name": "图片文件夹",
        "parentId": null,
        "moduleId": "gallery",
        "businessId": "business_123",
        "path": "图片文件夹",
        "depth": 0,
        "sortOrder": 0,
        "description": "存放图片的文件夹",
        "isSystem": false,
        "createdBy": "user_123",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 2. 创建文件夹

**接口**: `POST /api/universal-file/folders`

**描述**: 创建新文件夹

**请求体**:

```json
{
  "name": "新文件夹",
  "parentId": "parent_uuid",
  "moduleId": "gallery",
  "businessId": "business_123",
  "description": "文件夹描述",
  "sortOrder": 10
}
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "新文件夹",
    "parentId": "parent_uuid",
    "moduleId": "gallery",
    "businessId": "business_123",
    "path": "父文件夹/新文件夹",
    "depth": 1,
    "sortOrder": 10,
    "description": "文件夹描述",
    "isSystem": false,
    "createdBy": "user_123",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. 更新文件夹

**接口**: `PUT /api/universal-file/folders`

**描述**: 更新文件夹信息

**请求体**:

```json
{
  "folderId": "uuid",
  "updateData": {
    "name": "新名称",
    "parentId": "new_parent_uuid",
    "description": "新描述",
    "sortOrder": 20
  }
}
```

### 4. 删除文件夹

**接口**: `DELETE /api/universal-file/folders`

**描述**: 删除文件夹

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| folderId | string | 是 | 文件夹ID |
| recursive | boolean | 否 | 是否递归删除子文件夹和文件 |

## 错误代码

### 通用错误代码

| 代码 | 说明 | HTTP状态码 |
|------|------|-----------|
| UNKNOWN_ERROR | 未知错误 | 500 |
| VALIDATION_ERROR | 参数验证失败 | 400 |
| AUTHENTICATION_ERROR | 身份验证失败 | 401 |
| AUTHORIZATION_ERROR | 权限不足 | 403 |
| NOT_FOUND | 资源不存在 | 404 |
| CONFLICT | 资源冲突 | 409 |
| RATE_LIMIT_EXCEEDED | 请求频率超限 | 429 |

### 文件相关错误代码

| 代码 | 说明 | HTTP状态码 |
|------|------|-----------|
| FILE_NOT_FOUND | 文件不存在 | 404 |
| FILE_TOO_LARGE | 文件过大 | 413 |
| FILE_TYPE_NOT_SUPPORTED | 不支持的文件类型 | 415 |
| FILE_UPLOAD_FAILED | 文件上传失败 | 500 |
| FILE_PROCESSING_FAILED | 文件处理失败 | 500 |
| FILE_ALREADY_EXISTS | 文件已存在 | 409 |
| FILE_CORRUPTED | 文件已损坏 | 422 |

### 文件夹相关错误代码

| 代码 | 说明 | HTTP状态码 |
|------|------|-----------|
| FOLDER_NOT_FOUND | 文件夹不存在 | 404 |
| FOLDER_NOT_EMPTY | 文件夹不为空 | 409 |
| FOLDER_NAME_CONFLICT | 文件夹名称冲突 | 409 |
| FOLDER_DEPTH_EXCEEDED | 文件夹层级过深 | 400 |

### 存储相关错误代码

| 代码 | 说明 | HTTP状态码 |
|------|------|-----------|
| STORAGE_PROVIDER_ERROR | 存储服务错误 | 502 |
| STORAGE_QUOTA_EXCEEDED | 存储配额已满 | 507 |
| STORAGE_UNAVAILABLE | 存储服务不可用 | 503 |

## 使用示例

### JavaScript/TypeScript 客户端

```typescript
// 查询文件列表
async function getFiles(params: {
  page?: number;
  pageSize?: number;
  moduleId?: string;
  folderId?: string;
}) {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });

  const response = await fetch(`/api/universal-file/files?${searchParams}`);
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error.message);
  }
  
  return result.data;
}

// 上传文件
async function uploadFile(file: File, options: {
  folderId?: string;
  moduleId?: string;
  tags?: string[];
}) {
  const formData = new FormData();
  formData.append('file', file);
  
  if (options.folderId) {
    formData.append('folderId', options.folderId);
  }
  
  if (options.moduleId) {
    formData.append('moduleId', options.moduleId);
  }
  
  if (options.tags) {
    formData.append('tags', JSON.stringify(options.tags));
  }

  const response = await fetch('/api/universal-file/files', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error.message);
  }
  
  return result.data;
}

// 创建文件夹
async function createFolder(data: {
  name: string;
  parentId?: string;
  moduleId?: string;
  description?: string;
}) {
  const response = await fetch('/api/universal-file/folders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error.message);
  }
  
  return result.data;
}
```

### React Hook 示例

```typescript
import { useState, useEffect } from 'react';

export function useFileList(params: {
  moduleId?: string;
  folderId?: string;
  page?: number;
  pageSize?: number;
}) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0
  });

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getFiles(params);
      setFiles(data.files);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取文件列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [params.moduleId, params.folderId, params.page, params.pageSize]);

  return {
    files,
    loading,
    error,
    pagination,
    refetch: fetchFiles
  };
}
```

## 最佳实践

### 1. 文件上传

- 在上传前进行客户端验证（文件大小、类型等）
- 使用进度条显示上传进度
- 支持断点续传（大文件场景）
- 上传完成后及时清理临时文件

### 2. 错误处理

- 始终检查 `success` 字段
- 根据错误代码提供用户友好的错误提示
- 实现重试机制（网络错误等）
- 记录错误日志便于调试

### 3. 性能优化

- 使用分页避免一次性加载大量数据
- 实现虚拟滚动（大列表场景）
- 合理使用缓存机制
- 图片等资源使用CDN加速

### 4. 安全考虑

- 验证用户权限
- 限制文件类型和大小
- 扫描上传文件的安全性
- 使用HTTPS传输敏感数据

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 支持文件的基础CRUD操作
- 支持文件夹管理
- 提供完整的错误处理机制 