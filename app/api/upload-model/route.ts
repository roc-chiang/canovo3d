import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 配置 API 路由以支持大文件上传（最大 50MB）
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '50mb',
        },
    },
};

// Next.js 14+ App Router 配置
export const runtime = 'nodejs';
export const maxDuration = 60; // 最长执行时间 60 秒


export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const employeeName = formData.get('employeeName') as string;
        const model = formData.get('model') as File;

        if (!employeeName || !model) {
            return NextResponse.json(
                { success: false, message: '缺少必要参数' },
                { status: 400 }
            );
        }

        // 上传 GLB 模型到本地存储
        // 使用 Base64 编码员工姓名以避免中文字符问题
        const encodedName = Buffer.from(employeeName).toString('base64').replace(/[+/=]/g, '');
        const fileName = `model_${encodedName}_${Date.now()}.glb`;

        // 保存到本地文件系统
        const { saveFile } = await import('@/lib/storage');
        const modelUrl = await saveFile(model, 'models', fileName);

        // 更新提交记录
        const { data, error } = await supabase
            .from('submissions')
            .update({
                model_url: modelUrl,
                status: 'completed',
                updated_at: new Date().toISOString(),
            })
            .eq('employee_name', employeeName)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            submission: data,
        });
    } catch (error) {
        console.error('Upload model error:', error);
        return NextResponse.json(
            { success: false, message: '上传模型失败，请重试' },
            { status: 500 }
        );
    }
}
