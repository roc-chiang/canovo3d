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
            .select('photo_url, model_url')
            .eq('employee_name', employeeName)
            .single();

        if (fetchError || !submission) {
            return NextResponse.json(
                { success: false, message: '未找到提交记录' },
                { status: 404 }
            );
        }

        // 如果有照片文件，删除本地文件
        if (submission.photo_url) {
            try {
                // 从 URL 提取文件名
                const url = new URL(submission.photo_url, 'http://localhost');
                const fileName = path.basename(url.pathname);
                const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
                const filePath = path.join(uploadDir, 'photos', fileName);

                if (existsSync(filePath)) {
                    await fs.unlink(filePath);
                    console.log('[Delete Photo] File deleted:', filePath);
                }
            } catch (fileError) {
                console.error('[Delete Photo] File deletion error:', fileError);
                // 继续执行，即使文件删除失败也要更新数据库
            }
        }

        // 如果有模型，也一起删除
        if (submission.model_url) {
            try {
                const url = new URL(submission.model_url, 'http://localhost');
                const fileName = path.basename(url.pathname);
                const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
                const filePath = path.join(uploadDir, 'models', fileName);

                if (existsSync(filePath)) {
                    await fs.unlink(filePath);
                    console.log('[Delete Photo] Model file also deleted:', filePath);
                }
            } catch (fileError) {
                console.error('[Delete Photo] Model deletion error:', fileError);
            }
        }

        // 删除数据库记录（完全删除，让员工重新上传）
        const { error: deleteError } = await supabase
            .from('submissions')
            .delete()
            .eq('employee_name', employeeName);

        if (deleteError) throw deleteError;

        return NextResponse.json({
            success: true,
            message: '照片已删除，员工可以重新上传',
        });
    } catch (error) {
        console.error('Delete photo error:', error);
        return NextResponse.json(
            { success: false, message: '删除照片失败，请重试' },
            { status: 500 }
        );
    }
}
