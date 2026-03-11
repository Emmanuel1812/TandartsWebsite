import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const startStr = searchParams.get('start');
    const endStr = searchParams.get('end');

    let whereClause = {};
    if (startStr && endStr) {
        whereClause = {
            date: {
                gte: new Date(startStr),
                lte: new Date(endStr)
            }
        };
    }

    const schedules = await prisma.schedule.findMany({
        where: whereClause,
        orderBy: { date: 'asc' }
    });

    return NextResponse.json({ schedules });
}

export async function POST(request: Request) {
    try {
        const { date, startTime, endTime, isClosed } = await request.json();

        if (!date) {
            return NextResponse.json({ error: 'Date is required' }, { status: 400 });
        }

        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const existing = await prisma.schedule.findFirst({
            where: {
                date: { gte: selectedDate, lt: nextDay }
            }
        });

        let schedule;
        if (existing) {
            schedule = await prisma.schedule.update({
                where: { id: existing.id },
                data: {
                    startTime: startTime || existing.startTime,
                    endTime: endTime || existing.endTime,
                    isClosed: isClosed !== undefined ? isClosed : existing.isClosed
                }
            });
        } else {
            schedule = await prisma.schedule.create({
                data: {
                    date: selectedDate,
                    startTime: startTime || '09:00',
                    endTime: endTime || '17:00',
                    isClosed: isClosed || false
                }
            });
        }

        return NextResponse.json({ success: true, schedule });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
