import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
    try {
        const { employeeName } = await request.json();

        if (!employeeName) {
            return NextResponse.json(
                { success: false, message: '缺少员工姓名' },
                { status: 400 }
            );
        }

        // 获取当前的提交记录
        const { data: submission, error: fetchError } = await supabase
            .from('submissions')
            .select('model_url')
            .eq('employee_name', employeeName)
            .single();

        if (fetchError || !submission) {
            return NextResponse.json(
                { success: false, message: '未找到提交记录' },
                { status: 404 }
            );
        }

        // 如果有模型文件，删除本地文件
        if (submission.model_url) {
            try {
                // 从 URL 提取文件名
                const url = new URL(submission.model_url, 'http://localhost');
                const fileName = path.basename(url.pathname);
                const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
                const filePath = path.join(uploadDir, 'models', fileName);

                if (existsSync(filePath)) {
                    await fs.unlink(filePath);
                    console.log('[Delete Model] File deleted:', filePath);
                }
            } catch (fileError) {
                console.error('[Delete Model] File deletion error:', fileError);
                // 继续执行，即使文件删除失败也要更新数据库
            }
        }

        // 更新数据库记录，移除模型 URL 并重置状态
        const { data, error } = await supabase
            .from('submissions')
            .update({
                model_url: null,
                status: 'pending',
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
        console.error('Delete model error:', error);
        return NextResponse.json(
            { success: false, message: '删除模型失败，请重试' },
            { status: 500 }
        );
    }
}
