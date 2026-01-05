import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 配置 API 路由以支持图片上传（最大 10MB）
export const runtime = 'nodejs';
export const maxDuration = 30;


export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const employeeName = searchParams.get('name');

        if (!employeeName) {
            return NextResponse.json(
                { success: false, message: '缺少员工姓名' },
                { status: 400 }
            );
        }

        // 查询提交记录
        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .eq('employee_name', employeeName)
            .single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 是 "not found" 错误
            throw error;
        }

        return NextResponse.json({
            success: true,
            submission: data || null,
        });
    } catch (error) {
        console.error('Get submission error:', error);
        return NextResponse.json(
            { success: false, message: '获取提交状态失败' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const employeeName = formData.get('employeeName') as string;
        const photo = formData.get('photo') as File;

        if (!employeeName || !photo) {
            return NextResponse.json(
                { success: false, message: '缺少必要参数' },
                { status: 400 }
            );
        }

        // 上传照片到本地存储
        // 使用 Base64 编码员工姓名以避免中文字符问题
        const fileExt = photo.name.split('.').pop();
        const encodedName = Buffer.from(employeeName).toString('base64').replace(/[+/=]/g, '');
        const fileName = `photo_${encodedName}_${Date.now()}.${fileExt}`;

        // 保存到本地文件系统
        const { saveFile } = await import('@/lib/storage');
        const photoUrl = await saveFile(photo, 'photos', fileName);

        // 检查是否已有提交记录
        const { data: existingSubmission } = await supabase
            .from('submissions')
            .select('id')
            .eq('employee_name', employeeName)
            .single();

        let submission;

        if (existingSubmission) {
            // 更新现有记录
            const { data, error } = await supabase
                .from('submissions')
                .update({
                    photo_url: photoUrl,
                    updated_at: new Date().toISOString(),
                })
                .eq('employee_name', employeeName)
                .select()
                .single();

            if (error) throw error;
            submission = data;
        } else {
            // 创建新记录
            const { data, error } = await supabase
                .from('submissions')
                .insert({
                    employee_name: employeeName,
                    photo_url: photoUrl,
                    status: 'pending',
                })
                .select()
                .single();

            if (error) throw error;
            submission = data;
        }

        return NextResponse.json({
            success: true,
            submission,
        });
    } catch (error) {
        console.error('Upload photo error:', error);
        return NextResponse.json(
            { success: false, message: '上传失败，请重试' },
            { status: 500 }
        );
    }
}
