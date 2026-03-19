import React, { useState, useEffect, useRef } from 'react';
import Spline from '@splinetool/react-spline';
import { ShoppingBag, X, Search, Phone, MapPin } from 'lucide-react';
import { ALL, SECTIONS, SEC_COLORS, Product } from './data';

// --- Helper Functions ---
function getBottleEmoji(p: Product) {
  const t = p.tags, g = p.g;
  if(t.includes('oud')) return '🕌';
  if(t.includes('gourmand')) return '🍫';
  if(t.includes('floral') && g === 'w') return '🌸';
  if(t.includes('aquatic')) return '🌊';
  if(t.includes('leather')) return '🪶';
  if(t.includes('woody')) return '🪵';
  if(t.includes('sweet')) return '🍯';
  if(t.includes('fruity')) return '🍑';
  if(t.includes('spicy')) return '🌶️';
  if(g === 'm') return '🏺';
  if(g === 'w') return '🌺';
  return '🫧';
}

function parsePrice(priceStr: string): number {
  if (priceStr === 'N/A') return 0;
  // Extract the first number if it's a range (e.g., "4,500-5,999")
  const match = priceStr.split('–')[0].replace(/[^0-9]/g, '');
  return parseInt(match, 10) || 0;
}

// --- Components ---

function CustomCursor() {
  const curRef = useRef<HTMLDivElement>(null);
  const cur2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mx = 0, my = 0, fx = 0, fy = 0;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (curRef.current) {
        curRef.current.style.left = mx + 'px';
        curRef.current.style.top = my + 'px';
      }
    };

    const animate = () => {
      fx += (mx - fx) * 0.1;
      fy += (my - fy) * 0.1;
      if (cur2Ref.current) {
        cur2Ref.current.style.left = fx + 'px';
        cur2Ref.current.style.top = fy + 'px';
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, .pcard, .snav-item, .pill, input, select')) {
        document.body.classList.add('hov');
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, .pcard, .snav-item, .pill, input, select')) {
        document.body.classList.remove('hov');
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    animate();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <div id="cur" ref={curRef}></div>
      <div id="cur2" ref={cur2Ref}></div>
    </>
  );
}

// --- Main App ---

export default function App() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [scentFilter, setScentFilter] = useState('all');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({ occasion: '', scents: [] as string[] });
  const [quizResults, setQuizResults] = useState<Product[]>([]);
  const [searchQ, setSearchQ] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ name: '', phone: '', method: 'telebirr', txId: '' });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const ro = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('vis');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      ro.disconnect();
    };
  }, []);

  const handleQuizNext = () => {
    if (quizStep === 0 && !quizAnswers.occasion) return;
    if (quizStep === 1 && quizAnswers.scents.length === 0) return;
    
    if (quizStep === 1) {
      // Calculate results
      const results = ALL.filter(p => {
        const matchesScent = quizAnswers.scents.some(s => 
          p.vibe.toLowerCase().includes(s) || 
          p.tags.some(t => t.toLowerCase().includes(s))
        );
        return matchesScent;
      }).slice(0, 3);
      
      setQuizResults(results.length > 0 ? results : ALL.slice(0, 3));
      setQuizStep(2);
    } else {
      setQuizStep(prev => prev + 1);
    }
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizAnswers({ occasion: '', scents: [] });
    setQuizResults([]);
  };

  // Filter logic
  let filteredProducts = ALL;
  if (searchQ) {
    const q = searchQ.toLowerCase();
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.vibe.toLowerCase().includes(q) ||
      p.tags.join(' ').includes(q)
    );
  }
  if (activeFilter !== 'all') {
    if (activeFilter === 'men') filteredProducts = filteredProducts.filter(p => p.g === 'm');
    else if (activeFilter === 'women') filteredProducts = filteredProducts.filter(p => p.g === 'w');
    else if (activeFilter === 'unisex') filteredProducts = filteredProducts.filter(p => p.g === 'u');
    else if (activeFilter === 'designer') filteredProducts = filteredProducts.filter(p => p.orig);
    else if (activeFilter === 'clone') filteredProducts = filteredProducts.filter(p => !p.orig);
  }

  if (priceFilter !== 'all') {
    if (priceFilter === 'budget') filteredProducts = filteredProducts.filter(p => { const n = parsePrice(p.price); return n > 0 && n < 5000; });
    else if (priceFilter === '5k-10k') filteredProducts = filteredProducts.filter(p => { const n = parsePrice(p.price); return n >= 5000 && n <= 10000; });
    else if (priceFilter === 'above10k') filteredProducts = filteredProducts.filter(p => { const n = parsePrice(p.price); return n > 10000; });
  }

  if (scentFilter !== 'all') {
    if (scentFilter === 'oud') filteredProducts = filteredProducts.filter(p => p.tags.includes('oud'));
    else if (scentFilter === 'fresh') filteredProducts = filteredProducts.filter(p => p.tags.includes('fresh') || p.tags.includes('aquatic'));
    else if (scentFilter === 'sweet') filteredProducts = filteredProducts.filter(p => p.tags.includes('sweet') || p.tags.includes('gourmand'));
    else if (scentFilter === 'woody') filteredProducts = filteredProducts.filter(p => p.tags.includes('woody') || p.tags.includes('leather'));
  }

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.no === product.no);
      if (existing) {
        return prev.map(item => item.product.no === product.no ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
    setSelectedProduct(null); // Close detail panel
  };

  const updateQuantity = (no: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.no === no) {
        const newQ = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQ };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (parsePrice(item.product.price) * item.quantity), 0);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    /* 
    // --- INFINITYFREE PHP BACKEND INTEGRATION ---
    // Uncomment this block when you upload the PHP files to InfinityFree
    const orderData = {
      name: checkoutData.name,
      phone: checkoutData.phone,
      method: checkoutData.method,
      txId: checkoutData.txId,
      total: cartTotal,
      items: cart
    };

    fetch('http://YOUR_INFINITYFREE_DOMAIN.com/api/place_order.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
        alert("Order placed successfully!");
        setCart([]);
        setIsCheckoutOpen(false);
        setCheckoutData({ name: '', phone: '', method: 'telebirr', txId: '' });
      } else {
        alert("Error placing order: " + data.message);
      }
    })
    .catch(err => {
      console.error(err);
      alert("Failed to connect to the server.");
    });
    return; // Exit here if using the fetch above
    */

    // Default behavior (remove this when you uncomment the fetch above)
    alert(`Order placed successfully!\nName: ${checkoutData.name}\nTotal: ${cartTotal} ETB\nMethod: ${checkoutData.method}\nTxID: ${checkoutData.txId}`);
    setCart([]);
    setIsCheckoutOpen(false);
    setCheckoutData({ name: '', phone: '', method: 'telebirr', txId: '' });
  };

  return (
    <>
      <CustomCursor />

      {/* HEADER */}
      <header id="mainHeader" className={isScrolled ? 'scrolled' : ''}>
        <div className="header-inner">
          <svg className="logo-svg" viewBox="0 0 320 110" xmlns="http://www.w3.org/2000/svg" aria-label="Dagu Perfume">
            <rect x="22" y="4" width="36" height="7" rx="2" fill="white"/>
            <circle cx="40" cy="7.5" r="2" fill="#6E1324"/>
            <rect x="30" y="11" width="20" height="8" rx="1" fill="white"/>
            <rect x="18" y="19" width="13" height="86" rx="0" fill="white"/>
            <path d="M31,19 L50,19 Q100,19 100,62 Q100,105 50,105 L31,105 L31,92 L50,92 Q84,92 84,62 Q84,32 50,32 L31,32 Z" fill="white"/>
            <path d="M46,40 Q80,46 76,66 Q72,84 46,90 Q66,76 63,64 Q60,52 46,40 Z" fill="#6E1324"/>
            <text x="108" y="103" fontFamily="Georgia,'Times New Roman',Times,serif" fontSize="88" fontWeight="normal" fill="white" letterSpacing="0">AGU</text>
          </svg>
          <ul className="nav-links">
            <li><a href="#sec-kings">For Kings</a></li>
            <li><a href="#sec-queens">For Queens</a></li>
            <li><a href="#sec-oud">Oud</a></li>
            <li><a href="#sec-designer">Designer</a></li>
            <li><a href="#footer">Contact</a></li>
          </ul>
          <div className="header-right">
            <div className="search-wrap">
              <input 
                id="searchInput" 
                type="text" 
                placeholder="Search perfume…" 
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
              />
              <button className="search-btn" onClick={() => document.getElementById('searchInput')?.focus()}>
                <Search size={14} />
              </button>
            </div>
            <button 
              className="relative p-2 text-white hover:text-[#c8a050] transition-colors cursor-pointer"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag size={24} />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-[#6E1324] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-[#c8a050]">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="hero">
        <div className="hero-canvas">
          <Spline scene="https://prod.spline.design/vtjHfUFoverdHzBj/scene.splinecode" />
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <p className="hero-eyebrow">Addis Ababa · Bole Bora Kids Mall</p>
          <h1 className="hero-h1">Smell Good...</h1>
          <p className="hero-sub">Discover your signature scent from our curated collection of designer originals, premium clones & rare Arabic exclusives.</p>
          <div className="hero-btns">
            <a href="#sec-kings" className="btn-primary">Explore Collection</a>
            <button onClick={() => setIsQuizOpen(true)} className="btn-outline">Take Scent Quiz</button>
          </div>
        </div>
        <div className="hero-scroll"><div className="scroll-line"></div><span>Scroll</span></div>
      </section>

      {/* STATS */}
      <div className="stats-strip reveal vis">
        <div className="stat"><div className="stat-n">168</div><div className="stat-l">Fragrances</div></div>
        <div className="stat"><div className="stat-n">15+</div><div className="stat-l">Brands</div></div>
        <div className="stat"><div className="stat-n">100%</div><div className="stat-l">Authentic</div></div>
      </div>

      {/* FILTERS */}
      <div className="filters-bar" id="filtersBar">
        <div className="extra-filters-wrapper" style={{ width: '100%', justifyContent: 'space-between' }}>
          <button className="pill filter-btn" onClick={() => setIsQuizOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', display: 'inline-block', verticalAlign: 'middle'}}><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            Take Scent Quiz
          </button>
          <button className={`pill filter-btn ${(activeFilter !== 'all' || priceFilter !== 'all' || scentFilter !== 'all') ? 'active' : ''}`} onClick={() => setIsFilterMenuOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', display: 'inline-block', verticalAlign: 'middle'}}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            Filters {(activeFilter !== 'all' || priceFilter !== 'all' || scentFilter !== 'all') && <span className="filter-badge">•</span>}
          </button>
        </div>
      </div>

      {/* QUIZ DRAWER */}
      <div className={`drawer-backdrop ${isQuizOpen ? 'open' : ''}`} onClick={() => setIsQuizOpen(false)}></div>
      <div className={`filter-drawer ${isQuizOpen ? 'open' : ''}`} style={{ width: '400px', maxWidth: '100%' }}>
        <div className="filter-header">
          <h2>Find Your Scent</h2>
          <button className="filter-close" onClick={() => setIsQuizOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="filter-body" style={{ padding: '24px' }}>
          {quizStep === 0 && (
            <div className="quiz-step">
              <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>What's the occasion?</h3>
              <div className="grid-2x2">
                {['Everyday', 'Work', 'Date Night', 'Special Event'].map(occ => (
                  <button 
                    key={occ}
                    className={`fd-opt ${quizAnswers.occasion === occ ? 'active' : ''}`}
                    onClick={() => setQuizAnswers({...quizAnswers, occasion: occ})}
                    style={{ padding: '16px 12px', height: 'auto' }}
                  >
                    {occ}
                  </button>
                ))}
              </div>
            </div>
          )}
          {quizStep === 1 && (
            <div className="quiz-step">
              <h3 style={{ marginBottom: '8px', fontSize: '18px' }}>What kind of scents do you like?</h3>
              <p style={{ marginBottom: '16px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Select up to 2</p>
              <div className="grid-2x2">
                {['woody', 'fresh', 'sweet', 'oud', 'floral', 'spicy'].map(scent => (
                  <button 
                    key={scent}
                    className={`fd-opt ${quizAnswers.scents.includes(scent) ? 'active' : ''}`}
                    onClick={() => {
                      let newScents = [...quizAnswers.scents];
                      if (newScents.includes(scent)) {
                        newScents = newScents.filter(s => s !== scent);
                      } else if (newScents.length < 2) {
                        newScents.push(scent);
                      }
                      setQuizAnswers({...quizAnswers, scents: newScents});
                    }}
                    style={{ padding: '16px 12px', height: 'auto', textTransform: 'capitalize' }}
                  >
                    {scent}
                  </button>
                ))}
              </div>
            </div>
          )}
          {quizStep === 2 && (
            <div className="quiz-step">
              <h3 style={{ marginBottom: '16px', fontSize: '18px', color: 'var(--gold)' }}>Your Perfect Matches</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {quizResults.map(p => (
                  <div key={p.no} style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', cursor: 'pointer', alignItems: 'center' }} onClick={() => { setSelectedProduct(p); setIsQuizOpen(false); }}>
                    <div style={{ width: '60px', height: '60px', background: `linear-gradient(135deg, ${SEC_COLORS[p.sec] || 'rgba(110,19,36,.15)'}, rgba(10,2,5,.88))`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                      {getBottleEmoji(p)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{p.name}</div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>{p.brand}</div>
                      <div style={{ fontSize: '13px', color: 'var(--gold)', marginTop: '4px' }}>{p.price} Br</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn-primary" style={{ width: '100%', marginTop: '24px', textAlign: 'center' }} onClick={resetQuiz}>Take Quiz Again</button>
            </div>
          )}
        </div>
        {quizStep < 2 && (
          <div className="filter-footer">
            <button 
              className="filter-apply-btn" 
              onClick={handleQuizNext}
              disabled={(quizStep === 0 && !quizAnswers.occasion) || (quizStep === 1 && quizAnswers.scents.length === 0)}
              style={{ opacity: ((quizStep === 0 && !quizAnswers.occasion) || (quizStep === 1 && quizAnswers.scents.length === 0)) ? 0.5 : 1 }}
            >
              {quizStep === 1 ? 'Show My Matches' : 'Next'}
            </button>
          </div>
        )}
      </div>

      {/* FILTER DRAWER */}
      <div className={`drawer-backdrop ${isFilterMenuOpen ? 'open' : ''}`} onClick={() => setIsFilterMenuOpen(false)}></div>
      <div className={`filter-drawer ${isFilterMenuOpen ? 'open' : ''}`}>
        <div className="filter-header">
          <h2>Filters</h2>
          <button className="filter-close" onClick={() => setIsFilterMenuOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="filter-body">
          <div className="fd-section">
            <div className="fd-title">Category</div>
            <div className="grid-3x3">
              <button className={`fd-opt ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All</button>
              <button className={`fd-opt ${activeFilter === 'men' ? 'active' : ''}`} onClick={() => setActiveFilter('men')}>Kings</button>
              <button className={`fd-opt ${activeFilter === 'women' ? 'active' : ''}`} onClick={() => setActiveFilter('women')}>Queens</button>
              <button className={`fd-opt ${activeFilter === 'unisex' ? 'active' : ''}`} onClick={() => setActiveFilter('unisex')}>Unisex</button>
              <button className={`fd-opt ${activeFilter === 'designer' ? 'active' : ''}`} onClick={() => setActiveFilter('designer')}>Originals</button>
              <button className={`fd-opt ${activeFilter === 'clone' ? 'active' : ''}`} onClick={() => setActiveFilter('clone')}>Dupes</button>
            </div>
          </div>
          <div className="fd-section">
            <div className="fd-title">Price</div>
            <div className="grid-2x2">
              <button className={`fd-opt ${priceFilter === 'all' ? 'active' : ''}`} onClick={() => setPriceFilter('all')}>Any Price</button>
              <button className={`fd-opt ${priceFilter === 'budget' ? 'active' : ''}`} onClick={() => setPriceFilter('budget')}>Under 5k</button>
              <button className={`fd-opt ${priceFilter === '5k-10k' ? 'active' : ''}`} onClick={() => setPriceFilter('5k-10k')}>5k - 10k</button>
              <button className={`fd-opt ${priceFilter === 'above10k' ? 'active' : ''}`} onClick={() => setPriceFilter('above10k')}>Above 10k</button>
            </div>
          </div>
          <div className="fd-section">
            <div className="fd-title">Scent Profile</div>
            <button className={`fd-opt full-width ${scentFilter === 'all' ? 'active' : ''}`} onClick={() => setScentFilter('all')}>Any Scent</button>
            <div className="grid-2x2">
              <button className={`fd-opt ${scentFilter === 'oud' ? 'active' : ''}`} onClick={() => setScentFilter('oud')}>🕌 Oud</button>
              <button className={`fd-opt ${scentFilter === 'fresh' ? 'active' : ''}`} onClick={() => setScentFilter('fresh')}>🌊 Fresh</button>
              <button className={`fd-opt ${scentFilter === 'sweet' ? 'active' : ''}`} onClick={() => setScentFilter('sweet')}>🍯 Sweet</button>
              <button className={`fd-opt ${scentFilter === 'woody' ? 'active' : ''}`} onClick={() => setScentFilter('woody')}>🪵 Woody</button>
            </div>
          </div>
        </div>
        <div className="filter-footer">
          <button className="filter-apply-btn" onClick={() => setIsFilterMenuOpen(false)}>Show Results</button>
        </div>
      </div>

      {/* BODY */}
      <div className="page-body">
        {/* SIDEBAR */}
        <nav className="sidebar" id="sideNav">
          <div className="snav-hd">Sections</div>
          {SECTIONS.map(sec => (
            <div key={sec.id} className="snav-item" onClick={() => document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' })}>
              <span className="snav-emoji">{sec.emoji}</span>
              <span className="snav-text">{sec.title}</span>
              <span className="snav-n">{ALL.filter(p => p.sec === sec.id).length}</span>
            </div>
          ))}
          <div className="snav-sep"></div>
          <div className="snav-hd">Order</div>
          <div className="snav-item" onClick={() => window.open('https://t.me/dagu_perfume','_blank')}>
            <span className="snav-emoji">✈️</span><span className="snav-text">Telegram</span>
          </div>
          <div className="snav-item"><span className="snav-emoji">📞</span><span className="snav-text">0993337235</span></div>
          <div className="snav-item"><span className="snav-emoji">📞</span><span className="snav-text">0949064149</span></div>
        </nav>

        {/* CONTENT */}
        <div className="content" id="content">
          {SECTIONS.map(sec => {
            const items = filteredProducts.filter(p => p.sec === sec.id);
            if (items.length === 0) return null;
            return (
              <div key={sec.id} className="cat-sec" id={sec.id}>
                <div className="sec-head" data-emoji={sec.emoji}>
                  <div className="sh-left">
                    <div className="sh-tag">{sec.tag}</div>
                    <div className="sh-title">{sec.emoji} {sec.title}</div>
                    <div className="sh-sub">{sec.sub}</div>
                  </div>
                </div>
                <div className="p-grid">
                  {items.map((p, i) => (
                    <div key={p.no} className="pcard" style={{ animationDelay: `${i * 20}ms` }} onClick={() => setSelectedProduct(p)}>
                      <div className="pcard-img" style={{ background: `linear-gradient(135deg, ${SEC_COLORS[p.sec] || 'rgba(110,19,36,.15)'}, rgba(10,2,5,.88))` }}>
                        <div className="pcard-bottle">{getBottleEmoji(p)}</div>
                        <div className="pcard-hover-hint">View Details</div>
                      </div>
                      <div className="pcard-info">
                        <div className="pcard-id">ID · {String(p.no).padStart(3, '0')}</div>
                        <div className="pcard-brand">{p.brand}</div>
                        <div className="pcard-name">{p.name}</div>
                        <div className="pcard-badges">
                          {p.g === 'm' && <span className="badge badge-m">Men</span>}
                          {p.g === 'w' && <span className="badge badge-w">Women</span>}
                          {p.g === 'u' && <span className="badge badge-u">Unisex</span>}
                          <span className="badge badge-size">{p.size}</span>
                          {p.orig ? <span className="badge badge-orig">Original</span> : <span className="badge badge-clone">Clone</span>}
                          {p.tags.filter(t => t !== 'misc').slice(0, 2).map(t => (
                            <span key={t} className="badge badge-type">{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                          ))}
                        </div>
                        {p.price === 'N/A' ? (
                          <div className="pcard-price-na">Price on request</div>
                        ) : (
                          <div className="pcard-price">{p.price} Br</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {filteredProducts.length === 0 && (
            <div className="empty">
              <p>No fragrances found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL PANEL */}
      <div id="dpBackdrop" className={selectedProduct ? 'open' : ''} onClick={() => setSelectedProduct(null)}></div>
      <div id="detailPanel" className={selectedProduct ? 'open' : ''}>
        <button className="dp-close" onClick={() => setSelectedProduct(null)}>✕</button>
        {selectedProduct && (
          <>
            <div className="dp-img" style={{ background: `linear-gradient(135deg, ${SEC_COLORS[selectedProduct.sec] || 'rgba(110,19,36,.25)'}, rgba(10,2,5,.9))` }}>
              <div className="dp-img-bg"></div>
              <div className="dp-bottle">{getBottleEmoji(selectedProduct)}</div>
              <div className="dp-shimmer"></div>
            </div>
            <div className="dp-body">
              <div className="dp-no">#{String(selectedProduct.no).padStart(3, '0')}</div>
              <div className="dp-brand">{selectedProduct.brand}</div>
              <div className="dp-name">{selectedProduct.name}</div>
              <div className="dp-badges">
                {selectedProduct.g === 'm' && <span className="badge badge-m">Men</span>}
                {selectedProduct.g === 'w' && <span className="badge badge-w">Women</span>}
                {selectedProduct.g === 'u' && <span className="badge badge-u">Unisex</span>}
                {selectedProduct.orig ? <span className="badge badge-orig" style={{fontSize:'8px', padding:'3px 8px'}}>Original</span> : <span className="badge badge-clone" style={{fontSize:'8px', padding:'3px 8px'}}>Clone / Alt</span>}
                {selectedProduct.tags.filter(t => t !== 'misc').slice(0, 3).map(t => (
                  <span key={t} className="badge" style={{fontSize:'7px', padding:'2px 7px', background:'rgba(110,19,36,.15)', border:'1px solid rgba(110,19,36,.3)', color:'rgba(245,237,224,.5)'}}>{t}</span>
                ))}
              </div>
              <div className="dp-divider"></div>
              <div className="dp-label">Scent Profile</div>
              <div className="dp-vibe">{selectedProduct.vibe}</div>
              <div className="dp-divider"></div>
              <div className="dp-price-row">
                <div>
                  <div className="dp-price-lbl">Price</div>
                  <div className={selectedProduct.price === 'N/A' ? 'dp-price-na' : 'dp-price-val'}>
                    {selectedProduct.price === 'N/A' ? '—' : `${selectedProduct.price} Br`}
                  </div>
                </div>
                <div>
                  <span className="badge badge-size" style={{fontSize:'10px', padding:'5px 10px'}}>{selectedProduct.size}</span>
                </div>
              </div>
              
              {selectedProduct.price !== 'N/A' && (
                <button 
                  className="dp-order-btn" 
                  style={{ background: 'var(--brand)', marginBottom: '12px', width: '100%' }}
                  onClick={() => addToCart(selectedProduct)}
                >
                  🛒 Add to Cart
                </button>
              )}

              <div className="dp-call-row" style={{ marginBottom: '12px' }}>
                <a className="dp-order-btn" href="tel:0993337235" style={{ background: 'var(--brand)', marginBottom: 0, flex: 1, gap: '8px' }}>📞 Call 0993337235</a>
              </div>
              <div className="dp-call-row">
                <a className="dp-order-btn" href="tel:0949064149" style={{ background: 'rgba(110,19,36,.6)', border: '1px solid rgba(110,19,36,.5)', marginBottom: 0, flex: 1, gap: '8px' }}>📞 Call 0949064149</a>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CART DRAWER */}
      <div id="dpBackdrop" className={isCartOpen ? 'open' : ''} onClick={() => setIsCartOpen(false)}></div>
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <div className="cart-title">Your Cart</div>
          <button className="dp-close" style={{position: 'relative', top: 0, right: 0}} onClick={() => setIsCartOpen(false)}>✕</button>
        </div>
        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="empty" style={{padding: '40px 0'}}>
              <p style={{fontSize: '18px'}}>Your cart is empty.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.no} className="cart-item">
                <div className="cart-item-img">{getBottleEmoji(item.product)}</div>
                <div className="cart-item-info">
                  <div className="cart-item-brand">{item.product.brand}</div>
                  <div className="cart-item-name">{item.product.name}</div>
                  <div className="cart-item-price">{item.product.price} Br</div>
                  <div className="cart-controls">
                    <button className="cart-btn" onClick={() => updateQuantity(item.product.no, -1)}>-</button>
                    <span style={{fontSize: '14px', color: 'var(--cream)'}}>{item.quantity}</span>
                    <button className="cart-btn" onClick={() => updateQuantity(item.product.no, 1)}>+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <div className="cart-total-lbl">Total</div>
              <div className="cart-total-val">{cartTotal.toLocaleString()} Br</div>
            </div>
            <button 
              className="dp-order-btn" 
              style={{ width: '100%', marginBottom: 0 }}
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>

      {/* CHECKOUT MODAL */}
      <div className={`checkout-modal-overlay ${isCheckoutOpen ? 'open' : ''}`}>
        <div className="checkout-modal">
          <button className="dp-close" onClick={() => setIsCheckoutOpen(false)}>✕</button>
          <h2 className="cart-title" style={{marginBottom: '8px'}}>Checkout</h2>
          <p style={{color: 'rgba(245,237,224,.6)', fontSize: '12px', marginBottom: '24px'}}>Complete your order of {cartTotal.toLocaleString()} ETB</p>
          
          <form onSubmit={handleCheckoutSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                value={checkoutData.name}
                onChange={e => setCheckoutData({...checkoutData, name: e.target.value})}
                placeholder="Abebe Kebede"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="tel" 
                className="form-input" 
                required 
                value={checkoutData.phone}
                onChange={e => setCheckoutData({...checkoutData, phone: e.target.value})}
                placeholder="0911..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select 
                className="form-select"
                value={checkoutData.method}
                onChange={e => setCheckoutData({...checkoutData, method: e.target.value})}
              >
                <option value="telebirr">Telebirr</option>
                <option value="cbe">Commercial Bank of Ethiopia (CBE)</option>
              </select>
            </div>

            {checkoutData.method === 'telebirr' ? (
              <div className="payment-instructions">
                Please send <strong>{cartTotal.toLocaleString()} ETB</strong> to Telebirr account:<br/>
                <strong>0993337235</strong> (Dagu Perfume)<br/>
                Then enter the Transaction ID below.
              </div>
            ) : (
              <div className="payment-instructions">
                Please transfer <strong>{cartTotal.toLocaleString()} ETB</strong> to CBE account:<br/>
                <strong>1000123456789</strong> (Dagu Perfume)<br/>
                Then enter the Transaction ID below.
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Transaction ID</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                value={checkoutData.txId}
                onChange={e => setCheckoutData({...checkoutData, txId: e.target.value})}
                placeholder="e.g. 7A8B9C0D"
              />
            </div>

            <button type="submit" className="dp-order-btn" style={{width: '100%', marginTop: '12px'}}>
              Confirm Order
            </button>
          </form>
        </div>
      </div>

      {/* MAP CTA */}
      <div className="map-cta-section reveal vis">
        <div className="map-cta-inner">
          <div className="map-cta-left">
            <div className="map-cta-tag">Come Visit</div>
            <div className="map-cta-title">Find Us in Bole</div>
            <div className="map-cta-addr">Bora Kids Mall · Ground Floor G-02<br/>Bole, Addis Ababa</div>
            <div className="map-cta-hours"><span className="map-cta-hours-dot"></span>Mon – Sat &nbsp;·&nbsp; 9:00 AM – 8:00 PM</div>
          </div>
          <a className="map-cta-btn" href="https://www.google.com/maps/dir/?api=1&destination=Bora+Kids+Mall+Bole+Addis+Ababa" target="_blank" rel="noreferrer">
            <span className="map-cta-btn-ico">
              <MapPin />
            </span>
            <span className="map-cta-btn-text">
              <span className="map-cta-btn-label">Open in Google Maps</span>
              <span className="map-cta-btn-sub">Get directions →</span>
            </span>
          </a>
        </div>
      </div>

      {/* FOOTER */}
      <footer id="footer">
        <div className="footer-top">
          <div className="footer-left-col">
            <div className="footer-logo">
              <svg className="logo-svg-footer" viewBox="0 0 320 110" xmlns="http://www.w3.org/2000/svg" aria-label="Dagu Perfume">
                <rect x="22" y="4" width="36" height="7" rx="2" fill="white"/>
                <circle cx="40" cy="7.5" r="2" fill="#6E1324"/>
                <rect x="30" y="11" width="20" height="8" rx="1" fill="white"/>
                <rect x="18" y="19" width="13" height="86" rx="0" fill="white"/>
                <path d="M31,19 L50,19 Q100,19 100,62 Q100,105 50,105 L31,105 L31,92 L50,92 Q84,92 84,62 Q84,32 50,32 L31,32 Z" fill="white"/>
                <path d="M46,40 Q80,46 76,66 Q72,84 46,90 Q66,76 63,64 Q60,52 46,40 Z" fill="#6E1324"/>
                <text x="108" y="103" fontFamily="Georgia,'Times New Roman',Times,serif" fontSize="88" fontWeight="normal" fill="white" letterSpacing="0">AGU</text>
              </svg>
            </div>
            <p className="footer-tagline">Your destination for luxury fragrances in Addis Ababa. Designer originals, premium clones and rare Arabic exclusives — all under one roof.</p>
          </div>

          <div className="footer-right-col">
            <div className="f-head">Find Us Online</div>
            <div className="f-social-cards">
              <a className="f-scard f-scard-tg" href="https://t.me/dagu_perfume" target="_blank" rel="noreferrer">
                <div className="f-scard-ico f-scard-ico-tg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.269c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.952z"/></svg>
                </div>
                <div className="f-scard-info">
                  <div className="f-scard-label">Order on Telegram</div>
                  <div className="f-scard-val">@dagu_perfume</div>
                </div>
              </a>
              <a className="f-scard f-scard-tt" href="https://www.tiktok.com/@dagu_perfume" target="_blank" rel="noreferrer">
                <div className="f-scard-ico f-scard-ico-tt">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.27 8.27 0 004.84 1.55V6.85a4.85 4.85 0 01-1.07-.16z"/></svg>
                </div>
                <div className="f-scard-info">
                  <div className="f-scard-label">Watch on TikTok</div>
                  <div className="f-scard-val">@dagu_perfume</div>
                </div>
              </a>
              <a className="f-scard f-scard-ph" href="tel:0993337235">
                <div className="f-scard-ico f-scard-ico-ph"><Phone size={18} /></div>
                <div className="f-scard-info">
                  <div className="f-scard-label">Call Us</div>
                  <div className="f-scard-val">0993 33 7235</div>
                </div>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2025 Dagu Perfume · Addis Ababa</div>
        </div>
      </footer>
    </>
  );
}
