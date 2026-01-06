'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Submission } from '@/lib/types';

export default function UploadPage() {
    const router = useRouter();
    const [employeeName, setEmployeeName] = useState('');
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [error, setError] = useState('');

    useEffect(() => {
        const name = sessionStorage.getItem('employeeName');
        if (!name) {
            router.push('/');
            return;
        }
        setEmployeeName(name);
        fetchSubmission(name);
    }, [router]);

    const fetchSubmission = async (name: string) => {
        try {
            const response = await fetch(`/api/submissions?name=${encodeURIComponent(name)}`);
            const data = await response.json();
            if (data.success) {
                setSubmission(data.submission);
            }
        } catch (err) {
            console.error('Failed to fetch submission:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // 验证文件大小（最大 10MB）
            const maxSize = 10 * 1024 * 1024; // 10MB in bytes
            if (file.size > maxSize) {
                setError(`照片文件过大！不能超过 10MB，当前文件大小：${(file.size / 1024 / 1024).toFixed(2)}MB`);
                return;
            }

            // 验证文件类型
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                setError('请上传 JPG 或 PNG 格式的图片');
                return;
            }

            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !employeeName) return;

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('employeeName', employeeName);
            formData.append('photo', selectedFile);

            const response = await fetch('/api/submissions', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setSubmission(data.submission);
                setSelectedFile(null);
                setPreviewUrl('');
            } else {
                setError(data.message || '上传失败');
            }
        } catch (err) {
            setError('上传失败，请重试');
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('employeeName');
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    // 状态 3: 已有 3D 模型
    if (submission?.model_url) {
        return (
            <div className="min-h-screen p-6">
                <div className="container max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold">您的 3D 礼品</h1>
                        <button onClick={handleLogout} className="btn-secondary">
                            退出
                        </button>
                    </div>

                    <div className="glass-card p-8 fade-in">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 font-semibold mb-4">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                已完成
                            </div>
                            <p className="text-gray-300">您的专属 3D 礼品已经制作完成！</p>
                        </div>

                        <div className="bg-black/30 rounded-2xl overflow-hidden" style={{ height: '600px' }}>
                            <model-viewer
                                src={submission.model_url}
                                alt="3D Model"
                                auto-rotate
                                camera-controls
                                style={{ width: '100%', height: '100%' }}
                                loading="eager"
                            ></model-viewer>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">🎮</span>
                                    <div className="text-sm text-gray-300">
                                        <p className="font-semibold mb-2">如何操作 3D 模型</p>
                                        <ul className="space-y-1 text-gray-400">
                                            <li>• <strong>旋转：</strong>鼠标左键拖拽</li>
                                            <li>• <strong>缩放：</strong>鼠标滚轮</li>
                                            <li>• <strong>移动：</strong>鼠标右键拖拽</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center text-sm text-gray-400">
                                <p>🎉 恭喜！您的专属 3D 礼品已制作完成</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 状态 2: 已上传照片，等待处理
    if (submission?.photo_url && !submission.model_url) {
        return (
            <div className="min-h-screen p-6">
                <div className="container max-w-2xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold">照片已提交</h1>
                        <button onClick={handleLogout} className="btn-secondary">
                            退出
                        </button>
                    </div>

                    <div className="glass-card p-8 fade-in">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-semibold mb-4 pulse">
                                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                                等待 3D 建模
                            </div>
                            <p className="text-gray-300 mb-2 text-lg">您的照片已成功提交！</p>
                            <p className="text-sm text-gray-400 mb-4">Sculptify 团队正在为您制作专属 3D 礼品</p>

                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mt-6 max-w-md mx-auto">
                                <div className="flex items-start gap-3 text-left">
                                    <span className="text-xl">⏱️</span>
                                    <div className="text-sm text-gray-300">
                                        <p className="font-semibold mb-1">预计制作时间</p>
                                        <p className="text-gray-400">通常需要 1-3 个工作日，完成后您将在此页面看到 3D 模型预览。</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <img
                                src={submission.photo_url}
                                alt="Uploaded photo"
                                className="w-full max-w-md mx-auto rounded-xl shadow-2xl"
                            />
                        </div>

                        <button
                            onClick={() => {
                                setSubmission(null);
                            }}
                            className="btn-secondary w-full"
                        >
                            更换照片
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 状态 1: 未上传照片
    return (
        <div className="min-h-screen p-6">
            <div className="container max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">上传照片</h1>
                        <p className="text-gray-400 mt-1">欢迎，{employeeName}</p>
                    </div>
                    <button onClick={handleLogout} className="btn-secondary">
                        退出
                    </button>
                </div>

                {/* 操作步骤提示 */}
                <div className="glass-card p-6 mb-6 fade-in">
                    <div className="flex items-start gap-3 mb-4">
                        <span className="text-2xl">📝</span>
                        <div>
                            <h2 className="text-lg font-semibold mb-2">操作步骤</h2>
                            <ol className="space-y-2 text-gray-300 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-400 font-bold min-w-[20px]">1.</span>
                                    <span>上传一张清晰的正面照片（建议使用纯色背景）</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-400 font-bold min-w-[20px]">2.</span>
                                    <span>确认照片无误后点击"确认上传"</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-400 font-bold min-w-[20px]">3.</span>
                                    <span>等待 Sculptify 团队为您制作专属 3D 礼品</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-400 font-bold min-w-[20px]">4.</span>
                                    <span>完成后即可在此页面预览您的 3D 模型</span>
                                </li>
                            </ol>
                        </div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mt-4">
                        <div className="flex items-start gap-2 text-blue-300 text-sm">
                            <span>💡</span>
                            <p><strong>温馨提示：</strong>照片越清晰，3D 模型效果越好！支持 JPG、PNG 格式。</p>
                        </div>
                    </div>
                </div>

                {/* 照片要求说明 */}
                <div className="glass-card p-6 mb-6 fade-in">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span>📸</span>
                        照片拍摄要求
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {/* 正面照片 */}
                        <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-2xl">👤</span>
                                <h3 className="font-semibold text-purple-300">正面照片</h3>
                            </div>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-400 mt-1">•</span>
                                    <span>面部正对镜头</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-400 mt-1">•</span>
                                    <span>光线均匀，表情自然</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-400 mt-1">•</span>
                                    <span>不戴帽子和墨镜</span>
                                </li>
                            </ul>
                        </div>

                        {/* 光线充足 */}
                        <div className="bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-2xl">💡</span>
                                <h3 className="font-semibold text-yellow-300">光线充足</h3>
                            </div>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex items-start gap-2">
                                    <span className="text-yellow-400 mt-1">•</span>
                                    <span>避免强光直射</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-yellow-400 mt-1">•</span>
                                    <span>避免逆光拍摄</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-yellow-400 mt-1">•</span>
                                    <span>确保面部无明显阴影</span>
                                </li>
                            </ul>
                        </div>

                        {/* 图像质量 */}
                        <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-2xl">✨</span>
                                <h3 className="font-semibold text-green-300">图像质量</h3>
                            </div>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">•</span>
                                    <span>照片清晰对焦</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">•</span>
                                    <span>分辨率不低于 1000x1000</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">•</span>
                                    <span>避免模糊或过度压缩</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-8 fade-in">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">上传您的照片</h2>
                        <p className="text-gray-400 text-sm">
                            请上传一张清晰的照片，我们将为您制作专属 3D 礼品
                        </p>
                    </div>

                    {!selectedFile ? (
                        <label className="upload-zone block">
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/jpg"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <div className="flex flex-col items-center gap-4">
                                <svg
                                    className="w-16 h-16 text-purple-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                </svg>
                                <div className="text-center">
                                    <p className="text-lg font-semibold mb-1">点击或拖拽上传</p>
                                    <p className="text-sm text-gray-400">支持 JPG、PNG 格式</p>
                                </div>
                            </div>
                        </label>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full rounded-xl shadow-2xl"
                                />
                                <button
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setPreviewUrl('');
                                    }}
                                    className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-2 transition"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="btn-primary w-full disabled:opacity-50"
                            >
                                {uploading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="spinner w-5 h-5 border-2"></div>
                                        <span>上传中...</span>
                                    </div>
                                ) : (
                                    '确认上传'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
