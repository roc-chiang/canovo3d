import { NextRequest, NextResponse } from 'next/server';
import employeeList from '@/lib/employees.json';

const ACCESS_CODE = 'Canovo2025';

export async function POST(request: NextRequest) {
    try {
        const { name, accessCode } = await request.json();

        // 验证访问码
        if (accessCode !== ACCESS_CODE) {
            return NextResponse.json(
                { success: false, message: '访问码错误' },
                { status: 401 }
            );
        }

        // 验证员工姓名
        if (!employeeList.includes(name)) {
            return NextResponse.json(
                { success: false, message: '您不在授权名单中' },
                { status: 403 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json(
            { success: false, message: '验证失败，请重试' },
            { status: 500 }
        );
    }
}
