'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import styles from './wizard.module.css';

export default function NewEvaluation() {
  const { user, loading, fetchWithAuth } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const [kbBrands, setKbBrands] = useState<any[]>([]);
  const [kbModels, setKbModels] = useState<any[]>([]);

  useEffect(() => {
    fetchWithAuth('/api/kb?category=BRAND').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setKbBrands(data);
    });
  }, []);

  useEffect(() => {
    let url = '/api/kb?category=MODEL';
    if (formData.brand) {
      url += `&context=${encodeURIComponent(formData.brand)}`;
    }
    fetchWithAuth(url).then(r => r.json()).then(data => {
      if (Array.isArray(data)) setKbModels(data);
    });
  }, [formData.brand]);

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

  const addImageUrl = () => {
    if (currentUrl.trim() && currentUrl.startsWith('http')) {
      setImageUrls([...imageUrls, currentUrl.trim()]);
      setCurrentUrl('');
    }
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const submitEvaluation = async () => {
    setIsSubmitting(true);

    try {
      const res = await fetchWithAuth('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId: user.uid, images: imageUrls })
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/evaluation/${data.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wizardCard}>
        <div className={styles.progress}>Etapa {step} de 6</div>
        
        {step === 1 && (
          <div className={styles.stepContent}>
            <h2>1. Cadastro do Veículo</h2>
            <input name="brand" list="kb-brands" placeholder="Marca" value={formData.brand} onChange={handleChange} className={styles.input} />
            <datalist id="kb-brands">
              {kbBrands.map(b => <option key={b.id} value={b.value} />)}
            </datalist>
            <input name="model" list="kb-models" placeholder="Modelo" value={formData.model} onChange={handleChange} className={styles.input} />
            <datalist id="kb-models">
              {kbModels.map(m => <option key={m.id} value={m.value} />)}
            </datalist>
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

        {step === 6 && (
          <div className={styles.stepContent}>
            <h2>6. Fotos do Veículo</h2>
            <p className={styles.note}>Adicione links diretos para as fotos do veículo (ex: Imgur, Discord, etc).</p>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input 
                type="url" 
                placeholder="https://exemplo.com/imagem.jpg"
                value={currentUrl}
                onChange={e => setCurrentUrl(e.target.value)}
                className={styles.input} 
                style={{ flex: 1, margin: 0 }}
              />
              <button onClick={addImageUrl} className={styles.btnSecondary} style={{ padding: '0 1rem' }} type="button">
                Adicionar Link
              </button>
            </div>

            {imageUrls.length > 0 && (
              <ul style={{ listStyleType: 'none', padding: 0, marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {imageUrls.map((url, i) => (
                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '4px' }}>
                    <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }} title={url}>{url}</span>
                    <button onClick={() => removeImageUrl(i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }} type="button">X</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className={styles.actions}>
          {step > 1 && <button onClick={() => setStep(s => s - 1)} className={styles.btnSecondary} disabled={isSubmitting}>Voltar</button>}
          {step < 6 && <button onClick={() => setStep(s => s + 1)} className={styles.btnPrimary}>Próximo</button>}
          {step === 6 && <button onClick={submitEvaluation} className={styles.btnSuccess} disabled={isSubmitting}>
            {isSubmitting ? 'Processando...' : 'Gerar Score'}
          </button>}
        </div>
      </div>
    </div>
  );
}
