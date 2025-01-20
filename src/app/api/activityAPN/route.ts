import { NextResponse } from 'next/server';

var deviceToken = '';

export async function POST(request: Request): Promise<NextResponse> {
    const body = await request.json();
    console.log('body:', body);
    
    if (!body.devicetoken) {
        return NextResponse.json({ 
            error: '设备令牌不能为空',
            status: 400 
        }, { status: 400 });
    }
    
    deviceToken = body.devicetoken;
    console.log('Updated deviceToken:', deviceToken);
    
    return NextResponse.json({ 
        message: 'Activity APN API is working',
        deviceToken: deviceToken 
    });
}

export function getDeviceToken() {
    return deviceToken;
}
