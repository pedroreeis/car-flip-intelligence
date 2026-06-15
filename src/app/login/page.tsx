'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signIn();
      router.push('/');
    } catch (error) {
      console.error(error);
      alert('Erro ao fazer login com o Google');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Car Flip Intelligence</h1>
        <p className={styles.subtitle}>Acesse a inteligência operacional</p>
        <button onClick={handleLogin} className={styles.button}>
          Entrar com Google
        </button>
      </div>
    </div>
  );
}
