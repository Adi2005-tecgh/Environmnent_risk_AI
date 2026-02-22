/**
 * useAuth — lightweight auth hook for the Government Portal.
 * Stores session in localStorage (hackathon-grade).
 */

import { useState, useCallback } from 'react';
import axios from 'axios';

const STORAGE_KEY = 'gov_session';
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// ── helpers ──────────────────────────────────────────────────────────────────

const saveSession = (session) =>
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

const clearSession = () =>
    localStorage.removeItem(STORAGE_KEY);

export const readSession = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

// ── hook ──────────────────────────────────────────────────────────────────────

export const useAuth = () => {
    const [session, setSession] = useState(readSession);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
            const s = { token: data.token, role: data.role, name: data.name, email: data.email };
            saveSession(s);
            setSession(s);
            return { ok: true, role: data.role };
        } catch (err) {
            const msg = err.response?.data?.error || 'Invalid credentials. Access restricted.';
            setError(msg);
            return { ok: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        clearSession();
        setSession(null);
    }, []);

    return {
        session,
        isAuthenticated: !!session?.token,
        role: session?.role ?? null,
        name: session?.name ?? null,
        loading,
        error,
        login,
        logout,
    };
};
