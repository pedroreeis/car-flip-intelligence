'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Autocomplete from '@/components/Autocomplete';
import styles from './wizard.module.css';

const STRUCTURE_DEFECTS = [
  { id: 's1', label: 'Pintura de Peça', cost: 500 },
  { id: 's2', label: 'Polimento Geral', cost: 400 },
  { id: 's3', label: 'Martelinho de Ouro', cost: 250 },
  { id: 's4', label: 'Higienização Interna', cost: 300 },
  { id: 's5', label: 'Reparo de Rodas', cost: 400 },
];

const MECHANIC_DEFECTS = [
  { id: 'm1', label: 'Óleo e Filtros', cost: 350 },
  { id: 'm2', label: 'Correia Dentada', cost: 900 },
  { id: 'm3', label: 'Pneus Novos', cost: 1500 },
  { id: 'm4', label: 'Amortecedores', cost: 1200 },
  { id: 'm5', label: 'Bateria', cost: 450 },
  { id: 'm6', label: 'Freios', cost: 600 },
];

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
  });

  const [selectedStructureDefects, setSelectedStructureDefects] = useState<any[]>([]);
  const [selectedMechanicDefects, setSelectedMechanicDefects] = useState<any[]>([]);

  const [otherStructureName, setOtherStructureName] = useState('');
  const [otherStructureCost, setOtherStructureCost] = useState('');

  const [otherMechanicName, setOtherMechanicName] = useState('');
  const [otherMechanicCost, setOtherMechanicCost] = useState('');

  // FIPE States
  const [fipeBrands, setFipeBrands] = useState<any[]>([]);
  const [fipeModels, setFipeModels] = useState<any[]>([]);
  const [fipeYears, setFipeYears] = useState<any[]>([]);
  
  const [selectedBrandCode, setSelectedBrandCode] = useState('');
  const [selectedModelCode, setSelectedModelCode] = useState('');
  const [selectedYearCode, setSelectedYearCode] = useState('');
  const [isLoadingFipe, setIsLoadingFipe] = useState(false);

  useEffect(() => {
    fetchWithAuth('/api/fipe/brands').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setFipeBrands(data);
    });
  }, []);

  useEffect(() => {
    if (selectedBrandCode) {
      setFipeModels([]);
      setFipeYears([]);
      setSelectedModelCode('');
      setSelectedYearCode('');
      fetchWithAuth(`/api/fipe/models?brandCode=${selectedBrandCode}`).then(r => r.json()).then(data => {
        if (Array.isArray(data)) setFipeModels(data);
      });
    }
  }, [selectedBrandCode]);

  useEffect(() => {
    if (selectedBrandCode && selectedModelCode) {
      setFipeYears([]);
      setSelectedYearCode('');
      fetchWithAuth(`/api/fipe/years?brandCode=${selectedBrandCode}&modelCode=${selectedModelCode}`).then(r => r.json()).then(data => {
        if (Array.isArray(data)) setFipeYears(data);
      });
    }
  }, [selectedModelCode]);

  useEffect(() => {
    if (selectedBrandCode && selectedModelCode && selectedYearCode) {
      setIsLoadingFipe(true);
      fetchWithAuth(`/api/fipe/price?brandCode=${selectedBrandCode}&modelCode=${selectedModelCode}&yearCode=${selectedYearCode}`)
        .then(r => r.json())
        .then(data => {
          if (data && data.price) {
            // price comes like "R$ 10.816,00"
            const numericPrice = parseFloat(data.price.replace('R$ ', '').replace(/\./g, '').replace(',', '.'));
            setFormData(prev => ({ ...prev, fipePrice: numericPrice.toString() }));
          }
        })
        .finally(() => setIsLoadingFipe(false));
    }
  }, [selectedYearCode]);

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

  const handleBrandChange = (code: string) => {
    const name = fipeBrands.find(b => b.code === code)?.name || '';
    setSelectedBrandCode(code);
    setFormData(prev => ({ ...prev, brand: name, model: '', year: '' }));
  };

  const handleModelChange = (code: string) => {
    const name = fipeModels.find(m => m.code === code)?.name || '';
    setSelectedModelCode(code);
    setFormData(prev => ({ ...prev, model: name, year: '' }));
  };

  const handleYearChange = (code: string) => {
    const name = fipeYears.find(y => y.code === code)?.name || '';
    setSelectedYearCode(code);
    setFormData(prev => ({ ...prev, year: code }));
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
        body: JSON.stringify({ 
          ...formData, 
          userId: user.uid, 
          images: imageUrls,
          structureDefects: selectedStructureDefects,
          mechanicDefects: selectedMechanicDefects
        })
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
            
            <Autocomplete 
              options={fipeBrands} 
              value={selectedBrandCode} 
              onChange={handleBrandChange} 
              placeholder="Digite a Marca..." 
            />

            <Autocomplete 
              options={fipeModels} 
              value={selectedModelCode} 
              onChange={handleModelChange} 
              placeholder="Digite o Modelo..." 
              disabled={!selectedBrandCode}
            />

            <Autocomplete 
              options={fipeYears} 
              value={selectedYearCode} 
              onChange={handleYearChange} 
              placeholder="Digite o Ano/Combustível..." 
              disabled={!selectedModelCode}
            />

            <input name="vin" placeholder="VIN / Chassi (Opcional)" value={formData.vin} onChange={handleChange} className={styles.input} />
            <input name="askingPrice" type="number" placeholder="Preço Pedido (R$)" value={formData.askingPrice} onChange={handleChange} className={styles.input} />
            <input name="origin" placeholder="Origem (Ex: Particular, OLX)" value={formData.origin} onChange={handleChange} className={styles.input} />
            <input name="adLink" placeholder="Link do Anúncio (Opcional)" value={formData.adLink} onChange={handleChange} className={styles.input} />
            
            {isLoadingFipe && <p className={styles.note} style={{color: '#10b981'}}>Consultando preço FIPE oficial...</p>}
          </div>
        )}

        {step === 2 && (
          <div className={styles.stepContent}>
            <h2>2. Avaliação de Mercado</h2>
            <input name="fipePrice" type="number" placeholder="Preço FIPE (R$)" value={formData.fipePrice} onChange={handleChange} className={styles.input} />
            <p className={styles.note}>O Preço Fipe é preenchido automaticamente, mas pode ser ajustado manualmente se necessário.</p>
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
            <p className={styles.note}>Selecione os defeitos encontrados e ajuste o custo estimado se necessário:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
              {STRUCTURE_DEFECTS.map(defect => {
                const isSelected = selectedStructureDefects.find(d => d.id === defect.id);
                return (
                  <label key={defect.id} className={styles.checkboxLabel} style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
                    <span>
                      <input 
                        type="checkbox" 
                        checked={!!isSelected}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedStructureDefects([...selectedStructureDefects, { ...defect }]);
                          else setSelectedStructureDefects(selectedStructureDefects.filter(d => d.id !== defect.id));
                        }} 
                      />
                      {' ' + defect.label}
                    </span>
                    {isSelected ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        R$ 
                        <input 
                          type="number" 
                          value={isSelected.cost} 
                          onChange={e => setSelectedStructureDefects(selectedStructureDefects.map(d => d.id === defect.id ? { ...d, cost: parseFloat(e.target.value) || 0 } : d))}
                          style={{ width: '80px', padding: '0.2rem', margin: 0 }}
                          className={styles.input}
                        />
                      </div>
                    ) : (
                      <strong style={{ color: 'var(--text-muted)' }}>R$ {defect.cost}</strong>
                    )}
                  </label>
                )
              })}
              
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Outro Defeito:</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" placeholder="Descrição" value={otherStructureName} onChange={e => setOtherStructureName(e.target.value)} className={styles.input} style={{ flex: 2, margin: 0 }} />
                  <input type="number" placeholder="Custo (R$)" value={otherStructureCost} onChange={e => setOtherStructureCost(e.target.value)} className={styles.input} style={{ flex: 1, margin: 0 }} />
                  <button type="button" className={styles.btnSecondary} onClick={() => {
                    if (otherStructureName && otherStructureCost) {
                      setSelectedStructureDefects([...selectedStructureDefects, { id: 's_other_' + Date.now(), label: otherStructureName, cost: parseFloat(otherStructureCost) || 0 }]);
                      setOtherStructureName('');
                      setOtherStructureCost('');
                    }
                  }}>Adicionar</button>
                </div>
                {selectedStructureDefects.filter(d => d.id.startsWith('s_other')).map(d => (
                   <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--surface-color)', marginTop: '0.5rem', borderRadius: '4px' }}>
                     <span>{d.label}</span>
                     <span>R$ {d.cost} <button onClick={() => setSelectedStructureDefects(selectedStructureDefects.filter(x => x.id !== d.id))} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '1rem' }}>X</button></span>
                   </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className={styles.stepContent}>
            <h2>5. Avaliação Mecânica</h2>
            <p className={styles.note}>Selecione os reparos mecânicos necessários e ajuste os valores:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
              {MECHANIC_DEFECTS.map(defect => {
                const isSelected = selectedMechanicDefects.find(d => d.id === defect.id);
                return (
                  <label key={defect.id} className={styles.checkboxLabel} style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
                    <span>
                      <input 
                        type="checkbox" 
                        checked={!!isSelected}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedMechanicDefects([...selectedMechanicDefects, { ...defect }]);
                          else setSelectedMechanicDefects(selectedMechanicDefects.filter(d => d.id !== defect.id));
                        }} 
                      />
                      {' ' + defect.label}
                    </span>
                    {isSelected ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        R$ 
                        <input 
                          type="number" 
                          value={isSelected.cost} 
                          onChange={e => setSelectedMechanicDefects(selectedMechanicDefects.map(d => d.id === defect.id ? { ...d, cost: parseFloat(e.target.value) || 0 } : d))}
                          style={{ width: '80px', padding: '0.2rem', margin: 0 }}
                          className={styles.input}
                        />
                      </div>
                    ) : (
                      <strong style={{ color: 'var(--text-muted)' }}>R$ {defect.cost}</strong>
                    )}
                  </label>
                )
              })}
              
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Outro Reparo:</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" placeholder="Descrição" value={otherMechanicName} onChange={e => setOtherMechanicName(e.target.value)} className={styles.input} style={{ flex: 2, margin: 0 }} />
                  <input type="number" placeholder="Custo (R$)" value={otherMechanicCost} onChange={e => setOtherMechanicCost(e.target.value)} className={styles.input} style={{ flex: 1, margin: 0 }} />
                  <button type="button" className={styles.btnSecondary} onClick={() => {
                    if (otherMechanicName && otherMechanicCost) {
                      setSelectedMechanicDefects([...selectedMechanicDefects, { id: 'm_other_' + Date.now(), label: otherMechanicName, cost: parseFloat(otherMechanicCost) || 0 }]);
                      setOtherMechanicName('');
                      setOtherMechanicCost('');
                    }
                  }}>Adicionar</button>
                </div>
                {selectedMechanicDefects.filter(d => d.id.startsWith('m_other')).map(d => (
                   <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--surface-color)', marginTop: '0.5rem', borderRadius: '4px' }}>
                     <span>{d.label}</span>
                     <span>R$ {d.cost} <button onClick={() => setSelectedMechanicDefects(selectedMechanicDefects.filter(x => x.id !== d.id))} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '1rem' }}>X</button></span>
                   </div>
                ))}
              </div>
            </div>
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
