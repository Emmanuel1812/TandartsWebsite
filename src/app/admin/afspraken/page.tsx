"use client";

import { useState, useEffect, useMemo } from "react";
import { format, isPast, isToday, parseISO } from "date-fns";
import { nl } from "date-fns/locale";
import { Search, Calendar, Clock, User, Filter, CheckCircle2, Clock3, XCircle, X, Mail, Phone, FileText, Briefcase } from "lucide-react";

type Appointment = {
    id: string;
    patientName: string;
    email: string;
    phone: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
    status?: string;
    service?: {
        id: string;
        name: string;
        duration: number;
        price: number;
    } | null;
};

export default function AfsprakenPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userRole, setUserRole] = useState<string | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "UPCOMING" | "PAST">("ALL");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const meRes = await fetch("/api/auth/me");
                if (meRes.ok) {
                    const meData = await meRes.json();
                    setUserRole(meData.role);
                }

                const res = await fetch("/api/appointments");
                if (!res.ok) throw new Error("Fout bij ophalen afspraken");
                const data = await res.json();
                const appointmentsData = Array.isArray(data) ? data : data.appointments || [];

                const enrichedData = appointmentsData.map((apt: any) => {
                    const aptDateTime = parseISO(`${apt.date}T${apt.startTime}`);
                    let implicitStatus = 'SCHEDULED';
                    if (isPast(aptDateTime)) implicitStatus = 'COMPLETED';
                    return { ...apt, status: apt.status || implicitStatus };
                });

                setAppointments(enrichedData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredAppointments = useMemo(() => {
        return appointments
            .filter((apt) => {
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch =
                    apt.patientName.toLowerCase().includes(searchLower) ||
                    (apt.email?.toLowerCase() || "").includes(searchLower) ||
                    (apt.service?.name?.toLowerCase() || "").includes(searchLower) ||
                    (apt.notes?.toLowerCase() || "").includes(searchLower);
                if (!matchesSearch) return false;

                const aptDate = parseISO(`${apt.date}T00:00:00`);
                if (statusFilter === 'UPCOMING' && isPast(aptDate) && !isToday(aptDate)) return false;
                if (statusFilter === 'PAST' && !isPast(aptDate)) return false;
                return true;
            })
            .sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.startTime}`).getTime();
                const dateB = new Date(`${b.date}T${b.startTime}`).getTime();
                return statusFilter === 'PAST' ? dateB - dateA : dateA - dateB;
            });
    }, [appointments, searchTerm, statusFilter]);

    const renderStatusBadge = (apt: Appointment) => {
        const aptDateTime = parseISO(`${apt.date}T${apt.startTime}`);

        if (apt.status === 'CANCELLED') {
            return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}><XCircle size={14} /> Geannuleerd</span>;
        }
        if (isPast(aptDateTime) && !isToday(aptDateTime)) {
            return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: '#d1fae5', color: '#047857', border: '1px solid #6ee7b7' }}><CheckCircle2 size={14} /> Voltooid</span>;
        }
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: '#dbeafe', color: '#1d4ed8', border: '1px solid #93c5fd' }}><Clock3 size={14} /> Gepland</span>;
    };

    const obfuscateEmail = (email: string) => email ? email.replace(/(.{2})(.*)(?=@)/, '$1***') : 'Geen email';
    const obfuscatePhone = (phone: string) => phone ? phone.replace(/.(?=.{4})/g, '*') : 'Geen telefoonnummer';

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Afspraken laden...</div>;
    if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#b91c1c', background: '#fee2e2', borderRadius: 'var(--radius-lg)' }}>{error}</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Afspraken</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>Beheer en overzie alle ingeplande afspraken.</p>
            </div>

            {/* Filter Bar */}
            <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--surface-border)' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                    <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                    <input
                        type="text"
                        placeholder="Zoek op patiënt, service of notitie..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem 1rem 0.5rem 2.5rem',
                            border: '1px solid var(--surface-border)',
                            borderRadius: 'var(--radius-lg)',
                            background: 'rgba(255,255,255,0.5)',
                            outline: 'none',
                            color: 'var(--text-main)',
                            fontSize: '0.875rem'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                    <Filter style={{ color: 'var(--text-muted)', marginRight: '0.5rem', flexShrink: 0 }} size={18} />
                    {(['ALL', 'UPCOMING', 'PAST'] as const).map(filter => (
                        <button
                            key={filter}
                            onClick={() => setStatusFilter(filter)}
                            style={{
                                padding: '0.375rem 1rem',
                                borderRadius: '9999px',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                                border: 'none',
                                cursor: 'pointer',
                                background: statusFilter === filter ? 'var(--primary)' : 'rgba(0,0,0,0.05)',
                                color: statusFilter === filter ? 'white' : 'var(--text-muted)',
                                boxShadow: statusFilter === filter ? 'var(--shadow-sm)' : 'none'
                            }}
                        >
                            {filter === 'ALL' ? 'Alles' : filter === 'UPCOMING' ? 'Aankomend' : 'Verleden'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Data Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {filteredAppointments.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.5)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--surface-border)' }}>
                        Geen afspraken gevonden die voldoen aan je zoekcriteria.
                    </div>
                ) : (
                    filteredAppointments.map((apt, idx) => {
                        const isCompleted = isPast(parseISO(`${apt.date}T00:00:00`)) && !isToday(parseISO(`${apt.date}T00:00:00`));

                        return (
                            <div
                                key={apt.id}
                                className="glass-panel animate-fade-in"
                                onClick={() => setSelectedAppointment(apt)}
                                style={{
                                    padding: '1.5rem',
                                    position: 'relative',
                                    animationDelay: `${idx * 50}ms`,
                                    borderTop: `4px solid ${isCompleted ? '#10b981' : 'var(--primary)'}`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                            <User size={18} style={{ color: 'var(--text-muted)' }} />
                                            {apt.patientName}
                                        </h3>
                                        {apt.service && (
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.5rem', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}>
                                                <Briefcase size={12} />
                                                {apt.service.name}
                                            </div>
                                        )}
                                    </div>
                                    {renderStatusBadge(apt)}
                                </div>

                                <div style={{ background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-lg)', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--surface-border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)', fontWeight: 500, fontSize: '0.875rem' }}>
                                        <Calendar size={16} style={{ color: 'var(--primary)' }} />
                                        {format(parseISO(apt.date), 'EEEE d MMMM yyyy', { locale: nl })}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)', fontWeight: 500, fontSize: '0.875rem' }}>
                                        <Clock size={16} style={{ color: 'var(--primary)' }} />
                                        {apt.startTime} – {apt.endTime}
                                    </div>
                                </div>

                                <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                                    Klik voor details →
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)' }}>
                Toont {filteredAppointments.length} afspraken.
            </div>

            {/* Detail Modal */}
            {selectedAppointment && (
                <div
                    onClick={() => setSelectedAppointment(null)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="glass-panel"
                        style={{
                            width: '100%',
                            maxWidth: '520px',
                            margin: '1rem',
                            padding: 0,
                            overflow: 'hidden',
                            animation: 'slideUp 0.25s ease-out'
                        }}
                    >
                        {/* Modal Header */}
                        <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', padding: '1.5rem 2rem', color: 'white', position: 'relative' }}>
                            <button
                                onClick={() => setSelectedAppointment(null)}
                                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                            >
                                <X size={18} />
                            </button>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{selectedAppointment.patientName}</h2>
                            <div style={{ marginTop: '0.5rem' }}>{renderStatusBadge(selectedAppointment)}</div>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Service */}
                            {selectedAppointment.service && (
                                <DetailRow icon={<Briefcase size={18} style={{ color: '#6366f1' }} />} label="Behandeling" value={`${selectedAppointment.service.name} (${selectedAppointment.service.duration} min · €${selectedAppointment.service.price.toFixed(2)})`} />
                            )}

                            {/* Date */}
                            <DetailRow icon={<Calendar size={18} style={{ color: 'var(--primary)' }} />} label="Datum" value={format(parseISO(selectedAppointment.date), 'EEEE d MMMM yyyy', { locale: nl })} />

                            {/* Time */}
                            <DetailRow icon={<Clock size={18} style={{ color: 'var(--primary)' }} />} label="Tijd" value={`${selectedAppointment.startTime} – ${selectedAppointment.endTime}`} />

                            {/* Email */}
                            <DetailRow
                                icon={<Mail size={18} style={{ color: 'var(--primary)' }} />}
                                label="E-mail"
                                value={userRole === 'WORKER' ? obfuscateEmail(selectedAppointment.email) : (selectedAppointment.email || 'Geen email')}
                            />

                            {/* Phone */}
                            <DetailRow
                                icon={<Phone size={18} style={{ color: 'var(--primary)' }} />}
                                label="Telefoon"
                                value={userRole === 'WORKER' ? obfuscatePhone(selectedAppointment.phone) : (selectedAppointment.phone || 'Geen telefoonnummer')}
                            />

                            {/* Notes */}
                            {selectedAppointment.notes && (
                                <DetailRow icon={<FileText size={18} style={{ color: 'var(--primary)' }} />} label="Notities" value={selectedAppointment.notes} />
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div style={{ marginTop: '2px', flexShrink: 0 }}>{icon}</div>
            <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-main)', marginTop: '0.125rem' }}>{value}</div>
            </div>
        </div>
    );
}
