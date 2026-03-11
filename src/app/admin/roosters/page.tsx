"use client";

import { useState, useEffect } from 'react';

export default function RoostersPage() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [isClosed, setIsClosed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Fetch specific date structure
    useEffect(() => {
        setLoading(true);
        setMessage('');

        // Default values if no custom schedule exists
        const selectedDateObj = new Date(date);
        const dayOfWeek = selectedDateObj.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        setStartTime('09:00');
        setEndTime('17:00');
        setIsClosed(isWeekend);

        fetch(`/api/schedule?start=${date}&end=${date}T23:59:59`)
            .then(res => res.json())
            .then(data => {
                if (data.schedules && data.schedules.length > 0) {
                    const schedule = data.schedules[0];
                    setStartTime(schedule.startTime);
                    setEndTime(schedule.endTime);
                    setIsClosed(schedule.isClosed);
                }
                setLoading(false);
            });
    }, [date]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const res = await fetch('/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, startTime, endTime, isClosed }),
            });

            if (!res.ok) throw new Error('Fout bij opslaan');

            setMessage('Rooster succesvol opgeslagen!');
            setTimeout(() => setMessage(''), 3000);
        } catch {
            setMessage('Er is een fout opgetreden.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Roosterregistratie</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Beheer de openingstijden en gesloten dagen van de praktijk.</p>
            </div>

            <div className="grid-2">
                <div className="glass-panel animate-fade-in" style={{ padding: '3rem', background: 'var(--surface)' }}>
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '1.125rem' }}>Selecteer Datum</label>
                            <input
                                type="date"
                                className="form-input"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                            />
                        </div>

                        {loading ? (
                            <p>Gegevens laden...</p>
                        ) : (
                            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: isClosed ? '#fee2e2' : 'var(--background-start)', borderRadius: 'var(--radius-md)', border: `1px solid ${isClosed ? '#fca5a5' : 'var(--surface-border)'}`, transition: 'var(--transition)' }}>
                                    <input
                                        type="checkbox"
                                        id="isClosed"
                                        checked={isClosed}
                                        onChange={e => setIsClosed(e.target.checked)}
                                        style={{ width: '1.5rem', height: '1.5rem', accentColor: 'var(--primary)' }}
                                    />
                                    <label htmlFor="isClosed" style={{ fontSize: '1.125rem', fontWeight: 600, color: isClosed ? '#b91c1c' : 'inherit', cursor: 'pointer' }}>
                                        Praktijk Gesloten op deze dag
                                    </label>
                                </div>

                                {!isClosed && (
                                    <div className="grid-2" style={{ gap: '1.5rem' }}>
                                        <div>
                                            <label className="form-label">Openingstijd</label>
                                            <input
                                                type="time"
                                                className="form-input"
                                                value={startTime}
                                                onChange={e => setStartTime(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Sluitingstijd</label>
                                            <input
                                                type="time"
                                                className="form-input"
                                                value={endTime}
                                                onChange={e => setEndTime(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '1.25rem', fontSize: '1.125rem' }}>
                                    {saving ? 'Opslaan...' : 'Wijzigingen Opslaan'}
                                </button>

                                {message && (
                                    <div style={{ padding: '1rem', background: message.includes('fout') ? '#fee2e2' : '#dcfce7', color: message.includes('fout') ? '#b91c1c' : '#166534', borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: 600 }}>
                                        {message}
                                    </div>
                                )}
                            </div>
                        )}
                    </form>
                </div>

                <div className="glass-panel animate-fade-in delay-200" style={{ padding: '3rem', background: 'var(--primary-light)', border: 'none' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Rooster Uitleg</h2>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-main)', paddingLeft: '1.25rem' }}>
                        <li>Standaard is de praktijk doordeweeks geopend van <strong>09:00 tot 17:00</strong>.</li>
                        <li>In de weekenden is de praktijk standaard gesloten, patiënten kunnen dan geen afspraken boeken.</li>
                        <li>Wanneer u een dag op <strong>'Gesloten'</strong> zet (bijvoorbeeld voor een feestdag), komen alle beschikbare tijden voor patiënten direct te vervallen.</li>
                        <li>Indien u de openingstijden aanpast, worden de reserverings-slots voor die betreffende dag automatisch aangepast op deze nieuwe tijden.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
