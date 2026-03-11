import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { name, description, price, duration, setupTime, downTime } = body;

        const updatedService = await prisma.service.update({
            where: { id },
            data: {
                name,
                description,
                price: parseFloat(price) || 0,
                duration: parseInt(duration) || 0,
                setupTime: parseInt(setupTime) || 0,
                downTime: parseInt(downTime) || 0,
            }
        });

        return NextResponse.json(updatedService);
    } catch (error) {
        console.error("Error updating service:", error);
        return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.service.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting service:", error);
        return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
    }
}
