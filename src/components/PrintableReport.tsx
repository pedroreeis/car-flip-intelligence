import React from 'react';

export const PrintableReport = React.forwardRef(({ data }: { data: any }, ref: React.Ref<HTMLDivElement>) => {
  if (!data) return null;

  return (
    <div ref={ref} style={{ padding: '40px', fontFamily: 'Arial, sans-serif', color: '#333', background: '#fff', minHeight: '100vh' }}>
      <div style={{ borderBottom: '2px solid #2563eb', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1e293b', fontSize: '24px' }}>CFI - Laudo de Due Diligence</h1>
          <p style={{ margin: '5px 0 0', color: '#64748b' }}>Car Flip Intelligence</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '18px' }}>{data.vehicle.brand} {data.vehicle.model}</p>
          <p style={{ margin: 0 }}>Ano: {data.vehicle.year}</p>
          <p style={{ margin: 0 }}>Data: {new Date(data.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
        <div>
          <h3 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>Métricas Financeiras</h3>
          <p><strong>Preço Pedido:</strong> R$ {(data.askingPrice || 0).toLocaleString()}</p>
          <p><strong>Preço FIPE:</strong> R$ {(data.fipePrice || 0).toLocaleString()}</p>
          <p><strong>Custo de Preparação (Estimado):</strong> R$ {(data.totalInvestment - data.askingPrice).toLocaleString()}</p>
          <p><strong>Investimento Total:</strong> R$ {data.totalInvestment.toLocaleString()}</p>
          <p><strong>Preço de Venda Estimado:</strong> R$ {data.estimatedSalePrice?.toLocaleString()}</p>
          <p><strong>Lucro Estimado:</strong> R$ {data.estimatedProfit?.toLocaleString()}</p>
          <p><strong>ROI Esperado:</strong> {data.estimatedRoi?.toFixed(1)}%</p>
        </div>

        <div>
          <h3 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>Análise de Risco</h3>
          <p><strong>Score CFI:</strong> {data.attractivenessScore?.toFixed(0)}/100</p>
          <p><strong>Risco Operacional:</strong> {data.riskScore}/100</p>
          <p><strong>Veredito:</strong> {data.recommendation}</p>
          
          <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Documentação e Histórico</h4>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            <li>Passagem por Leilão: {data.documentation?.leilao ? 'Sim' : 'Não'}</li>
            <li>Sinistro Apontado: {data.documentation?.sinistro ? 'Sim' : 'Não'}</li>
            <li>Restrições Jud./Fin.: {data.documentation?.restricao ? 'Sim' : 'Não'}</li>
          </ul>
        </div>
      </div>

      <div>
        <h3 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>Parecer Técnico</h3>
        <p><strong>Estrutura:</strong> {data.structure?.ok ? 'Aprovada (Sem danos estruturais significativos)' : 'Reprovada/Atenção (Danos estruturais identificados)'}</p>
        <p><strong>Mecânica:</strong> {data.mechanics?.ok ? 'Aprovada (Sem problemas mecânicos graves)' : 'Reprovada/Atenção (Problemas mecânicos que exigem revisão)'}</p>
      </div>

      {data.images && data.images.length > 0 && (
        <div style={{ marginTop: '40px', pageBreakInside: 'avoid' }}>
          <h3 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>Evidências Fotográficas</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '20px' }}>
            {data.images.map((url: string, index: number) => (
              <img key={index} src={url} alt={`Foto ${index}`} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '4px' }} />
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
        <p>Este laudo é gerado automaticamente baseado nos dados fornecidos pelo operador.</p>
        <p>Car Flip Intelligence - Sistema de Análise de Oportunidades Automotivas</p>
      </div>
    </div>
  );
});

PrintableReport.displayName = 'PrintableReport';
