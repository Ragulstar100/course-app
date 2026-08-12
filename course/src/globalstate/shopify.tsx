import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
}

export interface ShopifyCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ShopifyContextType {
  shop: string | null;
  token: string | null;
  shopName: string;
  shopEmail: string;
  products: ShopifyProduct[];
  customers: ShopifyCustomer[];
  loading: boolean;
  error: string | null;
  authenticateAdmin: (shopDomain: string, simulate?: boolean) => void;
  fetchShopDetails: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchCustomers: () => Promise<void>;
  connectManually: (shopDomain: string, adminToken: string, name: string, email: string) => void;
  logoutAdmin: () => void;
}

const ShopifyContext = createContext<ShopifyContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:1000/shopify';

export const ShopifyProvider = ({ children }: { children: ReactNode }) => {
  const [shop, setShop] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string>('Shopify Academy');
  const [shopEmail, setShopEmail] = useState<string>('');
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [customers, setCustomers] = useState<ShopifyCustomer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize: load shop and token from URL query params, falling back to localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlShop = urlParams.get('shop');
    const urlToken = urlParams.get('token');

    if (urlShop && urlToken) {
      setShop(urlShop);
      setToken(urlToken);
      localStorage.setItem('shopify_shop', urlShop);
      localStorage.setItem('shopify_token', urlToken);
      
      // Clean query parameters from URL for a cleaner look
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const savedShop = localStorage.getItem('shopify_shop');
      const savedToken = localStorage.getItem('shopify_token');
      if (savedShop && savedToken) {
        setShop(savedShop);
        setToken(savedToken);
      }
    }
  }, []);

  // Fetch shop metadata
  const fetchShopDetails = async () => {
    if (!shop || !token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/shop`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Shop-Domain': shop,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch shop details');
      const data = await response.json();
      setShopName(data.name || 'Shopify Store');
      setShopEmail(data.email || '');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch store metadata');
    } finally {
      setLoading(false);
    }
  };

  // Fetch linkable products
  const fetchProducts = async () => {
    if (!shop || !token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Shop-Domain': shop,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load Shopify products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch installable customers
  const fetchCustomers = async () => {
    if (!shop || !token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/customers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Shop-Domain': shop,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomers(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load Shopify customers');
    } finally {
      setLoading(false);
    }
  };

  // Trigger installation/auth flow
  const authenticateAdmin = (shopDomain: string, simulate = true) => {
    let authUrl = `http://localhost:1000/shopify/auth?shop=${encodeURIComponent(shopDomain)}`;
    if (simulate) {
      authUrl += '&simulated=true';
    }
    // Redirect browser to backend Auth URL
    window.location.href = authUrl;
  };

  const connectManually = (shopDomain: string, adminToken: string, name: string, email: string) => {
    setShop(shopDomain);
    setToken(adminToken);
    setShopName(name);
    setShopEmail(email);
    localStorage.setItem('shopify_shop', shopDomain);
    localStorage.setItem('shopify_token', adminToken);
  };

  const logoutAdmin = () => {
    setShop(null);
    setToken(null);
    setShopName('Shopify Academy');
    setShopEmail('');
    setProducts([]);
    setCustomers([]);
    localStorage.removeItem('shopify_shop');
    localStorage.removeItem('shopify_token');
  };

  // Load basic details automatically once authenticated
  useEffect(() => {
    if (shop && token) {
      fetchShopDetails();
      fetchProducts();
      fetchCustomers();
    }
  }, [shop, token]);

  return (
    <ShopifyContext.Provider
      value={{
        shop,
        token,
        shopName,
        shopEmail,
        products,
        customers,
        loading,
        error,
        authenticateAdmin,
        fetchShopDetails,
        fetchProducts,
        fetchCustomers,
        connectManually,
        logoutAdmin,
      }}
    >
      {children}
    </ShopifyContext.Provider>
  );
};

export const useShopify = () => {
  const context = useContext(ShopifyContext);
  if (!context) {
    throw new Error('useShopify must be used within a ShopifyProvider');
  }
  return context;
};
