"use client";

import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, Send, User, Bot, Loader2, ChevronLeft, ChevronRight, Stethoscope } from 'lucide-react';

type Service = {
    id: string;
    name: string;
    description: string | null;
    price: number;
    duration: number;
    setupTime: number;
    downTime: number;
};

function ServiceList({ onServiceSelect }: { onServiceSelect: (service: Service) => void }) {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/services')
            .then(res => res.json())
            .then(data => {
                setServices(data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', color: 'var(--text-muted)' }}><Loader2 className="animate-spin" size={16} /> Diensten laden...</div>;

    if (services.length === 0) return <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>Geen diensten beschikbaar.</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--surface-border)' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Stethoscope size={16} /> Kies een dienst
            </h4>
            {services.map(s => (
                <button
                    key={s.id}
                    onClick={() => onServiceSelect(s)}
                    style={{
                        padding: '0.75rem',
                        background: 'var(--surface)',
                        border: '1px solid var(--primary-light)',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                        transition: 'all 0.2s',
                    }}
                    className="hover:bg-blue-50"
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <strong style={{ color: 'var(--primary)' }}>{s.name}</strong>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>€{s.price}</span>
                    </div>
                    {s.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.description}</div>}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                        ⏱️ {s.duration + s.setupTime + s.downTime} min
                    </div>
                </button>
            ))}
        </div>
    );
}

function MiniCalendar({ onDateSelect }: { onDateSelect: (dateStr: string) => void }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

    const monthNames = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"];
    const dayNames = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <div style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--surface-border)', width: '100%', boxSizing: 'border-box' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '0.95rem' }}>
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={prevMonth} className="btn" style={{ padding: '0.25rem', minWidth: 'auto', background: 'transparent', color: 'var(--text-main)' }}>
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={nextMonth} className="btn" style={{ padding: '0.25rem', minWidth: 'auto', background: 'transparent', color: 'var(--text-main)' }}>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Days grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '0.5rem' }}>
                {dayNames.map(day => (
                    <div key={day} style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>{day}</div>
                ))}

                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const date = i + 1;
                    const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date);
                    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                    const isPast = dateObj < today;
                    const isSelectable = !isWeekend && !isPast;

                    const dateStr = dateObj.toISOString().split('T')[0];

                    return (
                        <button
                            key={date}
                            disabled={!isSelectable}
                            onClick={() => isSelectable && onDateSelect(dateStr)}
                            style={{
                                padding: '0.5rem 0',
                                border: 'none',
                                background: isSelectable ? 'var(--surface)' : 'transparent',
                                color: isSelectable ? 'var(--text-main)' : 'var(--text-muted)',
                                borderRadius: '4px',
                                cursor: isSelectable ? 'pointer' : 'default',
                                fontSize: '0.85rem',
                                fontWeight: isSelectable ? 600 : 400,
                                opacity: isSelectable ? 1 : 0.5,
                            }}
                            className={isSelectable ? "hover:bg-primary hover:text-white transition-colors" : ""}
                        >
                            {date}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // State to track submitted forms so we don't allow double submission
    const [submittedForms, setSubmittedForms] = useState<Record<string, boolean>>({});

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>, toolCallId: string, datum: string, tijd: string, serviceId: string) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;

        setSubmittedForms(prev => ({ ...prev, [toolCallId]: true }));

        append({
            role: 'user',
            content: `Hier zijn de gegevens van de patiënt voor de afspraak op ${datum} om ${tijd}:\nNaam: ${name}\nE-mail: ${email}\nTelefoon: ${phone}\nService ID: ${serviceId}\n\nPlan de afspraak nu direct in via de 'maakAfspraak' tool.`
        });
    };

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (pathname?.startsWith('/admin')) {
        return null;
    }

    return (
        <>
            <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 50 }}>
                {!isOpen && (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="btn btn-primary animate-fade-in"
                        style={{
                            width: '4rem', height: '4rem', borderRadius: '50%',
                            padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: 'var(--shadow-lg)'
                        }}
                    >
                        <MessageCircle size={32} />
                    </button>
                )}

                {isOpen && (
                    <div className="glass-panel animate-fade-in" style={{
                        width: '380px', height: '600px',
                        display: 'flex', flexDirection: 'column',
                        overflow: 'hidden', boxShadow: 'var(--shadow-lg)',
                        border: '1px solid var(--surface-border)',
                        background: 'var(--surface)'
                    }}>
                        {/* Header */}
                        <div style={{
                            background: 'var(--primary)', color: 'white',
                            padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'white' }}>Stralend Assistent</h3>
                                <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>Altijd open voor vragen & boekingen</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} style={{ color: 'white', background: 'transparent' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.4)' }}>
                            {messages.length === 0 && (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                                    <Bot size={48} style={{ margin: '0 auto 1rem', color: 'var(--primary-light)' }} />
                                    <p>Hallo! Ik ben de virtuele assistent van Tandartspraktijk Stralend. Hoe kan ik u vandaag helpen? Ik kan bijvoorbeeld een afspraak voor u inplannen.</p>
                                </div>
                            )}

                            {messages.map((m) => (
                                <div key={m.id} style={{ display: 'flex', gap: '0.75rem', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: m.role === 'user' ? 'var(--secondary)' : 'var(--primary)',
                                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                    }}>
                                        {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                                    </div>
                                    <div style={{
                                        background: m.role === 'user' ? 'var(--secondary)' : 'var(--surface)',
                                        color: m.role === 'user' ? 'white' : 'var(--text-main)',
                                        padding: '0.75rem 1rem', borderRadius: '1rem',
                                        borderBottomLeftRadius: m.role !== 'user' ? '0' : '1rem',
                                        borderBottomRightRadius: m.role === 'user' ? '0' : '1rem',
                                        maxWidth: '80%', fontSize: '0.95rem',
                                        border: m.role !== 'user' ? '1px solid var(--surface-border)' : 'none',
                                        boxShadow: 'var(--shadow-sm)',
                                        overflow: 'hidden'
                                    }}>
                                        {m.content && m.content.trim() !== '' && (
                                            <div style={{ marginBottom: m.toolInvocations?.length ? '0.5rem' : '0' }}>
                                                {m.content}
                                            </div>
                                        )}

                                        {/* Render tool invocations visually */}
                                        {m.toolInvocations && m.toolInvocations.map(tool => (
                                            <div key={tool.toolCallId} style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(0,0,0,0.05)', borderRadius: '0.5rem', fontSize: '0.8rem' }}>
                                                {tool.toolName === 'toonDiensten' && (
                                                    <div style={{ marginTop: '0.5rem' }}>
                                                        <ServiceList onServiceSelect={(svc) => append({ role: 'user', content: `Ik wil graag de dienst "${svc.name}" boeken. (Service ID: ${svc.id})` })} />
                                                    </div>
                                                )}
                                                {tool.toolName === 'toonKalender' && (
                                                    <div style={{ marginTop: '0.5rem' }}>
                                                        <MiniCalendar onDateSelect={(dateStr) => append({ role: 'user', content: `Kijk of er op ${dateStr} nog plek is.` })} />
                                                    </div>
                                                )}
                                                {tool.toolName === 'checkBeschikbaarheid' && (
                                                    <div style={{ marginTop: '0.5rem' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', marginBottom: tool.state === 'result' ? '0.5rem' : '0' }}>
                                                            {tool.state !== 'result' && <Loader2 size={12} className="animate-spin" />}
                                                            {tool.state === 'result' ? `Beschikbaarheid op ${(tool.args as any)?.datum}:` : `Controleren van beschikbaarheid op ${(tool.args as any)?.datum}...`}
                                                        </span>
                                                        {tool.state === 'result' && (tool.result as any)?.beschikbaarheid && (
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                                {((tool.result as any).beschikbaarheid as string[]).map(tijd => (
                                                                    <button
                                                                        key={tijd}
                                                                        onClick={() => append({ role: 'user', content: `Ik kies ${tijd}.` })}
                                                                        style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', borderRadius: '2rem', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                                                                    >
                                                                        {tijd}
                                                                    </button>
                                                                ))}
                                                                {((tool.result as any).beschikbaarheid as string[]).length === 0 && (
                                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Geen tijden beschikbaar op deze datum.</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {tool.toolName === 'maakAfspraak' && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                                                        <Loader2 size={12} className="animate-spin" /> Bezig met het inplannen van de afspraak...
                                                    </span>
                                                )}
                                                {tool.toolName === 'toonBoekingsFormulier' && (
                                                    <div style={{ marginTop: '0.5rem', background: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--surface-border)' }}>
                                                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)', fontSize: '0.95rem' }}>Vul uw gegevens in:</h4>
                                                        {submittedForms[tool.toolCallId] ? (
                                                            <div style={{ color: 'var(--success)', fontWeight: 'bold' }}>Gegevens verzonden! ✓</div>
                                                        ) : (
                                                            <form onSubmit={(e) => handleFormSubmit(e, tool.toolCallId, (tool.args as any).datum, (tool.args as any).tijd, (tool.args as any).serviceId || '')} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                                <input type="text" name="name" placeholder="Volledige naam" required className="form-input" style={{ padding: '0.5rem', fontSize: '0.9rem' }} />
                                                                <input type="email" name="email" placeholder="E-mailadres" required className="form-input" style={{ padding: '0.5rem', fontSize: '0.9rem' }} />
                                                                <input type="tel" name="phone" placeholder="Telefoonnummer" required className="form-input" style={{ padding: '0.5rem', fontSize: '0.9rem' }} />
                                                                <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem', fontSize: '0.9rem', marginTop: '0.5rem' }}>Versturen</button>
                                                            </form>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input area */}
                        <div style={{ padding: '1rem', borderTop: '1px solid var(--surface-border)', background: 'var(--surface)' }}>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder="Typ een bericht..."
                                    className="form-input"
                                    style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '2rem' }}
                                    disabled={isLoading}
                                />
                                <button type="submit" disabled={isLoading || !input.trim()} className="btn btn-primary" style={{ width: '3rem', height: '3rem', borderRadius: '50%', padding: 0, flexShrink: 0 }}>
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
