import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

// 获取上传目录路径
const getUploadDir = () => {
    return process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
};

// 确保目录存在
export async function ensureDir(dirPath: string) {
    if (!existsSync(dirPath)) {
        await fs.mkdir(dirPath, { recursive: true });
    }
}

// 保存文件到本地
export async function saveFile(
    file: File,
    category: 'photos' | 'models',
    fileName: string
): Promise<string> {
    const uploadDir = getUploadDir();
    const categoryDir = path.join(uploadDir, category);

    // 确保目录存在
    await ensureDir(categoryDir);

    // 保存文件
    const filePath = path.join(categoryDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // 返回公开访问 URL（通过 API 路由访问）
    const baseUrl = process.env.NEXT_PUBLIC_FILE_BASE_URL || '';
    return `${baseUrl}/api/uploads/${category}/${fileName}`;
}

// 删除文件
export async function deleteFile(fileUrl: string): Promise<void> {
    try {
        // 从 URL 提取文件路径
        const urlPath = new URL(fileUrl).pathname;
        const filePath = path.join(process.cwd(), 'public', urlPath);

        if (existsSync(filePath)) {
            await fs.unlink(filePath);
        }
    } catch (error) {
        console.error('Delete file error:', error);
    }
}

// 获取文件信息
export async function getFileInfo(filePath: string) {
    try {
        const stats = await fs.stat(filePath);
        return {
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
        };
    } catch (error) {
        return null;
    }
}
