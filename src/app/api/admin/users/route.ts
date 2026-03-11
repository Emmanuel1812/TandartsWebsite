import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            where: {
                role: { in: ['ADMIN', 'WORKER'] }
            },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        return NextResponse.json(users);
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return NextResponse.json({ error: 'Interne server fout' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { name, email, password, role } = await request.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'Vul alle velden in' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'Dit e-mailadres is al in gebruik' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role
            },
            select: { id: true, name: true, email: true, role: true }
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error('Failed to create user:', error);
        return NextResponse.json({ error: 'Interne server fout' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
         const { id } = await request.json();
         if (!id) return NextResponse.json({ error: 'Geen ID opgegeven' }, { status: 400 });

         await prisma.user.delete({ where: { id } });
         return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete user:', error);
        return NextResponse.json({ error: 'Interne server fout' }, { status: 500 });
    }
}
