import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function getOrCreateSyncText() {
    let syncText = await prisma.syncText.findFirst();
    if (!syncText) {
        syncText = await prisma.syncText.create({
            data: {}
        });
    }
    return syncText;
}

export async function GET(): Promise<Response> {
    try {
        const syncText = await getOrCreateSyncText();
        return NextResponse.json({
            success: true,
            data: {
                text: syncText.text,
                updateTime: syncText.updateTime.toISOString()
            }
        });
    } catch (error) {
        console.error('读取数据失败:', error);
        return NextResponse.json({
            success: false,
            error: '读取数据失败'
        }, { status: 500 });
    }
}

export async function POST(request: Request): Promise<Response> {
    try {
        const body = await request.json();
        const { text } = body;

        if (typeof text !== 'string') {
            return NextResponse.json({
                success: false,
                error: '无效的文本格式'
            }, { status: 400 });
        }

        const syncText = await getOrCreateSyncText();
        const updatedText = await prisma.syncText.update({
            where: { id: syncText.id },
            data: {
                text,
                updateTime: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                text: updatedText.text,
                updateTime: updatedText.updateTime.toISOString()
            }
        });
    } catch (error) {
        console.error('保存数据失败:', error);
        return NextResponse.json({
            success: false,
            error: '保存数据失败'
        }, { status: 500 });
    }
}

export async function DELETE(): Promise<Response> {
    try {
        const syncText = await getOrCreateSyncText();
        const clearedText = await prisma.syncText.update({
            where: { id: syncText.id },
            data: {
                text: '',
                updateTime: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                text: clearedText.text,
                updateTime: clearedText.updateTime.toISOString()
            }
        });
    } catch (error) {
        console.error('清除数据失败:', error);
        return NextResponse.json({
            success: false,
            error: '清除数据失败'
        }, { status: 500 });
    }
}  