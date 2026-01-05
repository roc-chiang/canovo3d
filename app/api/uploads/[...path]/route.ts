import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function GET(
    request: NextRequest,
    context: any
) {
    try {
        // 兼容不同版本的 Next.js
        const params = context.params.path ? context.params : await context.params;
        const filePath = params.path.join('/');
        const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
        const fullPath = path.join(uploadDir, filePath);

        console.log('[File Serve] Request:', {
            filePath,
            uploadDir,
            fullPath,
            exists: existsSync(fullPath)
        });

        // 安全检查：确保文件在 uploads 目录内
        const normalizedPath = path.normalize(fullPath);
        const normalizedUploadDir = path.normalize(uploadDir);

        if (!normalizedPath.startsWith(normalizedUploadDir)) {
            console.error('[File Serve] Access denied:', normalizedPath);
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        // 检查文件是否存在
        if (!existsSync(fullPath)) {
            console.error('[File Serve] File not found:', fullPath);
            return NextResponse.json(
                { error: 'File not found', path: fullPath },
                { status: 404 }
            );
        }

        // 读取文件
        const fileBuffer = await fs.readFile(fullPath);

        // 根据文件扩展名设置 Content-Type
        const ext = path.extname(fullPath).toLowerCase();
        const contentTypeMap: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.glb': 'model/gltf-binary',
            '.gltf': 'model/gltf+json',
        };

        const contentType = contentTypeMap[ext] || 'application/octet-stream';

        console.log('[File Serve] Success:', {
            path: fullPath,
            contentType,
            size: fileBuffer.length
        });

        // 返回文件
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('[File Serve] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: String(error) },
            { status: 500 }
        );
    }
}
