import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, FormLayout, TextField, Button } from '@shopify/polaris';
import { message, Alert } from 'antd';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, clearError } from '../store/authSlice';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginAttempted, setLoginAttempted] = useState(false);

  // Autofill if coming from Register page
  useEffect(() => {
    dispatch(clearError());
    if (location.state) {
      const state = location.state as { email?: string; password?: string };
      if (state.email) setEmail(state.email);
      if (state.password) setPassword(state.password);
    }
  }, [location.state, dispatch]);

  const handleSubmit = async () => {
    if (!email || !password) {
      message.error('Please enter both email and password.');
      return;
    }

    setLoginAttempted(true);
    const resultAction = await dispatch(loginUser({ email: email.trim(), password }));

    if (loginUser.fulfilled.match(resultAction)) {
      message.success('Login successful!');
      navigate('/dashboard');
    } else {
      const errMsg = resultAction.payload as string || 'Login failed';
      // Show an Ant Design error alert/message
      message.error({
        content: `Error: ${errMsg}`,
        duration: 4
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Portal Login
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Don't have an account?{' '}
            <button 
              onClick={() => navigate('/register')} 
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none cursor-pointer"
            >
              Register here
            </button>
          </p>
        </div>

        {error && loginAttempted && (
          <div className="mb-4">
            <Alert
              message="Authentication Error"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => dispatch(clearError())}
            />
          </div>
        )}

        <Card>
          <div className="p-6">
            <FormLayout>
              <TextField
                label="Email Address"
                value={email}
                onChange={(val) => setEmail(val)}
                type="email"
                autoComplete="email"
                placeholder="ragulson200@gmail.com"
              />
              <TextField
                label="Password"
                value={password}
                onChange={(val) => setPassword(val)}
                type="password"
                autoComplete="current-password"
                placeholder="••••••"
              />
              
              <div className="mt-4">
                <Button 
                  variant="primary" 
                  fullWidth 
                  onClick={handleSubmit} 
                  loading={loading}
                >
                  Sign In
                </Button>
              </div>
            </FormLayout>
          </div>
        </Card>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
