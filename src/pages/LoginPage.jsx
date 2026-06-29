import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError(`ไม่สามารถลงชื่อเข้าใช้ได้: ${err.message || 'ไม่ทราบสาเหตุ'}`);
      console.error('Login Error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      background: 'var(--color-bg)',
    }}>
      <div style={{
        background: 'var(--color-surface)',
        padding: '2.5rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(107, 144, 128, 0.4)',
          margin: '0 auto 1.5rem',
        }}>
          <Leaf size={32} color="white" />
        </div>
        
        <h1 style={{
          fontSize: 'var(--font-size-2xl)',
          color: 'var(--color-primary-dark)',
          marginBottom: '0.5rem',
        }}>FlowSpace</h1>
        
        <p style={{
          color: 'var(--color-text-muted)',
          marginBottom: '2rem',
        }}>เพิ่มความโปรดักทีฟโดยไร้ความกดดัน</p>

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#ef4444',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: 'var(--font-size-sm)',
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            width: '100%',
            padding: '12px',
            background: 'white',
            color: '#333',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-base)',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 200ms ease',
            boxShadow: 'var(--shadow-sm)',
          }}
          onMouseEnter={e => {
             if (!loading) e.currentTarget.style.background = '#f9fafb';
          }}
          onMouseLeave={e => {
             if (!loading) e.currentTarget.style.background = 'white';
          }}
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            style={{ width: '20px', height: '20px' }} 
          />
          {loading ? 'กำลังลงชื่อเข้าใช้...' : 'ลงชื่อเข้าใช้ด้วย Google'}
        </button>
      </div>
    </div>
  );
}
