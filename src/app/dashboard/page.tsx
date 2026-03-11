'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, LogOut, User, Activity, FileText, PlusCircle } from 'lucide-react';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/AnimatedSection';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [patientData, setPatientData] = useState<any>(null);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check auth
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(storedUser);
        setUser(userData);

        // Fetch dashboard data
        const fetchDashboard = async () => {
            try {
                const res = await fetch(`/api/dashboard?userId=${userData.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setAppointments(data.appointments || []);
                    setPatientData(data.patient);
                } else {
                    // If token/user is invalid for some reason
                    localStorage.removeItem('user');
                    router.push('/login');
                }
            } catch (err) {
                console.error('Failed to load dashboard', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Laden...
            </div>
        );
    }

    const now = new Date();
    const upcomingAppointments = appointments.filter(apt => new Date(apt.date) >= now);
    const pastAppointments = appointments.filter(apt => new Date(apt.date) < now);

    return (
        <div style={{ background: 'var(--background)', minHeight: '100vh' }}>

            {/* Dashboard Nav */}
            <nav style={{ background: 'white', padding: '1rem 2rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/" style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>Tandartspraktijk Stralend</Link>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>| Patiëntenportaal</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/boeken" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PlusCircle size={16} /> Afspraak Maken
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                        <User size={18} className="text-primary" />
                        Welkom, {user?.name.split(' ')[0]}
                    </div>
                    <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LogOut size={16} /> Uitloggen
                    </button>
                </div>
            </nav>

            <main className="container" style={{ padding: '3rem 1.5rem' }}>
                <FadeInUp>
                    <div style={{ marginBottom: '3rem' }}>
                        <h1 style={{ fontSize: '2.5rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>Mijn Dashboard</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Overzicht van uw komende en in het verleden geplande afspraken.</p>
                    </div>
                </FadeInUp>

                <div className="grid-3" style={{ gap: '2rem' }}>

                    {/* Afspraken Kolom (2/3 width) */}
                    <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Aankomend */}
                        <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                                <Calendar size={20} /> Aankomende Afspraken
                            </h2>

                            {upcomingAppointments.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>U heeft momenteel geen aankomende afspraken ingepland.</p>
                                    <Link href="/boeken" className="btn btn-primary">Nieuwe afspraak maken</Link>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {upcomingAppointments.map((apt, idx) => (
                                        <div key={idx} style={{ padding: '1.5rem', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                                                    {apt.service?.name || "Algemene Afspraak"}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Calendar size={14} /> {new Date(apt.date).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </span>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Clock size={14} /> {apt.startTime} - {apt.endTime}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: '#dcfce7', color: '#166534', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
                                                    {apt.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Verleden */}
                        <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                <Clock size={20} /> Historie Afspraken
                            </h2>

                            {pastAppointments.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)' }}>Er zijn nog geen eerdere afspraken gevonden.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', opacity: 0.8 }}>
                                    {pastAppointments.map((apt, idx) => (
                                        <div key={idx} style={{ padding: '1rem 1.5rem', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                                <div style={{ fontWeight: 500 }}>{new Date(apt.date).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                                                <div>{apt.service?.name || "Afspraak"}</div>
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Betaling Voldaan</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Zijkolom (1/3 width) - Persoonlijk & Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <User size={18} /> Mijn Gegevens
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                                <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Naam</strong> {user?.name}</div>
                                <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>E-mail</strong> {user?.email}</div>
                                {patientData && (
                                    <>
                                        <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Telefoon</strong> {patientData.mobieleNummer}</div>
                                        <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Geboortedatum</strong> {new Date(patientData.geboortedatum).toLocaleDateString('nl-NL')}</div>
                                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)' }}>
                                            <Link href="#" style={{ color: 'var(--primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                Gegevens bewerken
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Activity size={18} /> Dossier Status
                            </h3>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }}></div>
                                    Inschrijving Voltooid
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }}></div>
                                    Medische Vragenlijst Ingeleverd
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }}></div>
                                    Wachtend op eerste controle
                                </li>
                            </ul>
                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
}
