"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Calendar as CalendarIcon, Clock, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

type Schedule = {
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
        color?: string; // Optional field for UI dot colors
    };
};

type AppUser = {
    id: string;
    name: string;
    email: string;
    role: string;
};

// Generate a pseudo-random color based on string input
const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
};

export default function RoosterAanmakenPage() {
    const router = useRouter();
    const [view, setView] = useState<'month' | 'week'>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [workers, setWorkers] = useState<AppUser[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    
    const [currentUser, setCurrentUser] = useState<any>(null);

    const [formData, setFormData] = useState({
        workerId: "",
        date: "",
        startTime: "",
        endTime: "",
        notes: ""
    });

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

            if (meData.role !== 'ADMIN') {
                router.push('/admin'); // Redirect if not an admin
                return;
            }

            // Fetch schedules
            const schedulesRes = await fetch("/api/admin/schedules/worker");
            if (!schedulesRes.ok) throw new Error("Fout bij ophalen roosters");
            let fetchedSchedules: Schedule[] = await schedulesRes.json();
            
            // Assign a color to each schedule based on worker ID for consistent UI
            fetchedSchedules = fetchedSchedules.map(s => ({
                ...s,
                worker: { ...s.worker, color: stringToColor(s.workerId) }
            }));
            setSchedules(fetchedSchedules);
            
            // Fetch users for dropdown and grid rows
            const usersRes = await fetch("/api/admin/users");
            if (usersRes.ok) {
                setWorkers(await usersRes.json());
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const dataToSubmit = { ...formData };

            const res = await fetch("/api/admin/schedules/worker", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSubmit),
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Fout bij inplannen");
            }
            
            setIsCreating(false);
            setFormData({ workerId: "", date: "", startTime: "", endTime: "", notes: "" });
            fetchData();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Weet je zeker dat je deze dienst wilt verwijderen?")) return;
        try {
            const res = await fetch("/api/admin/schedules/worker", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) throw new Error("Fout bij verwijderen dienst");
            fetchData();
        } catch (err: any) {
            setError(err.message);
        }
    };

    // Date navigation helpers
    const getStartOfWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    const nextTimePeriod = () => {
        const newDate = new Date(currentDate);
        if (view === 'week') newDate.setDate(newDate.getDate() + 7);
        if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
        setCurrentDate(newDate);
    };

    const prevTimePeriod = () => {
        const newDate = new Date(currentDate);
        if (view === 'week') newDate.setDate(newDate.getDate() - 7);
        if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(new Date());
    };

    const isSameDay = (d1: Date, d2: Date | null) => {
        if (!d1 || !d2) return false;
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const getSchedulesForDate = (date: Date) => {
        return schedules.filter(s => {
            const schDate = new Date(s.date);
            return isSameDay(schDate, date);
        }).sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

    // Render Logic Layer

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
        const selectedDaySchedules = selectedDate ? getSchedulesForDate(selectedDate) : [];

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(500px, 2fr) minmax(350px, 1fr)', gap: '2rem', alignItems: 'start' }}>
                <div className="glass-panel" style={{ padding: '2rem', background: 'var(--surface)' }}>
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
                                return <div key={`empty-${index}`} style={{ minHeight: '120px', background: 'transparent' }} />;
                            }

                            const daySchedules = getSchedulesForDate(date);
                            const isToday = isSameDay(date, new Date());
                            const isSelected = isSameDay(date, selectedDate);

                            return (
                                <button
                                    key={`day-${date.getDate()}`}
                                    onClick={() => setSelectedDate(date)}
                                    style={{
                                        minHeight: '120px',
                                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--surface-border)',
                                        borderRadius: 'var(--radius-md)',
                                        background: isToday ? 'var(--primary-light)' : 'rgba(255,255,255,0.7)',
                                        padding: '0.75rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: isSelected ? 'var(--shadow-md)' : 'none',
                                        position: 'relative'
                                    }}
                                    className="hover:bg-gray-50"
                                >
                                    <div style={{ 
                                        fontWeight: isToday || isSelected ? 700 : 500, 
                                        color: isSelected ? 'var(--primary)' : isToday ? 'var(--primary-hover)' : 'var(--text-main)',
                                        marginBottom: '0.5rem',
                                        fontSize: '1rem',
                                        alignSelf: 'flex-start'
                                    }}>
                                        {date.getDate()}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'auto' }}>
                                        {/* Render distinct dots per employee */}
                                        {daySchedules.slice(0, 10).map((sch, i) => (
                                            <div key={i} title={`${sch.worker.name} (${sch.startTime})`} style={{
                                                width: '10px',
                                                height: '10px',
                                                borderRadius: '50%',
                                                background: sch.worker.color || 'var(--secondary)'
                                            }} />
                                        ))}
                                        {daySchedules.length > 10 && (
                                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700 }}>+{daySchedules.length - 10}</div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right Side Panel */}
                <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(255,255,255,0.6)', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
                            {selectedDate ? (
                                <>{selectedDate.getDate()} {currentDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}</>
                            ) : 'Selecteer een datum'}
                        </h2>
                        {selectedDate && (
                             <button onClick={() => {
                                 const y = selectedDate.getFullYear();
                                 const m = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
                                 const d = selectedDate.getDate().toString().padStart(2, '0');
                                 setFormData(prev => ({ ...prev, date: `${y}-${m}-${d}` }));
                                 setIsCreating(true);
                             }} className="btn btn-primary" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem' }}>
                                 <Plus size={16} /> Toevoegen
                             </button>
                        )}
                    </div>

                    {!selectedDate ? (
                         <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ fontSize: '1.1rem' }}>Klik op een dag in de kalender om het rooster te beheren.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {selectedDaySchedules.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                                    Geen diensten ingepland voor deze dag.
                                </div>
                            ) : (
                                selectedDaySchedules.map((schedule, index) => (
                                     <div key={schedule.id} className="animate-fade-in" style={{
                                        animationDelay: `${index * 50}ms`,
                                        background: 'var(--surface)',
                                        border: '1px solid var(--surface-border)',
                                        borderLeft: `4px solid ${schedule.worker.color}`,
                                        borderRadius: 'var(--radius-md)',
                                        padding: '1rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        boxShadow: 'var(--shadow-sm)',
                                    }}>
                                         <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.1rem' }}>
                                                {schedule.worker.name}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', margin: '0.25rem 0' }}>
                                                <Clock size={14} /> {schedule.startTime} - {schedule.endTime}
                                            </div>
                                            {schedule.notes && <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{schedule.notes}</div>}
                                         </div>
                                         <button 
                                            onClick={() => handleDelete(schedule.id)}
                                            className="btn hover:bg-red-50" 
                                            style={{ padding: '0.5rem', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', background: 'transparent' }}
                                            title="Verwijderen"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderWeekGridView = () => {
        const startDate = getStartOfWeek(currentDate);
        const days = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            return d;
        });

        // Get unique workers who have schedules this week OR all workers (we'll show all for completeness)
        const activeWorkers = workers.filter(w => w.role === 'WORKER' || w.role === 'ADMIN'); // showing everyone eligible

        return (
            <div className="glass-panel overflow-x-auto" style={{ background: 'var(--surface)' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                    <thead style={{ background: 'rgba(0,0,0,0.02)' }}>
                        <tr>
                            <th style={{ width: '150px', padding: '1rem', borderRight: '1px solid var(--surface-border)', borderBottom: '1px solid var(--surface-border)', textAlign: 'left', position: 'sticky', left: 0, background: 'var(--surface)', zIndex: 10 }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}><Users size={16} className="inline mr-2" />Medewerker</div>
                            </th>
                            {days.map((day, i) => {
                                const isToday = day.toDateString() === new Date().toDateString();
                                return (
                                    <th key={i} style={{ padding: '1rem', borderBottom: '1px solid var(--surface-border)', borderRight: '1px solid var(--surface-border)', textAlign: 'center', background: isToday ? 'var(--primary-light)' : 'transparent', minWidth: '120px' }}>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{day.toLocaleDateString('nl-NL', { weekday: 'short' })}</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: isToday ? 800 : 600, color: isToday ? 'var(--primary)' : 'var(--text-main)' }}>{day.getDate()}</div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {activeWorkers.map((worker) => (
                             <tr key={worker.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                 <td style={{ padding: '1rem', borderRight: '1px solid var(--surface-border)', position: 'sticky', left: 0, background: 'var(--surface)', zIndex: 10, fontWeight: 500 }}>
                                     {worker.name}
                                 </td>
                                 {days.map((day, i) => {
                                     const workerSchedules = getSchedulesForDate(day).filter(s => s.workerId === worker.id);
                                     const isToday = day.toDateString() === new Date().toDateString();

                                     return (
                                        <td key={i} style={{ padding: '0.5rem', borderRight: '1px solid var(--surface-border)', background: isToday ? 'rgba(0,0,0,0.01)' : 'transparent', verticalAlign: 'top' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {workerSchedules.map(sch => (
                                                    <div key={sch.id} style={{
                                                        background: stringToColor(worker.id),
                                                        color: 'white',
                                                        padding: '0.5rem',
                                                        borderRadius: 'var(--radius-sm)',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        boxShadow: 'var(--shadow-sm)'
                                                    }}>
                                                        <span>{sch.startTime} - {sch.endTime}</span>
                                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(sch.id); }} style={{ color: 'rgba(255,255,255,0.7)', padding: '2px', cursor: 'pointer', background: 'transparent', border: 'none' }} className="hover:text-white">
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button onClick={() => {
                                                    const y = day.getFullYear();
                                                    const m = (day.getMonth() + 1).toString().padStart(2, '0');
                                                    const d = day.getDate().toString().padStart(2, '0');
                                                    setFormData(prev => ({ ...prev, workerId: worker.id, date: `${y}-${m}-${d}` }));
                                                    setIsCreating(true);
                                                }} style={{
                                                    padding: '0.5rem',
                                                    border: '1px dashed var(--surface-border)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    background: 'transparent',
                                                    color: 'var(--text-muted)',
                                                    cursor: 'pointer',
                                                    display: workerSchedules.length > 0 ? 'none' : 'block',
                                                    textAlign: 'center',
                                                    fontSize: '0.75rem'
                                                }} className="hover:bg-gray-50">
                                                    + Dienst
                                                </button>
                                            </div>
                                        </td>
                                     );
                                 })}
                             </tr>
                        ))}
                    </tbody>
                 </table>
            </div>
        );
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Rooster laden...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    const getHeaderDateText = () => {
        if (view === 'week') {
            const start = getStartOfWeek(currentDate);
            const end = new Date(start);
            end.setDate(end.getDate() + 6);
            if (start.getMonth() === end.getMonth()) {
                return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}`;
            } else {
                 return `${start.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short'})} - ${end.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric'})}`;
            }
        } else {
             return currentDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Medewerkers Rooster</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>Beheer en plan het rooster in voor alle medewerkers.</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface)', padding: '0.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                        {(['month', 'week'] as const).map(v => (
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
                                {v === 'month' ? 'Maand Overzicht' : 'Week Grid'}
                            </button>
                        ))}
                    </div>

                    <div style={{ width: '1px', height: '2rem', background: 'var(--surface-border)' }}></div>

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

            <div style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                 <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CalendarIcon size={22} className="text-blue-600" />
                    {getHeaderDateText()}
                 </h2>
            </div>
            
             {/* Create Shift Modal / Overlay Form */}
             {isCreating && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', background: 'var(--surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)' }}>
                         <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                            <Plus size={24} /> Nieuwe Dienst Inplannen
                        </h2>
                        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label font-bold">Medewerker</label>
                                <select name="workerId" value={formData.workerId} onChange={handleChange} required className="form-input w-full p-3 border rounded-lg bg-gray-50 text-gray-800">
                                    <option value="">Selecteer een medewerker...</option>
                                    {workers.map(w => (
                                        <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="form-label font-bold">Datum</label>
                                <input type="date" name="date" value={formData.date} onChange={handleChange} required className="form-input w-full p-3 border rounded-lg bg-gray-50 text-gray-800" />
                            </div>
                            <div>
                                <label className="form-label font-bold">Starttijd</label>
                                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required className="form-input w-full p-3 border rounded-lg bg-gray-50 text-gray-800" />
                            </div>
                            <div>
                                <label className="form-label font-bold">Eindtijd</label>
                                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required className="form-input w-full p-3 border rounded-lg bg-gray-50 text-gray-800" />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label font-bold">Notities (Optioneel)</label>
                                <textarea name="notes" value={formData.notes || ""} onChange={handleChange} className="form-input w-full p-3 border rounded-lg bg-gray-50 text-gray-800" placeholder="Aanvullende info over deze shift..." rows={3} />
                            </div>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setIsCreating(false)} className="btn px-6 py-2" style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--surface-border)' }}>Annuleren</button>
                                <button type="submit" className="btn btn-primary px-8 py-2 font-bold">Dienst Opslaan</button>
                            </div>
                        </form>
                    </div>
                </div>
             )}

            {/* Main Data Views */}
            <div>
                {view === 'month' && renderMonthView()}
                {view === 'week' && renderWeekGridView()}
            </div>
        </div>
    );
}
