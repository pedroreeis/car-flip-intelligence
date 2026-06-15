'use client';
import { useAuth } from "@/contexts/AuthContext";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useReactToPrint } from 'react-to-print';
import { PrintableReport } from '@/components/PrintableReport';
import { Printer } from 'lucide-react';
import styles from './result.module.css';

export default function EvaluationResult() {
  const { fetchWithAuth } = useAuth();

  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laudo_CFI_${data?.vehicle?.brand}_${data?.vehicle?.model}`,
  });

  useEffect(() => {
    fetchWithAuth(`/api/evaluations/${params.id}`)
      .then(res => res.json())
      .then(setData);
  }, [params.id]);

  if (!data) return <div className={styles.loading}>Carregando Score...</div>;

  const handleAddToStock = async () => {
    try {
      const res = await fetchWithAuth(`/api/evaluations/${params.id}/stock`, { method: 'POST' });
      if (res.ok) {
        router.push('/inventory');
      } else {
        alert('Erro ao adicionar ao estoque');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDiscard = async () => {
    try {
      const res = await fetchWithAuth(`/api/evaluations/${params.id}/reject`, { method: 'POST' });
      if (res.ok) {
        router.push('/');
      } else {
        alert('Erro ao descartar avaliação');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ display: 'none' }}>
        <PrintableReport ref={printRef} data={data} />
      </div>

      <div className={styles.card}>
        <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Resultado da Avaliação</h1>
            <p>{data.vehicle.brand} {data.vehicle.model} ({data.vehicle.year})</p>
          </div>
          <button onClick={() => handlePrint()} className={styles.btnSecondary} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={18} /> Exportar PDF
          </button>
        </div>

        <div className={styles.scoreBoard}>
          <div className={styles.mainScore}>
            <h2>{data.attractivenessScore?.toFixed(0)}</h2>
            <span>Score CFI</span>
          </div>
          <div className={styles.recommendation}>
            Veredito: <strong>{data.recommendation}</strong>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.infoBox}>
            <h3>Lucro Estimado</h3>
            <p className={styles.valuePositive}>R$ {data.estimatedProfit?.toFixed(2)}</p>
          </div>
          <div className={styles.infoBox}>
            <h3>ROI Esperado</h3>
            <p className={styles.valuePositive}>{data.estimatedRoi?.toFixed(1)}%</p>
          </div>
          <div className={styles.infoBox}>
            <h3>Risco Operacional</h3>
            <p className={data.riskScore > 30 ? styles.valueDanger : styles.valueWarning}>{data.riskScore}</p>
          </div>
          <div className={styles.infoBox}>
            <h3>Investimento Total</h3>
            <p>R$ {data.totalInvestment?.toFixed(2)}</p>
          </div>
        </div>

        {data.images && data.images.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Fotos do Veículo</h3>
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
              {data.images.map((url: string, index: number) => (
                <img 
                  key={index} 
                  src={url} 
                  alt={`Foto ${index + 1}`} 
                  style={{ width: '200px', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} 
                />
              ))}
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button onClick={handleDiscard} className={styles.btnSecondary} style={{ cursor: 'pointer' }}>Descartar Avaliação</button>
          <button onClick={handleAddToStock} className={styles.btnPrimary}>Adicionar ao Estoque</button>
        </div>
      </div>
    </div>
  );
}
