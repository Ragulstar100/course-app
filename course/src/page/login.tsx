import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Page, 
  Card, 
  Form, 
  FormLayout, 
  TextField, 
  Button, 
  Banner, 
  BlockStack, 
  Text, 
  Link
} from '@shopify/polaris';
import { useStudent } from '../globalstate/student';

export default function LoginPage() {
  const { loginStudent, loading, error } = useStudent();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = useCallback(async () => {
    if (!email || !password) return;
    const success = await loginStudent({ email, password });
    if (success) {
      navigate('/dashboard');
    }
  }, [email, password, loginStudent, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f2f5 0%, #e2e8f0 100%)',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <Page narrowWidth>
          <BlockStack gap="600">
            {/* Header branding */}
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <Text variant="headingXl" as="h1" tone="base">
                Course Academy
              </Text>
              <Text variant="bodyMd" as="p" tone="subdued">
                Unlock your potential with premium learning courses
              </Text>
            </div>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingLg" as="h2">Student Login</Text>
                
                {error && (
                  <Banner tone="critical" title="Login failed">
                    <p>{error}</p>
                  </Banner>
                )}

                <Form onSubmit={handleSubmit}>
                  <FormLayout>
                    <TextField
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(val) => setEmail(val)}
                      autoComplete="email"
                      requiredIndicator
                      placeholder="e.g. alex@example.com"
                    />
                    <TextField
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(val) => setPassword(val)}
                      autoComplete="current-password"
                      requiredIndicator
                      placeholder="••••••••"
                    />
                    <Button submit variant="primary" loading={loading} fullWidth size="large">
                      Log In
                    </Button>
                  </FormLayout>
                </Form>

                <div style={{ borderTop: '1px solid #e1e3e5', paddingTop: '16px' }}>
                  <BlockStack gap="200" align="center">
                    <Text variant="bodyMd" as="p" tone="subdued">
                      Don't have a student account?{' '}
                      <Link onClick={() => navigate('/register')}>Register here</Link>
                    </Text>
                    <Text variant="bodyMd" as="p" tone="subdued">
                      Are you an administrator?{' '}
                      <Link onClick={() => navigate('/courses')}>Manage Courses</Link>
                    </Text>
                  </BlockStack>
                </div>
              </BlockStack>
            </Card>

            {/* Back to Home Link */}
            <div style={{ textAlign: 'center' }}>
              <Link onClick={() => navigate('/')}>← Back to welcome screen</Link>
            </div>
          </BlockStack>
        </Page>
      </div>
    </div>
  );
}