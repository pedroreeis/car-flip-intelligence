'use client';
import { useAuth } from "@/contexts/AuthContext";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from '../../new/wizard.module.css'; // Reusing wizard styles

export default function CloseCase() {
  const { fetchWithAuth } = useAuth();

  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  
  const [form, setForm] = useState({
    actualSalePrice: '',
    actualCosts: '',
  });

  useEffect(() => {
    fetchWithAuth(`/api/evaluations/${params.id}`)
      .then(res => res.json())
      .then(setData);
  }, [params.id]);

  const submitClose = async () => {
    try {
      const res = await fetchWithAuth(`/api/evaluations/${params.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        router.push('/');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!data) return <div>Carregando...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.wizardCard}>
        <div className={styles.stepContent}>
          <h2>Encerrar Caso: {data.vehicle?.brand} {data.vehicle?.model}</h2>
          <p>Preencha os valores REAIS da negociação para calibrar a inteligência do sistema.</p>
          
          <label>Preço de Venda Real (R$)</label>
          <input 
            type="number" 
            className={styles.input} 
            value={form.actualSalePrice}
            onChange={e => setForm({...form, actualSalePrice: e.target.value})}
          />
          
          <label>Custos Reais de Preparação (R$)</label>
          <input 
            type="number" 
            className={styles.input} 
            value={form.actualCosts}
            onChange={e => setForm({...form, actualCosts: e.target.value})}
          />
        </div>
        
        <div className={styles.actions}>
          <button onClick={() => router.back()} className={styles.btnSecondary}>Cancelar</button>
          <button onClick={submitClose} className={styles.btnSuccess}>Confirmar e Encerrar</button>
        </div>
      </div>
    </div>
  );
}
