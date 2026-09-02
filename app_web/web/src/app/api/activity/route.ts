//APP 启动实施活动时就会 从苹果 push 服务 获取 push 的 token ,需要精力 pushtoken 发送给服务器 token对于每个实施活动都是唯一的
//需要更新实时活动是, 可直接通过服务器将 更新 对应 pushtoken 的实时活动 (向 苹果 push 服务 发送 请求)
//APP 接收到 实时活动 后, 会更新 实时活动 的 状态
import { NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import * as https from 'https';
import * as http2 from 'http2';
// import { getDeviceToken } from '../activityAPN/route';

const TEAM_ID = "";
const TOKEN_KEY_FILE_NAME = path.join(process.cwd(), "src", "P8", "test.p8");
const AUTH_KEY_ID = "";
const FALLBACK_DEVICE_TOKEN = "";
const APNS_HOST_NAME = "api.sandbox.push.apple.com";

// 辅助函数：Base64 URL编码
function base64URLEncode(str: string): string {
  return str
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generateAuthToken(): Promise<string> {
  const JWT_ISSUE_TIME = Math.floor(Date.now() / 1000);

  // 创建header
  const header = {
    alg: 'ES256',
    kid: AUTH_KEY_ID
  };
  const JWT_HEADER = base64URLEncode(Buffer.from(JSON.stringify(header)).toString('base64'));

  // 创建claims
  const claims = {
    iss: TEAM_ID,
    iat: JWT_ISSUE_TIME
  };
  const JWT_CLAIMS = base64URLEncode(Buffer.from(JSON.stringify(claims)).toString('base64'));

  // 读取私钥
  const privateKey = await fs.readFile(TOKEN_KEY_FILE_NAME);

  // 签名
  const JWT_HEADER_CLAIMS = `${JWT_HEADER}.${JWT_CLAIMS}`;
  const signature = crypto.createSign('SHA256')
    .update(JWT_HEADER_CLAIMS)
    .sign(privateKey);

  const JWT_SIGNED_HEADER_CLAIMS = base64URLEncode(signature.toString('base64'));

  return `${JWT_HEADER}.${JWT_CLAIMS}.${JWT_SIGNED_HEADER_CLAIMS}`;
}

export async function POST(request: Request): Promise<Response> {
  try {
    // 1. 请求体解析部分
    const rawBody = await request.text();
    console.log('原始请求体:', rawBody);

    const body = JSON.parse(rawBody);
    console.log('解析后的请求体:', body);

    // 2. 参数处理部分
    const storedDeviceToken = ''//getDeviceToken();
    const pushToken = body.pushToken || storedDeviceToken || FALLBACK_DEVICE_TOKEN;
    const apns_topic =  body.apns_topic || '';
    const apns_priority = body.apns_priority || '10';
    const event = body.event || 'update';
    const contentState = typeof body.contentState === 'string' 
      ? JSON.parse(body.contentState)
      : body.contentState || {
        "endTime": 759810093.822517,
        "isRunning": false,
        "completedCount": 2,
        "currentPhase": "work",
        "totalTime": 2000,
        "elapsedTime": 1000
      };

    console.log('完整的设备令牌:', pushToken);
    console.log('apns_topic:', apns_topic);
    console.log('apns_priority:', apns_priority);
    console.log('event:', event);
    console.log('contentState:', contentState);


    // 3. 生成认证token
    const authToken = await generateAuthToken();
        
    // 4. 构建推送消息payload
    const payload = {
      aps: {
        timestamp: Math.floor(Date.now() / 1000),
        event: event,
        "content-state": contentState,
        // "attributes-type": "TomatoClockAttributes",
        // "attributes": {
        //     "endTime": 759810093.822517,
        //     "currentPhase": "work",
        //     "elapsedTime": 1000,
        //     "totalTime": 2000,
        //     "isRunning": true,
        //     "completedCount": 9
        // },
        // "alert": {
        //     title: {
        //         "loc-key": "%@ is knocked down!",
        //         "loc-args": ["Power Panda"]
        //     },
        //     body: {
        //         "loc-key": "Use a potion to heal %@!",
        //         "loc-args": ["Power Panda"]
        //     },
        //     sound: "HeroDown.mp4"
        // }
      }
    };

    //先将请求数据更新到前端页面上

    // 5. HTTP/2 请求处理
    const response = await new Promise<Response>((resolve, reject) => {
      const client = http2.connect(`https://${APNS_HOST_NAME}`);
      console.log('aaaclient:', client);
      client.on('error', (err) => {
        console.error('HTTP/2 client error:', err);
        resolve(NextResponse.json({
          success: false,
          error: err.message
        }, { status: 500 }));
      });

      const req = client.request({
        ':method': 'POST',
        ':path': `/3/device/${pushToken}`,
        'authorization': `bearer ${authToken}`,
        'apns-topic': apns_topic,
        'apns-priority': apns_priority,
        'apns-push-type': 'liveactivity',
        'content-type': 'application/json',
      });

      let responseData = '';
      let statusCode: number;

      req.on('response', (headers) => {
        console.log('收到响应头:', headers);
        statusCode = headers[':status'] as number;
        console.log('状态码:', statusCode);
      });

      req.on('data', (chunk) => {
        responseData += chunk;
      });

      req.on('end', () => {
        client.close();
        console.log('APNS响应:', responseData || '空响应（这是正常的）');
        console.log('APNS状态码:', statusCode);

        if (statusCode === 200) {
          resolve(NextResponse.json({
            success: true,
            message: '推送请求已成功发送',
            statusCode,
            responseData: responseData || null
          }));
        } else {
          resolve(NextResponse.json({
            success: false,
            message: '推送请求失败',
            statusCode,
            error: responseData || '未知错误',
          }, { status: statusCode || 500 }));
        }
      });

      req.on('error', (err) => {
        client.close();
        console.error('请求错误:', err);
        resolve(NextResponse.json({
          success: false,
          error: err.message
        }, { status: 500 }));
      });

      console.log('发送的payload:', JSON.stringify(payload, null, 2));
      req.write(JSON.stringify(payload));
      req.end();
    });

    return response;

  } catch (error) {
    console.error('处理请求时出错:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

export async function GET(): Promise<Response> {
  return NextResponse.json({
    success: true,
    message: 'API 正常运行'
  });
}

