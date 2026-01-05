'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Submission } from '@/lib/types';
import employeeList from '@/lib/employees.json';

export default function AdminPage() {
    const router = useRouter();
    const [authenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadingFor, setUploadingFor] = useState<string | null>(null);
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // 简单密码验证（生产环境应使用更安全的方式）
        if (password === 'sculptify2025') {
            setAuthenticated(true);
            sessionStorage.setItem('adminAuth', 'true');
            fetchAllSubmissions();
        } else {
            setError('密码错误');
        }
    };

    useEffect(() => {
        const auth = sessionStorage.getItem('adminAuth');
        if (auth === 'true') {
            setAuthenticated(true);
            fetchAllSubmissions();
        }
    }, []);

    const fetchAllSubmissions = async () => {
        setLoading(true);
        try {
            // 为每个员工获取提交状态
            const promises = employeeList.map(async (name) => {
                const response = await fetch(`/api/submissions?name=${encodeURIComponent(name)}`);
                const data = await response.json();
                return data.submission || { employee_name: name, status: 'none' };
            });

            const results = await Promise.all(promises);
            setSubmissions(results);
        } catch (err) {
            console.error('Failed to fetch submissions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPhoto = (photoUrl: string, employeeName: string) => {
        const link = document.createElement('a');
        link.href = photoUrl;
        link.download = `${employeeName}-photo.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUploadModel = async (employeeName: string, file: File) => {
        setUploadingFor(employeeName);
        setError('');

        // 验证文件类型
        if (!file.name.toLowerCase().endsWith('.glb')) {
            setError('请上传 .glb 格式的 3D 模型文件');
            setUploadingFor(null);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('employeeName', employeeName);
            formData.append('model', file);

            const response = await fetch('/api/upload-model', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                // 刷新列表
                await fetchAllSubmissions();
            } else {
                setError(data.message || '上传失败');
            }
        } catch (err) {
            setError('上传失败，请重试');
        } finally {
            setUploadingFor(null);
        }
    };

    const handleDeleteModel = async (employeeName: string) => {
        if (!confirm(`确定要删除 ${employeeName} 的 3D 模型吗？删除后员工将重新看到"等待处理"状态。`)) {
            return;
        }

        setError('');

        try {
            const response = await fetch('/api/delete-model', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeName }),
            });

            const data = await response.json();

            if (data.success) {
                // 刷新列表
                await fetchAllSubmissions();
            } else {
                setError(data.message || '删除失败');
            }
        } catch (err) {
            setError('删除失败，请重试');
        }
    };

    const handleDeletePhoto = async (employeeName: string) => {
        if (!confirm(`确定要删除 ${employeeName} 的照片吗？\n\n删除后：\n- 照片和模型文件都将被删除\n- 员工可以重新上传新照片\n- 此操作不可撤销`)) {
            return;
        }

        setError('');

        try {
            const response = await fetch('/api/delete-photo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeName }),
            });

            const data = await response.json();

            if (data.success) {
                // 刷新列表
                await fetchAllSubmissions();
            } else {
                setError(data.message || '删除失败');
            }
        } catch (err) {
            setError('删除失败，请重试');
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminAuth');
        setAuthenticated(false);
        setPassword('');
    };

    const getStatusInfo = (submission: any) => {
        if (!submission.photo_url) {
            return { text: '未上传', class: 'status-badge status-pending', icon: '🔴' };
        }
        if (submission.photo_url && !submission.model_url) {
            return { text: '待处理', class: 'status-badge status-processing', icon: '🟡' };
        }
        return { text: '已完成', class: 'status-badge status-completed', icon: '🟢' };
    };

    if (!authenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="glass-card p-8 md:p-12 w-full max-w-md fade-in">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">管理员登录</h1>
                        <p className="text-gray-400">Sculptify Admin</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">
                                管理员密码
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="请输入管理员密码"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button type="submit" className="btn-primary w-full">
                            登录
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">管理面板</h1>
                        <p className="text-gray-400">Sculptify Admin Dashboard</p>
                    </div>
                    <button onClick={handleLogout} className="btn-secondary">
                        退出登录
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <div className="glass-card p-6 fade-in">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">员工列表</h2>
                            <button
                                onClick={fetchAllSubmissions}
                                className="btn-secondary text-sm py-2 px-4"
                            >
                                刷新
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full table-fixed">
                                <thead>
                                    <tr className="border-b-2 border-white/20">
                                        <th className="text-left py-5 px-6 font-semibold text-base w-32">姓名</th>
                                        <th className="text-left py-5 px-6 font-semibold text-base w-36">状态</th>
                                        <th className="text-left py-5 px-6 font-semibold text-base w-32">照片</th>
                                        <th className="text-left py-5 px-6 font-semibold text-base">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map((submission) => {
                                        const status = getStatusInfo(submission);
                                        return (
                                            <tr
                                                key={submission.employee_name}
                                                className="border-b border-white/5 hover:bg-white/5 transition"
                                            >
                                                <td className="py-5 px-6 font-medium text-base">
                                                    {submission.employee_name}
                                                </td>
                                                <td className="py-5 px-6">
                                                    <span className={status.class}>
                                                        <span>{status.icon}</span>
                                                        {status.text}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-6">
                                                    {submission.photo_url ? (
                                                        <img
                                                            src={submission.photo_url}
                                                            alt="Photo"
                                                            className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:scale-110 transition"
                                                            onClick={() => submission.photo_url && window.open(submission.photo_url, '_blank')}
                                                        />
                                                    ) : (
                                                        <span className="text-gray-500 text-sm">无</span>
                                                    )}
                                                </td>
                                                <td className="py-5 px-6">
                                                    <div className="flex flex-wrap gap-2">
                                                        {submission.photo_url && !submission.model_url && (
                                                            <>
                                                                <button
                                                                    onClick={() =>
                                                                        handleDownloadPhoto(
                                                                            submission.photo_url!,
                                                                            submission.employee_name
                                                                        )
                                                                    }
                                                                    className="btn-secondary btn-sm"
                                                                >
                                                                    下载照片
                                                                </button>
                                                                <label className="btn-primary btn-sm cursor-pointer">
                                                                    {uploadingFor === submission.employee_name ? (
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="spinner w-4 h-4 border-2"></div>
                                                                            <span>上传中...</span>
                                                                        </div>
                                                                    ) : (
                                                                        '上传模型'
                                                                    )}
                                                                    <input
                                                                        type="file"
                                                                        accept=".glb"
                                                                        className="hidden"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) {
                                                                                handleUploadModel(submission.employee_name, file);
                                                                            }
                                                                        }}
                                                                        disabled={uploadingFor === submission.employee_name}
                                                                    />
                                                                </label>
                                                                <button
                                                                    onClick={() => handleDeletePhoto(submission.employee_name)}
                                                                    className="bg-orange-500/80 hover:bg-orange-500 text-white btn-sm transition"
                                                                    title="删除照片，让员工重新上传"
                                                                >
                                                                    删除照片
                                                                </button>
                                                            </>
                                                        )}
                                                        {submission.model_url && (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        // 临时设置员工名到 sessionStorage，然后跳转到预览页面
                                                                        sessionStorage.setItem('employeeName', submission.employee_name);
                                                                        window.open('/upload', '_blank');
                                                                    }}
                                                                    className="btn-secondary btn-sm"
                                                                >
                                                                    预览模型
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteModel(submission.employee_name)}
                                                                    className="bg-red-500/80 hover:bg-red-500 text-white btn-sm transition"
                                                                >
                                                                    删除模型
                                                                </button>
                                                            </>
                                                        )}
                                                        {!submission.photo_url && (
                                                            <span className="text-gray-500 text-sm">等待员工上传</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="glass-card p-4">
                                    <div className="text-3xl font-bold text-red-400">
                                        {submissions.filter((s) => !s.photo_url).length}
                                    </div>
                                    <div className="text-sm text-gray-400 mt-1">未上传</div>
                                </div>
                                <div className="glass-card p-4">
                                    <div className="text-3xl font-bold text-yellow-400">
                                        {submissions.filter((s) => s.photo_url && !s.model_url).length}
                                    </div>
                                    <div className="text-sm text-gray-400 mt-1">待处理</div>
                                </div>
                                <div className="glass-card p-4">
                                    <div className="text-3xl font-bold text-green-400">
                                        {submissions.filter((s) => s.model_url).length}
                                    </div>
                                    <div className="text-sm text-gray-400 mt-1">已完成</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
