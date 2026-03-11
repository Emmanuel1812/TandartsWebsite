"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    return (
        <>
            {/* Hamburger Button */}
            <button
                className="mobile-menu-toggle"
                onClick={() => setIsOpen(true)}
                aria-label="Open menu"
                aria-expanded={isOpen}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            </button>

            {/* Backdrop */}
            <div
                className={`mobile-menu-backdrop ${isOpen ? 'mobile-menu-backdrop--open' : ''}`}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            />

            {/* Slide-in Panel */}
            <nav
                className={`mobile-menu-panel ${isOpen ? 'mobile-menu-panel--open' : ''}`}
                aria-label="Mobile navigation"
            >
                {/* Panel Header */}
                <div className="mobile-menu-header">
                    <div className="mobile-menu-brand">Stralend</div>
                    <button
                        className="mobile-menu-close"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close menu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="mobile-menu-links">
                    <Link href="#over-ons" onClick={() => setIsOpen(false)} className="mobile-menu-link">
                        Onze Praktijk
                    </Link>
                    <Link href="#diensten" onClick={() => setIsOpen(false)} className="mobile-menu-link">
                        Behandelingen
                    </Link>
                    <Link href="#faciliteiten" onClick={() => setIsOpen(false)} className="mobile-menu-link">
                        Onze Kliniek
                    </Link>
                    <Link href="#contact" onClick={() => setIsOpen(false)} className="mobile-menu-link">
                        Contact
                    </Link>
                    <Link href="/login" onClick={() => setIsOpen(false)} className="mobile-menu-link">
                        Inloggen
                    </Link>
                </div>

                {/* CTA Buttons */}
                <div className="mobile-menu-cta">
                    <Link
                        href="/boeken"
                        onClick={() => setIsOpen(false)}
                        className="btn btn-primary mobile-menu-btn"
                    >
                        Afspraak Maken
                    </Link>
                    <Link
                        href="/inschrijven"
                        onClick={() => setIsOpen(false)}
                        className="btn btn-secondary mobile-menu-btn"
                    >
                        Inschrijven
                    </Link>
                </div>

                {/* Footer info */}
                <div className="mobile-menu-footer">
                    <a href="tel:0201234567" className="mobile-menu-footer-link">
                        📞 020 123 4567
                    </a>
                    <span className="mobile-menu-footer-text">Ma-Vr: 09:00 – 17:00</span>
                </div>
            </nav>
        </>
    );
}
