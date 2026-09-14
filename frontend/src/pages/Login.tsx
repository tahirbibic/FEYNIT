import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLoginSuccess: (username: string, userId: string) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name } },
        });
        if (signUpError) throw signUpError;
        if (signUpData.session && signUpData.user) {
          const displayName = signUpData.user.user_metadata?.display_name || name;
          onLoginSuccess(displayName, signUpData.user.id);
        } else {
          setRegistered(true);
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        if (data.user) {
          const displayName = data.user.user_metadata?.display_name || data.user.user_metadata?.full_name || data.user.user_metadata?.name || email.split('@')[0];
          onLoginSuccess(displayName, data.user.id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Greška pri prijavi.');
    }
    setLoading(false);
  };

  const switchMode = (next: 'login' | 'register') => {
    setMode(next);
    setError('');
    setRegistered(false);
  };

  const inputCls = 'absolute bg-transparent outline-none border-none text-base tracking-wide';
  const inputStyle: React.CSSProperties = { color: '#2b2118', paddingLeft: '14%' };

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
      <img src="/assets/login-bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/40" />

      {/* Logo — independent, floats above the popup */}
      <img
        src="/assets/login_logo.png"
        alt="feynit Logo"
        className="absolute z-20 h-48 object-contain"
        style={{ imageRendering: 'pixelated', top: '-8%', left: '50%', transform: 'translateX(-50%)' }}
        draggable={false}
      />

      <div className="relative z-10 flex flex-col items-center gap-2">

        <form
          onSubmit={handleSubmit}
          className="relative"
          style={{ width: 'min(325px, 100vw)' }}
        >
          <img
            src={mode === 'login' ? '/assets/login_popup.png' : '/assets/register_popup.png'}
            alt="popup"
            className="w-full h-auto block"
            draggable={false}
          />

          {/* ── Tab: PRIJAVA ── */}
          <button
            type="button"
            onClick={() => switchMode('login')}
            className="absolute cursor-pointer bg-transparent border-none"
            style={{ left: '9%', top: '5%', width: '39%', height: '15%' }}
          />
          <span
            className="absolute pointer-events-none font-bold uppercase select-none"
            style={{
              left: '29.5%', top: mode === 'register' ? '12%' : '14.5%', transform: 'translate(-50%, -50%)',
              color: mode === 'login' ? '#eafff2' : '#3a2a1a',
              fontSize: 'clamp(10px, 1.6vw, 20px)',
            }}
          >
            Prijava
          </span>

          {/* ── Tab: REGISTRACIJA ── */}
          <button
            type="button"
            onClick={() => switchMode('register')}
            className="absolute cursor-pointer bg-transparent border-none"
            style={{ left: '49%', top: '5%', width: '40%', height: '15%' }}
          />
          <span
            className="absolute pointer-events-none font-bold uppercase select-none"
            style={{
              left: mode === 'register' ? '65.5%' : '68.5%', top: mode === 'register' ? '12%' : '15%', transform: 'translate(-50%, -50%)',
              color: mode === 'register' ? '#eafff2' : '#3a2a1a',
              fontSize: mode === 'register' ? 'clamp(9px, 1.4vw, 10px)' : 'clamp(9px, 1.4vw, 20px)',
            }}
          >
            Registracija
          </span>

          {mode === 'login' && (
            <>
              {/* Email */}
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={inputCls}
                style={{ ...inputStyle, left: '16%', top: '33.9%', width: '67.7%', height: '8.2%' }}
              />

              {/* Password */}
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="current-password"
                className={inputCls}
                style={{ ...inputStyle, left: '16%', top: '45%', width: '67.7%', height: '8.2%' }}
              />

              {/* Zapamti me checkbox */}
              <div
                onClick={() => setRememberMe(r => !r)}
                className="absolute cursor-pointer flex items-center justify-center"
                style={{ left: '23%', top: '56.3%', width: '5.5%', height: '3.9%', background: rememberMe ? 'transparent' : 'rgba(255, 242, 225, 1)' }}
              />
              <span
                onClick={() => setRememberMe(r => !r)}
                className="absolute cursor-pointer font-bold select-none"
                style={{ left: '29.5%', top: '58.2%', transform: 'translateY(-50%)', color: '#eafff2', fontSize: 'clamp(9px, 1.3vw, 15px)' }}
              >
                Zapamti me
              </span>

              {/* Uđi u školu */}
              <button
                type="submit"
                disabled={loading}
                className="absolute cursor-pointer bg-transparent border-none"
                style={{ left: '16.5%', top: '61.7%', width: '66.8%', height: '8.9%' }}
              />
              <span
                className="absolute pointer-events-none font-bold uppercase select-none"
                style={{ left: '51.3%', top: '66.2%', transform: 'translate(-50%, -50%)', color: '#3a2a1a', fontSize: 'clamp(10px, 1.8vw, 22px)' }}
              >
                {loading ? '...' : 'Uđi u školu'}
              </span>
            </>
          )}

          {mode === 'register' && !registered && (
            <>
              {/* Ime */}
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
                className={inputCls}
                style={{ ...inputStyle, left: '16%', top: '32.8%', width: '67.7%', height: '8.2%' }}
              />

              {/* Email */}
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={inputCls}
                style={{ ...inputStyle, left: '16%', top: '42.5%', width: '67.7%', height: '8.2%' }}
              />

              {/* Password */}
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className={inputCls}
                style={{ ...inputStyle, left: '16%', top: '54.2%', width: '67.7%', height: '8.2%' }}
              />

              {/* Zapamti me checkbox */}
              <div
                onClick={() => setRememberMe(r => !r)}
                className="absolute cursor-pointer flex items-center justify-center"
                style={{ left: '27%', top: '62.7%', width: '5.5%', height: '3.6%', background: rememberMe ? 'transparent' : 'rgba(255, 242, 225, 1)' }}
              />
              <span
                onClick={() => setRememberMe(r => !r)}
                className="absolute cursor-pointer font-bold select-none"
                style={{ left: '33.5%', top: '64.5%', transform: 'translateY(-50%)', color: '#eafff2', fontSize: 'clamp(9px, 1.3vw, 15px)' }}
              >
                Zapamti me
              </span>

              {/* Registruj se */}
              <button
                type="submit"
                disabled={loading}
                className="absolute cursor-pointer bg-transparent border-none"
                style={{ left: '16.5%', top: '69.5%', width: '66.8%', height: '8.9%' }}
              />
              <span
                className="absolute pointer-events-none font-bold uppercase select-none"
                style={{ left: '50.1%', top: '73%', transform: 'translate(-50%, -50%)', color: '#3a2a1a', fontSize: 'clamp(10px, 1.8vw, 16px)' }}
              >
                {loading ? '...' : 'Registruj se'}
              </span>
            </>
          )}

          {mode === 'register' && registered && (
            <div
              className="absolute flex flex-col items-center justify-center text-center gap-2"
              style={{ left: '16%', top: '30%', width: '67.7%', height: '38%' }}
            >
              <p className="text-green-300 font-bold leading-tight">POTVRDI EMAIL!</p>
              <p className="text-white/70 text-xs leading-tight">Link poslat na<br />{email}</p>
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="mt-2 px-3 py-1 bg-green-700/80 text-white text-xs border border-green-500"
              >
                PRIJAVI SE
              </button>
            </div>
          )}
        </form>

        {error && (
          <p className="text-red-400 text-xs text-center max-w-[280px] bg-black/60 px-3 py-1 rounded">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
