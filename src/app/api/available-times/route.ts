import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');

    if (!dateStr) {
        return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Parse date
    const selectedDate = new Date(dateStr);
    selectedDate.setHours(0, 0, 0, 0);

    // Get custom schedule if any
    let schedule = await prisma.schedule.findFirst({
        where: { date: selectedDate }
    });

    // Default schedule: 09:00 to 17:00
    if (!schedule) {
        schedule = {
            id: "default",
            date: selectedDate,
            startTime: "09:00",
            endTime: "17:00",
            isClosed: [0, 6].includes(selectedDate.getDay()), // Closed on weekends
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    if (schedule.isClosed) {
        return NextResponse.json({ availableSlots: [] });
    }

    // Get booked appointments for this date
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const bookedAppointments = await prisma.appointment.findMany({
        where: {
            date: {
                gte: selectedDate,
                lt: nextDay
            },
            status: 'CONFIRMED'
        }
    });

    const bookedTimes = bookedAppointments.map(a => a.startTime);

    // Generate 30-min slots
    const slots: string[] = [];
    const startHour = parseInt(schedule.startTime.split(':')[0]);
    const startMin = parseInt(schedule.startTime.split(':')[1]);
    const endHour = parseInt(schedule.endTime.split(':')[0]);
    const endMin = parseInt(schedule.endTime.split(':')[1]);

    let current = new Date(selectedDate);
    current.setHours(startHour, startMin, 0, 0);

    const end = new Date(selectedDate);
    end.setHours(endHour, endMin, 0, 0);

    // Don't generate slots in the past if checking today's date
    const now = new Date();

    while (current < end) {
        const hh = current.getHours().toString().padStart(2, '0');
        const mm = current.getMinutes().toString().padStart(2, '0');
        const timeStr = `${hh}:${mm}`;

        const isPast = (selectedDate.toDateString() === now.toDateString()) && (current < now);

        if (!bookedTimes.includes(timeStr) && !isPast) {
            slots.push(timeStr);
        }

        // Add 30 mins
        current.setMinutes(current.getMinutes() + 30);
    }

    return NextResponse.json({ availableSlots: slots });
}
