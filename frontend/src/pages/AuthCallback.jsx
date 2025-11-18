import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      checkAuth();
      navigate('/dashboard');
    } else {
      navigate('/login?error=oauth_failed');
    }
  }, [searchParams, navigate, checkAuth]);

  return <div style={{ padding: '40px', textAlign: 'center' }}>Processando login...</div>;
};

export default AuthCallback;

