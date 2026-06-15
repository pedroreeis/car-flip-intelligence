'use client';

import Link from 'next/link';
import { Database, PenTool, TrendingUp } from 'lucide-react';
import styles from '@/app/page.module.css';

export default function ToolsDashboard() {
  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb} style={{ padding: '2rem 2rem 0', marginBottom: '-1rem' }}>
        <Link href="/">Início</Link> &gt; <span>Ferramentas</span>
      </div>

      <div className={styles.heroHeader} style={{ margin: '2rem', borderRadius: '16px' }}>
        <div className={styles.heroContent}>
          <h1>Ferramentas do Sistema</h1>
          <p>Gerencie a base de conhecimento, ajuste o motor estatístico e outras configurações da plataforma.</p>
        </div>
      </div>

      <main className={styles.mainLayout} style={{ padding: '0 2rem' }}>
        <div className={styles.feedColumn} style={{ width: '100%' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            
            <Link href="/tools/knowledge-base" className={styles.oppCard} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
                <div style={{ background: '#e0f2fe', padding: '1rem', borderRadius: '50%', color: '#0284c7' }}>
                  <Database size={40} />
                </div>
                <h3>Base de Conhecimento</h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  Gerencie as opções padronizadas (marcas, modelos, tipos de reparo) que alimentam o preenchimento automático.
                </p>
              </div>
            </Link>

            <div className={styles.oppCard} style={{ opacity: 0.6, cursor: 'not-allowed' }}>
              <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
                <div style={{ background: '#f3e8ff', padding: '1rem', borderRadius: '50%', color: '#9333ea' }}>
                  <TrendingUp size={40} />
                </div>
                <h3>Ajustes do Motor Estatístico</h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  Configuração manual de pesos e confiança do modelo (Em Breve).
                </p>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
