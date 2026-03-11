import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Get all registered patients (have an account)
        const patients = await prisma.patient.findMany({
            include: {
                user: true,
                appointments: {
                    include: { service: true },
                    orderBy: { date: 'desc' }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Get all registered user emails so we can filter them out from guest appointments
        const registeredEmails = patients.map(p => p.user.email);

        // Get guest bookings: appointments where the email is NOT from a registered user
        const guestAppointments = await prisma.appointment.findMany({
            where: {
                NOT: {
                    email: {
                        in: registeredEmails
                    }
                }
            },
            include: {
                service: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Group guest appointments by email to create unique "guest" profiles
        const guestMap = new Map<string, any>();
        for (const apt of guestAppointments) {
            if (!guestMap.has(apt.email)) {
                guestMap.set(apt.email, {
                    name: apt.patientName,
                    email: apt.email,
                    phone: apt.phone,
                    appointments: [],
                    firstBooking: apt.createdAt,
                });
            }
            guestMap.get(apt.email)!.appointments.push(apt);
        }

        const guests = Array.from(guestMap.values());

        return NextResponse.json({ patients, guests });
    } catch (error) {
        console.error('Error fetching clients:', error);
        return NextResponse.json({ error: 'Fout bij ophalen klanten' }, { status: 500 });
    }
}
