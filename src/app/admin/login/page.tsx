"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('admin_role', data.role);
                router.push('/admin');
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || 'Login mislukt');
            }
        } catch {
            setError('Netwerkfout');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background-start)' }}>
            <div className="glass-panel animate-fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--primary)', letterSpacing: '-0.05em', fontWeight: 800 }}>Stralend Admin</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Log in om de praktijk te beheren</p>

                {error && <div style={{ color: '#b91c1c', marginBottom: '1.5rem', background: '#fee2e2', padding: '1rem', borderRadius: 'var(--radius-md)' }}>{error}</div>}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            type="email"
                            placeholder="E-mailadres"
                            className="form-input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoFocus
                            style={{ padding: '1rem' }}
                        />
                        <input
                            type="password"
                            placeholder="Wachtwoord"
                            className="form-input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            style={{ padding: '1rem' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '1rem', width: '100%', fontSize: '1.125rem' }}>
                        {loading ? 'Bezig...' : 'Inloggen'}
                    </button>
                </form>

                <div style={{ marginTop: '2.5rem' }}>
                    <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>&larr; Terug naar de publieke website</Link>
                </div>
            </div>
        </div>
    );
}
