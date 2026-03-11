"use client";

import { useState, useEffect } from "react";
import { User, Mail, Shield, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MijnAccountPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (!res.ok) {
                    if (res.status === 401) {
                        router.push('/admin/login');
                        return;
                    }
                    throw new Error("Niet geautoriseerd of sessie verlopen");
                }
                const data = await res.json();
                setUser(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    if (loading) return <div className="p-8 text-center text-gray-500">Gegevens laden...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!user) return null;

    // Helper functions for UI
    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'Beheerder';
            case 'WORKER': return 'Medewerker';
            default: return role;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'WORKER': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Mijn Account</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>Bekijk je persoonlijke profielgegevens.</p>
            </div>

            <div className="glass-panel overflow-hidden relative">
                {/* Decorative background header */}
                <div style={{ height: '120px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', opacity: 0.8 }} />
                
                <div style={{ padding: '0 2rem 2.5rem 2rem', position: 'relative' }}>
                    
                    {/* Avatar Badge */}
                    <div style={{ 
                        marginTop: '-3rem', 
                        marginBottom: '1.5rem',
                        display: 'inline-flex',
                        background: 'var(--surface)',
                        padding: '0.5rem',
                        borderRadius: '50%',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '50%', 
                            background: 'var(--primary-light)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: 'var(--primary)'
                        }}>
                            <UserCircle2 size={48} strokeWidth={1.5} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Status / Role Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className={`px-4 py-1.5 rounded-full text-sm font-bold border flex items-center gap-2 ${getRoleColor(user.role)}`}>
                                <Shield size={16} />
                                {getRoleLabel(user.role)} Account
                            </div>
                        </div>

                        {/* User Details Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                            
                            {/* Name Field */}
                            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                                    <User size={18} />
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Volledige Naam</span>
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                    {user.name}
                                </div>
                            </div>

                            {/* Email Field */}
                            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                                    <Mail size={18} />
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>E-mailadres</span>
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-all' }}>
                                    {user.email}
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Neem contact op met een beheerder als je gegevens onjuist zijn.
            </div>
        </div>
    );
}
