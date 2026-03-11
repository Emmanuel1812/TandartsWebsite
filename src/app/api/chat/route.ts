import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = await streamText({
        model: google('gemini-2.5-flash'),
        messages,
        maxSteps: 5,
        system: `Je bent een vriendelijke, behulpzame en professionele assistent voor Tandartspraktijk Stralend.
Jouw doel is om patiënten te helpen met vragen, en ze te helpen bij het boeken van een afspraak.
- De praktijk heet "Tandartspraktijk Stralend".
- VRAAG ALTIJD EERST welke dienst (service) de patiënt wil boeken. Gebruik hiervoor DIRECT de tool 'toonDiensten'. Toon NOOIT de kalender voordat je weet welke dienst de patiënt wil.
- Pas als de patiënt een dienst heeft gekozen, en je de serviceId hebt, mag je de tool 'toonKalender' aanroepen (als ze vragen om beschikbare dagen) of 'checkBeschikbaarheid' (voor een specifieke datum).
- Geef altijd de 'serviceId' mee aan 'checkBeschikbaarheid' en 'toonBoekingsFormulier'.
- Let op: als je 'toonDiensten', 'checkBeschikbaarheid' of 'toonKalender' gebruikt, LIST DE DATA OF TIJDEN DAN NIET OP in je tekst. De frontend toont deze automatisch als klikbare knoppen. Geef alleen een korte introductie (bijv. "Hier zijn de diensten:").
- VRAAG NOOIT in tekst om de naam, e-mail of telefoonnummer. Gebruik daarvoor ALTIJD de tool 'toonBoekingsFormulier'.
- Gebruik de tool 'maakAfspraak' om de daadwerkelijke boeking te plaatsen zodra je alle gegevens (naam, e-mail, telefoonnummer, datum, tijd, serviceId) succesvol hebt ontvangen via het formulier.
- Reageer altijd in prettig en professioneel Nederlands, passend bij een premium service.`,
        tools: {
            toonDiensten: tool({
                description: 'Toon een lijst met diensten aan de patiënt zodat ze er een kunnen selecteren. Gebruik dit ALTIJD als allereerste stap in het boekingsproces.',
                parameters: z.object({}),
            }),
            toonKalender: tool({
                description: 'Toon een interactieve kalender aan de patiënt zodat ze een datum kunnen kiezen. Gebruik dit wanneer de gebruiker vraagt om algemene beschikbaarheid (welke dagen kan ik?).',
                parameters: z.object({}),
            }),
            toonBoekingsFormulier: tool({
                description: 'Toon een formulier aan de patiënt om hun naam, e-mail en telefoonnummer in te vullen. Gebruik dit ALTIJD zodra een patiënt een datum en tijd heeft gekozen voor een afspraak.',
                parameters: z.object({
                    datum: z.string().describe('De gekozen datum in YYYY-MM-DD formaat.'),
                    tijd: z.string().describe('De gekozen tijd in HH:MM formaat.'),
                    serviceId: z.string().describe('Het ID van de gekozen dienst.')
                }),
            }),
            checkBeschikbaarheid: tool({
                description: 'Vraag de open en vrije tijden (in formaat HH:MM) op voor een specifieke datum. Vereist serviceId om de juiste tijdsduur te berekenen.',
                parameters: z.object({
                    datum: z.string().describe('De geselecteerde datum in YYYY-MM-DD formaat.'),
                    serviceId: z.string().describe('Het ID van de dienst die de patiënt wil boeken.'),
                }),
                // @ts-ignore
                execute: async ({ datum, serviceId }: { datum: string, serviceId: string }) => {
                    try {
                        const selectedDate = new Date(datum);
                        selectedDate.setHours(0, 0, 0, 0);

                        const service = await prisma.service.findUnique({ where: { id: serviceId } });
                        if (!service) {
                            return { success: false, error: 'Dienst niet gevonden.' };
                        }

                        const totalMinsNeeded = service.setupTime + service.duration + service.downTime;

                        let schedule = await prisma.schedule.findFirst({
                            where: { date: selectedDate }
                        });

                        if (!schedule) {
                            schedule = {
                                id: "default",
                                date: selectedDate,
                                startTime: "09:00",
                                endTime: "17:00",
                                isClosed: [0, 6].includes(selectedDate.getDay()),
                                createdAt: new Date(),
                                updatedAt: new Date()
                            };
                        }

                        if (schedule.isClosed) {
                            return { success: true, beschikbaarheid: [], message: 'De praktijk is gesloten op deze datum.' };
                        }

                        const nextDay = new Date(selectedDate);
                        nextDay.setDate(nextDay.getDate() + 1);

                        const bookedAppointments = await prisma.appointment.findMany({
                            where: {
                                date: { gte: selectedDate, lt: nextDay },
                                status: 'CONFIRMED'
                            }
                        });

                        // Convert time string "HH:MM" to minutes since midnight for easier math
                        const timeToMins = (timeStr: string) => {
                            const [h, m] = timeStr.split(':').map(Number);
                            return h * 60 + m;
                        };
                        const minsToTime = (mins: number) => {
                            const h = Math.floor(mins / 60).toString().padStart(2, '0');
                            const m = (mins % 60).toString().padStart(2, '0');
                            return `${h}:${m}`;
                        };

                        const startMins = timeToMins(schedule.startTime);
                        const endMins = timeToMins(schedule.endTime);

                        // Map appointments to busy intervals [startMins, endMins]
                        const busyIntervals = bookedAppointments.map((a: any) => {
                            return { start: timeToMins(a.startTime), end: timeToMins(a.endTime) };
                        });
                        busyIntervals.sort((a: any, b: any) => a.start - b.start);

                        // Generate all possible start times in 15-min increments
                        const slots: string[] = [];
                        const now = new Date();
                        const isToday = selectedDate.toDateString() === now.toDateString();
                        const currentMins = now.getHours() * 60 + now.getMinutes();

                        for (let slotStart = startMins; slotStart + totalMinsNeeded <= endMins; slotStart += 15) {
                            const slotEnd = slotStart + totalMinsNeeded;

                            // Skip if time is in the past for today
                            if (isToday && slotStart <= currentMins) continue;

                            // Check collision with busy intervals
                            let conflict = false;
                            for (const busy of busyIntervals) {
                                // Overlap logic
                                if (slotStart < busy.end && slotEnd > busy.start) {
                                    conflict = true;
                                    break;
                                }
                            }

                            if (!conflict) {
                                // Add start time, adjusted for setup time to show actual "appointment start time" to patient
                                // Usually patient arrives at slotStart + setupTime, or setupTime is invisible to them.
                                // Let's present the time they should arrive (slotStart + setupTime).
                                const patientArrivalTime = slotStart + service.setupTime;
                                const timeStr = minsToTime(patientArrivalTime);
                                // Prevent duplicates
                                if (!slots.includes(timeStr)) {
                                    slots.push(timeStr);
                                }
                            }
                        }

                        return { success: true, beschikbaarheid: slots, message: 'Dit zijn de beschikbare tijden.' };
                    } catch (e) {
                        return { success: false, error: 'Fout bij ophalen beschikbaarheid.' };
                    }
                },
            }),
            maakAfspraak: tool({
                description: 'Maakt een officiële afspraak in het systeem. Vereist patiëntnaam, e-mail, telefoonnummer, datum en begintijd.',
                parameters: z.object({
                    patientName: z.string().describe('De volledige naam van de patiënt.'),
                    email: z.string().email().describe('E-mailadres van de patiënt.'),
                    phone: z.string().describe('Telefoonnummer van de patiënt.'),
                    date: z.string().describe('De afspraakdatum in YYYY-MM-DD formaat.'),
                    startTime: z.string().describe('De starttijd van de afspraak (bijv. 09:30).'),
                    serviceId: z.string().describe('Het ID van de gekozen dienst.'),
                    notes: z.string().optional().describe('Optionele opmerkingen van de patiënt.'),
                }),
                // @ts-ignore
                execute: async ({ patientName, email, phone, date, startTime, serviceId, notes }: { patientName: string; email: string; phone: string; date: string; startTime: string; serviceId: string; notes?: string }) => {
                    try {
                        const selectedDate = new Date(date);
                        selectedDate.setHours(0, 0, 0, 0);

                        const service = await prisma.service.findUnique({ where: { id: serviceId } });
                        if (!service) {
                            return { success: false, error: 'Dienst niet gevonden.' };
                        }

                        // Reverse math: The startTime given is patientArrivalTime.
                        // Actual appointment booked timeframe blocks: slotStart = patientArrivalTime - setupTime
                        // True endTime blocking schedule = slotStart + totalTime = patientArrivalTime + duration + downTime
                        const [hh, mm] = startTime.split(':').map(Number);
                        const startMins = hh * 60 + mm;
                        const actualStartMins = startMins - service.setupTime;
                        const endMins = startMins + service.duration + service.downTime;

                        const formatMins = (mins: number) => {
                            const h = Math.floor(mins / 60).toString().padStart(2, '0');
                            const m = (mins % 60).toString().padStart(2, '0');
                            return `${h}:${m}`;
                        };

                        const actualStartTime = formatMins(actualStartMins);
                        const actualEndTime = formatMins(endMins);

                        const nextDay = new Date(selectedDate);
                        nextDay.setDate(nextDay.getDate() + 1);

                        // Double check if time slot is still completely free
                        const existingBookings = await prisma.appointment.findMany({
                            where: { date: { gte: selectedDate, lt: nextDay }, status: 'CONFIRMED' }
                        });

                        const conflict = existingBookings.some((apt: any) => {
                            const aStart = apt.startTime.split(':').reduce((acc: number, current: string, i: number) => acc + (i === 0 ? Number(current) * 60 : Number(current)), 0);
                            const aEnd = apt.endTime.split(':').reduce((acc: number, current: string, i: number) => acc + (i === 0 ? Number(current) * 60 : Number(current)), 0);
                            return actualStartMins < aEnd && endMins > aStart;
                        });

                        if (conflict) {
                            return { success: false, message: 'Helaas is deze tijd inmiddels niet meer beschikbaar.' };
                        }

                        const appointment = await prisma.appointment.create({
                            data: {
                                patientName,
                                email,
                                phone,
                                date: selectedDate,
                                startTime: actualStartTime,
                                endTime: actualEndTime,
                                serviceId,
                                notes,
                            }
                        });

                        return { success: true, appointmentId: appointment.id, message: `Afspraak succesvol gemaakt voor ${patientName} op ${date} om ${startTime}.` };
                    } catch (e) {
                        return { success: false, error: 'Er ging iets fout in de database. De afspraak is niet gemaakt.' };
                    }
                },
            }),
        },
    });

    return result.toDataStreamResponse();
}
