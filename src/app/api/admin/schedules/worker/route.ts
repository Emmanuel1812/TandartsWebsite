import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all worker schedules
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const workerId = searchParams.get('workerId');
        
        const whereClause = workerId ? { workerId } : {};

        const schedules = await prisma.workerSchedule.findMany({
            where: whereClause,
            include: {
                worker: {
                    select: { name: true, email: true, role: true }
                }
            },
            orderBy: { date: 'asc' }
        });
        return NextResponse.json(schedules);
    } catch (error) {
        console.error('Failed to fetch worker schedules:', error);
        return NextResponse.json({ error: 'Interne server fout' }, { status: 500 });
    }
}

// Create a new worker schedule/shift
export async function POST(request: Request) {
    try {
        const { workerId, date, startTime, endTime, notes } = await request.json();

        if (!workerId || !date || !startTime || !endTime) {
            return NextResponse.json({ error: 'Vul alle verplichte velden in' }, { status: 400 });
        }

        const parsedDate = new Date(date);
        
        const schedule = await prisma.workerSchedule.create({
            data: {
                workerId,
                date: parsedDate,
                startTime,
                endTime,
                notes
            },
            include: {
                worker: {
                    select: { name: true }
                }
            }
        });

        return NextResponse.json(schedule, { status: 201 });
    } catch (error) {
        console.error('Failed to create worker schedule:', error);
        return NextResponse.json({ error: 'Interne server fout' }, { status: 500 });
    }
}

// Delete a worker schedule
export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        if (!id) return NextResponse.json({ error: 'Geen ID opgegeven' }, { status: 400 });

        await prisma.workerSchedule.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete worker schedule:', error);
        return NextResponse.json({ error: 'Interne server fout' }, { status: 500 });
    }
}
