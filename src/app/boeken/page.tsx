"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BookingPage() {
    const [date, setDate] = useState('');
    const [slots, setSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    const [services, setServices] = useState<any[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [isLoadingServices, setIsLoadingServices] = useState(true);

    const [formData, setFormData] = useState({ patientName: '', email: '', phone: '', notes: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/services')
            .then(res => res.json())
            .then(data => {
                setServices(data || []);
                setIsLoadingServices(false);
            })
            .catch(() => {
                setServices([]);
                setIsLoadingServices(false);
            });
    }, []);

    useEffect(() => {
        if (date) {
            setSelectedSlot('');
            setIsLoadingSlots(true);
            fetch(`/api/available-times?date=${date}`)
                .then(res => res.json())
                .then(data => {
                    setSlots(data.availableSlots || []);
                    setIsLoadingSlots(false);
                })
                .catch(() => {
                    setSlots([]);
                    setIsLoadingSlots(false);
                });
        }
    }, [date]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, date, startTime: selectedSlot, serviceId: selectedServiceId }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Er is iets misgegaan.');
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="section container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <nav style={{ width: '100%', marginBottom: '3rem', textAlign: 'left' }}>
                <Link href="/" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '1.25rem' }}>&larr; Terug naar home</Link>
            </nav>

            <div className="glass-panel animate-fade-in" style={{ maxWidth: '900px', width: '100%', padding: '4rem 3rem', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '1rem' }}>Maak een Afspraak</h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.125rem' }}>
                    Selecteer een gewenste datum en tijd voor uw behandeling.
                </p>

                {success ? (
                    <div className="animate-fade-in" style={{ textAlign: 'center', padding: '3rem 0' }}>
                        <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🎉</div>
                        <h2 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '2rem' }}>Afspraak Bevestigd!</h2>
                        <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>We hebben uw afspraak op <strong style={{ color: 'var(--secondary)' }}>{date}</strong> om <strong style={{ color: 'var(--secondary)' }}>{selectedSlot}</strong> succesvol ingepland.</p>
                        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Tot dan, {formData.patientName}!</p>
                        <div style={{ marginTop: '3rem' }}>
                            <Link href="/" className="btn btn-primary" style={{ padding: '1rem 3rem' }}>Terug naar Home</Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid-2" style={{ gap: '4rem', gridTemplateColumns: selectedSlot ? '1fr 1fr' : '1fr' }}>
                        {/* Left Column: Date and Time */}
                        <div style={{ maxWidth: selectedSlot ? '100%' : '500px', margin: selectedSlot ? '0' : '0 auto', width: '100%' }}>

                            <div className="form-group" style={{ marginBottom: '2rem' }}>
                                <label className="form-label" htmlFor="service" style={{ fontSize: '1.125rem' }}>1. Kies een Behandeling</label>
                                {isLoadingServices ? (
                                    <p style={{ color: 'var(--text-muted)' }}>Behandelingen laden...</p>
                                ) : (
                                    <select
                                        id="service"
                                        className="form-input"
                                        value={selectedServiceId}
                                        onChange={(e) => {
                                            setSelectedServiceId(e.target.value);
                                            setDate('');
                                            setSelectedSlot('');
                                        }}
                                        style={{ padding: '1rem', fontSize: '1.125rem', width: '100%', cursor: 'pointer' }}
                                    >
                                        <option value="" disabled>Selecteer een behandeling...</option>
                                        {services.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.duration} min)</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {selectedServiceId && (
                                <div className="form-group animate-fade-in delay-100">
                                    <label className="form-label" htmlFor="date" style={{ fontSize: '1.125rem' }}>2. Kies een Datum</label>
                                    <input
                                        type="date"
                                        id="date"
                                        className="form-input"
                                        value={date}
                                        min={new Date().toISOString().split('T')[0]} // Cannot book in the past
                                        onChange={(e) => setDate(e.target.value)}
                                        style={{ padding: '1rem', fontSize: '1.125rem' }}
                                    />
                                </div>
                            )}

                            {date && (
                                <div className="animate-fade-in delay-200" style={{ marginTop: '2.5rem' }}>
                                    <label className="form-label" style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>3. Beschikbare Tijden</label>
                                    {isLoadingSlots ? (
                                        <p style={{ color: 'var(--text-muted)' }}>Beschikbaarheid laden...</p>
                                    ) : slots.length > 0 ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.75rem' }}>
                                            {slots.map(slot => (
                                                <button
                                                    key={slot}
                                                    type="button"
                                                    onClick={() => setSelectedSlot(slot)}
                                                    style={{
                                                        padding: '0.75rem',
                                                        borderRadius: 'var(--radius-md)',
                                                        border: `2px solid ${selectedSlot === slot ? 'var(--primary)' : 'var(--surface-border)'}`,
                                                        background: selectedSlot === slot ? 'var(--primary-light)' : 'rgba(255,255,255,0.5)',
                                                        color: selectedSlot === slot ? 'var(--primary-hover)' : 'var(--secondary)',
                                                        fontWeight: 600,
                                                        transition: 'var(--transition)'
                                                    }}
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ padding: '1.5rem', background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                            Er zijn helaas geen tijden meer beschikbaar op deze datum.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Column: Form */}
                        {selectedSlot && (
                            <div className="animate-fade-in delay-300">
                                <form onSubmit={handleSubmit} style={{ background: 'var(--background-start)', padding: '2.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--surface-border)', boxShadow: 'var(--shadow-md)' }}>
                                    <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>4. Uw Gegevens</h3>

                                    {error && (
                                        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-md)' }}>
                                            {error}
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label className="form-label">Naam</label>
                                        <input required type="text" className="form-input" value={formData.patientName} onChange={e => setFormData({ ...formData, patientName: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">E-mailadres</label>
                                        <input required type="email" className="form-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Telefoonnummer</label>
                                        <input required type="text" className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Opmerkingen (optioneel)</label>
                                        <textarea
                                            className="form-input"
                                            rows={3}
                                            value={formData.notes}
                                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                            style={{ resize: 'none' }}
                                        ></textarea>
                                    </div>

                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.25rem', fontSize: '1.125rem', marginTop: '1rem' }} disabled={isSubmitting}>
                                        {isSubmitting ? 'Bezig met inplannen...' : `Bevestig Afspraak om ${selectedSlot}`}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
