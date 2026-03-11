"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Calendar as CalendarIcon, Clock, User } from "lucide-react";

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
    };
};

type AppUser = {
    id: string;
    name: string;
    email: string;
};

export default function WorkerSchedulesPage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [workers, setWorkers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    
    // Auth context manually tracked
    const [currentUser, setCurrentUser] = useState<any>(null);

    const [formData, setFormData] = useState({
        workerId: "",
        date: "",
        startTime: "",
        endTime: "",
        notes: ""
    });

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [selectedDaySchedules, setSelectedDaySchedules] = useState<Schedule[]>([]);

    const fetchData = async () => {
        try {
            // Fetch current user
            const meRes = await fetch("/api/auth/me");
            if (meRes.ok) {
                const meData = await meRes.json();
                setCurrentUser(meData);
                // Also prepopulate workerId if it's a worker
                if (meData.role === 'WORKER') {
                     setFormData(prev => ({ ...prev, workerId: meData.userId }));
                }
            }

            // Fetch schedules
            const schedulesRes = await fetch("/api/admin/schedules/worker");
            if (!schedulesRes.ok) throw new Error("Fout bij ophalen roosters");
            setSchedules(await schedulesRes.json());
            
            // Fetch users for dropdown if admin
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

    useEffect(() => {
        if (!selectedDate) {
            setSelectedDaySchedules([]);
            return;
        }

        // Filter schedules for the currently selected date
        const filtered = schedules.filter(schedule => {
            const schDate = new Date(schedule.date);
            return schDate.getFullYear() === selectedDate.getFullYear() &&
                schDate.getMonth() === selectedDate.getMonth() &&
                schDate.getDate() === selectedDate.getDate();
        });

        // If worker, only show their own schedules
        if (currentUser?.role === 'WORKER') {
            setSelectedDaySchedules(filtered.filter(s => s.workerId === currentUser.userId));
        } else {
            setSelectedDaySchedules(filtered);
        }
    }, [schedules, selectedDate, currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const dataToSubmit = { ...formData };
            if (currentUser?.role === 'WORKER') {
                dataToSubmit.workerId = currentUser.userId;
            }

            // Default date to selectedDate if not specified, otherwise use formData
            if (!dataToSubmit.date && selectedDate) {
                const year = selectedDate.getFullYear();
                const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
                const day = selectedDate.getDate().toString().padStart(2, '0');
                dataToSubmit.date = `${year}-${month}-${day}`;
            }

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
            setFormData({ workerId: currentUser?.role === 'WORKER' ? currentUser.userId : "", date: "", startTime: "", endTime: "", notes: "" });
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

    if (loading) return <div>Laden...</div>;

    const isAdmin = currentUser?.role === 'ADMIN';

    // Calendar generation logic
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => {
        let day = new Date(year, month, 1).getDay();
        return day === 0 ? 7 : day;
    };

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const calendarDays = [];
    for (let i = 1; i < firstDay; i++) {
        calendarDays.push({ day: null, date: null });
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push({ day: i, date: new Date(year, month, i) });
    }

    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));

    const monthNames = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"];
    const dayNames = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

    const hasSchedules = (date: Date) => {
        return schedules.some(sch => {
            const schDate = new Date(sch.date);
            const matchesDate = schDate.getFullYear() === date.getFullYear() &&
                schDate.getMonth() === date.getMonth() &&
                schDate.getDate() === date.getDate();
            
            if (!matchesDate) return false;
            
            if (currentUser?.role === 'WORKER') {
                return sch.workerId === currentUser.userId;
            }
            return true;
        });
    };

    const isSameDay = (d1: Date, d2: Date | null) => {
        if (!d2) return false;
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return isSameDay(date, today);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Werkrooster</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{isAdmin ? 'Beheer de instellingen voor alle medewerkers.' : 'Overzicht van je geplande werkdagen en tijden.'}</p>
                </div>
                {!isCreating && (
                    <button onClick={() => {
                        setIsCreating(true);
                        if (selectedDate) {
                            const y = selectedDate.getFullYear();
                            const m = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
                            const d = selectedDate.getDate().toString().padStart(2, '0');
                            setFormData(prev => ({ ...prev, date: `${y}-${m}-${d}` }));
                        }
                    }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={18} /> Dienst Toevoegen
                    </button>
                )}
            </div>

            {error && (
                <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    {error}
                </div>
            )}

            {isCreating && (
                <div className="glass-panel p-6 animate-fade-in" style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CalendarIcon size={20} className="text-blue-500" /> Nieuwe Dienst Inplannen
                    </h2>
                    <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        
                        {isAdmin && (
                            <div>
                                <label className="form-label">Medewerker</label>
                                <select name="workerId" value={formData.workerId} onChange={handleChange} required className="form-input">
                                    <option value="">Selecteer medewerker...</option>
                                    {workers.map(w => (
                                        <option key={w.id} value={w.id}>{w.name} ({w.email})</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="form-label">Datum</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="form-input" />
                        </div>
                        <div>
                            <label className="form-label">Starttijd</label>
                            <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required className="form-input" />
                        </div>
                        <div>
                            <label className="form-label">Eindtijd</label>
                            <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required className="form-input" />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">Notities (Optioneel)</label>
                            <textarea name="notes" value={formData.notes || ""} onChange={handleChange} className="form-input" placeholder="Eventuele opmerkingen over deze dienst..." rows={2} />
                        </div>
                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button type="button" onClick={() => setIsCreating(false)} className="btn" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>Annuleren</button>
                            <button type="submit" className="btn btn-primary">Opslaan</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '2rem' }}>

                {/* Calendar Pane */}
                <div className="glass-panel" style={{ padding: '2rem', background: 'var(--surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                            <CalendarIcon size={20} />
                            {monthNames[month]} {year}
                        </h2>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={prevMonth} className="btn" style={{ padding: '0.5rem', background: 'var(--background-start)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
                                <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>&lsaquo;</span>
                            </button>
                            <button onClick={nextMonth} className="btn" style={{ padding: '0.5rem', background: 'var(--background-start)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
                                <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>&rsaquo;</span>
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        {dayNames.map(day => (
                            <div key={day} style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem', padding: '0.5rem 0' }}>
                                {day}
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                        {calendarDays.map((item, index) => {
                            if (!item.date) {
                                return <div key={`empty-${index}`} style={{ padding: '1rem', background: 'transparent' }} />;
                            }

                            const hasSch = hasSchedules(item.date);
                            const isSelected = isSameDay(item.date, selectedDate);
                            const today = isToday(item.date);

                            return (
                                <button
                                    key={`day-${item.day}`}
                                    onClick={() => setSelectedDate(item.date)}
                                    style={{
                                        position: 'relative',
                                        padding: '0.75rem 0.5rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: 'none',
                                        background: isSelected ? 'var(--primary)' : today ? 'var(--background-end)' : 'transparent',
                                        color: isSelected ? 'white' : today ? 'var(--primary)' : 'var(--text-main)',
                                        fontWeight: isSelected || today ? 700 : 400,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        transition: 'all 0.2s',
                                        boxShadow: isSelected ? 'var(--shadow-md)' : 'none',
                                    }}
                                    className="hover:bg-gray-100"
                                >
                                    <span>{item.day}</span>
                                    {hasSch && (
                                        <div style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: isSelected ? 'white' : 'var(--secondary)',
                                            marginTop: '4px',
                                            position: 'absolute',
                                            bottom: '4px'
                                        }} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Details Pane */}
                <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(255,255,255,0.6)', minHeight: '500px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
                            {selectedDate ? (
                                <>Diensten op {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}</>
                            ) : 'Selecteer een datum'}
                        </h2>
                    </div>

                    {!selectedDate ? (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                            <p style={{ fontSize: '1.25rem' }}>Klik op een dag in de kalender om het rooster te zien.</p>
                        </div>
                    ) : selectedDaySchedules.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.5 }}>☕</div>
                            <p style={{ fontSize: '1.25rem' }}>Geen ingeplande diensten gevonden voor deze datum.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {selectedDaySchedules.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((schedule, index) => {
                                const canDelete = isAdmin || schedule.workerId === currentUser?.userId;

                                return (
                                    <div key={schedule.id} className="animate-fade-in" style={{
                                        animationDelay: `${index * 50}ms`,
                                        display: 'flex',
                                        background: 'var(--surface)',
                                        border: '1px solid var(--surface-border)',
                                        borderRadius: 'var(--radius-xl)',
                                        padding: '1.5rem',
                                        gap: '2rem',
                                        alignItems: 'center',
                                        boxShadow: 'var(--shadow-sm)',
                                        transition: 'transform 0.2s',
                                    }}>
                                        <div style={{ textAlign: 'center', minWidth: '100px', borderRight: '1px solid var(--surface-border)', paddingRight: '1.5rem' }}>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>{schedule.startTime}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{schedule.endTime}</div>
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.125rem', flexShrink: 0 }}>
                                                {schedule.worker.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{schedule.worker.name}</h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                    <span style={{ display: 'inline-block', padding: '0.1rem 0.6rem', background: schedule.worker.role === 'ADMIN' ? '#fee2e2' : '#f0fdf4', color: schedule.worker.role === 'ADMIN' ? '#991b1b' : '#166534', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                                                        {schedule.worker.role}
                                                    </span>
                                                    <span>{schedule.worker.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {schedule.notes && (
                                            <div style={{ maxWidth: '250px', fontSize: '0.875rem', color: 'var(--text-muted)', background: 'var(--background-start)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                                {schedule.notes}
                                            </div>
                                        )}
                                        <div style={{ paddingLeft: '1rem' }}>
                                            {canDelete && (
                                                <button 
                                                    onClick={() => handleDelete(schedule.id)}
                                                    className="btn hover:bg-red-50" 
                                                    style={{ padding: '0.75rem', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', background: 'transparent', transition: 'all 0.2s' }}
                                                    title="Dienst Verwijderen"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
