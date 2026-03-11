"use client";

import { motion } from "framer-motion";

interface AnimatedSectionProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
    id?: string;
    style?: React.CSSProperties;
}

export function FadeInUp({ children, delay = 0, className = "", id, style }: AnimatedSectionProps) {
    return (
        <motion.div
            id={id}
            className={className}
            style={style}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
        >
            {children}
        </motion.div>
    );
}

export function ScaleIn({ children, delay = 0, className = "", id, style }: AnimatedSectionProps) {
    return (
        <motion.div
            id={id}
            className={className}
            style={style}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
        >
            {children}
        </motion.div>
    );
}

export function StaggerContainer({ children, className = "", id, style }: AnimatedSectionProps) {
    return (
        <motion.div
            id={id}
            className={className}
            style={style}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.15
                    }
                }
            }}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({ children, className = "", style }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) {
    return (
        <motion.div
            className={className}
            style={style}
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
            }}
        >
            {children}
        </motion.div>
    )
}
