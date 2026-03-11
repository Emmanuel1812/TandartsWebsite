import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_development_only_please_change');

export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('admin_session');

        if (!sessionCookie) {
            return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
        }

        const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET);
        return NextResponse.json(payload);
    } catch (error) {
        return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }
}
