'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ activeOps: 0, avgRoi: 0 });

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.activeOps !== 'undefined') {
          setStats(data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.overlay}></div>
      <div className={styles.content}>
        
        {/* Extremidade Esquerda: Métricas Reais */}
        <div className={styles.metricsLeft}>
          <div className={styles.metricItem}>
            <span className={styles.metricValue}>{stats.activeOps}</span>
            <span className={styles.metricLabel}>Oportunidades Ativas</span>
          </div>
        </div>

        {/* Centro: Marca e Pesquisa */}
        <div className={styles.centerSection}>
          <h1 className={styles.title}>Car Flip Intelligence</h1>
        </div>

        {/* Extremidade Direita: Métricas Reais */}
        <div className={styles.metricsRight}>
          <div className={styles.metricItem}>
            <span className={styles.metricValue}>{stats.avgRoi.toFixed(1)}%</span>
            <span className={styles.metricLabel}>ROI Médio</span>
          </div>
        </div>

      </div>
    </header>
  );
}
