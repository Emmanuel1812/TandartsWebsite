import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
        }

        // Get the patient record to find standard appointments OR just find appointments linked by email
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { patient: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 });
        }

        const appointments = await prisma.appointment.findMany({
            where: {
                OR: [
                    { email: user.email },
                    ...(user.patient ? [{ patientId: user.patient.id }] : [])
                ]
            },
            include: {
                service: true
            },
            orderBy: {
                date: 'asc'
            }
        });

        return NextResponse.json({ appointments, patient: user.patient });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Fout bij ophalen van gegevens' }, { status: 500 });
    }
}
