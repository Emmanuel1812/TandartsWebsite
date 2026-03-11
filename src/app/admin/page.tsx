"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, ChevronDown, X } from 'lucide-react';

type Appointment = {
    id: string;
    patientName: string;
    email: string;
    phone: string;
    date: string;
    startTime: string;
    endTime: string;
    notes: string;
    status: string;
    service?: {
        id: string;
        name: string;
        duration: number;
        price: number;
    } | null;
};

type Service = {
    id: string;
    name: string;
    description: string | null;
    price: number;
    duration: number;
    setupTime: number;
    downTime: number;
};

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'klanten'>('appointments');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [guests, setGuests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
    const [expandedGuest, setExpandedGuest] = useState<string | null>(null);
    const [selectedApt, setSelectedApt] = useState<any | null>(null);

    const [editingService, setEditingService] = useState<Service | null>(null);
    const [serviceForm, setServiceForm] = useState({
        name: '', description: '', price: '', duration: '', setupTime: '', downTime: ''
    });

    const [currentUser, setCurrentUser] = useState<any>(null);

    // State for the currently viewed month in the calendar
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // State for the currently selected date to view details
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    // State to hold appointments for the selected day
    const [selectedDayAppointments, setSelectedDayAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        // Fetch current user
        fetch("/api/auth/me").then(res => res.ok && res.json()).then(data => {
            if (data) setCurrentUser(data);
        }).catch(err => console.error(err));

        if (activeTab === 'appointments') {
            setLoading(true);
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth() + 1; // 1-12
            const monthStr = `${year}-${month.toString().padStart(2, '0')}`;

            fetch(`/api/appointments?month=${monthStr}`)
                .then(res => res.json())
                .then(data => {
                    setAppointments(data.appointments || []);
                    setLoading(false);
                });
        }
    }, [currentMonth, activeTab]);

    useEffect(() => {
        if (activeTab === 'services') {
            fetchServices();
        }
        if (activeTab === 'klanten') {
            fetchPatients();
        }
    }, [activeTab]);

    const fetchPatients = async () => {
        try {
            const res = await fetch('/api/patients/all');
            if (res.ok) {
                const data = await res.json();
                setPatients(data.patients || []);
                setGuests(data.guests || []);
            }
        } catch (e) {
            console.error('Failed to fetch patients', e);
        }
    };

    const fetchServices = async () => {
        try {
            const res = await fetch('/api/services');
            if (!res.ok) {
                setServices([]);
                return;
            }
            const data = await res.json();
            setServices(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            setServices([]);
        }
    };

    const handleServiceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingService ? `/api/services/${editingService.id}` : '/api/services';
        const method = editingService ? 'PUT' : 'POST';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(serviceForm)
        });

        setEditingService(null);
        setServiceForm({ name: '', description: '', price: '', duration: '', setupTime: '', downTime: '' });
        fetchServices();
    };

    const handleEditService = (s: Service) => {
        setEditingService(s);
        setServiceForm({
            name: s.name, description: s.description || '', price: s.price.toString(),
            duration: s.duration.toString(), setupTime: s.setupTime.toString(), downTime: s.downTime.toString()
        });
    };

    const handleDeleteService = async (id: string) => {
        if (!confirm('Weet u zeker dat u deze dienst wilt verwijderen?')) return;
        await fetch(`/api/services/${id}`, { method: 'DELETE' });
        fetchServices();
    };

    useEffect(() => {
        if (!selectedDate) {
            setSelectedDayAppointments([]);
            return;
        }

        // Filter appointments for the currently selected date
        const filtered = appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate.getFullYear() === selectedDate.getFullYear() &&
                aptDate.getMonth() === selectedDate.getMonth() &&
                aptDate.getDate() === selectedDate.getDate();
        });

        setSelectedDayAppointments(filtered);
    }, [appointments, selectedDate]);

    // Calendar generation logic
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => {
        let day = new Date(year, month, 1).getDay();
        // Convert Sunday (0) to 7 so Monday is 1
        return day === 0 ? 7 : day;
    };

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Create array of days to render (including empty slots for padding)
    const calendarDays = [];

    // Padding for previous month
    for (let i = 1; i < firstDay; i++) {
        calendarDays.push({ day: null, date: null });
    }

    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push({ day: i, date: new Date(year, month, i) });
    }

    const nextMonth = () => {
        setCurrentMonth(new Date(year, month + 1, 1));
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(year, month - 1, 1));
    };

    const monthNames = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"];
    const dayNames = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

    // Helper to check if a date has appointments
    const hasAppointments = (date: Date) => {
        return appointments.some(apt => {
            const aptDate = new Date(apt.date);
            return aptDate.getFullYear() === date.getFullYear() &&
                aptDate.getMonth() === date.getMonth() &&
                aptDate.getDate() === date.getDate();
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
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Beheer uw praktijk efficiënt.</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('appointments')}
                    className="btn"
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: activeTab === 'appointments' ? 'var(--primary)' : 'var(--surface)',
                        color: activeTab === 'appointments' ? 'white' : 'var(--text-main)',
                        border: '1px solid var(--surface-border)',
                        fontWeight: 600
                    }}
                >
                    Kalender & Afspraken
                </button>
                {currentUser?.role === 'ADMIN' && (
                    <>
                        <button
                            onClick={() => setActiveTab('services')}
                            className="btn"
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: activeTab === 'services' ? 'var(--primary)' : 'var(--surface)',
                                color: activeTab === 'services' ? 'white' : 'var(--text-main)',
                                border: '1px solid var(--surface-border)',
                                fontWeight: 600
                            }}
                        >
                            Diensten Beheer
                        </button>
                        <button
                            onClick={() => setActiveTab('klanten')}
                            className="btn"
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: activeTab === 'klanten' ? 'var(--primary)' : 'var(--surface)',
                                color: activeTab === 'klanten' ? 'white' : 'var(--text-main)',
                                border: '1px solid var(--surface-border)',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Users size={18} /> Klanten
                        </button>
                    </>
                )}
            </div>

            {activeTab === 'appointments' && (

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '2rem' }}>

                    {/* Calendar Pane */}
                    <div className="glass-panel" style={{ padding: '2rem', background: 'var(--surface)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CalendarIcon size={20} />
                                {monthNames[month]} {year}
                            </h2>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={prevMonth} className="btn" style={{ padding: '0.5rem', background: 'var(--background-start)', borderRadius: 'var(--radius-md)' }}>
                                    <ChevronLeft size={20} />
                                </button>
                                <button onClick={nextMonth} className="btn" style={{ padding: '0.5rem', background: 'var(--background-start)', borderRadius: 'var(--radius-md)' }}>
                                    <ChevronRight size={20} />
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

                                const hasApts = hasAppointments(item.date);
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
                                        {hasApts && (
                                            <div style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                background: isSelected ? 'white' : 'var(--primary)',
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

                        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem' }}>
                            {selectedDate ? (
                                <>Afspraken op {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}</>
                            ) : 'Selecteer een datum'}
                        </h2>

                        {loading ? (
                            <p style={{ color: 'var(--text-muted)' }}>Afspraken laden...</p>
                        ) : !selectedDate ? (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                                <p style={{ fontSize: '1.25rem' }}>Klik op een dag in de kalender om de afspraken te zien.</p>
                            </div>
                        ) : selectedDayAppointments.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🏖️</div>
                                <p style={{ fontSize: '1.25rem' }}>Geen afspraken gepland voor deze datum.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {selectedDayAppointments.map((apt, index) => (
                                    <div key={apt.id} className="animate-fade-in" style={{
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
                                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>{apt.startTime}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{apt.endTime}</div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                                                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{apt.patientName}</h3>
                                                {apt.service && (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))', color: '#6366f1', border: '1px solid rgba(99,102,241,0.3)' }}>
                                                        💼 {apt.service.name}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                                {currentUser?.role === 'ADMIN' ? (
                                                    <>
                                                        <span>📞 {apt.phone}</span>
                                                        <span>✉️ {apt.email}</span>
                                                    </>
                                                ) : (
                                                    <span>(Contactgegevens verborgen)</span>
                                                )}
                                            </div>
                                            {apt.notes && (
                                                <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--background-start)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', borderLeft: '3px solid var(--primary)' }}>
                                                    <strong>Notitie:</strong> {apt.notes}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <span style={{
                                                padding: '0.5rem 1rem',
                                                background: apt.status === 'CONFIRMED' ? '#dcfce7' : '#fef08a',
                                                color: apt.status === 'CONFIRMED' ? '#166534' : '#854d0e',
                                                borderRadius: 'var(--radius-full)',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                letterSpacing: '0.5px'
                                            }}>
                                                {apt.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'services' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                    {/* Add / Edit Form */}
                    <div className="glass-panel" style={{ padding: '2rem', background: 'var(--surface)' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>{editingService ? 'Dienst Bewerken' : 'Nieuwe Dienst'}</h2>
                        <form onSubmit={handleServiceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Naam</label>
                                <input type="text" value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} className="form-input" required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Beschrijving (optioneel)</label>
                                <textarea value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} className="form-input" rows={3} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Prijs (€)</label>
                                    <input type="number" step="0.01" value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })} className="form-input" required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Duur (min)</label>
                                    <input type="number" value={serviceForm.duration} onChange={e => setServiceForm({ ...serviceForm, duration: e.target.value })} className="form-input" required />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Voorbereidingstijd (min)</label>
                                    <input type="number" value={serviceForm.setupTime} onChange={e => setServiceForm({ ...serviceForm, setupTime: e.target.value })} className="form-input" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Opruimtijd (min)</label>
                                    <input type="number" value={serviceForm.downTime} onChange={e => setServiceForm({ ...serviceForm, downTime: e.target.value })} className="form-input" />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingService ? 'Opslaan' : 'Toevoegen'}</button>
                                {editingService && (
                                    <button type="button" onClick={() => { setEditingService(null); setServiceForm({ name: '', description: '', price: '', duration: '', setupTime: '', downTime: '' }); }} className="btn" style={{ background: 'var(--surface-border)' }}>Annuleren</button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Services List */}
                    <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(255,255,255,0.6)' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Beschikbare Diensten</h2>
                        {services.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>Geen diensten gevonden.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {services.map(s => (
                                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)' }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--primary)' }}>{s.name} <span style={{ color: 'var(--text-main)', fontSize: '1rem' }}>- €{s.price}</span></h3>
                                            {s.description && <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{s.description}</p>}
                                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                <span>⏱️ Duur: {s.duration}m</span>
                                                {s.setupTime > 0 && <span>🔧 Prep: {s.setupTime}m</span>}
                                                {s.downTime > 0 && <span>🧹 Opruim: {s.downTime}m</span>}
                                                <span><strong>Totaal Tijd: {s.duration + s.setupTime + s.downTime}m</strong></span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => handleEditService(s)} className="btn" style={{ padding: '0.5rem 1rem', background: 'var(--primary-light)', color: 'white' }}>Bewerk</button>
                                            <button onClick={() => handleDeleteService(s.id)} className="btn" style={{ padding: '0.5rem 1rem', background: '#fee2e2', color: '#b91c1c' }}>Verwijder</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {activeTab === 'klanten' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Appointment Detail Modal */}
                    {selectedApt && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedApt(null)}>
                            <div className="glass-panel" style={{ background: 'white', padding: '2.5rem', borderRadius: 'var(--radius-xl)', maxWidth: '600px', width: '90%', position: 'relative' }} onClick={e => e.stopPropagation()}>
                                <button onClick={() => setSelectedApt(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--secondary)' }}>Afspraak Details</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', fontSize: '0.95rem' }}>
                                    <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Patient</strong>{selectedApt.patientName}</div>
                                    <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>E-mail</strong>{selectedApt.email}</div>
                                    <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Telefoon</strong>{selectedApt.phone}</div>
                                    <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Status</strong>
                                        <span style={{ padding: '0.25rem 0.75rem', background: selectedApt.status === 'CONFIRMED' ? '#dcfce7' : '#fef08a', color: selectedApt.status === 'CONFIRMED' ? '#166534' : '#854d0e', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>{selectedApt.status}</span>
                                    </div>
                                    <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Datum</strong>{new Date(selectedApt.date).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                    <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Tijd</strong>{selectedApt.startTime} - {selectedApt.endTime}</div>
                                    <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Behandeling</strong>{selectedApt.service?.name || 'Algemene afspraak'}</div>
                                    {selectedApt.service?.price && <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Prijs</strong>€{selectedApt.service.price}</div>}
                                </div>
                                {selectedApt.notes && (
                                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary)' }}>
                                        <strong>Notitie:</strong> {selectedApt.notes}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Geregistreerde Klanten */}
                    <div className="glass-panel" style={{ padding: '2rem', background: 'var(--surface)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
                                <Users size={24} /> Ingeschreven Klanten
                            </h2>
                            <span style={{ padding: '0.5rem 1rem', background: '#dcfce7', color: '#166534', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>{patients.length} ingeschreven</span>
                        </div>

                        {patients.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-muted)' }}>
                                <p>Nog geen ingeschreven klanten.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {patients.map((p: any) => {
                                    const isExpanded = expandedPatient === p.id;
                                    return (
                                        <div key={p.id} style={{ border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'white' }}>
                                            {/* Clickable row */}
                                            <div
                                                onClick={() => setExpandedPatient(isExpanded ? null : p.id)}
                                                style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 30px', alignItems: 'center', padding: '1rem 1.5rem', cursor: 'pointer', transition: 'background 0.15s' }}
                                            >
                                                <div style={{ fontWeight: 600 }}>
                                                    {p.user?.name}
                                                    {p.regelmatigTandarts && <span style={{ marginLeft: '0.5rem', color: '#16a34a' }}>⭐</span>}
                                                </div>
                                                <div style={{ fontSize: '0.875rem' }}>
                                                    <div>{p.user?.email}</div>
                                                    <div style={{ color: 'var(--text-muted)' }}>{p.mobieleNummer}</div>
                                                </div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{p.geboortedatum}</div>
                                                <div style={{ fontSize: '0.875rem' }}>{p.appointments?.length || 0} afspraken</div>
                                                <ChevronDown size={18} style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }} />
                                            </div>

                                            {/* Expanded detail panel */}
                                            {isExpanded && (
                                                <div style={{ borderTop: '1px solid var(--surface-border)', padding: '1.5rem', background: 'var(--surface)' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem', fontSize: '0.9rem' }}>
                                                        <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Adres</strong>{p.straatEnHuisnummer}, {p.postcode} {p.plaats}</div>
                                                        <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Geslacht</strong>{p.geslacht}</div>
                                                        <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Telefoon Thuis</strong>{p.telefoonThuis || '-'}</div>
                                                        <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Verzekeraar</strong>{p.naamVerzekeraar || '-'}</div>
                                                        <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Polisnummer</strong>{p.verzekeringsnummer || '-'}</div>
                                                        <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>BSN</strong>{p.bsnNummer || '-'}</div>
                                                        <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Aanvullend Verzekerd</strong>{p.aanvullendVerzekerd ? 'Ja' : 'Nee'}</div>
                                                        <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Laatste Tandarts</strong>{p.laatsteTandarts || '-'}</div>
                                                        <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Reden Afspraak</strong>{p.redenAfspraak || '-'}</div>
                                                        {p.onderBehandelingArts && <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Arts/Specialist</strong>{p.naamArts || 'Ja'}</div>}
                                                        {p.gebruiktMedicijnen && <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Medicijnen</strong>{p.naamMedicijnen || 'Ja'}</div>}
                                                    </div>

                                                    <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>Afspraken ({p.appointments?.length || 0})</h4>
                                                    {(!p.appointments || p.appointments.length === 0) ? (
                                                        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Geen afspraken gevonden.</p>
                                                    ) : (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                            {p.appointments.map((apt: any) => (
                                                                <div
                                                                    key={apt.id}
                                                                    onClick={() => setSelectedApt(apt)}
                                                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                                                                >
                                                                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', fontSize: '0.875rem' }}>
                                                                        <span style={{ fontWeight: 600 }}>{new Date(apt.date).toLocaleDateString('nl-NL')}</span>
                                                                        <span>{apt.startTime} - {apt.endTime}</span>
                                                                        <span style={{ color: 'var(--primary)' }}>{apt.service?.name || 'Afspraak'}</span>
                                                                    </div>
                                                                    <span style={{ padding: '0.2rem 0.6rem', background: apt.status === 'CONFIRMED' ? '#dcfce7' : '#fef08a', color: apt.status === 'CONFIRMED' ? '#166534' : '#854d0e', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>{apt.status}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Gast Klanten */}
                    <div className="glass-panel" style={{ padding: '2rem', background: 'var(--surface)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                <Users size={24} /> Gasten (Niet Ingeschreven)
                            </h2>
                            <span style={{ padding: '0.5rem 1rem', background: '#fef08a', color: '#854d0e', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>{guests.length} gasten</span>
                        </div>

                        {guests.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-muted)' }}>
                                <p>Geen gastboekingen gevonden.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {guests.map((g: any, idx: number) => {
                                    const isExpanded = expandedGuest === g.email;
                                    return (
                                        <div key={idx} style={{ border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'white' }}>
                                            <div
                                                onClick={() => setExpandedGuest(isExpanded ? null : g.email)}
                                                style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 30px', alignItems: 'center', padding: '1rem 1.5rem', cursor: 'pointer', transition: 'background 0.15s' }}
                                            >
                                                <div style={{ fontWeight: 600 }}>{g.name}</div>
                                                <div style={{ fontSize: '0.875rem' }}>{g.email}</div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{g.phone}</div>
                                                <div style={{ fontSize: '0.875rem' }}>{g.appointments.length} afspraken</div>
                                                <ChevronDown size={18} style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }} />
                                            </div>

                                            {isExpanded && (
                                                <div style={{ borderTop: '1px solid var(--surface-border)', padding: '1.5rem', background: 'var(--surface)' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                                        <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Naam</strong>{g.name}</div>
                                                        <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>E-mail</strong>{g.email}</div>
                                                        <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Telefoon</strong>{g.phone}</div>
                                                    </div>

                                                    <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>Afspraken ({g.appointments.length})</h4>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        {g.appointments.map((apt: any) => (
                                                            <div
                                                                key={apt.id}
                                                                onClick={() => setSelectedApt(apt)}
                                                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                                                            >
                                                                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', fontSize: '0.875rem' }}>
                                                                    <span style={{ fontWeight: 600 }}>{new Date(apt.date).toLocaleDateString('nl-NL')}</span>
                                                                    <span>{apt.startTime} - {apt.endTime}</span>
                                                                    <span style={{ color: 'var(--primary)' }}>{apt.service?.name || 'Afspraak'}</span>
                                                                </div>
                                                                <span style={{ padding: '0.2rem 0.6rem', background: apt.status === 'CONFIRMED' ? '#dcfce7' : '#fef08a', color: apt.status === 'CONFIRMED' ? '#166534' : '#854d0e', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>{apt.status}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
