import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { email, password, voornaam, achternaam, ...patientData } = data;

        // 1. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Een account met dit e-mailadres bestaat al.' }, { status: 400 });
        }

        // 2. Create User auth record
        // In a real app, hash the password using bcrypt. For this prototype, we store it raw so they can log in.
        const user = await prisma.user.create({
            data: {
                email,
                password, // Reminder: Hash this in production!
                name: `${voornaam} ${achternaam}`,
                role: 'PATIENT'
            }
        });

        // 3. Create Patient details record
        const patient = await prisma.patient.create({
            data: {
                userId: user.id,
                voornaam,
                achternaam,
                ...patientData
            }
        });

        return NextResponse.json({ success: true, user, patient }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating patient:', error);
        return NextResponse.json({ error: 'Er ging iets mis bij het inschrijven.' }, { status: 500 });
    }
}
