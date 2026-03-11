"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
}

function FAQItem({ question, answer, isOpen, onClick }: FAQItemProps) {
    return (
        <div
            className="faq-item"
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--surface-border)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '1rem',
                overflow: 'hidden',
                boxShadow: isOpen ? 'var(--shadow-md)' : 'none',
                borderColor: isOpen ? 'rgba(14, 165, 233, 0.4)' : 'var(--surface-border)',
                transition: 'all 0.3s ease'
            }}
        >
            <button
                onClick={onClick}
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.5rem',
                    textAlign: 'left',
                    background: 'transparent',
                    color: 'var(--secondary)',
                    cursor: 'pointer',
                    border: 'none',
                    fontSize: '1.125rem',
                    fontWeight: 600
                }}
            >
                {question}
                <motion.div
                    initial={false}
                    animate={{ rotate: isOpen ? 180 : 0, color: isOpen ? 'var(--primary)' : 'var(--text-muted)' }}
                    transition={{ duration: 0.3, ease: 'backOut' }}
                >
                    <ChevronDown size={24} />
                </motion.div>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function AnimatedFAQ({ items }: { items: { question: string; answer: string }[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(0); // First one open by default

    return (
        <div className="faq-container">
            {items.map((item, index) => (
                <FAQItem
                    key={index}
                    question={item.question}
                    answer={item.answer}
                    isOpen={openIndex === index}
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                />
            ))}
        </div>
    );
}
