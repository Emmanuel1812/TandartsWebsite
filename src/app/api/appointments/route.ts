import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { patientName, email, phone, date, startTime, notes, serviceId } = body;

        if (!patientName || !email || !date || !startTime) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);

        // Fetch service to calculate total duration
        let durationMinutes = 30; // default
        if (serviceId) {
            const service = await prisma.service.findUnique({ where: { id: serviceId } });
            if (service) {
                durationMinutes = service.duration + service.setupTime + service.downTime;
            }
        }

        // Calculate endTime
        const [hh, mm] = startTime.split(':').map(Number);
        const endDate = new Date(selectedDate);
        endDate.setHours(hh, mm + durationMinutes, 0, 0);
        const endHH = endDate.getHours().toString().padStart(2, '0');
        const endMM = endDate.getMinutes().toString().padStart(2, '0');
        const endTime = `${endHH}:${endMM}`;

        // Verify slot is still available to prevent double booking race condition
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const existing = await prisma.appointment.findFirst({
            where: {
                date: { gte: selectedDate, lt: nextDay },
                startTime: startTime,
                status: 'CONFIRMED'
            }
        });

        if (existing) {
            return NextResponse.json({ error: 'This timeslot is no longer available' }, { status: 409 });
        }

        const appointment = await prisma.appointment.create({
            data: {
                patientName,
                email,
                phone,
                date: selectedDate,
                startTime,
                endTime,
                notes,
                serviceId: serviceId || null
            }
        });

        return NextResponse.json({ success: true, appointment });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    // Used by Admin
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');

    let whereClause = {};

    if (dateStr) {
        const selectedDate = new Date(dateStr);
        selectedDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);

        whereClause = {
            date: {
                gte: selectedDate,
                lt: nextDay
            }
        };
    } else {
        const monthStr = searchParams.get('month'); // format YYYY-MM
        if (monthStr) {
            const [year, month] = monthStr.split('-').map(Number);
            const startOfMonth = new Date(year, month - 1, 1);
            const startOfNextMonth = new Date(year, month, 1);

            whereClause = {
                date: {
                    gte: startOfMonth,
                    lt: startOfNextMonth
                }
            };
        }
    }

    const appointments = await prisma.appointment.findMany({
        where: whereClause,
        include: {
            service: true
        },
        orderBy: [
            { date: 'asc' },
            { startTime: 'asc' }
        ]
    });

    return NextResponse.json({ appointments });
}
