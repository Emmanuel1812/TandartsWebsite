import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                patient: true
            }
        });

        if (!user || user.password !== password) {
            return NextResponse.json({ error: 'Ongeldig e-mailadres of wachtwoord' }, { status: 401 });
        }

        // In a real app, generate a JWT. For this prototype, we'll return user data to store in local storage.
        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Er ging iets mis bij het inloggen' }, { status: 500 });
    }
}
