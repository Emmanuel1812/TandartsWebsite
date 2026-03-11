"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        setRole(localStorage.getItem('admin_role'));
    }, []);

    const handleLogout = async () => {
        await fetch('/api/auth', { method: 'DELETE' });
        localStorage.removeItem('admin_role');
        router.push('/admin/login');
        router.refresh();
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background-start)' }}>
            {/* Sidebar */}
            <aside style={{ width: '280px', background: 'var(--surface)', backdropFilter: 'blur(16px)', borderRight: '1px solid var(--surface-border)', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
                <div style={{ padding: '2.5rem 2rem', borderBottom: '1px solid var(--surface-border)' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.75rem', color: 'var(--primary)', letterSpacing: '-0.05em' }}>Stralend.</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, marginTop: '0.25rem' }}>Praktijk Management</div>
                </div>

                <nav style={{ flex: 1, padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Link href="/admin" style={{
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        background: pathname === '/admin' ? 'var(--primary-light)' : 'transparent',
                        color: pathname === '/admin' ? 'var(--primary-hover)' : 'var(--text-main)',
                        fontWeight: pathname === '/admin' ? 600 : 500,
                        transition: 'var(--transition)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <span style={{ fontSize: '1.25rem' }}>📋</span> Dashboard
                    </Link>

                    <Link href="/admin/mijn-account" style={{
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        background: pathname === '/admin/mijn-account' ? 'var(--primary-light)' : 'transparent',
                        color: pathname === '/admin/mijn-account' ? 'var(--primary-hover)' : 'var(--text-main)',
                        fontWeight: pathname === '/admin/mijn-account' ? 600 : 500,
                        transition: 'var(--transition)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <span style={{ fontSize: '1.25rem' }}>👤</span> Mijn Account
                    </Link>

                    <Link href="/admin/afspraken" style={{
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        background: pathname === '/admin/afspraken' ? 'var(--primary-light)' : 'transparent',
                        color: pathname === '/admin/afspraken' ? 'var(--primary-hover)' : 'var(--text-main)',
                        fontWeight: pathname === '/admin/afspraken' ? 600 : 500,
                        transition: 'var(--transition)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <span style={{ fontSize: '1.25rem' }}>📅</span> Afspraken
                    </Link>

                    {role === 'WORKER' && (
                        <Link href="/admin/mijn-rooster" style={{
                            padding: '1rem 1.25rem',
                            borderRadius: 'var(--radius-md)',
                            background: pathname === '/admin/mijn-rooster' ? 'var(--primary-light)' : 'transparent',
                            color: pathname === '/admin/mijn-rooster' ? 'var(--primary-hover)' : 'var(--text-main)',
                            fontWeight: pathname === '/admin/mijn-rooster' ? 600 : 500,
                            transition: 'var(--transition)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <span style={{ fontSize: '1.25rem' }}>📅</span> Afspraak Rooster
                        </Link>
                    )}

                    {role === 'ADMIN' && (
                        <>
                            <Link href="/admin/rooster-aanmaken" style={{
                                padding: '1rem 1.25rem',
                                borderRadius: 'var(--radius-md)',
                                background: pathname === '/admin/rooster-aanmaken' ? 'var(--primary-light)' : 'transparent',
                                color: pathname === '/admin/rooster-aanmaken' ? 'var(--primary-hover)' : 'var(--text-main)',
                                fontWeight: pathname === '/admin/rooster-aanmaken' ? 600 : 500,
                                transition: 'var(--transition)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <span style={{ fontSize: '1.25rem' }}>📅</span> Medewerkers Rooster
                            </Link>

                            <Link href="/admin/roosters/werkrooster" style={{
                                padding: '1rem 1.25rem',
                                borderRadius: 'var(--radius-md)',
                                background: pathname === '/admin/roosters/werkrooster' ? 'var(--primary-light)' : 'transparent',
                                color: pathname === '/admin/roosters/werkrooster' ? 'var(--primary-hover)' : 'var(--text-main)',
                                fontWeight: pathname === '/admin/roosters/werkrooster' ? 600 : 500,
                                transition: 'var(--transition)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <span style={{ fontSize: '1.25rem' }}>🗓️</span> Roosterregistratie
                            </Link>
                        </>
                    )}
                    
                    {role === 'ADMIN' && (
                        <>
                            <Link href="/admin/users" style={{
                                padding: '1rem 1.25rem',
                                borderRadius: 'var(--radius-md)',
                                background: pathname === '/admin/users' ? 'var(--primary-light)' : 'transparent',
                                color: pathname === '/admin/users' ? 'var(--primary-hover)' : 'var(--text-main)',
                                fontWeight: pathname === '/admin/users' ? 600 : 500,
                                transition: 'var(--transition)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <span style={{ fontSize: '1.25rem' }}>👥</span> Gebruikers (Admin)
                            </Link>
                            <Link href="/admin/services" style={{
                                padding: '1rem 1.25rem',
                                borderRadius: 'var(--radius-md)',
                                background: pathname === '/admin/services' ? 'var(--primary-light)' : 'transparent',
                                color: pathname === '/admin/services' ? 'var(--primary-hover)' : 'var(--text-main)',
                                fontWeight: pathname === '/admin/services' ? 600 : 500,
                                transition: 'var(--transition)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <span style={{ fontSize: '1.25rem' }}>⚙️</span> Behandelingen
                            </Link>
                        </>
                    )}
                </nav>

                <div style={{ padding: '2rem 1.5rem' }}>
                    <button onClick={handleLogout} className="btn" style={{ width: '100%', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}>
                        🔒 Uitloggen
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '4rem', overflowY: 'auto' }}>
                <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
