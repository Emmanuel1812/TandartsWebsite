import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_development_only_please_change');

export async function POST(request: Request) {
    const { email, password } = await request.json();

    if (!email || !password) {
        return NextResponse.json({ error: 'Vul alle velden in' }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return NextResponse.json({ error: 'Ongeldige inloggegevens' }, { status: 401 });
        }

        // Validate role (Admin or Worker)
        if (user.role !== 'ADMIN' && user.role !== 'WORKER') {
             return NextResponse.json({ error: 'Toegang geweigerd. Geen beheerdersrechten.' }, { status: 403 });
        }

        const token = await new SignJWT({ userId: user.id, role: user.role, email: user.email, name: user.name })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(JWT_SECRET);

        const response = NextResponse.json({ success: true, role: user.role });
        response.cookies.set('admin_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 // 1 day
        });
        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Interne server fout' }, { status: 500 });
    }
}

export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('admin_session');
    return response;
}
