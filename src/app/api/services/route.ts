import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const services = await prisma.service.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(services);
    } catch (error) {
        console.error("Error fetching services:", error);
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, description, price, duration, setupTime, downTime } = body;

        const newService = await prisma.service.create({
            data: {
                name,
                description,
                price: parseFloat(price) || 0,
                duration: parseInt(duration) || 0,
                setupTime: parseInt(setupTime) || 0,
                downTime: parseInt(downTime) || 0,
            }
        });

        return NextResponse.json(newService, { status: 201 });
    } catch (error) {
        console.error("Error creating service:", error);
        return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
    }
}
