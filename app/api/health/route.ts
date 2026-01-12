import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 健康检查端点 - 用于保持 Supabase 活跃
export async function GET() {
    try {
        // 执行一个简单的数据库查询
        const { data, error } = await supabase
            .from('employees')
            .select('count')
            .limit(1);

        if (error) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Database connection failed',
                    error: error.message
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            status: 'ok',
            message: 'Database is active',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'error',
                message: 'Health check failed',
                error: String(error)
            },
            { status: 500 }
        );
    }
}
