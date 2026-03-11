"use client";

import { useState, useEffect } from "react";
import { UserPlus, Trash2, Mail, Shield, User } from "lucide-react";

type AppUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
};

export default function UsersPage() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "WORKER"
    });

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            if (!res.ok) throw new Error("Fout bij ophalen gebruikers");
            const data = await res.json();
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Fout bij aanmaken gebruiker");
            }
            setIsCreating(false);
            setFormData({ name: "", email: "", password: "", role: "WORKER" });
            fetchUsers();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Weet je zeker dat je deze gebruiker wilt verwijderen?")) return;
        try {
            const res = await fetch("/api/admin/users", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) throw new Error("Fout bij verwijderen gebruiker");
            fetchUsers();
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) return <div>Laden...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Gebruikersbeheer</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Beheer toegang en rechten voor medewerkers.</p>
                </div>
                {!isCreating && (
                    <button onClick={() => setIsCreating(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserPlus size={18} /> Nieuwe Gebruiker
                    </button>
                )}
            </div>

            {error && (
                <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    {error}
                </div>
            )}

            {isCreating && (
                <div className="glass-panel p-6 animate-fade-in">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserPlus size={20} className="text-blue-500" /> Gebruiker Aanmaken
                    </h2>
                    <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label className="form-label">Naam</label>
                            <input name="name" value={formData.name} onChange={handleChange} required className="form-input" placeholder="Naam medewerker" />
                        </div>
                        <div>
                            <label className="form-label">E-mailadres</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="form-input" placeholder="email@stralend.nl" />
                        </div>
                        <div>
                            <label className="form-label">Wachtwoord</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="form-input" placeholder="Minimaal 6 tekens" />
                        </div>
                        <div>
                            <label className="form-label">Rol</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="form-input">
                                <option value="WORKER">Medewerker (Beperkte rechten)</option>
                                <option value="ADMIN">Beheerder (Volledige rechten)</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button type="button" onClick={() => setIsCreating(false)} className="btn" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>Annuleren</button>
                            <button type="submit" className="btn btn-primary">Opslaan</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass-panel overflow-hidden">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--surface-border)' }}>
                        <tr>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Naam</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Contact</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Rol</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)' }}>Acties</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--surface-border)', transition: 'background 0.2s', ':hover': { background: 'rgba(0,0,0,0.01)' } } as React.CSSProperties}>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                                            {user.name.charAt(0)}
                                        </div>
                                        <span style={{ fontWeight: 500 }}>{user.name}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Mail size={14} /> {user.email}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    {user.role === 'ADMIN' ? (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#dbeafe', color: '#1d4ed8', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 500 }}>
                                            <Shield size={14} /> Beheerder
                                        </span>
                                    ) : (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#f3f4f6', color: '#4b5563', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 500 }}>
                                            <User size={14} /> Medewerker
                                        </span>
                                    )}
                                </td>
                                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                    <button 
                                        onClick={() => handleDelete(user.id)}
                                        className="btn" 
                                        style={{ padding: '0.5rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)' }}
                                        title="Verwijderen"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Geen gebruikers gevonden.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
