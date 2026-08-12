import React, { useState } from 'react';
import { useShopify } from './globalstate/shopify';

type WelcomePageProps = {
  onRegister?: () => void;
  onLogin?: () => void;
  onManageProducts?: () => void;
  onTrackOrders?: () => void;
};

export default function WelcomePage({
  onRegister,
  onLogin,
  onManageProducts,
  onTrackOrders,
}: WelcomePageProps) {
  const { authenticateAdmin, connectManually, shop: activeShop } = useShopify();
  const [shopDomain, setShopDomain] = useState('courcelight.myshopify.com');
  const [useRealOAuth, setUseRealOAuth] = useState(false);
  const [useTokenConnect, setUseTokenConnect] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const handleInstallClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopDomain) {
      alert('Please enter a valid shop domain');
      return;
    }
    // authenticateAdmin will redirect the browser to the backend OAuth path
    authenticateAdmin(shopDomain, !useRealOAuth);
  };

  const handleManualConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopDomain || !accessToken) {
      alert('Please fill out both the shop domain and the access token.');
      return;
    }

    setIsConnecting(true);
    setConnectError(null);

    try {
      const response = await fetch('http://localhost:1000/shopify/manual-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop: shopDomain,
          accessToken: accessToken
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Connection failed. Verify access token credentials.');
      }

      const data = await response.json();
      connectManually(data.shop, data.token, data.name, data.email);
      alert('Connected to Shopify store successfully!');
      if (onManageProducts) {
        onManageProducts();
      }
    } catch (err: any) {
      setConnectError(err.message || 'Direct connection failed. Check domain and token.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-xl">🎓</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              Course Academy
            </span>
          </div>

          <nav className="flex items-center gap-4">
            <button
              type="button"
              onClick={onTrackOrders}
              className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/50 transition-all duration-200 cursor-pointer"
            >
              Student Portal
            </button>
            {activeShop ? (
              <button
                type="button"
                onClick={onManageProducts}
                className="px-4 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all duration-200 cursor-pointer"
              >
                Go to Admin Panel
              </button>
            ) : (
              <a
                href="#install-section"
                className="px-4 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all duration-200 cursor-pointer text-center"
              >
                Install Shopify App
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Hero section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 flex flex-col justify-center gap-12 lg:gap-16">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Branding and Intro */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold uppercase tracking-wider animate-pulse">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              Shopify LMS Integration App
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Manage Courses &<br/> Enrollments <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Directly in Shopify</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl font-normal leading-relaxed">
              Upgrade your Shopify store into a fully functional course platform. Sync your customer records, link courses with products, and let merchants run training bootcamps with ease.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                type="button"
                onClick={onRegister}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/35 hover:shadow-indigo-500/45 transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                Student Registration
              </button>
              <button
                type="button"
                onClick={onLogin}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-100 font-bold text-sm rounded-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                Student Login
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Shopify App Installer Card */}
          <div id="install-section" className="lg:col-span-5">
            <div className="bg-slate-950/60 backdrop-blur-lg border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/15 transition-all duration-500"></div>
              
              <div className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Merchant Installation</h2>
                  <p className="text-sm text-slate-400">
                    Connect your Shopify store using the Client ID and Secret configured in the backend environment.
                  </p>
                </div>

                {/* Tabs to switch connection modes */}
                <div className="flex border-b border-slate-800 mb-4">
                  <button
                    type="button"
                    onClick={() => { setUseTokenConnect(false); setConnectError(null); }}
                    className={`flex-1 pb-2 text-xs font-bold uppercase tracking-wider transition-colors ${!useTokenConnect ? 'border-b-2 border-indigo-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Standard Install (OAuth)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUseTokenConnect(true); setConnectError(null); }}
                    className={`flex-1 pb-2 text-xs font-bold uppercase tracking-wider transition-colors ${useTokenConnect ? 'border-b-2 border-indigo-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Direct Token Connect
                  </button>
                </div>

                {connectError && (
                  <div className="bg-rose-950/40 border border-rose-800 rounded-xl p-3 text-xs text-rose-300">
                    {connectError}
                  </div>
                )}

                {!useTokenConnect ? (
                  /* Standard install form */
                  <form onSubmit={handleInstallClick} className="space-y-4">
                    <div>
                      <label htmlFor="shop-input" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Shopify Store Domain
                      </label>
                      <div className="relative">
                        <input
                          id="shop-input"
                          type="text"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                          placeholder="e.g. your-store.myshopify.com"
                          value={shopDomain}
                          onChange={(e) => setShopDomain(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Real OAuth vs Simulated Mode check */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">Use Real OAuth Flow</span>
                          <span className="text-[11px] text-slate-500">Requires app configuration in Shopify Partners Dashboard</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useRealOAuth}
                            onChange={(e) => setUseRealOAuth(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:shadow-emerald-400/30 transform hover:-translate-y-0.5 cursor-pointer text-center"
                    >
                      🚀 {useRealOAuth ? 'Authenticate App via Shopify' : 'Launch Simulated Admin Panel'}
                    </button>
                  </form>
                ) : (
                  /* Manual direct token connect form */
                  <form onSubmit={handleManualConnectSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="shop-input" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Shopify Store Domain
                      </label>
                      <input
                        id="shop-input"
                        type="text"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                        placeholder="e.g. your-store.myshopify.com"
                        value={shopDomain}
                        onChange={(e) => setShopDomain(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="token-input" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Shopify Admin API Access Token
                      </label>
                      <input
                        id="token-input"
                        type="password"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                        placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        required
                      />
                      <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                        Go to Shopify Settings &gt; App and sales channels &gt; Develop apps. Create a Custom App with <strong>read_products</strong> and <strong>write_customers, read_customers</strong> scopes, install it, and paste its API token here.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isConnecting}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:shadow-indigo-400/30 transform hover:-translate-y-0.5 cursor-pointer text-center disabled:opacity-50"
                    >
                      {isConnecting ? 'Connecting...' : '🔌 Verify & Connect Store'}
                    </button>
                  </form>
                )}

                <div className="pt-4 border-t border-slate-900 text-center text-xs text-slate-500">
                  {activeShop ? (
                    <p className="text-indigo-400 font-semibold">
                      Connected to shop: <code className="bg-indigo-950/40 px-1.5 py-0.5 rounded">{activeShop}</code>
                    </p>
                  ) : (
                    <p>Not currently connected to any shopify session</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature list section */}
        <div className="grid md:grid-cols-3 gap-6 pt-6">
          <div className="bg-slate-950/30 border border-slate-800/40 rounded-2xl p-6 hover:border-slate-800 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl text-indigo-400 mb-4">
              🛡️
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Shopify OAuth Auth</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Standard embedded Shopify authorization flow using App Bridge sessions and token persistence.
            </p>
          </div>
          <div className="bg-slate-950/30 border border-slate-800/40 rounded-2xl p-6 hover:border-slate-800 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl text-purple-400 mb-4">
              📦
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Shopify Products Link</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Query products from the Shopify Admin GraphQL API and bind them directly to training courses.
            </p>
          </div>
          <div className="bg-slate-950/30 border border-slate-800/40 rounded-2xl p-6 hover:border-slate-800 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl text-emerald-400 mb-4">
              👥
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Student Enrollments</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Prevent duplicate registrations with unique database constraints. Switch enrollment status cleanly.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Course Academy. Built with Shopify Polaris and Express SQLite backend.</p>
      </footer>
    </div>
  );
}