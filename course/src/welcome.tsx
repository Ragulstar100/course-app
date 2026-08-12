import React from "react";

type WelcomePageProps = {
  onRegister?: () => void;
  onLogin?: () => void;
  onManageProducts?: () => void;
  onTrackOrders?: () => void;
  onViewAnalytics?: () => void;
  onLearnMore?: () => void;
};

export default function WelcomePage({
  onRegister,
  onLogin,
  onManageProducts,
  onTrackOrders,
  onViewAnalytics,
  onLearnMore,
}: WelcomePageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-gray-950">Store Assistant</span>
          </div>

          <nav className="flex items-center gap-3">
            <button
              type="button"
              onClick={onManageProducts}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-950 hover:bg-gray-100 rounded-md transition-colors"
            >
              Manage products
            </button>
            <button
              type="button"
              onClick={onTrackOrders}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-950 hover:bg-gray-100 rounded-md transition-colors"
            >
              Track orders
            </button>
            <button
              type="button"
              onClick={onViewAnalytics}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-950 hover:bg-gray-100 rounded-md transition-colors"
            >
              Store analytics
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 space-y-8 flex flex-col justify-center">
        {/* Welcome Section - Centered */}
        <div className="bg-white border border-gray-200 rounded-xl p-10 shadow-sm text-center max-w-2xl mx-auto w-full space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome to Store Assistant
            </h1>
            <p className="text-base text-gray-500 max-w-lg mx-auto">
              Manage your Shopify store more efficiently with powerful tools
              designed to simplify your daily workflow.
            </p>
          </div>

          {/* Register & Login Buttons (Centered) */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={onRegister}
              className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              Register
            </button>

            <button
              type="button"
              onClick={onLogin}
              className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm border border-gray-300 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              Login
            </button>
          </div>
        </div>

        {/* Banner Section */}
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex gap-3 text-emerald-900">
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold text-emerald-900">
                Your store is ready to go
              </h3>
              <p className="text-sm text-emerald-700">
                Connect your store data and start managing products, orders, and
                customers from one place.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}