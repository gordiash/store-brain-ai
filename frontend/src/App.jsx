import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [gameState, setGameState] = useState({
    revenue: 0,
    conversionRate: 0,
    visitors: 0,
    agents: {
      strategist: { name: "Strateg (The Oracle)", level: 1, xp: 0, nextXp: 100, status: "idle", activity: "Planowanie...", color: "#a855f7" },
      merchant: { name: "Kierownik Sklepu (The Merchant)", level: 1, xp: 0, nextXp: 100, status: "idle", activity: "Obsługa WooCommerce...", color: "#eab308" },
      tiktok: { name: "TikTok Agent (Viral Architect)", level: 1, xp: 0, nextXp: 100, status: "idle", activity: "Tworzenie virali...", color: "#ec4899" },
      facebook: { name: "FB Agent (Community Connector)", level: 1, xp: 0, nextXp: 100, status: "idle", activity: "Publikowanie w mediach...", color: "#3b82f6" }
    },
    quests: [],
    logs: [],
    totalTokens: 0,
    totalTokenCost: 0
  });
  const [errorMsg, setErrorMsg] = useState(null);
  const [isAutoSim, setIsAutoSim] = useState(true);

  const API_URL = 'http://localhost:5000/api';

  // Fetch state from server
  const fetchState = async () => {
    try {
      const response = await fetch(`${API_URL}/state`);
      if (!response.ok) throw new Error("Problem z połączeniem z backendem.");
      const data = await response.json();
      setGameState(data);
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg("Błąd: Serwer backendu nie odpowiada. Upewnij się, że serwer jest uruchomiony na porcie 5000.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchState();
    // Poll state every 2 seconds
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, []);

  // Trigger one agent cycle
  const handleTriggerCycle = async () => {
    try {
      const response = await fetch(`${API_URL}/trigger-cycle`, { method: 'POST' });
      const data = await response.json();
      setGameState(data);
    } catch (err) {
      console.error("Error triggering cycle:", err);
    }
  };

  // Add a sale manually
  const handleAddSale = async () => {
    try {
      const response = await fetch(`${API_URL}/add-sale`, { method: 'POST' });
      const data = await response.json();
      setGameState(data);
    } catch (err) {
      console.error("Error adding sale:", err);
    }
  };

  // Reset simulation
  const handleReset = async () => {
    if (window.confirm("Czy na pewno chcesz zresetować postępy agentów i przychody?")) {
      try {
        const response = await fetch(`${API_URL}/reset`, { method: 'POST' });
        const data = await response.json();
        setGameState(data);
      } catch (err) {
        console.error("Error resetting simulation:", err);
      }
    }
  };

  // Calculate goal metrics
  const targetRevenue = 15000;
  const progressPercent = Math.min(100, (gameState.revenue / targetRevenue) * 100);

  // Return sender specific color for log entry
  const getSenderColor = (sender) => {
    if (sender.includes("Strateg")) return "#c084fc"; // Light purple
    if (sender.includes("TikTok")) return "#f472b6"; // Light pink
    if (sender.includes("FB")) return "#60a5fa"; // Light blue
    if (sender.includes("Kierownik") || sender.includes("Merchant")) return "#facc15"; // Light yellow
    if (sender.includes("Sprzedaż") || sender.includes("Sklep")) return "#34d399"; // Emerald green
    return "#e2e8f0";
  };

  const handleUpdateStats = async () => {
    const revInput = window.prompt("Podaj Twój AKTUALNY REALNY PRZYCHÓD MIESIĘCZNY (w PLN):", gameState.revenue);
    if (revInput === null) return;
    
    const visInput = window.prompt("Podaj Twój REALNY UNIKALNY RUCH MIESIĘCZNY (UU):", gameState.visitors);
    if (visInput === null) return;
    
    const convInput = window.prompt("Podaj Twoją REALNĄ KONWERSJĘ SKLEPU (w % np. 3.2):", gameState.conversionRate);
    if (convInput === null) return;

    try {
      const response = await fetch(`${API_URL}/update-stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revenue: parseFloat(revInput),
          visitors: parseInt(visInput),
          conversionRate: parseFloat(convInput)
        })
      });
      const data = await response.json();
      setGameState(data);
    } catch (err) {
      console.error("Błąd aktualizacji statystyk:", err);
    }
  };

  return (
    <div className="app-container">
      {/* Game Header */}
      <header className="game-header">
        <div className="title-section pixel-panel">
          <h1>👗 BIELIZNA damska - RPG AGENT TEAM 👗</h1>
          <p>Organiczna kampania e-commerce o wartości 0 zł ku celowi rentowności 15 000 PLN/miesięcznie</p>
        </div>

        {/* Stats bar */}
        <div className="stats-bar">
          <div className="stat-card pixel-panel pixel-panel-accent">
            <span className="stat-label">💰 ZYSK MIESIĘCZNY</span>
            <span className="stat-value gold">{gameState.revenue.toLocaleString()} PLN</span>
          </div>

          <div className="stat-card pixel-panel">
            <span className="stat-label">📈 CEL STRATEGICZNY</span>
            <span className="stat-value">15,000 PLN</span>
          </div>

          <div className="stat-card pixel-panel">
            <span className="stat-label">👥 UNIKALNY RUCH (ORGANIC)</span>
            <span className="stat-value pink">{gameState.visitors.toLocaleString()} UU</span>
          </div>

          <div className="stat-card pixel-panel">
            <span className="stat-label">🎯 KONWERSJA SKLEPU</span>
            <span className="stat-value green">{gameState.conversionRate.toFixed(2)} %</span>
          </div>

          <div className="stat-card pixel-panel" style={{ borderColor: '#60a5fa' }}>
            <span className="stat-label">⚡ ZUŻYTA MANA (TOKENY)</span>
            <span className="stat-value" style={{ color: '#60a5fa' }}>
              {(gameState.totalTokens || 0).toLocaleString()} tok.
            </span>
          </div>

          <div className="stat-card pixel-panel" style={{ borderColor: '#38bdf8' }}>
            <span className="stat-label">💸 KOSZT TOKENÓW</span>
            <span className="stat-value" style={{ color: '#38bdf8' }}>
              {(gameState.totalTokenCost || 0).toFixed(4)} PLN
            </span>
          </div>
        </div>

        {/* Main Progress Bar representing target gold */}
        <div className="pixel-panel" style={{ padding: '8px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-menu)', fontSize: '12px', marginBottom: '4px' }}>
            <span>POSTĘP KAMPANII (ZŁOTO DO POZIOMU 15k)</span>
            <span>{progressPercent.toFixed(1)}%</span>
          </div>
          <div className="pixel-bar-container">
            <div className="pixel-bar" style={{ width: `${progressPercent}%`, backgroundColor: 'var(--color-border-accent)' }}></div>
            <div className="pixel-bar-text">{gameState.revenue} / {targetRevenue} PLN</div>
          </div>
        </div>

        {/* Dynamic Charts Section */}
        {(() => {
          const historyData = (gameState.history && gameState.history.length > 0)
            ? gameState.history
            : [
                { time: '17:00', revenue: 74, visitors: 120, conversion: 2.1 },
                { time: '17:10', revenue: 124, visitors: 240, conversion: 2.8 },
                { time: '17:20', revenue: 198, visitors: 410, conversion: 3.4 },
                { time: '17:30', revenue: 272, visitors: 650, conversion: 3.8 }
              ];
          
          const maxRev = Math.max(...historyData.map(d => d.revenue || 0), 100);
          const maxVis = Math.max(...historyData.map(d => d.visitors || 0), 100);

          const pointsRev = historyData.map((d, i) => {
            const x = 40 + (i / Math.max(historyData.length - 1, 1)) * 440;
            const y = 125 - ((d.revenue || 0) / maxRev) * 95;
            return `${x},${y}`;
          }).join(' ');

          const pointsVis = historyData.map((d, i) => {
            const x = 40 + (i / Math.max(historyData.length - 1, 1)) * 440;
            const y = 125 - ((d.visitors || 0) / maxVis) * 95;
            return `${x},${y}`;
          }).join(' ');

          return (
            <div className="pixel-panel chart-dashboard-panel" style={{ marginTop: '12px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontFamily: 'var(--font-menu)', fontSize: '12px', color: 'var(--color-primary-light)' }}>
                  📊 ANALITYKA PRZYCHODU I RUCHU W CZASIE RZECZYWISTYM
                </span>
                <div style={{ fontFamily: 'var(--font-menu)', fontSize: '10px', display: 'flex', gap: '16px' }}>
                  <span style={{ color: '#a855f7' }}>🟣 PRZYCHÓD (PLN)</span>
                  <span style={{ color: '#10b981' }}>🟢 UNIKALNY RUCH (UU)</span>
                </div>
              </div>

              <div className="svg-container" style={{ width: '100%', overflowX: 'auto' }}>
                <svg viewBox="0 0 500 150" style={{ width: '100%', height: 'auto', background: '#0a0a14', borderRadius: '4px', border: '1px solid #1e293b' }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="40" y1="55" x2="480" y2="55" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="40" y1="90" x2="480" y2="90" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="40" y1="125" x2="480" y2="125" stroke="rgba(255,255,255,0.2)" />

                  {/* Area fills */}
                  {historyData.length > 1 && (
                    <>
                      <polygon points={`40,125 ${pointsRev} 480,125`} fill="url(#revGrad)" />
                      <polygon points={`40,125 ${pointsVis} 480,125`} fill="url(#visGrad)" />
                    </>
                  )}

                  {/* Polylines */}
                  <polyline points={pointsRev} fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
                  <polyline points={pointsVis} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Data Points */}
                  {historyData.map((d, i) => {
                    const x = 40 + (i / Math.max(historyData.length - 1, 1)) * 440;
                    const yRev = 125 - ((d.revenue || 0) / maxRev) * 95;
                    const yVis = 125 - ((d.visitors || 0) / maxVis) * 95;
                    return (
                      <g key={i}>
                        {/* Revenue Point */}
                        <rect x={x - 3} y={yRev - 3} width="6" height="6" fill="#a855f7" stroke="#ffffff" strokeWidth="1" />
                        {/* Visitor Point */}
                        <rect x={x - 3} y={yVis - 3} width="6" height="6" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
                        {/* Time Label */}
                        <text x={x} y="142" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace">
                          {d.time}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          );
        })()}
      </header>

      {errorMsg && (
        <div className="pixel-panel" style={{ borderColor: 'var(--color-danger)', backgroundColor: '#3f1a1a', color: '#ffb3b3', fontSize: '16px', textAlign: 'center' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Main Game Layout */}
      <main className="game-layout">
        
        {/* Left Side: Agents Chambers */}
        <section className="agents-grid">
          
          {/* Chamber 1: Strategist */}
          <div className={`pixel-panel agent-room room-strategist ${gameState.agents.strategist.status === 'working' ? 'working-active' : ''}`}>
            <div className="agent-header">
              <span className="agent-name">🔮 STRATEG (The Oracle)</span>
              <span className="agent-level">LVL {gameState.agents.strategist.level}</span>
            </div>
            
            <div className="agent-visual">
              <div className="room-item item-1">🔮</div>
              <div className="room-item item-2">📜</div>
              <div className="room-item item-3">📊</div>
              <div className="room-item item-4">📈</div>
              
              <div className="avatar-wrapper">
                <span className="avatar-character anim-float">🧙‍♂️</span>
                <span className={`avatar-status-badge ${gameState.agents.strategist.status === 'working' ? 'status-working' : 'status-idle'}`}>
                  {gameState.agents.strategist.status === 'working' ? 'MYŚLI' : 'CZEKA'}
                </span>
              </div>
            </div>

            <div className="agent-activity-box">
              <div className="activity-label">Zadanie:</div>
              <div className="activity-text" title={gameState.agents.strategist.activity}>{gameState.agents.strategist.activity}</div>
              <div className="agent-xp-container">
                <div className="pixel-bar-container" style={{ height: '14px' }}>
                  <div className="pixel-bar" style={{ width: `${(gameState.agents.strategist.xp / gameState.agents.strategist.nextXp) * 100}%`, backgroundColor: '#a855f7' }}></div>
                  <div className="pixel-bar-text" style={{ fontSize: '9px' }}>XP: {gameState.agents.strategist.xp}/{gameState.agents.strategist.nextXp}</div>
                </div>
              </div>
              <div className="agent-skills-list">
                {(gameState.agents.strategist.skills || ["🧠 Analiza Marż 0zł", "📈 Zasięg Organiczny", "🎯 Targetowanie Premium"]).map((sk, idx) => (
                  <span key={idx} className="skill-badge">{sk}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Chamber 2: Shopkeeper / Merchant */}
          <div className={`pixel-panel agent-room room-merchant ${gameState.agents.merchant.status === 'working' ? 'working-active' : ''}`}>
            <div className="agent-header">
              <span className="agent-name">🛍️ KIEROWNIK (The Merchant)</span>
              <span className="agent-level">LVL {gameState.agents.merchant.level}</span>
            </div>
            
            <div className="agent-visual">
              <div className="room-item item-1">👙</div>
              <div className="room-item item-2">👚</div>
              <div className="room-item item-3">📦</div>
              <div className="room-item item-4">🪙</div>
              
              <div className="avatar-wrapper">
                <span className="avatar-character anim-float">🧝‍♀️</span>
                <span className={`avatar-status-badge ${gameState.agents.merchant.status === 'working' ? 'status-working' : 'status-idle'}`}>
                  {gameState.agents.merchant.status === 'working' ? 'KODUJE' : 'SPRAWDZA'}
                </span>
              </div>
            </div>

            <div className="agent-activity-box">
              <div className="activity-label">Zadanie:</div>
              <div className="activity-text" title={gameState.agents.merchant.activity}>{gameState.agents.merchant.activity}</div>
              <div className="agent-xp-container">
                <div className="pixel-bar-container" style={{ height: '14px' }}>
                  <div className="pixel-bar" style={{ width: `${(gameState.agents.merchant.xp / gameState.agents.merchant.nextXp) * 100}%`, backgroundColor: '#eab308' }}></div>
                  <div className="pixel-bar-text" style={{ fontSize: '9px' }}>XP: {gameState.agents.merchant.xp}/{gameState.agents.merchant.nextXp}</div>
                </div>
              </div>
              <div className="agent-skills-list">
                {(gameState.agents.merchant.skills || ["🔍 Opisy SEO HTML", "🏷️ WooCommerce API", "🔒 Jednorazowy Lock"]).map((sk, idx) => (
                  <span key={idx} className="skill-badge">{sk}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Chamber 3: Instagram Agent */}
          <div className={`pixel-panel agent-room room-instagram ${gameState.agents.instagram?.status === 'working' ? 'working-active' : ''}`}>
            <div className="agent-header">
              <span className="agent-name">📸 INSTAGRAM (Visual Architect)</span>
              <span className="agent-level">LVL {gameState.agents.instagram?.level || 1}</span>
            </div>
            
            <div className="agent-visual">
              <div className="room-item item-1">📸</div>
              <div className="room-item item-2">🖼️</div>
              <div className="room-item item-3">✨</div>
              <div className="room-item item-4">🌺</div>
              
              <div className="avatar-wrapper">
                <span className="avatar-character anim-float">👩‍🎨</span>
                <span className={`avatar-status-badge ${gameState.agents.instagram?.status === 'working' ? 'status-working' : 'status-idle'}`}>
                  {gameState.agents.instagram?.status === 'working' ? 'PUBLIKUJE' : 'MONITUJE'}
                </span>
              </div>
            </div>

            <div className="agent-activity-box">
              <div className="activity-label">Zadanie:</div>
              <div className="activity-text" title={gameState.agents.instagram?.activity}>{gameState.agents.instagram?.activity}</div>
              <div className="agent-xp-container">
                <div className="pixel-bar-container" style={{ height: '14px' }}>
                  <div className="pixel-bar" style={{ width: `${((gameState.agents.instagram?.xp || 0) / (gameState.agents.instagram?.nextXp || 100)) * 100}%`, backgroundColor: '#ec4899' }}></div>
                  <div className="pixel-bar-text" style={{ fontSize: '9px' }}>XP: {gameState.agents.instagram?.xp || 0}/{gameState.agents.instagram?.nextXp || 100}</div>
                </div>
              </div>
              <div className="agent-skills-list">
                {(gameState.agents.instagram?.skills || ["📸 Posty ze Zdjęciami", "🎬 Rolki Reels (3 dni)", "🏷️ Hashtag Matrix"]).map((sk, idx) => (
                  <span key={idx} className="skill-badge">{sk}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Chamber 4: Facebook Agent */}
          <div className={`pixel-panel agent-room room-facebook ${gameState.agents.facebook.status === 'working' ? 'working-active' : ''}`}>
            <div className="agent-header">
              <span className="agent-name">👥 FB AGENT (Community)</span>
              <span className="agent-level">LVL {gameState.agents.facebook.level}</span>
            </div>
            
            <div className="agent-visual">
              <div className="room-item item-1">💬</div>
              <div className="room-item item-2">☕</div>
              <div className="room-item item-3">👥</div>
              <div className="room-item item-4">📢</div>
              
              <div className="avatar-wrapper">
                <span className="avatar-character anim-float">👩‍💻</span>
                <span className={`avatar-status-badge ${gameState.agents.facebook.status === 'working' ? 'status-working' : 'status-idle'}`}>
                  {gameState.agents.facebook.status === 'working' ? 'PISZE' : 'MODERUJE'}
                </span>
              </div>
            </div>

            <div className="agent-activity-box">
              <div className="activity-label">Zadanie:</div>
              <div className="activity-text" title={gameState.agents.facebook.activity}>{gameState.agents.facebook.activity}</div>
              <div className="agent-xp-container">
                <div className="pixel-bar-container" style={{ height: '14px' }}>
                  <div className="pixel-bar" style={{ width: `${(gameState.agents.facebook.xp / gameState.agents.facebook.nextXp) * 100}%`, backgroundColor: '#3b82f6' }}></div>
                  <div className="pixel-bar-text" style={{ fontSize: '9px' }}>XP: {gameState.agents.facebook.xp}/{gameState.agents.facebook.nextXp}</div>
                </div>
              </div>
              <div className="agent-skills-list">
                {(gameState.agents.facebook.skills || ["👥 Posty Grupy FB", "💬 Budowanie Relacji", "📸 Fotografia Meta"]).map((sk, idx) => (
                  <span key={idx} className="skill-badge">{sk}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Chamber 5: Blogger SEO Agent */}
          <div className={`pixel-panel agent-room room-blogger ${gameState.agents.blogger?.status === 'working' ? 'working-active' : ''}`}>
            <div className="agent-header">
              <span className="agent-name">✍️ BLOGER (SEO Content)</span>
              <span className="agent-level">LVL {gameState.agents.blogger?.level || 1}</span>
            </div>
            
            <div className="agent-visual">
              <div className="room-item item-1">📚</div>
              <div className="room-item item-2">✍️</div>
              <div className="room-item item-3">📜</div>
              <div className="room-item item-4">🔍</div>
              
              <div className="avatar-wrapper">
                <span className="avatar-character anim-float">🧙‍♀️</span>
                <span className={`avatar-status-badge ${gameState.agents.blogger?.status === 'working' ? 'status-working' : 'status-idle'}`}>
                  {gameState.agents.blogger?.status === 'working' ? 'PISZE BLOG' : 'GROMADZI FRAZY'}
                </span>
              </div>
            </div>

            <div className="agent-activity-box">
              <div className="activity-label">Zadanie:</div>
              <div className="activity-text" title={gameState.agents.blogger?.activity}>{gameState.agents.blogger?.activity}</div>
              <div className="agent-xp-container">
                <div className="pixel-bar-container" style={{ height: '14px' }}>
                  <div className="pixel-bar" style={{ width: `${((gameState.agents.blogger?.xp || 0) / (gameState.agents.blogger?.nextXp || 100)) * 100}%`, backgroundColor: '#10b981' }}></div>
                  <div className="pixel-bar-text" style={{ fontSize: '9px' }}>XP: {gameState.agents.blogger?.xp || 0}/{gameState.agents.blogger?.nextXp || 100}</div>
                </div>
              </div>
              <div className="agent-skills-list">
                {(gameState.agents.blogger?.skills || ["✍️ Poradniki Brafittingu", "🌐 WordPress REST API", "🛡️ Anty-Spam WP"]).map((sk, idx) => (
                  <span key={idx} className="skill-badge">{sk}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Chamber 6: Reels Producer Agent */}
          <div className={`pixel-panel agent-room room-reels ${gameState.agents.reels_producer?.status === 'working' ? 'working-active' : ''}`}>
            <div className="agent-header">
              <span className="agent-name">🎬 TWÓRCA ROLEK (Reels Producer)</span>
              <span className="agent-level">LVL {gameState.agents.reels_producer?.level || 1}</span>
            </div>
            
            <div className="agent-visual">
              <div className="room-item item-1">🎬</div>
              <div className="room-item item-2">🎞️</div>
              <div className="room-item item-3">✨</div>
              <div className="room-item item-4">📱</div>
              
              <div className="avatar-wrapper">
                <span className="avatar-character anim-float">🎬</span>
                <span className={`avatar-status-badge ${gameState.agents.reels_producer?.status === 'working' ? 'status-working' : 'status-idle'}`}>
                  {gameState.agents.reels_producer?.status === 'working' ? 'MONTUJE WIDEO' : 'GOTOWY'}
                </span>
              </div>
            </div>

            <div className="agent-activity-box">
              <div className="activity-label">Zadanie:</div>
              <div className="activity-text" title={gameState.agents.reels_producer?.activity}>{gameState.agents.reels_producer?.activity || 'Renderowanie i montaż wideo 9:16 MP4...'}</div>
              <div className="agent-xp-container">
                <div className="pixel-bar-container" style={{ height: '14px' }}>
                  <div className="pixel-bar" style={{ width: `${((gameState.agents.reels_producer?.xp || 0) / (gameState.agents.reels_producer?.nextXp || 100)) * 100}%`, backgroundColor: '#f43f5e' }}></div>
                  <div className="pixel-bar-text" style={{ fontSize: '9px' }}>XP: {gameState.agents.reels_producer?.xp || 0}/{gameState.agents.reels_producer?.nextXp || 100}</div>
                </div>
              </div>
              <div className="agent-skills-list">
                {(gameState.agents.reels_producer?.skills || ["🎬 Animacja 9:16", "📜 Scenariusz z IG", "🎞️ Render MP4", "⚡ Meta API"]).map((sk, idx) => (
                  <span key={idx} className="skill-badge">{sk}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Chamber 7: CEO / Prezes Sklepu */}
          <div className={`pixel-panel agent-room room-ceo ${gameState.agents.ceo?.status === 'working' ? 'working-active' : ''}`}>
            <div className="agent-header">
              <span className="agent-name">👑 PREZES (E-Commerce CEO)</span>
              <span className="agent-level">LVL {gameState.agents.ceo?.level || 1}</span>
            </div>
            
            <div className="agent-visual">
              <div className="room-item item-1">👑</div>
              <div className="room-item item-2">💰</div>
              <div className="room-item item-3">📜</div>
              <div className="room-item item-4">💎</div>
              
              <div className="avatar-wrapper">
                <span className="avatar-character anim-float">🤴</span>
                <span className={`avatar-status-badge ${gameState.agents.ceo?.status === 'working' ? 'status-working' : 'status-idle'}`}>
                  {gameState.agents.ceo?.status === 'working' ? 'ZARZĄDZA' : 'PREZES 0 PLN'}
                </span>
              </div>
            </div>

            <div className="agent-activity-box">
              <div className="activity-label">Zadanie:</div>
              <div className="activity-text" title={gameState.agents.ceo?.activity}>{gameState.agents.ceo?.activity || 'Maksymalizacja zysku 0 PLN i edycja skillów...'}</div>
              <div className="agent-xp-container">
                <div className="pixel-bar-container" style={{ height: '14px' }}>
                  <div className="pixel-bar" style={{ width: `${((gameState.agents.ceo?.xp || 0) / (gameState.agents.ceo?.nextXp || 100)) * 100}%`, backgroundColor: '#eab308' }}></div>
                  <div className="pixel-bar-text" style={{ fontSize: '9px' }}>XP: {gameState.agents.ceo?.xp || 0}/{gameState.agents.ceo?.nextXp || 100}</div>
                </div>
              </div>
              <div className="agent-skills-list">
                {(gameState.agents.ceo?.skills || ["👑 Zysk 0 PLN", "📜 Zarządzanie Skillami", "🤖 Nowi Pracownicy"]).map((sk, idx) => (
                  <span key={idx} className="skill-badge">{sk}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Chamber 8: CMO / Dyrektor Marketingu */}
          <div className={`pixel-panel agent-room room-cmo ${gameState.agents.cmo?.status === 'working' ? 'working-active' : ''}`}>
            <div className="agent-header">
              <span className="agent-name">📣 MARKETING (CMO Director)</span>
              <span className="agent-level">LVL {gameState.agents.cmo?.level || 1}</span>
            </div>
            
            <div className="agent-visual">
              <div className="room-item item-1">📣</div>
              <div className="room-item item-2">🎯</div>
              <div className="room-item item-3">📊</div>
              <div className="room-item item-4">🚀</div>
              
              <div className="avatar-wrapper">
                <span className="avatar-character anim-float">👩‍💼</span>
                <span className={`avatar-status-badge ${gameState.agents.cmo?.status === 'working' ? 'status-working' : 'status-idle'}`}>
                  {gameState.agents.cmo?.status === 'working' ? 'KOORDYNUJE' : 'STRATEG 0 PLN'}
                </span>
              </div>
            </div>

            <div className="agent-activity-box">
              <div className="activity-label">Zadanie:</div>
              <div className="activity-text" title={gameState.agents.cmo?.activity}>{gameState.agents.cmo?.activity || 'Nadzór i koordynacja kampanii 0 PLN...'}</div>
              <div className="agent-xp-container">
                <div className="pixel-bar-container" style={{ height: '14px' }}>
                  <div className="pixel-bar" style={{ width: `${((gameState.agents.cmo?.xp || 0) / (gameState.agents.cmo?.nextXp || 100)) * 100}%`, backgroundColor: '#a855f7' }}></div>
                  <div className="pixel-bar-text" style={{ fontSize: '9px' }}>XP: {gameState.agents.cmo?.xp || 0}/{gameState.agents.cmo?.nextXp || 100}</div>
                </div>
              </div>
              <div className="agent-skills-list">
                {(gameState.agents.cmo?.skills || ["📣 Kampanie 0 PLN", "🎯 Synergia Omnichannel", "👥 Zarządzanie Zespołem"]).map((sk, idx) => (
                  <span key={idx} className="skill-badge">{sk}</span>
                ))}
              </div>
            </div>
          </div>

        </section>

        {/* Right Side: Quests & Logs */}
        <section className="sidebar-layout">
          
          {/* Daily Quests Board */}
          <div className="pixel-panel quests-section">
            <h2 className="quests-title">
              <span>📋 MISJE DNIA (DAILY QUESTS)</span>
              <span style={{ fontSize: '10px', color: '#ffb3b3' }}>nisza: bielizna</span>
            </h2>
            <div className="quests-list">
              {gameState.quests.length > 0 ? (
                gameState.quests.map((quest) => (
                  <div key={quest.id} className={`quest-item ${quest.completed ? 'completed' : ''}`}>
                    <div className="quest-item-header">
                      <span className="quest-item-title">{quest.title}</span>
                      <span className="quest-item-reward">+{quest.xpReward} XP</span>
                    </div>
                    <p className="quest-item-desc">{quest.description}</p>
                  </div>
                ))
              ) : (
                <div className="empty-quests">
                  Strateg planuje misje na nadchodzącą turę... Kliknij "Uruchom Turę", aby wystartować.
                </div>
              )}
            </div>
          </div>

          {/* Activity Console / Battle Log */}
          <div className="pixel-panel console-section">
            <h2 className="console-title">⚔️ KONSOLA AKTYWNOŚCI (BATTLE LOG)</h2>
            <div className="console-log">
              {gameState.logs.length > 0 ? (
                gameState.logs.map((log) => (
                  <div key={log.id} className="log-entry">
                    <span className="log-time">[{log.timestamp}]</span>
                    <span className="log-sender" style={{ color: getSenderColor(log.sender) }}>
                      {log.sender}:
                    </span>
                    <span className="log-message">{log.message}</span>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '16px' }}>
                  Brak wpisów. Dashboard oczekuje na aktywność agentów.
                </div>
              )}
            </div>
          </div>

        </section>

      </main>

      {/* Control Panel Footer */}
      <footer className="pixel-panel game-controls">
        <button onClick={handleTriggerCycle} className="pixel-btn pixel-btn-success anim-flash">
          ⚔️ URUCHOM TURĘ AGENTÓW
        </button>

        <button onClick={handleUpdateStats} className="pixel-btn" style={{ borderColor: '#a855f7', color: '#c084fc' }}>
          ⚙️ WPISZ REALNE DANE SKLEPU
        </button>

        <button onClick={handleReset} className="pixel-btn pixel-btn-danger">
          🔄 ZRESETUJ SYMULACJĘ
        </button>

        <div className="controls-info">
          * Cykl automatyczny wykonuje się w tle co 30 sekund. Możesz wpisać realne statystyki sklepu przyciskiem powyżej.
        </div>
      </footer>
    </div>
  );
}

export default App;
