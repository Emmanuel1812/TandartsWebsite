'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/AnimatedSection';

import { Suspense } from 'react';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isRegistered = searchParams.get('registered') === 'true';

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Inloggen mislukt');
            }

            // Store user info in localStorage for this prototype
            localStorage.setItem('user', JSON.stringify(result.user));

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ width: '100%', maxWidth: '500px', padding: '3rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)' }} className="glass-panel">
            <FadeInUp>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--secondary)' }}>Inloggen als Patiënt</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Log in om uw afspraken te bekijken of te beheren.</p>
                </div>
            </FadeInUp>

            {isRegistered && (
                <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                    Inschrijving succesvol! U kunt nu inloggen met uw gekozen wachtwoord.
                </div>
            )}

            {error && (
                <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <StaggerContainer>
                    <StaggerItem>
                        <label className="form-label">E-mailadres</label>
                        <input type="email" name="email" className="form-input" required />
                    </StaggerItem>

                    <StaggerItem>
                        <label className="form-label" style={{ marginTop: '1.5rem' }}>Wachtwoord</label>
                        <input type="password" name="password" className="form-input" required />
                    </StaggerItem>

                    <StaggerItem>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', marginTop: '2rem', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Bezig met inloggen...' : 'Inloggen'}
                        </button>
                    </StaggerItem>

                    <StaggerItem>
                        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Nog geen account? </span>
                            <Link href="/inschrijven" className="text-primary hover:text-secondary transition-colors" style={{ fontWeight: 600 }}>Schrijf je in</Link>
                        </div>
                    </StaggerItem>
                </StaggerContainer>
            </form>
        </div>
    );
}

export default function LoginPage() {
    return (
        <main style={{ background: 'var(--surface)', minHeight: '100vh', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '500px', marginBottom: '2rem' }}>
                <Link href="/" className="hover:text-primary transition-colors" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <ChevronLeft size={20} /> Terug naar Home
                </Link>
            </div>
            <Suspense fallback={<div>Laden...</div>}>
                <LoginContent />
            </Suspense>
        </main>
    );
}
