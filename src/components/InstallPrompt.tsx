'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import styles from './InstallPrompt.module.css';

export default function InstallPrompt() {
  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMobileDevice = /iphone|ipad|ipod|android|blackberry|windows phone/g.test(userAgent);
    setIsMobile(isMobileDevice);

    // Check if app is already installed
    const isAppStandalone = window.matchMedia('(display-mode: standalone)').matches 
                         || (window.navigator as any).standalone;
    setIsStandalone(isAppStandalone);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (isMobileDevice && !isAppStandalone) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Fallback trigger if event doesn't fire but we know it's mobile web
    if (isMobileDevice && !isAppStandalone) {
      // Small delay so it's not jarring
      setTimeout(() => setShowPrompt(true), 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback for iOS / Safari which don't support beforeinstallprompt
      alert('Para instalar: Clique no ícone de Compartilhar do seu navegador e escolha "Adicionar à Tela de Início".');
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className={styles.promptContainer}>
      <div className={styles.promptContent}>
        <div className={styles.promptText}>
          <strong>Instalar Aplicativo</strong>
          <p>Instale o Car Flip Intelligence para uma experiência melhor e mais rápida!</p>
        </div>
        <div className={styles.promptActions}>
          <button className={styles.btnInstall} onClick={handleInstallClick}>
            <Download size={16} /> Instalar
          </button>
          <button className={styles.btnClose} onClick={() => setShowPrompt(false)}>
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
