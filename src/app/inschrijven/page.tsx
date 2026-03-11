'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/AnimatedSection';

export default function SignUpPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        // Ensure boolean strings are mapped correctly if needed, though they are stored as strings for now or we map them:
        const payload = {
            ...data,
            aanvullendVerzekerd: data.aanvullendVerzekerd === 'Ja',
            regelmatigTandarts: data.regelmatigTandarts === 'Ja',
            onderBehandelingArts: data.onderBehandelingArts === 'Ja',
            gebruiktMedicijnen: data.gebruiktMedicijnen === 'Ja',
        };

        try {
            const res = await fetch('/api/patients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Er is iets misgegaan');
            }

            router.push('/login?registered=true');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={{ background: 'var(--surface)', minHeight: '100vh', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            <div style={{ width: '100%', maxWidth: '900px', marginBottom: '2rem' }}>
                <Link href="/" className="hover:text-primary transition-colors" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <ChevronLeft size={20} /> Terug naar Home
                </Link>
            </div>

            <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', padding: '3rem 4rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)' }}>
                <FadeInUp>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--secondary)' }}>Inschrijven bij Tandartspraktijk Stralend</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>We zijn verheugd dat je ervoor hebt gekozen om deel uit te maken van onze tandheelkundige familie.</p>
                    </div>
                </FadeInUp>

                {error && (
                    <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    <StaggerContainer>
                        {/* Persoonlijke Gegevens */}
                        <div style={{ marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '2px solid var(--primary-light)', paddingBottom: '0.5rem' }}>Persoonsgegevens</h3>
                            <div className="grid-2" style={{ gap: '1.5rem' }}>
                                <StaggerItem>
                                    <label className="form-label">Voornaam</label>
                                    <input type="text" name="voornaam" className="form-input" placeholder="Voornaam" required />
                                </StaggerItem>
                                <StaggerItem>
                                    <label className="form-label">Tussenvoegsel</label>
                                    <input type="text" name="tussenvoegsel" className="form-input" placeholder="Tussenvoegsel" />
                                </StaggerItem>
                                <StaggerItem>
                                    <label className="form-label">Achternaam</label>
                                    <input type="text" name="achternaam" className="form-input" placeholder="Achternaam" required />
                                </StaggerItem>
                                <StaggerItem>
                                    <label className="form-label">Voorletters</label>
                                    <input type="text" name="voorletters" className="form-input" placeholder="Voorletters" />
                                </StaggerItem>
                                <StaggerItem>
                                    <label className="form-label">Geboortedatum</label>
                                    <input type="date" name="geboortedatum" className="form-input" required />
                                </StaggerItem>
                                <StaggerItem>
                                    <label className="form-label">Geslacht</label>
                                    <select name="geslacht" className="form-input" required>
                                        <option value="">Selecteer geslacht</option>
                                        <option value="Man">Man</option>
                                        <option value="Vrouw">Vrouw</option>
                                        <option value="Anders">Anders</option>
                                    </select>
                                </StaggerItem>
                            </div>
                        </div>

                        {/* Contactgegevens */}
                        <div style={{ marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '2px solid var(--primary-light)', paddingBottom: '0.5rem' }}>Adres & Contact</h3>
                            <div className="grid-2" style={{ gap: '1.5rem' }}>
                                <StaggerItem style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Straat en huisnummer</label>
                                    <input type="text" name="straatEnHuisnummer" className="form-input" placeholder="Straat en huisnummer" required />
                                </StaggerItem>
                                <StaggerItem>
                                    <label className="form-label">Postcode</label>
                                    <input type="text" name="postcode" className="form-input" placeholder="1234 AB" required />
                                </StaggerItem>
                                <StaggerItem>
                                    <label className="form-label">Plaats</label>
                                    <input type="text" name="plaats" className="form-input" placeholder="Rotterdam" required />
                                </StaggerItem>
                                <StaggerItem>
                                    <label className="form-label">E-mail</label>
                                    <input type="email" name="email" className="form-input" placeholder="uw@email.nl" required />
                                </StaggerItem>
                                <StaggerItem>
                                    <label className="form-label">Wachtwoord (Voor uw dashboard)</label>
                                    <input type="password" name="password" className="form-input" placeholder="Kies een veilig wachtwoord" required minLength={6} />
                                </StaggerItem>
                                <StaggerItem>
                                    <label className="form-label">Telefoon thuis</label>
                                    <input type="tel" name="telefoonThuis" className="form-input" placeholder="010 123 4567" />
                                </StaggerItem>
                                <StaggerItem>
                                    <label className="form-label">Mobiele nummer</label>
                                    <input type="tel" name="mobieleNummer" className="form-input" placeholder="06 1234 5678" required />
                                </StaggerItem>
                            </div>
                        </div>

                        {/* Verzekering */}
                        <div style={{ marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '2px solid var(--primary-light)', paddingBottom: '0.5rem' }}>Verzekering & BSN</h3>
                            <div className="grid-2" style={{ gap: '1.5rem' }}>
                                <StaggerItem>
                                    <label className="form-label">Naam verzekeraar</label>
                                    <input type="text" name="naamVerzekeraar" className="form-input" placeholder="Bijv. Zilveren Kruis" />
                                </StaggerItem>
                                <StaggerItem>
                                    <label className="form-label">Verzekeringsnummer (Polisnummer)</label>
                                    <input type="text" name="verzekeringsnummer" className="form-input" placeholder="123456789" />
                                </StaggerItem>
                                <StaggerItem>
                                    <label className="form-label">BSN Nummer</label>
                                    <input type="text" name="bsnNummer" className="form-input" placeholder="123456789" />
                                </StaggerItem>
                                <StaggerItem>
                                    <label className="form-label">Aanvullend verzekerd voor de tandarts?</label>
                                    <select name="aanvullendVerzekerd" className="form-input" required>
                                        <option value="">Selecteer</option>
                                        <option value="Ja">Ja</option>
                                        <option value="Nee">Nee</option>
                                    </select>
                                </StaggerItem>
                            </div>
                        </div>

                        {/* Tandheelkundige Historie & Medisch */}
                        <div style={{ marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '2px solid var(--primary-light)', paddingBottom: '0.5rem' }}>Medische Gegevens</h3>
                            <div className="grid-2" style={{ gap: '1.5rem' }}>
                                <StaggerItem>
                                    <label className="form-label">Regelmatig naar de tandarts geweest?</label>
                                    <select name="regelmatigTandarts" className="form-input" required>
                                        <option value="">Selecteer</option>
                                        <option value="Ja">Ja</option>
                                        <option value="Nee">Nee</option>
                                    </select>
                                </StaggerItem>
                                <StaggerItem>
                                    <label className="form-label">Wie was uw laatste tandarts?</label>
                                    <input type="text" name="laatsteTandarts" className="form-input" placeholder="Naam vorige praktijk" />
                                </StaggerItem>
                                <StaggerItem style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Waarvoor wilt u een afspraak?</label>
                                    <select name="redenAfspraak" className="form-input" required>
                                        <option value="">Selecteer reden</option>
                                        <option value="Controle">Controle</option>
                                        <option value="Wil gesaneerd worden">Wil gesaneerd worden</option>
                                        <option value="Pijn">Pijn</option>
                                        <option value="Prothese (kunstgebit)">Prothese (kunstgebit)</option>
                                        <option value="Anders">Anders</option>
                                    </select>
                                </StaggerItem>

                                <StaggerItem>
                                    <label className="form-label">Onder behandeling bij een arts/specialist?</label>
                                    <select name="onderBehandelingArts" className="form-input" required>
                                        <option value="">Selecteer</option>
                                        <option value="Ja">Ja</option>
                                        <option value="Nee">Nee</option>
                                    </select>
                                </StaggerItem>
                                <StaggerItem>
                                    <label className="form-label">Zo ja, naam arts/specialist:</label>
                                    <input type="text" name="naamArts" className="form-input" placeholder="Vul in (optioneel)" />
                                </StaggerItem>

                                <StaggerItem>
                                    <label className="form-label">Gebruikt u medicijnen?</label>
                                    <select name="gebruiktMedicijnen" className="form-input" required>
                                        <option value="">Selecteer</option>
                                        <option value="Ja">Ja</option>
                                        <option value="Nee">Nee</option>
                                    </select>
                                </StaggerItem>
                                <StaggerItem>
                                    <label className="form-label">Zo ja, naam medicijnen:</label>
                                    <input type="text" name="naamMedicijnen" className="form-input" placeholder="Vul in (optioneel)" />
                                </StaggerItem>
                            </div>
                        </div>

                        <StaggerItem className="mt-4">
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '2rem' }}>
                                Insturen van dit formulier leidt niet automatisch tot aanname van u als patiënt. De aanvragen zullen zorgvuldig in behandeling worden genomen om zo de meest effectief mogelijke tandheelkundige zorg te kunnen verlenen.
                            </p>
                        </StaggerItem>

                        <StaggerItem>
                            <div className="inschrijven-actions" style={{ display: 'flex', gap: '1rem' }}>
                                <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1, padding: '1rem', fontSize: '1.125rem', opacity: loading ? 0.7 : 1 }}>
                                    {loading ? 'Bezig met inschrijven...' : 'Inschrijven Afronden'}
                                </button>
                                <Link href="/login" className="btn btn-secondary" style={{ flex: 1, padding: '1rem', textAlign: 'center', fontSize: '1.125rem' }}>
                                    Ik heb al een account
                                </Link>
                            </div>
                        </StaggerItem>
                    </StaggerContainer>

                </form>
            </div>
        </main>
    );
}
