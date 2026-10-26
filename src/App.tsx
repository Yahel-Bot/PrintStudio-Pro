import React, { useState, useEffect } from 'react';
import logo from './assets/logo.png';
import { getLayoutDimensions, getPaperAspectRatio } from './domain/layout';
import { calculatePrintCosts, isColorPage } from './domain/pricing';

// Tipos para la API de Electron
declare global {
  interface Window {
    electronAPI: {
      getIP: () => Promise<string>;
      getNetworkInfo: () => Promise<{
        hotspotIp: string;
        hasActiveHotspotAdapter: boolean;
        wifiIp: string;
        preferredLocalIp: string;
        port: number;
        uploadPath: string;
        hotspot?: {
          supported: boolean;
          state: string;
          ssid?: string;
          password?: string;
          clients?: number;
          ip?: string;
          error?: string;
        };
      }>;
      getHotspotInfo: () => Promise<any>;
      toggleHotspot: (enable: boolean) => Promise<any>;
      getUploadPath: () => Promise<string>;
      getPrinters: () => Promise<any[]>;
      generateQR: (text: string) => Promise<string>;
      analyzeImage: (filePath: string) => Promise<any>;
      saveSale: (saleData: any) => Promise<any>;
      getCorte: () => Promise<any>;
      selectFiles: () => Promise<string[]>;
      convertOffice: (filePath: string) => Promise<any>;
      printTicket: (saleData: any, printerName?: string) => Promise<any>;
      printDocument: (jobData: any) => Promise<any>;
      getLearningModel: () => Promise<any>;
      savePriceCorrection: (correctionData: any) => Promise<any>;
      resetLearningModel: () => Promise<any>;
      getPathForFile: (file: any) => string;
      onFileReceived: (callback: (filePath: string) => void) => void;
      onTunnelUrl: (callback: (url: string) => void) => void;
      onTunnelInfo: (callback: (info: { url: string; password?: string }) => void) => void;
    }
  }
}

interface PageAnalysis {
  path: string;
  pageIndex: number;
  imagePath: string;
  esColor: boolean;
  cobertura: number;
  pctColor?: number;
  esAltaDensidadBN: boolean;
  isDocumentPage: boolean;
  // Controls
  rotation: number; // 0, 90, 180, 270 degrees
  quantity: number; // Number of copies of this specific image/page
  copiesPerPage: number; // Number of copies of each page in the print job
  colorOverride?: 'color' | 'bw' | null; // Override individual page color/BW mode
}

const App: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (
    localStorage.getItem('theme') as 'dark' | 'light' || 'dark'
  ));

  // Business Configuration (Saved in localStorage)
  const [costBase, setCostBase] = useState<number>(() => Number(localStorage.getItem('costBase') || '3'));
  const [costBW, setCostBW] = useState<number>(() => Number(localStorage.getItem('costBW') || '1'));
  const [costBWHigh, setCostBWHigh] = useState<number>(() => Number(localStorage.getItem('costBWHigh') || '2'));
  const [costColor, setCostColor] = useState<number>(() => Number(localStorage.getItem('costColor') || '5'));
  const [pricingMode, setPricingMode] = useState<'fixed' | 'smart'>(() => (localStorage.getItem('pricingMode') as 'fixed' | 'smart') || 'fixed');
  const [printColorMode, setPrintColorMode] = useState<'auto' | 'color' | 'bw'>(
    () => (localStorage.getItem('printColorMode') as 'auto' | 'color' | 'bw') || 'auto'
  );

  // Modelo de Aprendizaje Inteligente de Tarifas (Aprende de las correcciones del usuario)
  const [learningModel, setLearningModel] = useState<{
    tier1_rate: number;
    tier2_rate: number;
    tier3_rate: number;
    tier4_rate: number;
    color_rate: number;
    cost_bw_high: number;
    cost_base: number;
    tuning_factor: number;
    total_corrections: number;
  }>({
    tier1_rate: 1.00, // 1 a 50 copias (B/N): $1.00
    tier2_rate: 0.80, // 51 a 100 copias (B/N): $0.80
    tier3_rate: 0.50, // 101 a 200 copias (B/N): $0.50
    tier4_rate: 0.40, // 201+ copias (B/N): $0.40
    color_rate: 3.00,
    cost_bw_high: 2.00,
    cost_base: 0.00,
    tuning_factor: 1.00,
    total_corrections: 0
  });

  // Corrección manual de precios por el usuario
  const [correctedTotal, setCorrectedTotal] = useState<number | null>(null);
  const [isEditingPrice, setIsEditingPrice] = useState<boolean>(false);
  const [priceCorrectionInput, setPriceCorrectionInput] = useState<string>('');

  // Application State
  const [connectionMode, setConnectionMode] = useState<'hotspot' | 'wifi' | 'internet'>('hotspot');
  const [hotspotStep, setHotspotStep] = useState<'wifi' | 'upload'>('wifi');
  const [hotspotInfo, setHotspotInfo] = useState<{
    supported: boolean;
    state: string;
    ssid?: string;
    password?: string;
    clients?: number;
    ip?: string;
  } | null>(null);
  const [isTogglingHotspot, setIsTogglingHotspot] = useState<boolean>(false);
  const [wifiIp, setWifiIp] = useState<string>('');
  const [hotspotIp, setHotspotIp] = useState<string>('192.168.137.1');
  const [uploadRoute, setUploadRoute] = useState<string>('/upload');
  
  // QR Codes for different modes
  const [wifiConnectQr, setWifiConnectQr] = useState<string>('');
  const [hotspotUploadQr, setHotspotUploadQr] = useState<string>('');
  const [wifiUploadQr, setWifiUploadQr] = useState<string>('');
  const [tunnelUploadQr, setTunnelUploadQr] = useState<string>('');
  const [publicUploadUrl, setPublicUploadUrl] = useState<string>('');
  const [tunnelPassword, setTunnelPassword] = useState<string>('');

  // Big QR modal & Toast notification
  const [showBigQrModal, setShowBigQrModal] = useState<boolean>(false);
  const [bigQrData, setBigQrData] = useState<{ title: string; subtitle: string; qr: string; helpText?: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5500);
  };

  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const savedWidth = Number(localStorage.getItem('sidebarWidth'));
    return Number.isFinite(savedWidth) ? Math.min(380, Math.max(220, savedWidth)) : 252;
  });
  const [files, setFiles] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<PageAnalysis[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageAnalysis | null>(null);
  
  // Printing Job Params
  const [printers, setPrinters] = useState<Array<{ name: string; isDefault?: boolean }>>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [isLoadingPrinters, setIsLoadingPrinters] = useState<boolean>(true);
  const [paperSize, setPaperSize] = useState<string>('Carta');
  const [copies, setCopies] = useState<number>(1);
  const [imageLayout, setImageLayout] = useState<number>(1);
  const [fitOption, setFitOption] = useState<'fit' | 'fill'>('fit');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<string>('');
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [previewZoom, setPreviewZoom] = useState<number>(1);

  // Daily Summary (Corte Diario)
  const [corteSummary, setCorteSummary] = useState<any>({ total_tinta: 0, total_general: 0, num_ventas: 0 });
  const [corteSales, setCorteSales] = useState<any[]>([]);

  // Ticket Modal State
  const [showTicketModal, setShowTicketModal] = useState<boolean>(false);
  const [activeTicketData, setActiveTicketData] = useState<any | null>(null);
  const [ticketQr, setTicketQr] = useState<string>('');

  // Save Settings to localStorage
  useEffect(() => {
    localStorage.setItem('costBase', costBase.toString());
    localStorage.setItem('costBW', costBW.toString());
    localStorage.setItem('costBWHigh', costBWHigh.toString());
    localStorage.setItem('costColor', costColor.toString());
    localStorage.setItem('pricingMode', pricingMode);
  }, [costBase, costBW, costBWHigh, costColor, pricingMode, printColorMode]);

  useEffect(() => {
    localStorage.setItem('printColorMode', printColorMode);
  }, [printColorMode]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('sidebarWidth', String(sidebarWidth));
  }, [sidebarWidth]);

  // Cargar modelo de aprendizaje inteligente al iniciar
  useEffect(() => {
    const loadLearningModel = async () => {
      try {
        if (window.electronAPI && typeof window.electronAPI.getLearningModel === 'function') {
          const model = await window.electronAPI.getLearningModel();
          if (model && Object.keys(model).length > 0) {
            setLearningModel(prev => ({ ...prev, ...model }));
          }
        }
      } catch (e) {
        console.warn('Error al cargar modelo de aprendizaje:', e);
      }
    };
    loadLearningModel();
  }, []);

  const handleSidebarResize = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = sidebarWidth;
    const updateWidth = (moveEvent: PointerEvent) => {
      setSidebarWidth(Math.min(380, Math.max(220, startWidth + moveEvent.clientX - startX)));
    };
    const stopResize = () => {
      window.removeEventListener('pointermove', updateWidth);
      window.removeEventListener('pointerup', stopResize);
    };
    window.addEventListener('pointermove', updateWidth);
    window.addEventListener('pointerup', stopResize, { once: true });
  };

  const refreshAllQrs = async (netInfo?: any, currentHotspot?: any) => {
    try {
      const up = netInfo?.uploadPath || uploadRoute || '/upload';
      const hIp = netInfo?.hotspotIp || hotspotIp || '192.168.137.1';
      const wIp = netInfo?.wifiIp || wifiIp;
      const hs = currentHotspot || hotspotInfo;

      // 1. QR de subida en Hotspot directo (Sin router Wi-Fi)
      const hsUrl = `http://${hIp}:3500${up}`;
      const hsUpload = await window.electronAPI.generateQR(hsUrl);
      setHotspotUploadQr(hsUpload);

      // 2. QR de conexión al Wi-Fi del Hotspot (formato estándar WIFI:)
      if (hs?.ssid && hs?.password) {
        const wifiStr = `WIFI:S:${hs.ssid};T:WPA;P:${hs.password};;`;
        const wifiQr = await window.electronAPI.generateQR(wifiStr);
        setWifiConnectQr(wifiQr);
      }

      // 3. QR de subida en Wi-Fi Local (misma red)
      if (wIp && wIp !== 'localhost') {
        const wifiUrl = `http://${wIp}:3500${up}`;
        const wUpload = await window.electronAPI.generateQR(wifiUrl);
        setWifiUploadQr(wUpload);
      }
    } catch (e) {
      console.error('Error generating QRs:', e);
    }
  };

  const handleToggleHotspot = async () => {
    setIsTogglingHotspot(true);
    try {
      const shouldEnable = hotspotInfo?.state !== 'On';
      const result = await window.electronAPI.toggleHotspot(shouldEnable);
      if (result) {
        setHotspotInfo(result);
        await refreshAllQrs(null, result);
        showToast(
          shouldEnable ? 'Zona Móvil de la PC activada con éxito.' : 'Zona Móvil desactivada.',
          'success'
        );
      }
    } catch (e: any) {
      showToast('Error al cambiar estado de Zona Móvil: ' + (e.message || e), 'error');
    } finally {
      setIsTogglingHotspot(false);
    }
  };

  // Load Setup data on mount
  useEffect(() => {
    const setupApp = async () => {
      try {
        const netInfo = await window.electronAPI.getNetworkInfo();
        if (netInfo) {
          setWifiIp(netInfo.wifiIp || '');
          setHotspotIp(netInfo.hotspotIp || '192.168.137.1');
          setUploadRoute(netInfo.uploadPath || '/upload');
          if (netInfo.hotspot) {
            setHotspotInfo(netInfo.hotspot);
          }
          await refreshAllQrs(netInfo, netInfo.hotspot);
        }
      } catch (err) {
        console.error("Error setting up mobile import server QR:", err);
      }

      // Load System Printers
      try {
        setIsLoadingPrinters(true);
        let list = await window.electronAPI.getPrinters();
        if ((!Array.isArray(list) || list.length === 0)) {
          await new Promise(r => setTimeout(r, 700));
          list = await window.electronAPI.getPrinters();
        }
        if (Array.isArray(list) && list.length > 0) {
          setPrinters(list);
          const defaultP = list.find((p: any) => p.isDefault) || list[0];
          if (defaultP) setSelectedPrinter(defaultP.name);
        } else {
          console.warn('No system printers found.');
        }
      } catch (pErr) {
        console.error("Error loading system printers:", pErr);
      } finally {
        setIsLoadingPrinters(false);
      }
      
      // Load Initial Corte Diario
      fetchCorteDiario();
    };

    setupApp();

    // Listen for mobile uploaded files
    window.electronAPI.onFileReceived((filePath) => {
      setFiles(prev => prev.includes(filePath) ? prev : [...prev, filePath]);
      showToast('Nuevo archivo recibido desde el celular.', 'success');
      void analyzeFile(filePath);
    });

    // Listen for public tunnel URL and info from main
    window.electronAPI.onTunnelInfo((info: { url: string; password?: string }) => {
      setPublicUploadUrl(info.url);
      if (info.password) setTunnelPassword(info.password);
      window.electronAPI.generateQR(info.url)
        .then(qr => setTunnelUploadQr(qr))
        .catch(e => console.error('QR gen failed for tunnel URL', e));
    });

    window.electronAPI.onTunnelUrl((url: string) => {
      setPublicUploadUrl(url);
      window.electronAPI.generateQR(url)
        .then(qr => setTunnelUploadQr(qr))
        .catch(e => console.error('QR gen failed for tunnel URL', e));
    });
  }, []);

  // Helper functions for print preview and layout
  const getPrintItemsForPreview = () => {
    const items: { imagePath: string; rotation: number; name: string; originalPage: PageAnalysis }[] = [];
    analysisResults.forEach((analysis) => {
      const quantity = Math.max(1, analysis.quantity || 1);
      for (let i = 0; i < quantity; i++) {
        items.push({
          imagePath: analysis.imagePath,
          rotation: (analysis.rotation || 0) % 360,
          name: analysis.path.split(/[\\/]/).pop() || 'Archivo',
          originalPage: analysis
        });
      }
    });
    return items;
  };

  const getPreviewDimensions = (pSize: string, orient: 'portrait' | 'landscape') => {
    const ratio = getPaperAspectRatio(pSize, orient);
    if (orient === 'landscape') {
      const width = 340;
      const height = Math.round(width / ratio);
      return { width, height };
    } else {
      const height = 360;
      const width = Math.round(height * ratio);
      return { width, height };
    }
  };

  const updateSelectedRotation = (newRot: number) => {
    if (!selectedPage) return;
    const normalized = ((newRot % 360) + 360) % 360;
    setAnalysisResults(prev => {
      if (prev.length === 0) return prev;
      return prev.map(p => {
        if (p.path === selectedPage.path && p.pageIndex === selectedPage.pageIndex) {
          return { ...p, rotation: normalized };
        }
        return p;
      });
    });
    setSelectedPage(prev => prev ? { ...prev, rotation: normalized } : null);
  };

  const rotateAllImages = (delta: number) => {
    setAnalysisResults(prev => {
      return prev.map(p => ({
        ...p,
        rotation: (((p.rotation || 0) + delta) % 360 + 360) % 360
      }));
    });
    setSelectedPage(prev => prev ? {
      ...prev,
      rotation: (((prev.rotation || 0) + delta) % 360 + 360) % 360
    } : null);
  };

  const resetAllRotations = () => {
    setAnalysisResults(prev => {
      return prev.map(p => ({ ...p, rotation: 0 }));
    });
    setSelectedPage(prev => prev ? { ...prev, rotation: 0 } : null);
  };

  const updateSelectedQuantity = (newQty: number) => {
    if (!selectedPage) return;
    const val = Math.max(1, newQty);
    setAnalysisResults(prev => {
      if (prev.length === 0) return prev;
      return prev.map(p => {
        if (p.path === selectedPage.path && p.pageIndex === selectedPage.pageIndex) {
          return { ...p, quantity: val };
        }
        return p;
      });
    });
    setSelectedPage(prev => prev ? { ...prev, quantity: val } : null);
  };

  const updatePageQuantity = (page: PageAnalysis, newQty: number) => {
    const val = Math.max(1, newQty);
    setAnalysisResults(prev => prev.map(item => (
      item.path === page.path && item.pageIndex === page.pageIndex
        ? { ...item, quantity: val }
        : item
    )));
    setSelectedPage(prev => (
      prev && prev.path === page.path && prev.pageIndex === page.pageIndex
        ? { ...prev, quantity: val }
        : prev
    ));
  };

  const fetchCorteDiario = async () => {
    try {
      const data = await window.electronAPI.getCorte();
      if (data) {
        setCorteSummary({
          total_tinta: data.resumen?.total_tinta || 0,
          total_general: data.resumen?.total_general || 0,
          num_ventas: data.resumen?.num_ventas || 0
        });
        setCorteSales(data.ventas || []);
      }
    } catch (e) {
      console.error("Error fetching corte:", e);
    }
  };

  // Analyze single selected file
  const analyzeFile = async (filePath: string) => {
    const fileName = filePath.split(/[\\/]/).pop() || 'Archivo';
    const ext = filePath.split('.').pop()?.toLowerCase() || '';

    // Filter out invalid/binary executable files (e.g. PrintStudio Pro.exe)
    const validDocExts = ['pdf', 'docx', 'xlsx', 'pptx', 'doc', 'xls', 'ppt'];
    const validImgExts = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tif', 'tiff'];

    if (!validDocExts.includes(ext) && !validImgExts.includes(ext)) {
      console.warn(`Archivo omitido (formato no soportado): ${fileName}`);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(`Analizando ${fileName}...`);
    
    try {
      const isDoc = validDocExts.includes(ext);

      if (isDoc) {
        const response = await window.electronAPI.convertOffice(filePath);
        if (response.status === 'success') {
          const newPages = response.pages.map((p: any, idx: number) => ({
            path: filePath,
            pageIndex: idx,
            imagePath: p.image_path,
            esColor: p.esColor,
            cobertura: p.cobertura,
            pctColor: p.pctColor,
            esAltaDensidadBN: p.esAltaDensidadBN,
            isDocumentPage: true,
            // Initialize new print control properties
            rotation: 0,
            quantity: 1,
            copiesPerPage: 1
          }));

          setAnalysisResults(prev => {
            const updated = [...prev, ...newPages];
            // Select first analyzed page by default if none selected
            if (updated.length > 0 && !selectedPage) {
              setSelectedPage(updated[0]);
            }
            return updated;
          });
        } else {
          console.error("Error converting document:", response.message);
          showToast(`No se pudo procesar ${fileName}: ${response.message || 'Error de conversión'}`, 'error');
        }
      } else {
        // Handle images (.png, .jpg, .webp, .bmp, etc)
        const result = await window.electronAPI.analyzeImage(filePath);
        const newPage: PageAnalysis = {
          path: filePath,
          pageIndex: 0,
          imagePath: result.image_path,
          esColor: result.esColor,
          cobertura: result.cobertura,
          pctColor: result.pctColor,
          esAltaDensidadBN: result.esAltaDensidadBN,
          isDocumentPage: false,
          // Initialize new print control properties
          rotation: 0,
          quantity: 1,
          copiesPerPage: 1
        };

        setAnalysisResults(prev => {
          const updated = [...prev, newPage];
          if (!selectedPage) {
            setSelectedPage(newPage);
          }
          return updated;
        });
      }
    } catch (err: any) {
      console.error("Error analyzing file:", err);
      showToast(`Error al procesar ${fileName}: ${err?.message || err}`, 'error');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  const handleSelectFiles = async () => {
    const selected = (await window.electronAPI.selectFiles()) || [];
    if (selected.length > 0) {
      setFiles(prev => {
        const newFiles = [...prev];
        selected.forEach(s => {
          if (!newFiles.includes(s)) newFiles.push(s);
        });
        return newFiles;
      });

      for (const f of selected) {
        await analyzeFile(f);
      }
    }
  };

  const handleDropFiles = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    const paths: string[] = [];
    for (const file of droppedFiles) {
      let p = '';
      if (window.electronAPI?.getPathForFile) {
        try {
          p = window.electronAPI.getPathForFile(file);
        } catch (e) {
          console.warn('Error en getPathForFile:', e);
        }
      }
      if (!p && (file as any).path) {
        p = (file as any).path;
      }
      if (p) paths.push(p);
    }
    if (paths.length === 0) {
      showToast('No se pudieron leer las rutas de los archivos arrastrados. Haz clic en la zona para seleccionarlos.', 'error');
      return;
    }
    setFiles(prev => Array.from(new Set([...prev, ...paths])));
    for (const filePath of paths) {
      await analyzeFile(filePath);
    }
  };

  const handleClearAll = () => {
    setFiles([]);
    setAnalysisResults([]);
    setSelectedPage(null);
    setCopies(1);
  };

  const isPageColor = (page: PageAnalysis): boolean => {
    return isColorPage(page, printColorMode);
  };

  const togglePageColor = (page: PageAnalysis) => {
    const currentIsColor = isPageColor(page);
    const newOverride: 'color' | 'bw' = currentIsColor ? 'bw' : 'color';
    setAnalysisResults(prev => prev.map(p => {
      if (p.path === page.path && p.pageIndex === page.pageIndex) {
        return { ...p, colorOverride: newOverride };
      }
      return p;
    }));
    if (selectedPage?.path === page.path && selectedPage?.pageIndex === page.pageIndex) {
      setSelectedPage(prev => prev ? { ...prev, colorOverride: newOverride } : null);
    }
    if (correctedTotal !== null) setCorrectedTotal(null);
  };

  // Escalas por volumen para Blanco y Negro (SOLO B/N):
  // 1 a 50 copias: $1.00
  // 51 a 100 copias: $0.80
  // 101 a 200 copias: $0.50
  // 201+ copias: $0.40
  const costsBase = calculatePrintCosts(analysisResults, {
    costBase, costBW, costBWHigh, costColor, pricingMode, printColorMode, copies
  }, learningModel);
  const costs = {
    ...costsBase,
    total: correctedTotal !== null ? correctedTotal : costsBase.calculatedTotal,
    isCorrected: correctedTotal !== null
  };
  const { totalBwImpressions, totalColorImpressions, bwTier } = costsBase;
  const getPageUnitCost = (page: PageAnalysis) => {
    const single = calculatePrintCosts([{ ...page, quantity: 1 }], {
      costBase: 0, costBW, costBWHigh, costColor, pricingMode, printColorMode, copies: 1
    }, learningModel);
    return single.subtotalTinta;
  };

  const handleApplyPriceCorrection = async () => {
    const newPrice = parseFloat(priceCorrectionInput);
    if (isNaN(newPrice) || newPrice < 0) {
      showToast('Por favor escribe un precio válido', 'error');
      return;
    }

    setCorrectedTotal(newPrice);
    setIsEditingPrice(false);

    try {
      const correctionData = {
        archivo: analysisResults[0]?.path ? analysisResults[0].path.split(/[\\/]/).pop() : 'Trabajo',
        total_paginas: analysisResults.length,
        total_copias: copies,
        copias_bn: totalBwImpressions,
        copias_color: totalColorImpressions,
        cobertura_promedio: analysisResults.reduce((acc, p) => acc + p.cobertura, 0) / (analysisResults.length || 1),
        precio_calculado: costs.calculatedTotal,
        precio_corregido: newPrice,
        costo_fijo: costs.baseFee,
        detalles: {
          printColorMode,
          paperSize,
          copies,
          pages: analysisResults.length,
          costBW,
          costColor
        }
      };

      if (window.electronAPI && typeof window.electronAPI.savePriceCorrection === 'function') {
        const res = await window.electronAPI.savePriceCorrection(correctionData);
        if (res && res.success) {
          setLearningModel(res.model);
          showToast(`🧠 El sistema aprendió de tu corrección ($${newPrice.toFixed(2)} vs $${costs.calculatedTotal.toFixed(2)}) y ajustó las tarifas futuras`, 'success');
        }
      }
    } catch (e) {
      console.error('Error al guardar corrección de precio:', e);
    }
  };

  const handleResetLearning = async () => {
    try {
      if (window.electronAPI && typeof window.electronAPI.resetLearningModel === 'function') {
        const defaults = await window.electronAPI.resetLearningModel();
        setLearningModel(defaults);
        showToast('Tarifas aprendidas restablecidas a valores de fábrica', 'info');
      }
    } catch (e) {
      console.error('Error al restablecer aprendizaje:', e);
    }
  };

  // Save Sale & Generate Ticket
  const handlePrintAndRegister = async () => {
    if (analysisResults.length === 0) return;

    try {
      // Prepare items for print composer based on analysisResults and user quantities
      let printItems = [];

      // If we have analyzed pages (from documents or images), use them
      if (analysisResults.length > 0) {
        for (const analysis of analysisResults) {
          // Add the item multiple times based on its quantity (per-image copies)
          const itemQuantity = analysis.quantity || 1;
          const isPageBw = !isPageColor(analysis);
          for (let i = 0; i < itemQuantity; i++) {
            printItems.push({
              path: analysis.path,
              imagePath: analysis.imagePath,
              // Add rotation if specified
              rotation: analysis.rotation || 0,
              isBW: isPageBw,
              esColor: !isPageBw
            });
          }
        }
      } else {
        // Fallback - should not happen if we have analysisResults
        printItems = [{ path: '', imagePath: '', rotation: 0, isBW: false, esColor: true }];
      }

      // Prepare job data for print-document
      const jobData = {
        printer: selectedPrinter,
        // When using pages array, we don't need single filePath
        pages: printItems,
        copies: copies, // Job-level copies (copies of entire print job)
        paperSize: paperSize,
        imageLayout: imageLayout, // Layout selection (1, 2, 3, 4, 5, 7, 8, 9, 10, 35)
        isColorPrint: printColorMode === 'color' ||
                      (printColorMode === 'auto' && analysisResults.some(r => isPageColor(r))),
        fitOption: fitOption, // 'fit' or 'fill'
        orientation: orientation // 'portrait' or 'landscape'
      };

      // Show printing status
      setAnalysisProgress('Enviando trabajo a la impresora...');
      setIsAnalyzing(true);

      // Send to printer
      const printResult = await window.electronAPI.printDocument(jobData);

      setIsAnalyzing(false);
      setAnalysisProgress('');

      if (!printResult.success) {
        throw new Error(printResult.message || 'Error desconocido al imprimir');
      }

      // If print succeeded, save sale and generate ticket
      // Tomar primer archivo como identificador principal o resumen
      const mainFile = files[0].split(/[\\/]/).pop() || 'Varios';
      const { rows: printRows, cols: printCols } = getLayoutDimensions(imageLayout, orientation);
      const pagesPerSheet = printRows * printCols;
      const sheetsPerSet = Math.max(1, Math.ceil(printItems.length / pagesPerSheet));
      const totalPages = sheetsPerSet * copies;

      // Desglose de páginas para guardar (using original analysis results, not expanded)
      const desgloses = analysisResults.map((r, i) => ({
        pagina: i + 1,
        esColor: r.esColor,
        cobertura: r.cobertura,
        esAltaDensidadBN: r.esAltaDensidadBN
      }));

      const saleData = {
        archivo: files.length > 1 ? `${mainFile} (+${files.length - 1} más)` : mainFile,
        paginas: totalPages,
        copias: copies, // Job-level copies
        costo_tinta: costs.subtotalTinta,
        costo_fijo: costs.baseFee,
        total: costs.total,
        tipo_impresion: pricingMode === 'smart' ? 'Tarifa Inteligente' : 'Tarifa Fija',
        detalles: desgloses
      };

      const result = await window.electronAPI.saveSale(saleData);

      // Asignar ID retornado por SQLite para el ticket
      const completedSale = { ...saleData, id: result.lastInsertRowid };

      // Generar código QR para el ticket
      const qrData = JSON.stringify({
        id: completedSale.id,
        total: completedSale.total.toFixed(2),
        fecha: new Date().toLocaleString()
      });
      const qrDataURL = await window.electronAPI.generateQR(qrData);

      setTicketQr(qrDataURL);
      setActiveTicketData(completedSale);
      setShowTicketModal(true);

      // Recargar el historial diario
      fetchCorteDiario();

      // Limpiar el espacio de trabajo para la siguiente venta
      handleClearAll();

    } catch (e) {
      setIsAnalyzing(false);
      setAnalysisProgress('');
      console.error(e);
      alert('Error al imprimir: ' + (e.message || 'Error desconocido'));
    }
  };

  const handlePhysicalPrint = async () => {
    if (!activeTicketData) return;
    if (!selectedPrinter) {
      alert('Por favor, seleccione una impresora.');
      return;
    }
    try {
      const result = await window.electronAPI.printTicket(activeTicketData, selectedPrinter);
      if (!result?.success) {
        throw new Error(result?.reason || 'La impresora rechazó el ticket.');
      }
      alert(`Ticket enviado a la impresora "${selectedPrinter}".`);
    } catch (e) {
      console.error(e);
      alert('No se pudo imprimir el ticket físicamente (revisa tu impresora).');
    }
  };

  // Re-imprimir ticket histórico
  const handlePrintHistoryTicket = async (sale: any) => {
    let parsedDetalles = [];
    try {
      parsedDetalles = typeof sale.detalles === 'string' ? JSON.parse(sale.detalles) : sale.detalles;
    } catch (e) {}

    const completedSale = {
      id: sale.id,
      archivo: sale.archivo,
      paginas: sale.paginas,
      copias: sale.copias,
      costo_tinta: sale.costo_tinta,
      costo_fijo: sale.costo_fijo,
      total: sale.total,
      detalles: parsedDetalles
    };

    const qrData = JSON.stringify({
      id: completedSale.id,
      total: completedSale.total.toFixed(2),
      fecha: new Date(sale.fecha).toLocaleString()
    });
    const qrDataURL = await window.electronAPI.generateQR(qrData);
    
    setTicketQr(qrDataURL);
    setActiveTicketData(completedSale);
    setShowTicketModal(true);
  };

  const renderScanTab = () => {
    const printItems = getPrintItemsForPreview();
    const { rows: rowsPerPage, cols: colsPerPage } = getLayoutDimensions(imageLayout, orientation);
    const cellsPerPage = rowsPerPage * colsPerPage;
    const totalPages = Math.max(1, Math.ceil(printItems.length / cellsPerPage));
    const activePreviewPage = Math.min(previewPage, totalPages);

    // Slice items for current preview page
    const startIndex = (activePreviewPage - 1) * cellsPerPage;
    const itemsOnThisPage = printItems.slice(startIndex, startIndex + cellsPerPage);
    const previewDims = getPreviewDimensions(paperSize, orientation);

    // Physical sheets calculation
    const sheetsPerSet = Math.max(1, Math.ceil(printItems.length / cellsPerPage));
    const totalSheets = analysisResults.length === 0 ? 0 : sheetsPerSet * copies;

    return (
      <div className="workspace">
        <div className="workspace-left">
          {/* Upload Zone */}
          <div
            className="dropzone"
            onClick={handleSelectFiles}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDropFiles}
          >
            <div className="dropzone-icon">📁</div>
            <div className="dropzone-text">Cargar Documentos o Imágenes</div>
            <div className="dropzone-subtext">Soporta PDF, Word, Excel, PowerPoint y todo tipo de imágenes</div>
          </div>

          {/* Scanned Pages Grid */}
          <div className="grid-container">
            <div className="grid-title">
              <span>ARCHIVOS / PÁGINAS ({analysisResults.length})</span>
              {analysisResults.length > 0 && (
                <button className="clear-btn" onClick={handleClearAll}>Limpiar Todo</button>
              )}
            </div>

            {isAnalyzing && (
              <div className="loading-panel">
                <div className="spinner"></div>
                <div style={{fontWeight: 600, fontSize: '14px'}}>{analysisProgress}</div>
                <div style={{color: 'var(--text-secondary)', fontSize: '12px'}}>Procesando páginas y detectando cobertura...</div>
              </div>
            )}

            {!isAnalyzing && analysisResults.length === 0 && (
              <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontSize: '13px'}}>
                Ningún archivo cargado todavía. Usa el botón de arriba o escanea el QR desde tu móvil para subir archivos.
              </div>
            )}

            {!isAnalyzing && analysisResults.length > 0 && (
              <div className="previews-grid">
                {analysisResults.map((page, index) => {
                  const isSelected = selectedPage?.path === page.path && selectedPage?.pageIndex === page.pageIndex;
                  const name = page.path.split(/[\\/]/).pop() || 'Archivo';
                  
                  const pageIsColor = isPageColor(page);
                  let badge = (
                    <span 
                      className={`tile-badge ${pageIsColor ? 'badge-color' : (page.esAltaDensidadBN ? 'badge-bw-high' : 'badge-bw')}`}
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onClick={(event) => {
                        event.stopPropagation();
                        togglePageColor(page);
                      }}
                      title="Haz clic para alternar entre Color y Blanco/Negro"
                    >
                      {pageIsColor 
                        ? `🎨 Color · ${page.cobertura.toFixed(1)}%` 
                        : (page.esAltaDensidadBN ? `⚫ B/N Alta · ${page.cobertura.toFixed(1)}%` : `⚫ B/N · ${page.cobertura.toFixed(1)}%`)}
                    </span>
                  );

                  return (
                    <div 
                      key={`${page.path}-${page.pageIndex}`} 
                      className={`page-tile ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedPage(page)}
                    >
                      <div className="tile-header">
                        <div className="tile-name" title={name}>
                          <span className="tile-file-icon">▧</span>
                          {page.isDocumentPage ? `Pág. ${page.pageIndex + 1} - ` : ''}{name}
                          {page.isDocumentPage && <span className="tile-page-count">({page.pageIndex + 1} pág.)</span>}
                        </div>
                        <div className="tile-copy-control">
                          <span>Copias:</span>
                          <button
                            type="button"
                            className="tile-copy-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedPage(page);
                              updatePageQuantity(page, Math.max(1, (page.quantity || 1) - 1));
                            }}
                          >−</button>
                          <span>{page.quantity || 1}</span>
                          <button
                            type="button"
                            className="tile-copy-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              updatePageQuantity(page, (page.quantity || 1) + 1);
                              setSelectedPage({ ...page, quantity: (page.quantity || 1) + 1 });
                            }}
                          >+</button>
                        </div>
                      </div>
                      <div className="tile-thumb-container">
                        <img 
                          src={page.imagePath} 
                          alt={`Page ${index}`} 
                          className="tile-thumb"
                          style={{
                            transform: `rotate(${page.rotation || 0}deg)`,
                            filter: pageIsColor ? 'none' : 'grayscale(100%) contrast(105%)',
                            transition: 'transform 0.2s ease, filter 0.25s ease'
                          }} 
                        />
                      </div>
                      <div className="tile-info">
                        <div className="tile-type">{page.isDocumentPage ? 'Documento' : 'Imagen'}</div>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center', marginTop: '3px', flexWrap: 'wrap' }}>
                          {badge}
                          {(page.rotation || 0) > 0 && (
                            <span className="tile-badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fde68a' }}>
                              ↻ {page.rotation}°
                            </span>
                          )}
                        </div>
                        <div className="tile-price">
                          ${getPageUnitCost(page).toFixed(2)}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="tile-remove"
                        onClick={(event) => {
                          event.stopPropagation();
                          setAnalysisResults(current => current.filter(item => (
                            item.path !== page.path || item.pageIndex !== page.pageIndex
                          )));
                          setSelectedPage(current => (
                            current && current.path === page.path && current.pageIndex === page.pageIndex
                              ? null
                              : current
                          ));
                        }}
                        aria-label={`Eliminar ${name}`}
                      >×</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="workspace-right">
          {/* Paper Viewport */}
          <div className="canvas-area">
            <div className="preview-toolbar" aria-label="Herramientas de previsualización">
              <div className="preview-toolbar-title"><span className="toolbar-dot"></span>Vista de impresión</div>
              <div className="preview-toolbar-actions">
                <button type="button" onClick={() => updateSelectedRotation((selectedPage?.rotation || 0) - 90)} disabled={!selectedPage} title="Girar a la izquierda">↶</button>
                <button type="button" onClick={() => updateSelectedRotation((selectedPage?.rotation || 0) + 90)} disabled={!selectedPage} title="Girar a la derecha">↷</button>
                <span className="toolbar-divider" />
                <button type="button" onClick={() => setPreviewZoom(z => Math.max(0.75, +(z - 0.1).toFixed(2)))} title="Alejar">−</button>
                <span className="zoom-label">{Math.round(previewZoom * 100)}%</span>
                <button type="button" onClick={() => setPreviewZoom(z => Math.min(1.35, +(z + 0.1).toFixed(2)))} title="Acercar">+</button>
                <button type="button" onClick={() => setPreviewZoom(1)} title="Restablecer zoom">↺</button>
              </div>
            </div>
            {printItems.length === 0 ? (
              <div className="paper-empty">
                <div className="paper-empty-icon">📄</div>
                <div>Visualizador de Página</div>
                <div style={{fontSize: '12px', opacity: 0.7}}>Selecciona o carga imágenes para ver la vista previa exacta</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%', height: '100%', justifyContent: 'center' }}>
                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '13px', background: 'rgba(0,0,0,0.4)', padding: '4px 14px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                    <button
                      type="button"
                      onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                      disabled={activePreviewPage <= 1}
                      style={{ background: 'none', border: 'none', color: activePreviewPage <= 1 ? '#555' : '#fff', cursor: activePreviewPage <= 1 ? 'default' : 'pointer', fontSize: '14px', padding: '0 4px' }}
                    >◀</button>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Página {activePreviewPage} de {totalPages}</span>
                    <button
                      type="button"
                      onClick={() => setPreviewPage(p => Math.min(totalPages, p + 1))}
                      disabled={activePreviewPage >= totalPages}
                      style={{ background: 'none', border: 'none', color: activePreviewPage >= totalPages ? '#555' : '#fff', cursor: activePreviewPage >= totalPages ? 'default' : 'pointer', fontSize: '14px', padding: '0 4px' }}
                    >▶</button>
                  </div>
                )}

                {/* Paper sheet */}
                <div 
                  className="paper" 
                  style={{
                    width: `${previewDims.width}px`,
                    height: `${previewDims.height}px`,
                    padding: '12px',
                    boxSizing: 'border-box',
                    transform: `scale(${previewZoom})`
                  }}
                >
                  <div 
                    className="preview-grid" 
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${colsPerPage}, 1fr)`,
                      gridTemplateRows: `repeat(${rowsPerPage}, 1fr)`,
                      gap: '4px',
                      width: '100%',
                      height: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    {itemsOnThisPage.map((item, index) => {
                      const rot = (item.rotation || 0) % 360;
                      const isRot90 = (rot === 90 || rot === 270);
                      const cellWidthPx = Math.max(10, Math.floor((previewDims.width - 24 - (colsPerPage - 1) * 4) / colsPerPage));
                      const cellHeightPx = Math.max(10, Math.floor((previewDims.height - 24 - (rowsPerPage - 1) * 4) / rowsPerPage));

                      return (
                        <div
                          key={index}
                          className={`preview-cell ${selectedPage?.path === item.originalPage.path && selectedPage?.pageIndex === item.originalPage.pageIndex ? 'selected' : ''}`}
                          onClick={() => setSelectedPage(item.originalPage)}
                          title="Selecciona esta imagen para editarla"
                          style={{
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'white',
                            border: '1px dashed rgba(0, 0, 0, 0.12)',
                            borderRadius: '2px',
                            boxSizing: 'border-box'
                          }}
                        >
                          <div
                            style={{
                              width: isRot90 ? `${cellHeightPx}px` : '100%',
                              height: isRot90 ? `${cellWidthPx}px` : '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transform: `rotate(${rot}deg)`,
                              transformOrigin: 'center center',
                              flexShrink: 0
                            }}
                          >
                            <img
                              src={item.imagePath}
                              alt={`Preview ${index}`}
                              style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                width: '100%',
                                height: '100%',
                                objectFit: fitOption === 'fill' ? 'cover' : 'contain',
                                filter: isPageColor(item) ? 'none' : 'grayscale(100%) contrast(105%)',
                                transition: 'filter 0.25s ease'
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}

                    {/* Empty layout slots: remaining spaces shown empty without duplicate images */}
                    {Array.from({ length: cellsPerPage - itemsOnThisPage.length }).map((_, emptyIdx) => (
                      <div
                        key={`empty-${emptyIdx}`}
                        className="preview-cell empty"
                        style={{
                          backgroundColor: 'white',
                          border: '1px dashed rgba(0, 0, 0, 0.1)',
                          borderRadius: '2px',
                          boxSizing: 'border-box'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Panel */}
          <div className="cost-panel">
            <div className="cost-row">
              <span>Impresora de Destino:</span>
              <span className="cost-row highlight" style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={selectedPrinter || 'Sin seleccionar'}>
                {selectedPrinter || 'Sin seleccionar'}
              </span>
            </div>

            <div className="cost-row">
              <span>Hojas totales a imprimir:</span>
              <span className="cost-row highlight">
                {analysisResults.length === 0
                  ? '0 hojas'
                  : `${totalSheets} ${totalSheets === 1 ? 'hoja' : 'hojas'} (${sheetsPerSet} ${sheetsPerSet === 1 ? 'juego' : 'juegos'} x ${copies})`}
              </span>
            </div>

            <div className="cost-row">
              <span>Modo tarifa:</span>
              <span className="cost-row highlight" style={{color: pricingMode === 'smart' ? 'var(--primary)' : 'white'}}>
                {pricingMode === 'smart' ? 'Tarifa Inteligente' : 'Tarifa Fija'}
              </span>
            </div>

            {totalBwImpressions > 0 && (
              <div className="cost-row" style={{ color: '#38bdf8', fontSize: '11px', background: 'rgba(56, 189, 248, 0.1)', padding: '5px 8px', borderRadius: '4px', marginTop: '2px' }}>
                <span>🏷️ Escala B/N ({totalBwImpressions} copias):</span>
                <span style={{ fontWeight: 700 }}>${bwTier.rate.toFixed(2)}/copia ({bwTier.range})</span>
              </div>
            )}

            <div className="cost-divider"></div>

            <div className="cost-row">
              <span>Subtotal Tinta:</span>
              <span>${costs.subtotalTinta.toFixed(2)}</span>
            </div>

            <div className="cost-row">
              <span>Cargo Base de Impresión:</span>
              <span>${costs.baseFee.toFixed(2)}</span>
            </div>

            <div className="cost-divider"></div>

            <div className="cost-total-row" style={{ alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="cost-total-label">TOTAL A COBRAR:</span>
                {correctedTotal !== null && (
                  <span style={{ fontSize: '10.5px', color: '#10b981', fontWeight: 600 }}>
                    Sugerido: ${costs.calculatedTotal.toFixed(2)} (Ajustado)
                  </span>
                )}
              </div>

              {isEditingPrice ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>$</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    className="input-text"
                    style={{ width: '85px', fontSize: '16px', fontWeight: 700, padding: '4px 6px', textAlign: 'right' }}
                    value={priceCorrectionInput}
                    onChange={(e) => setPriceCorrectionInput(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="button button-success"
                    style={{ padding: '5px 8px', fontSize: '12px' }}
                    onClick={handleApplyPriceCorrection}
                    title="Guardar corrección y enseñar a la IA"
                  >
                    ✓ Guardar
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    style={{ padding: '5px 8px', fontSize: '12px' }}
                    onClick={() => setIsEditingPrice(false)}
                    title="Cancelar edición"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="cost-total-value">
                    ${costs.total.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    className="button button-secondary"
                    style={{ padding: '3px 8px', fontSize: '11px', whiteSpace: 'nowrap' }}
                    onClick={() => {
                      setPriceCorrectionInput(costs.total.toFixed(2));
                      setIsEditingPrice(true);
                    }}
                    title="Corregir precio si fue erróneo (el programa aprenderá para futuras ocasiones)"
                  >
                    ✏️ Corregir
                  </button>
                  {correctedTotal !== null && (
                    <button
                      type="button"
                      className="button button-secondary"
                      style={{ padding: '3px 6px', fontSize: '11px', color: '#f87171' }}
                      onClick={() => {
                        setCorrectedTotal(null);
                        setPriceCorrectionInput('');
                      }}
                      title="Restablecer precio calculado originalmente"
                    >
                      ↺
                    </button>
                  )}
                </div>
              )}
            </div>

            <button 
              className="button button-success" 
              style={{marginTop: '8px', fontSize: '15px'}}
              disabled={analysisResults.length === 0}
              onClick={handlePrintAndRegister}
            >
              💵 COBRAR E IMPRIMIR
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderHistoryTab = () => {
    return (
      <div className="history-panel">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Ventas Registradas</span>
            <span className="stat-value primary">{corteSummary.num_ventas}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Ingresos de Tinta/Hojas</span>
            <span className="stat-value success">${corteSummary.total_tinta?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Caja Total (con Cargo Base)</span>
            <span className="stat-value success" style={{color: 'var(--success)', textShadow: '0 0 10px var(--success-glow)'}}>
              ${corteSummary.total_general?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>

        <div className="table-container">
          <table className="sales-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Archivo / Trabajo</th>
                <th>Páginas</th>
                <th>Copias</th>
                <th>Costo Tinta</th>
                <th>Cargo Base</th>
                <th>Total</th>
                <th>Fecha / Hora</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {corteSales.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{textAlign: 'center', padding: '30px', color: 'var(--text-secondary)'}}>
                    No hay ventas registradas el día de hoy.
                  </td>
                </tr>
              ) : (
                corteSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>#{sale.id}</td>
                    <td>
                      <div className="table-file-name" title={sale.archivo}>{sale.archivo}</div>
                    </td>
                    <td>{sale.paginas}</td>
                    <td>{sale.copias} x</td>
                    <td>${sale.costo_tinta.toFixed(2)}</td>
                    <td>${sale.costo_fijo.toFixed(2)}</td>
                    <td style={{fontWeight: 'bold', color: 'var(--success)'}}>${sale.total.toFixed(2)}</td>
                    <td className="table-date">{new Date(sale.fecha).toLocaleTimeString()}</td>
                    <td>
                      <span className="action-link" onClick={() => handlePrintHistoryTicket(sale)}>Ver Ticket</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className={`app-container ${theme === 'light' ? 'light-theme' : ''}`}>
      {/* Sidebar Controls */}
      <div className="sidebar" style={{ width: `${sidebarWidth}px` }}>
        <div className="brand-section">
          <img src={logo} alt="PrintStudio Pro" className="brand-image" style={{width:48, height:48, borderRadius:8, marginRight:10}} />
          <div style={{display:'flex', flexDirection:'column'}}>
            <span className="brand-name">PrintStudio Pro</span>
            <span style={{fontSize:11, color:'var(--text-secondary)'}}>Sistema Inteligente de Impresión</span>
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>

        <div className="sidebar-group">
          <span className="sidebar-title">CONFIGURACIÓN TRABAJO</span>
          
          <div>
            <label className="field-label">Impresora Seleccionada</label>
            <select 
              className="input-select" 
              value={selectedPrinter} 
              onChange={(e) => setSelectedPrinter(e.target.value)}
              disabled={isLoadingPrinters || printers.length === 0}
            >
              {isLoadingPrinters ? (
                <option value="">Cargando impresoras...</option>
              ) : printers.length === 0 ? (
                <option value="">No se encontraron impresoras</option>
              ) : (
                printers.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} {p.isDefault ? '(Predeterminada)' : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="field-label">Tamaño del Papel</label>
            <select className="input-select" value={paperSize} onChange={(e) => setPaperSize(e.target.value)}>
              <option>Carta</option>
              <option>Oficio</option>
              <option>Oficio México</option>
              <option>Doble Carta / Tabloide</option>
            </select>
          </div>

          <div>
            <label className="field-label">Copias de cada Página (Juegos)</label>
            <div className="input-row wheel-control" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="number"
                className="input-text"
                min={1}
                value={copies}
                onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                onWheel={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const delta = e.deltaY < 0 ? 1 : -1;
                  setCopies(Math.max(1, copies + delta));
                }}
                style={{ flex: 1 }}
              />
              <div style={{ display: 'flex', gap: '3px' }}>
                <button
                  type="button"
                  className="button button-secondary"
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                  onClick={() => setCopies(c => c + 1)}
                  title="Aumentar copias"
                >▲</button>
                <button
                  type="button"
                  className="button button-secondary"
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                  disabled={copies <= 1}
                  onClick={() => setCopies(c => Math.max(1, c - 1))}
                  title="Disminuir copias"
                >▼</button>
              </div>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '3px' }}>
              Escribe o usa el scroll del mouse
            </div>
          </div>

          {/* Orientation Selection */}
          <div>
            <label className="field-label">Orientación del Papel</label>
            <select 
              className="input-select" 
              value={orientation} 
              onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
              onWheel={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
              }}
            >
              <option value="portrait">Vertical (Retrato)</option>
              <option value="landscape">Horizontal (Paisaje)</option>
            </select>
          </div>

          {/* Layout Selection */}
          <div>
            <label className="field-label">Diseño de Página (Fotos por hoja)</label>
            <select 
              className="input-select" 
              value={imageLayout} 
              onChange={(e) => {
                setImageLayout(parseInt(e.target.value));
                setPreviewPage(1);
              }}
              onWheel={(e) => {
                e.stopPropagation();
                e.preventDefault();
                const layouts = [1, 2, 3, 4, 5, 7, 8, 9, 10, 35];
                const currentIndex = layouts.indexOf(imageLayout);
                let newIndex = currentIndex;
                if (e.deltaY < 0) {
                  newIndex = (currentIndex - 1 + layouts.length) % layouts.length;
                } else if (e.deltaY > 0) {
                  newIndex = (currentIndex + 1) % layouts.length;
                }
                setImageLayout(layouts[newIndex]);
                setPreviewPage(1);
              }}
            >
              <option value={1}>Página completa (1)</option>
              <option value={2}>5 x 7 pulg. (2)</option>
              <option value={3}>3 fotos por página (3)</option>
              <option value={4}>3.5 x 5 pulg. (4)</option>
              <option value={5}>5 fotos por página (5)</option>
              <option value={7}>7 fotos por página (7)</option>
              <option value={8}>8 fotos por página (8)</option>
              <option value={9}>Billetera (9)</option>
              <option value={10}>10 fotos por página (10)</option>
              <option value={35}>Hoja de contactos (35)</option>
            </select>
          </div>

          {/* Fit or Fill */}
          <div>
            <label className="field-label">Ajuste en la celda</label>
            <select className="input-select" value={fitOption} onChange={(e) => setFitOption(e.target.value as 'fit' | 'fill')}>
              <option value="fit">Ajustar (completa sin recortar)</option>
              <option value="fill">Rellenar celda (sin bordes)</option>
            </select>
          </div>

          <div className="print-mode-control">
            <label className="field-label">Modo de impresión</label>
            <div className="print-mode-buttons" role="group" aria-label="Modo de impresión">
              <button
                type="button"
                className={`print-mode-button ${printColorMode === 'auto' ? 'active' : ''}`}
                onClick={() => setPrintColorMode('auto')}
                title="Detectar automáticamente si cada archivo es color o blanco y negro"
              >
                Automático
              </button>
              <button
                type="button"
                className={`print-mode-button color ${printColorMode === 'color' ? 'active' : ''}`}
                onClick={() => setPrintColorMode('color')}
                title="Imprimir usando color"
              >
                🎨 Color
              </button>
              <button
                type="button"
                className={`print-mode-button bw ${printColorMode === 'bw' ? 'active' : ''}`}
                onClick={() => setPrintColorMode('bw')}
                title="Imprimir en blanco y negro"
              >
                ⚫ B/N
              </button>
            </div>
            <div className="print-mode-help">
              {printColorMode === 'auto'
                ? 'Usa el análisis de cada imagen'
                : printColorMode === 'color'
                  ? 'Forzado a impresión a color'
                  : 'Forzado a blanco y negro'}
            </div>
          </div>

          {/* Per-Image Rotation */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="field-label" style={{ marginBottom: 0 }}>Rotación de Imagen</label>
              {analysisResults.length > 0 && (
                <>
                  <span
                    onClick={() => rotateAllImages(90)}
                    style={{ fontSize: '11px', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                    title="Rotar todas las imágenes 90°"
                  >
                    Rotar todas
                  </span>
                  <span
                    onClick={() => resetAllRotations()}
                    style={{ fontSize: '11px', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', marginLeft: '8px' }}
                    title="Restablecer rotación de todas las imágenes a 0°"
                  >
                    Reset todas
                  </span>
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
              <button
                type="button"
                className="button button-secondary"
                style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                disabled={!selectedPage}
                onClick={() => updateSelectedRotation((selectedPage?.rotation || 0) + 90)}
                title="Girar 90°"
              >
                🔄 90°
              </button>
              <button
                type="button"
                className="button button-secondary"
                style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                disabled={!selectedPage}
                onClick={() => updateSelectedRotation(0)}
                title="Restablecer rotación a 0°"
              >
                ⤾ 0°
              </button>
              <select
                className="input-select"
                style={{ flex: 1 }}
                value={(selectedPage?.rotation || 0) % 360}
                disabled={!selectedPage}
                onChange={(e) => updateSelectedRotation(parseInt(e.target.value) || 0)}
                onWheel={(e) => {
                  if (!selectedPage) return;
                  e.stopPropagation();
                  e.preventDefault();
                  const delta = e.deltaY < 0 ? 90 : -90;
                  updateSelectedRotation((selectedPage.rotation || 0) + delta);
                }}
              >
                <option value={0}>0° (Normal)</option>
                <option value={90}>90° (Derecha)</option>
                <option value={180}>180° (Invertido)</option>
                <option value={270}>270° (Izquierda)</option>
              </select>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '3px' }}>
              {selectedPage ? `Giro actual: ${selectedPage.rotation || 0}°` : 'Selecciona una imagen'}
            </div>
          </div>

          {/* Per-Image Quantity */}
          <div>
            <label className="field-label">Cantidad de esta Imagen</label>
            <div className="input-row wheel-control" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="number"
                className="input-text"
                min={1}
                value={selectedPage ? (selectedPage.quantity || 1) : 1}
                disabled={!selectedPage}
                onChange={(e) => updateSelectedQuantity(parseInt(e.target.value) || 1)}
                onWheel={(e) => {
                  if (!selectedPage) return;
                  e.stopPropagation();
                  e.preventDefault();
                  const delta = e.deltaY < 0 ? 1 : -1;
                  updateSelectedQuantity((selectedPage.quantity || 1) + delta);
                }}
                style={{ flex: 1 }}
              />
              <div style={{ display: 'flex', gap: '3px' }}>
                <button
                  type="button"
                  className="button button-secondary"
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                  disabled={!selectedPage}
                  onClick={() => updateSelectedQuantity((selectedPage?.quantity || 1) + 1)}
                  title="Aumentar cantidad"
                >▲</button>
                <button
                  type="button"
                  className="button button-secondary"
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                  disabled={!selectedPage || (selectedPage?.quantity || 1) <= 1}
                  onClick={() => updateSelectedQuantity((selectedPage?.quantity || 1) - 1)}
                  title="Disminuir cantidad"
                >▼</button>
              </div>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '3px' }}>
              Escribe o usa el scroll del mouse
            </div>
          </div>
        </div>

        <div className="sidebar-group">
          <span className="sidebar-title">PRECIOS Y TARIFAS</span>
          
          <div className="input-row">
            <div className="input-col">
              <label className="field-label">Cargo Base ($)</label>
              <input 
                type="number" 
                className="input-text" 
                min={0}
                step="0.5"
                value={costBase}
                onChange={(e) => setCostBase(Math.max(0, parseFloat(e.target.value) || 0))}
              />
            </div>
            <div className="input-col">
              <label className="field-label">Pág. B/N ($)</label>
              <input 
                type="number" 
                className="input-text" 
                min={0}
                step="0.1"
                value={costBW}
                onChange={(e) => setCostBW(Math.max(0, parseFloat(e.target.value) || 0))}
              />
            </div>
          </div>

          <div className="input-row">
            <div className="input-col">
              <label className="field-label">B/N Alta Dens ($)</label>
              <input 
                type="number" 
                className="input-text" 
                min={0}
                step="0.5"
                value={costBWHigh}
                onChange={(e) => setCostBWHigh(Math.max(0, parseFloat(e.target.value) || 0))}
              />
            </div>
            <div className="input-col">
              <label className="field-label">Pág. Color ($)</label>
              <input 
                type="number" 
                className="input-text" 
                min={0}
                step="0.5"
                value={costColor}
                onChange={(e) => setCostColor(Math.max(0, parseFloat(e.target.value) || 0))}
              />
            </div>
          </div>

          <div>
            <label className="field-label">Modelo de Cobro</label>
            <select className="input-select" value={pricingMode} onChange={(e) => setPricingMode(e.target.value as 'fixed' | 'smart')}>
              <option value="fixed">Tarifa Fija (Estándar)</option>
              <option value="smart">Tarifa Inteligente (Por Cobertura)</option>
            </select>
            <span style={{fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block', lineHeight: '1.3'}}>
              {pricingMode === 'fixed' 
                ? 'Se cobra precio fijo por color o B/N sin importar cuánta tinta se use.'
                : 'Calcula una tarifa gradual con cobertura de tinta y porcentaje real de color.'
              }
            </span>
          </div>

          <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                🧠 Escala B/N por Volumen
              </span>
              <span style={{ fontSize: '9.5px', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 5px', borderRadius: '4px' }}>
                {learningModel.total_corrections || 0} aprendidas
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', fontSize: '10.5px' }}>
              <div style={{ 
                padding: '5px 6px', 
                background: totalBwImpressions >= 1 && totalBwImpressions <= 50 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)', 
                border: totalBwImpressions >= 1 && totalBwImpressions <= 50 ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.06)',
                borderRadius: '4px' 
              }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '9.5px' }}>1 - 50 copias</div>
                <div style={{ fontWeight: 700, color: '#f8fafc' }}>${(learningModel.tier1_rate ?? 1.00).toFixed(2)}</div>
              </div>

              <div style={{ 
                padding: '5px 6px', 
                background: totalBwImpressions >= 51 && totalBwImpressions <= 100 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)', 
                border: totalBwImpressions >= 51 && totalBwImpressions <= 100 ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.06)',
                borderRadius: '4px' 
              }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '9.5px' }}>51 - 100 copias</div>
                <div style={{ fontWeight: 700, color: '#f8fafc' }}>${(learningModel.tier2_rate ?? 0.80).toFixed(2)}</div>
              </div>

              <div style={{ 
                padding: '5px 6px', 
                background: totalBwImpressions >= 101 && totalBwImpressions <= 200 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)', 
                border: totalBwImpressions >= 101 && totalBwImpressions <= 200 ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.06)',
                borderRadius: '4px' 
              }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '9.5px' }}>101 - 200 copias</div>
                <div style={{ fontWeight: 700, color: '#f8fafc' }}>${(learningModel.tier3_rate ?? 0.50).toFixed(2)}</div>
              </div>

              <div style={{ 
                padding: '5px 6px', 
                background: totalBwImpressions >= 201 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)', 
                border: totalBwImpressions >= 201 ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.06)',
                borderRadius: '4px' 
              }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '9.5px' }}>201+ copias</div>
                <div style={{ fontWeight: 700, color: '#f8fafc' }}>${(learningModel.tier4_rate ?? 0.40).toFixed(2)}</div>
              </div>
            </div>

            {(learningModel.total_corrections || 0) > 0 && (
              <button
                type="button"
                className="button button-secondary"
                style={{ marginTop: '8px', width: '100%', padding: '4px', fontSize: '10px' }}
                onClick={handleResetLearning}
                title="Restablecer aprendizaje a tarifas originales"
              >
                ↺ Restablecer Aprendizaje IA
              </button>
            )}
          </div>
        </div>

        {/* Multi-Mode Mobile Import Section */}
        <div className="qr-section">
          <span className="qr-title">📱 Importar desde Celular</span>

          {/* Mode Selector */}
          <div className="qr-mode-tabs" role="tablist">
            <button
              type="button"
              className={`qr-mode-tab ${connectionMode === 'hotspot' ? 'active' : ''}`}
              onClick={() => setConnectionMode('hotspot')}
              title="Envía archivos directamente sin necesidad de red Wi-Fi externa o internet"
            >
              📶 Sin Wi-Fi
            </button>
            <button
              type="button"
              className={`qr-mode-tab ${connectionMode === 'wifi' ? 'active' : ''}`}
              onClick={() => setConnectionMode('wifi')}
              title="Celular y PC conectados a la misma red Wi-Fi local"
            >
              🌐 Wi-Fi Local
            </button>
            <button
              type="button"
              className={`qr-mode-tab ${connectionMode === 'internet' ? 'active' : ''}`}
              onClick={() => setConnectionMode('internet')}
              title="Conexión remota por datos móviles (4G/5G) vía Internet"
            >
              ☁️ Datos
            </button>
          </div>

          {/* MODO 1: HOTSPOT DIRECTO (SIN RED WI-FI) */}
          {connectionMode === 'hotspot' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <div className="hotspot-status-box">
                <div className="hotspot-badge-row">
                  <span>Punto de Acceso PC:</span>
                  <span className={`hotspot-badge ${hotspotInfo?.state === 'On' ? 'on' : 'off'}`}>
                    {hotspotInfo?.state === 'On' ? '● ACTIVA' : '○ INACTIVA'}
                  </span>
                </div>
                
                {hotspotInfo?.state === 'On' && hotspotInfo.ssid && (
                  <div style={{ fontSize: '9.5px', color: '#cbd5e1', lineHeight: '1.3' }}>
                    <div><strong>Red:</strong> {hotspotInfo.ssid}</div>
                    {hotspotInfo.password && <div><strong>Contraseña:</strong> {hotspotInfo.password}</div>}
                  </div>
                )}

                <button
                  type="button"
                  className="hotspot-toggle-btn"
                  onClick={handleToggleHotspot}
                  disabled={isTogglingHotspot}
                >
                  {isTogglingHotspot
                    ? 'Cambiando estado...'
                    : hotspotInfo?.state === 'On'
                      ? 'Desactivar Zona Móvil'
                      : '⚡ Activar Zona Móvil de esta PC'}
                </button>
              </div>

              {/* Paso 1 vs Paso 2 */}
              <div className="hotspot-step-tabs">
                <button
                  type="button"
                  className={`hotspot-step-btn ${hotspotStep === 'wifi' ? 'active' : ''}`}
                  onClick={() => setHotspotStep('wifi')}
                >
                  1. Conectar Wi-Fi
                </button>
                <button
                  type="button"
                  className={`hotspot-step-btn ${hotspotStep === 'upload' ? 'active' : ''}`}
                  onClick={() => setHotspotStep('upload')}
                >
                  2. Subir Archivos
                </button>
              </div>

              {hotspotStep === 'wifi' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div 
                    className="qr-image-wrapper"
                    onClick={() => {
                      if (wifiConnectQr) {
                        setBigQrData({
                          title: 'Paso 1: Conectar al Wi-Fi de la PC',
                          subtitle: `Escanea con la cámara de tu teléfono para conectarte automáticamente a la red "${hotspotInfo?.ssid || 'de la PC'}". No requiere internet ni router externo.`,
                          qr: wifiConnectQr,
                          helpText: hotspotInfo?.password ? `Contraseña de red: ${hotspotInfo.password}` : undefined
                        });
                        setShowBigQrModal(true);
                      }
                    }}
                  >
                    {wifiConnectQr ? (
                      <img src={wifiConnectQr} className="qr-image" alt="QR Conectar Wi-Fi" />
                    ) : (
                      <div style={{ width: 124, height: 124, background: 'rgba(255,255,255,0.05)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text-secondary)' }}>
                        Activa la Zona Móvil
                      </div>
                    )}
                  </div>
                  <p className="qr-instructions">
                    <strong>Paso 1:</strong> Escanea para conectar el celular al Wi-Fi de la PC.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div 
                    className="qr-image-wrapper"
                    onClick={() => {
                      if (hotspotUploadQr) {
                        setBigQrData({
                          title: 'Paso 2: Subir Archivos a la PC',
                          subtitle: 'Abre la página web de subida en tu teléfono móvil para enviar tus fotos o documentos a imprimir.',
                          qr: hotspotUploadQr,
                          helpText: `Enlace directo: http://${hotspotIp}:3500${uploadRoute}`
                        });
                        setShowBigQrModal(true);
                      }
                    }}
                  >
                    {hotspotUploadQr ? (
                      <img src={hotspotUploadQr} className="qr-image" alt="QR Subir Archivos Hotspot" />
                    ) : (
                      <div style={{ width: 124, height: 124, background: 'rgba(255,255,255,0.05)', borderRadius: 6 }}></div>
                    )}
                  </div>
                  <p className="qr-instructions">
                    <strong>Paso 2:</strong> Escanea para abrir la web y enviar archivos.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* MODO 2: MISMA RED WI-FI LOCAL */}
          {connectionMode === 'wifi' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
              <div 
                className="qr-image-wrapper"
                onClick={() => {
                  if (wifiUploadQr) {
                    setBigQrData({
                      title: 'Subir desde la Misma Red Wi-Fi',
                      subtitle: 'Celular y computadora deben estar conectados a la misma red Wi-Fi o módem.',
                      qr: wifiUploadQr,
                      helpText: `Enlace local: http://${wifiIp || 'localhost'}:3500${uploadRoute}`
                    });
                    setShowBigQrModal(true);
                  }
                }}
              >
                {wifiUploadQr ? (
                  <img src={wifiUploadQr} className="qr-image" alt="QR Wi-Fi Local" />
                ) : (
                  <div style={{ width: 124, height: 124, background: 'rgba(255,255,255,0.05)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text-secondary)' }}>
                    Sin Wi-Fi detectado
                  </div>
                )}
              </div>
              <p className="qr-instructions">
                Escanea si tu celular y esta PC están en el <strong>mismo Wi-Fi</strong>.
              </p>
              <span className="qr-highlight-text">
                IP: {wifiIp || 'No conectada'}
              </span>
            </div>
          )}

          {/* MODO 3: INTERNET / DATOS MÓVILES */}
          {connectionMode === 'internet' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
              <div 
                className="qr-image-wrapper"
                onClick={() => {
                  if (tunnelUploadQr) {
                    setBigQrData({
                      title: 'Subir por Datos Móviles / Internet',
                      subtitle: 'Para clientes con datos móviles (4G/5G).',
                      qr: tunnelUploadQr,
                      helpText: tunnelPassword ? `Si la página solicita contraseña o IP, escribe: ${tunnelPassword}` : publicUploadUrl
                    });
                    setShowBigQrModal(true);
                  }
                }}
              >
                {tunnelUploadQr ? (
                  <img src={tunnelUploadQr} className="qr-image" alt="QR Internet Túnel" />
                ) : (
                  <div style={{ width: 124, height: 124, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 6, fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'center', padding: 8 }}>
                    Generando túnel público...
                  </div>
                )}
              </div>
              <p className="qr-instructions">
                Escanea desde cualquier red o datos móviles 4G/5G.
              </p>
              {tunnelPassword && (
                <div style={{ fontSize: '9px', background: 'rgba(99,102,241,0.15)', padding: '3px 6px', borderRadius: '4px', color: '#c7d2fe', textAlign: 'center' }}>
                  Contraseña túnel: <strong>{tunnelPassword}</strong>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div
        className="sidebar-resizer"
        onPointerDown={handleSidebarResize}
        role="separator"
        aria-label="Redimensionar panel lateral"
        title="Arrastra para cambiar el ancho del panel"
      />

      {/* Main Panel Area */}
      <div className="main-content">
        <div className="header-nav">
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'scan' ? 'active' : ''}`}
              onClick={() => setActiveTab('scan')}
            >
              🖥️ Escáner y Precios
            </button>
            <button 
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('history');
                fetchCorteDiario(); // Refrescar corte al entrar
              }}
            >
              📊 Corte Diario y Reporte
            </button>
          </div>

          <div className="server-status">
            <div className="status-dot"></div>
            <span>Servidor Móvil Activo (Puerto 3500)</span>
          </div>
        </div>

        {activeTab === 'scan' ? renderScanTab() : renderHistoryTab()}
      </div>

      {/* Ticket Modal popup */}
      {showTicketModal && activeTicketData && (
        <div className="modal-backdrop" onClick={() => setShowTicketModal(false)}>
          <div className="ticket-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ticket-header">
              <h2>COMPROBANTE</h2>
              <p>YARS Smart Printer Pro</p>
              <p>{new Date().toLocaleString()}</p>
            </div>
            
            <div className="ticket-divider"></div>
            
            <div className="ticket-body">
              <div className="ticket-row bold">
                <span>CONCEPTO</span>
                <span>VALOR</span>
              </div>
              <div className="ticket-row">
                <span style={{maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                  {activeTicketData.archivo}
                </span>
                <span>#{activeTicketData.id}</span>
              </div>
              <div className="ticket-row">
                <span>Total de Hojas:</span>
                <span>{activeTicketData.paginas}</span>
              </div>
              <div className="ticket-row">
                <span>Copias:</span>
                <span>{activeTicketData.copias} x</span>
              </div>
              <div className="ticket-row">
                <span>Subtotal Tinta:</span>
                <span>${activeTicketData.costo_tinta.toFixed(2)}</span>
              </div>
              <div className="ticket-row">
                <span>Cargo Servicio Base:</span>
                <span>${activeTicketData.costo_fijo.toFixed(2)}</span>
              </div>
              
              <div className="ticket-divider"></div>
              
              <div className="ticket-row total-row">
                <span>TOTAL:</span>
                <span>${activeTicketData.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="ticket-divider"></div>

            <div className="ticket-qr">
              <p style={{fontSize: '10px', color: '#4b5563', fontWeight: 600}}>Escanea para ver detalles en la base de datos</p>
              {ticketQr && <img src={ticketQr} alt="Ticket QR" />}
            </div>

            <div className="ticket-footer">
              <p>¡Gracias por su preferencia en nuestra Papelería!</p>
            </div>

            <div className="ticket-actions">
              <button 
                className="button button-primary" 
                style={{flex: 1, padding: '10px', fontSize: '13px'}}
                onClick={handlePhysicalPrint}
              >
                🖨️ IMPRIMIR TICKET
              </button>
              <button 
                className="button button-secondary" 
                style={{flex: 1, padding: '10px', fontSize: '13px'}}
                onClick={() => setShowTicketModal(false)}
              >
                CERRAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Big QR Modal for Counter Customers */}
      {showBigQrModal && bigQrData && (
        <div className="modal-backdrop" onClick={() => setShowBigQrModal(false)}>
          <div className="big-qr-container" onClick={(e) => e.stopPropagation()}>
            <div className="big-qr-title">{bigQrData.title}</div>
            <div className="big-qr-subtitle">{bigQrData.subtitle}</div>
            <img src={bigQrData.qr} alt="Código QR Grande" className="big-qr-img" />
            {bigQrData.helpText && (
              <div className="big-qr-note">
                {bigQrData.helpText}
              </div>
            )}
            <button
              type="button"
              className="button button-primary"
              style={{ width: '100%', padding: '10px' }}
              onClick={() => setShowBigQrModal(false)}
            >
              Cerrar Vista Grande
            </button>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className={`toast-banner ${toastMessage.type}`}>
          <span>{toastMessage.type === 'error' ? '⚠️' : toastMessage.type === 'success' ? '✅' : 'ℹ️'}</span>
          <span>{toastMessage.text}</span>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: 8, fontSize: 14 }}
            onClick={() => setToastMessage(null)}
          >×</button>
        </div>
      )}
    </div>
  );
};

export default App;
