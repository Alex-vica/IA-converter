
import React, { useState, useRef, useEffect } from 'react';
import { GeminiService } from './services/geminiService';
import { TransformationResult, AppStatus } from './types';

const CHARACTER_PRESETS = [
  { name: 'Pixar Hero', prompt: 'a high-quality 3D Pixar-style animated character' },
  { name: 'Studio Ghibli', prompt: 'a beautiful hand-drawn Studio Ghibli anime character' },
  { name: 'The Simpsons', prompt: 'a yellow-skinned character from The Simpsons with bulging eyes' },
  { name: 'Marvel Superhero', prompt: 'a heroic Marvel comic book superhero with a detailed costume' },
  { name: 'Disney Prince/Princess', prompt: 'a classic 2D Disney animated royalty character' },
  { name: 'Cyberpunk Anime', prompt: 'a futuristic cyberpunk character with neon accents and tech gear' },
];

const Navbar = ({ credits }: { credits: number }) => (
  <nav className="fixed top-0 w-full z-50 glass-panel px-6 py-4 flex justify-between items-center">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
        <span className="font-bold text-white">C</span>
      </div>
      <h1 className="text-xl font-bold tracking-tight">Character<span className="text-purple-400">Morph</span></h1>
    </div>
    <div className="hidden md:flex gap-6 text-sm text-slate-300">
      <a href="#" className="hover:text-white transition-colors">Galería</a>
      <a href="#" className="hover:text-white transition-colors">Estilos</a>
    </div>
    <div className="flex items-center gap-4">
      <div className="bg-slate-800/80 px-3 py-1.5 rounded-full border border-purple-500/30 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
        <span className="text-xs font-bold text-purple-200">{credits} Creaciones Libres</span>
      </div>
    </div>
  </nav>
);

const Footer = () => (
  <footer className="py-12 px-6 text-center text-slate-500 border-t border-slate-800/50 mt-20">
    <p>© 2024 CharacterMorph AI. Reimagina tu identidad.</p>
  </footer>
);

export default function App() {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [characterName, setCharacterName] = useState<string>('');
  const [styleDescription, setStyleDescription] = useState<string>('');
  const [results, setResults] = useState<TransformationResult[]>([]);
  const [currentResult, setCurrentResult] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(5);
  const [showLimitModal, setShowLimitModal] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
        setStatus('idle');
      };
      reader.readAsDataURL(file);
    }
  };

  const applyPreset = (preset: { name: string, prompt: string }) => {
    setStyleDescription(preset.prompt);
  };

  const handleTransform = async () => {
    if (credits <= 0) {
      setShowLimitModal(true);
      return;
    }
    if (!originalImage || (!characterName.trim() && !styleDescription.trim())) return;

    setStatus('transforming');
    setError(null);
    setCurrentResult(null);

    const fullPrompt = `Transform the person in this photo into a ${styleDescription}. They should look like ${characterName}. 
    Please preserve the person's essential facial structure, hair color, and expression so they are recognizable, 
    but completely re-render them as a character in that specific artistic style. 
    Ensure the character wears clothing and has features iconic to ${characterName}.`;

    try {
      const gemini = GeminiService.getInstance();
      const transformedBase64 = await gemini.transformImage(originalImage, fullPrompt);
      
      const newResult: TransformationResult = {
        id: crypto.randomUUID(),
        originalImage: originalImage,
        transformedImage: transformedBase64,
        prompt: `Become ${characterName} in ${styleDescription} style`,
        timestamp: Date.now(),
      };

      setCurrentResult(transformedBase64);
      setResults(prev => [newResult, ...prev]);
      setCredits(prev => prev - 1);
      setStatus('success');
    } catch (err: any) {
      setError(err.message || 'Error creando tu personaje. Intenta otro prompt.');
      setStatus('error');
    }
  };

  const handleReferralSim = () => {
    setCredits(prev => prev + 15);
    setShowLimitModal(false);
    alert("¡Felicidades! 3 personas se han registrado. Has recibido 15 creaciones extra.");
  };

  const clearImage = () => {
    setOriginalImage(null);
    setCurrentResult(null);
    setStatus('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadingMessages = [
    "Capturando tu esencia...",
    "Dibujando líneas de personaje...",
    "Aplicando sombreado cartoon...",
    "Finalizando la transformación...",
    "Añadiendo toques mágicos..."
  ];
  
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    if (status === 'transforming') {
      const interval = setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % loadingMessages.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [status]);

  return (
    <div className="min-h-screen flex flex-col pt-24 bg-[#0a0f1d]">
      <Navbar credits={credits} />

      {showLimitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#151b2d] border border-purple-500/30 rounded-3xl max-w-md w-full p-8 shadow-2xl relative">
            <button onClick={() => setShowLimitModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0116 0z" /></svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">¡Límite alcanzado!</h3>
                <p className="text-slate-400 text-sm">Has agotado tus 5 fotos gratuitas iniciales.</p>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl space-y-3">
                  <p className="text-indigo-300 text-sm font-medium">Opción 1: Recomienda Amigos</p>
                  <button 
                    onClick={handleReferralSim}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20"
                  >
                    Compartir con 3 personas
                  </button>
                  <p className="text-[10px] text-slate-500 italic">Obtén 15 creaciones tras sus registros</p>
                </div>

                <div className="p-4 bg-purple-600/10 border border-purple-500/20 rounded-2xl space-y-3">
                  <p className="text-purple-300 text-sm font-medium">Opción 2: Plan Premium</p>
                  <button className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-600/20">
                    Suscribirse por 3,55€ / mes
                  </button>
                  <p className="text-[10px] text-slate-500 italic">Acceso ilimitado y estilos exclusivos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow container mx-auto px-4 max-w-6xl">
        <header className="text-center mb-12">
          <h2 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter">
            VUÉLVETE <span className="gradient-text uppercase">ANIMADO</span>
          </h2>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
            Sube tu foto y dinos en qué personaje o estilo te quieres convertir.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <section className="glass-panel p-6 rounded-3xl space-y-6 border-purple-500/20 relative">
              
              {credits > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl mb-4">
                  <p className="text-[11px] text-amber-200 leading-relaxed font-medium">
                    ⚠️ <strong>Nota:</strong> Solo tienes 5 fotos gratis. Luego comparte con 3 amigos para 15 más, o suscríbete por solo 3,55€/mes.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-xs font-bold text-purple-400 uppercase tracking-[0.2em]">1. Sube tu foto</label>
                {!originalImage ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-2xl p-10 text-center cursor-pointer transition-all bg-slate-800/20 group relative overflow-hidden"
                  >
                    <div className="relative z-10">
                      <div className="mb-4 flex justify-center">
                        <svg className="w-12 h-12 text-slate-500 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <p className="text-slate-400 font-medium">Selecciona una foto de cara clara</p>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  </div>
                ) : (
                  <div className="relative group rounded-2xl overflow-hidden aspect-square border border-slate-700">
                    <img src={originalImage} alt="Original" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button onClick={clearImage} className="bg-red-500/90 hover:bg-red-600 text-white p-3 rounded-xl transition-all hover:scale-110">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-purple-400 uppercase tracking-[0.2em]">2. Nombre del Personaje</label>
                  <input 
                    type="text"
                    placeholder="ej. Spider-Man, Elsa, Goku..." 
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-purple-400 uppercase tracking-[0.2em]">3. Estilo de Arte</label>
                  <textarea 
                    placeholder="Describe el estilo (ej. Pixar 3D, Anime Clásico, Cómic)..." 
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none h-24 text-sm"
                    value={styleDescription}
                    onChange={(e) => setStyleDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">O elige un estilo predefinido</label>
                  <div className="flex flex-wrap gap-2">
                    {CHARACTER_PRESETS.map((p) => (
                      <button 
                        key={p.name}
                        onClick={() => applyPreset(p)}
                        className={`text-[11px] px-3 py-1.5 rounded-full border transition-all ${styleDescription === p.prompt ? 'bg-purple-600 border-purple-400 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                disabled={status === 'transforming' || !originalImage || (!characterName.trim() && !styleDescription.trim())}
                onClick={handleTransform}
                className={`w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 overflow-hidden group relative ${
                  status === 'transforming' || !originalImage || (!characterName.trim() && !styleDescription.trim())
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-2xl shadow-purple-600/30'
                }`}
              >
                <div className="absolute inset-0 w-full h-full bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]"></div>
                {status === 'transforming' ? (
                  <>
                    <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Transformando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Crear Personaje</span>
                  </>
                )}
              </button>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs flex gap-3 animate-bounce">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  <span>{error}</span>
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel p-6 rounded-3xl min-h-[500px] flex flex-col border-indigo-500/10 shadow-2xl relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  RESULTADO DEL PERSONAJE
                </h3>
                {currentResult && (
                  <a 
                    href={currentResult} 
                    download="character-morph.png"
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Descargar
                  </a>
                )}
              </div>

              <div className="flex-grow flex items-center justify-center border-2 border-slate-800/50 rounded-2xl bg-slate-900/60 relative overflow-hidden">
                {status === 'transforming' ? (
                  <div className="text-center space-y-6">
                    <div className="relative inline-block scale-150">
                      <div className="w-16 h-16 border-t-2 border-purple-500 border-solid rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 border-b-2 border-indigo-500 border-solid rounded-full animate-spin-slow"></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                       <p className="text-xl font-bold text-white tracking-widest uppercase italic">Morfando...</p>
                       <p className="text-purple-400 text-sm font-medium animate-pulse">{loadingMessages[loadingMsgIdx]}</p>
                    </div>
                  </div>
                ) : currentResult ? (
                  <div className="relative group w-full h-full flex items-center justify-center p-4">
                    <img 
                      src={currentResult} 
                      alt="Transformed Character" 
                      className="max-w-full max-h-[600px] object-contain rounded-xl shadow-[0_0_50px_rgba(168,85,247,0.2)] animate-in zoom-in duration-500" 
                    />
                  </div>
                ) : (
                  <div className="text-center space-y-4 opacity-30 group">
                    <div className="w-24 h-24 mx-auto border-2 border-slate-700 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-slate-500 font-medium">Tu versión animada aparecerá aquí</p>
                  </div>
                )}
              </div>
            </div>

            {results.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bóveda de Personajes</h3>
                  <span className="text-[10px] text-slate-600">{results.length} creaciones</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {results.map((res) => (
                    <div 
                      key={res.id} 
                      className={`cursor-pointer group relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 ${currentResult === res.transformedImage ? 'border-purple-500' : 'border-slate-800'}`}
                      onClick={() => setCurrentResult(res.transformedImage)}
                    >
                      <img src={res.transformedImage} alt="Creation" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const styleElement = document.createElement('style');
styleElement.innerHTML = `
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(-360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 4s linear infinite;
  }
  .gradient-text {
    background: linear-gradient(to right, #a855f7, #6366f1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;
document.head.appendChild(styleElement);
