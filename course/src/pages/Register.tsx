import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, FormLayout, TextField, Button } from '@shopify/polaris';
import { message } from 'antd';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { registerUser } from '../store/authSlice';

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      message.error('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      message.error('Passwords do not match.');
      return;
    }

    const resultAction = await dispatch(registerUser({ 
      studentName: name, 
      email: email.trim(), 
      password 
    }));

    if (registerUser.rejected.match(resultAction)) {
      const errMsg = resultAction.payload as string;
      if (errMsg === 'EMAIL_ALREADY_EXISTS' || (errMsg && errMsg.includes('already registered'))) {
        message.warning('Email is already registered. Redirecting you to login page...');
        setTimeout(() => {
          navigate('/login', { state: { email: email.trim() } });
        }, 1500);
      } else {
        message.error(errMsg || 'Registration failed');
      }
    } else {
      message.success('Student registered successfully!');
      setTimeout(() => {
        // Go to login page, passing the email and password so it can autofill
        navigate('/login', { state: { email: email.trim(), password } });
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Student Account
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/login')} 
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none cursor-pointer"
            >
              Sign in
            </button>
          </p>
        </div>

        <Card>
          <div className="p-6">
            <FormLayout>
              <TextField
                label="Full Name"
                value={name}
                onChange={(val) => setName(val)}
                autoComplete="name"
                placeholder="Ragul Son"
              />
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
                autoComplete="new-password"
                placeholder="••••••"
              />
              <TextField
                label="Confirm Password"
                value={confirmPassword}
                onChange={(val) => setConfirmPassword(val)}
                type="password"
                autoComplete="new-password"
                placeholder="••••••"
              />
              
              <div className="mt-4">
                <Button 
                  variant="primary" 
                  fullWidth 
                  onClick={handleSubmit} 
                  loading={loading}
                >
                  Register
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
