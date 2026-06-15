'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import styles from './wizard.module.css';

export default function NewEvaluation() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    vin: '',
    askingPrice: '',
    origin: '',
    adLink: '',
    fipePrice: '',
    estimatedSalePrice: '',
    docLeilao: false,
    docSinistro: false,
    docRestricao: false,
    estruturaOk: true,
    mecanicaOk: true,
  });

  if (loading) return <div>Carregando...</div>;
  if (!user) {
    router.push('/login');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const submitEvaluation = async () => {
    try {
      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId: user.uid })
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/evaluation/${data.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wizardCard}>
        <div className={styles.progress}>Etapa {step} de 5</div>
        
        {step === 1 && (
          <div className={styles.stepContent}>
            <h2>1. Cadastro do Veículo</h2>
            <input name="brand" placeholder="Marca" value={formData.brand} onChange={handleChange} className={styles.input} />
            <input name="model" placeholder="Modelo" value={formData.model} onChange={handleChange} className={styles.input} />
            <input name="year" type="number" placeholder="Ano" value={formData.year} onChange={handleChange} className={styles.input} />
            <input name="vin" placeholder="VIN / Chassi (Opcional)" value={formData.vin} onChange={handleChange} className={styles.input} />
            <input name="askingPrice" type="number" placeholder="Preço Pedido (R$)" value={formData.askingPrice} onChange={handleChange} className={styles.input} />
            <input name="origin" placeholder="Origem (Ex: Particular, OLX)" value={formData.origin} onChange={handleChange} className={styles.input} />
            <input name="adLink" placeholder="Link do Anúncio (Opcional)" value={formData.adLink} onChange={handleChange} className={styles.input} />
          </div>
        )}

        {step === 2 && (
          <div className={styles.stepContent}>
            <h2>2. Avaliação de Mercado</h2>
            <input name="fipePrice" type="number" placeholder="Preço FIPE (R$)" value={formData.fipePrice} onChange={handleChange} className={styles.input} />
            <input name="estimatedSalePrice" type="number" placeholder="Preço de Venda Estimado (R$)" value={formData.estimatedSalePrice} onChange={handleChange} className={styles.input} />
          </div>
        )}

        {step === 3 && (
          <div className={styles.stepContent}>
            <h2>3. Documentação</h2>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="docLeilao" checked={formData.docLeilao} onChange={handleChange} />
              Passagem por Leilão
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="docSinistro" checked={formData.docSinistro} onChange={handleChange} />
              Sinistro Apontado
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="docRestricao" checked={formData.docRestricao} onChange={handleChange} />
              Restrições (Judicial/Financeira)
            </label>
          </div>
        )}

        {step === 4 && (
          <div className={styles.stepContent}>
            <h2>4. Estrutura e Funilaria</h2>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="estruturaOk" checked={formData.estruturaOk} onChange={handleChange} />
              Marcar tudo como OK (Sem danos estruturais graves)
            </label>
            {!formData.estruturaOk && <p className={styles.note}>No MVP, desmarcar isso aplicará uma penalidade fixa no score.</p>}
          </div>
        )}

        {step === 5 && (
          <div className={styles.stepContent}>
            <h2>5. Avaliação Mecânica</h2>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="mecanicaOk" checked={formData.mecanicaOk} onChange={handleChange} />
              Marcar tudo como OK (Sem problemas mecânicos graves)
            </label>
            {!formData.mecanicaOk && <p className={styles.note}>No MVP, desmarcar isso reduzirá o lucro estimado em R$ 3.000 (reserva técnica).</p>}
          </div>
        )}

        <div className={styles.actions}>
          {step > 1 && <button onClick={() => setStep(s => s - 1)} className={styles.btnSecondary}>Voltar</button>}
          {step < 5 && <button onClick={() => setStep(s => s + 1)} className={styles.btnPrimary}>Próximo</button>}
          {step === 5 && <button onClick={submitEvaluation} className={styles.btnSuccess}>Gerar Score</button>}
        </div>
      </div>
    </div>
  );
}
