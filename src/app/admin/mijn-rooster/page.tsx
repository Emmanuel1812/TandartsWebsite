"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

// Define the Schedule interface matching the API response
interface Schedule {
    id: string;
    workerId: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
    worker: {
        name: string;
        email: string;
        role: string;
    };
}

export default function MijnRoosterPage() {
    const router = useRouter();
    const [view, setView] = useState<'day' | 'week' | 'month'>('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentUser, setCurrentUser] = useState<any>(null);

    const fetchData = async () => {
        try {
            // Fetch current user
            const meRes = await fetch("/api/auth/me");
            if (!meRes.ok) {
                 if(meRes.status === 401) {
                     router.push('/admin/login');
                     return;
                 }
                 throw new Error("Niet geautoriseerd");
            }
            const meData = await meRes.json();
            setCurrentUser(meData);

            if (meData.role !== 'WORKER') {
                router.push('/admin'); // Redirect if not a worker
                return;
            }

            // Fetch schedules (we'll filter them locally for now, though api could be optimized later)
            const schedulesRes = await fetch("/api/admin/schedules/worker");
            if (!schedulesRes.ok) throw new Error("Fout bij ophalen roosters");
            const allSchedules: Schedule[] = await schedulesRes.json();
            
            // Filter only this worker's schedules
            const mySchedules = allSchedules.filter(s => s.workerId === meData.userId);
            setSchedules(mySchedules);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Helper functions for date manipulation
    const getStartOfWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    };

    const nextTimePeriod = () => {
        const newDate = new Date(currentDate);
        if (view === 'day') newDate.setDate(newDate.getDate() + 1);
        if (view === 'week') newDate.setDate(newDate.getDate() + 7);
        if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
        setCurrentDate(newDate);
    };

    const prevTimePeriod = () => {
        const newDate = new Date(currentDate);
        if (view === 'day') newDate.setDate(newDate.getDate() - 1);
        if (view === 'week') newDate.setDate(newDate.getDate() - 7);
        if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Filter schedules for the current view
    const getSchedulesForDate = (date: Date) => {
        return schedules.filter(s => {
            const schDate = new Date(s.date);
            return schDate.getFullYear() === date.getFullYear() &&
                   schDate.getMonth() === date.getMonth() &&
                   schDate.getDate() === date.getDate();
        }).sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

    const formatTime = (timeString: string) => {
         // basic format
         return timeString;
    };

    // Render logic for different views
    const renderDayView = () => {
        const daySchedules = getSchedulesForDate(currentDate);
        
        return (
            <div className="glass-panel p-6 animate-fade-in" style={{ minHeight: '500px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem', color: 'var(--text-main)' }}>
                    {currentDate.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
                
                {daySchedules.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.5 }}>☕</div>
                        <p style={{ fontSize: '1.25rem' }}>Je bent vandaag vrij!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                        {/* Simple timeline abstraction */}
                        {daySchedules.map((sch, i) => (
                             <div key={sch.id} style={{
                                 background: 'var(--primary-light)',
                                 borderLeft: '4px solid var(--primary)',
                                 borderRadius: 'var(--radius-md)',
                                 padding: '1.5rem',
                                 display: 'flex',
                                 alignItems: 'center',
                                 gap: '1.5rem',
                                 boxShadow: 'var(--shadow-sm)'
                             }}>
                                 <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.25rem', minWidth: '120px' }}>
                                     {formatTime(sch.startTime)} - {formatTime(sch.endTime)}
                                 </div>
                                 <div>
                                     <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Geplande Dienst</div>
                                     {sch.notes && <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Nota: {sch.notes}</div>}
                                 </div>
                             </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderWeekView = () => {
        const startDate = getStartOfWeek(currentDate);
        const days = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            return d;
        });

        return (
            <div className="glass-panel animate-fade-in overflow-hidden" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: '600px' }}>
                {days.map((day, i) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    const daySchedules = getSchedulesForDate(day);
                    
                    return (
                        <div key={i} style={{ 
                            borderRight: i < 6 ? '1px solid var(--surface-border)' : 'none',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div style={{ 
                                padding: '1rem', 
                                textAlign: 'center', 
                                borderBottom: '1px solid var(--surface-border)',
                                background: isToday ? 'var(--primary-light)' : 'rgba(0,0,0,0.02)'
                            }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: isToday ? 'var(--primary)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                                    {day.toLocaleDateString('nl-NL', { weekday: 'short' })}
                                </div>
                                <div style={{ 
                                    fontSize: '1.5rem', 
                                    fontWeight: isToday ? 800 : 500, 
                                    color: isToday ? 'var(--primary)' : 'var(--text-main)',
                                    lineHeight: 1,
                                    marginTop: '0.25rem'
                                }}>
                                    {day.getDate()}
                                </div>
                            </div>
                            <div style={{ flex: 1, padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--surface)' }}>
                                {daySchedules.map(sch => (
                                    <div key={sch.id} style={{
                                        background: 'var(--primary)',
                                        color: 'white',
                                        padding: '0.5rem',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.75rem',
                                        boxShadow: 'var(--shadow-sm)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.25rem'
                                    }}>
                                        <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Clock size={12} />
                                            {formatTime(sch.startTime)} - {formatTime(sch.endTime)}
                                        </div>
                                    </div>
                                ))}
                                {daySchedules.length === 0 && (
                                     <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', opacity: 0.5 }}>
                                         Geen dienst
                                     </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderMonthView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let firstDay = new Date(year, month, 1).getDay();
        firstDay = firstDay === 0 ? 7 : firstDay;

        const calendarDays = [];
        for (let i = 1; i < firstDay; i++) {
            calendarDays.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            calendarDays.push(new Date(year, month, i));
        }

        const dayNames = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

        return (
            <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', background: 'var(--surface)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {dayNames.map(day => (
                        <div key={day} style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem', padding: '0.5rem 0' }}>
                            {day}
                        </div>
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                    {calendarDays.map((date, index) => {
                        if (!date) {
                            return <div key={`empty-${index}`} style={{ background: 'transparent', minHeight: '80px' }} />;
                        }

                        const daySchedules = getSchedulesForDate(date);
                        const isToday = date.toDateString() === new Date().toDateString();

                        return (
                            <div key={`day-${date.getDate()}`} style={{
                                minHeight: '100px',
                                border: '1px solid var(--surface-border)',
                                borderRadius: 'var(--radius-md)',
                                background: isToday ? 'var(--primary-light)' : 'rgba(255,255,255,0.5)',
                                padding: '0.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem'
                            }}>
                                <div style={{ 
                                    fontWeight: isToday ? 700 : 500, 
                                    color: isToday ? 'var(--primary)' : 'var(--text-muted)',
                                    marginBottom: '0.25rem',
                                    fontSize: '0.875rem'
                                }}>
                                    {date.getDate()}
                                </div>
                                {daySchedules.slice(0, 2).map((sch, i) => (
                                    <div key={i} style={{
                                        background: 'var(--primary)',
                                        color: 'white',
                                        fontSize: '0.7rem',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {formatTime(sch.startTime)} - {formatTime(sch.endTime)}
                                    </div>
                                ))}
                                {daySchedules.length > 2 && (
                                    <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600, paddingLeft: '0.25rem' }}>
                                        + {daySchedules.length - 2} meer
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Rooster laden...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    const getHeaderDateText = () => {
        if (view === 'day') {
            return currentDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
        } else if (view === 'week') {
            const start = getStartOfWeek(currentDate);
            const end = new Date(start);
            end.setDate(end.getDate() + 6);
            
            if (start.getMonth() === end.getMonth()) {
                return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}`;
            } else if (start.getFullYear() === end.getFullYear()) {
                return `${start.getDate()} ${start.toLocaleDateString('nl-NL', { month: 'short' })} - ${end.getDate()} ${end.toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' })}`;
            } else {
                 return `${start.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric'})} - ${end.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric'})}`;
            }
        } else {
             return currentDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Afspraak Rooster</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>Overzicht van jouw ingeplande werkdagen.</p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface)', padding: '0.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                    {/* View toggles */}
                    <div style={{ display: 'flex', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                        {(['day', 'week', 'month'] as const).map(v => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: view === v ? 'var(--primary)' : 'transparent',
                                    color: view === v ? 'white' : 'var(--text-main)',
                                    fontWeight: view === v ? 600 : 500,
                                    border: 'none',
                                    cursor: 'pointer',
                                    textTransform: 'capitalize',
                                    transition: 'all 0.2s',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {v === 'day' ? 'Dag' : v === 'week' ? 'Week' : 'Maand'}
                            </button>
                        ))}
                    </div>

                    <div style={{ width: '1px', height: '2rem', background: 'var(--surface-border)' }}></div>

                    {/* Navigation */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={goToToday} className="btn" style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--surface-border)', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.875rem' }}>
                            Vandaag
                        </button>
                        <button onClick={prevTimePeriod} className="btn hover:bg-gray-100" style={{ padding: '0.5rem', background: 'transparent', border: '1px solid var(--surface-border)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ChevronLeft size={18} />
                        </button>
                        <button onClick={nextTimePeriod} className="btn hover:bg-gray-100" style={{ padding: '0.5rem', background: 'transparent', border: '1px solid var(--surface-border)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ padding: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CalendarIcon size={24} style={{ color: 'var(--primary)' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize' }}>
                    {getHeaderDateText()}
                </h2>
            </div>

            {/* Main Content Area */}
            <div>
                {view === 'day' && renderDayView()}
                {view === 'week' && renderWeekView()}
                {view === 'month' && renderMonthView()}
            </div>
        </div>
    );
}
