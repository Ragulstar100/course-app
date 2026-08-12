import React, { useState, useCallback } from 'react';
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

interface LoginPageProps {
  onNavigateToRegister: () => void;
}

export default function LoginPage({ onNavigateToRegister }: LoginPageProps) {
  const { loginStudent, loading, error } = useStudent();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = useCallback(async () => {
    const success = await loginStudent({ email, password });
    if (success) {
      alert('Login successful!');
    }
  }, [email, password, loginStudent]);

  return (
    <Page narrowWidth title="Student Portal">
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h2">Log In to Your Account</Text>
          
          {error && <Banner tone="critical">{error}</Banner>}

          <Form onSubmit={handleSubmit}>
            <FormLayout>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(val) => setEmail(val)}
                autoComplete="email"
                required
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(val) => setPassword(val)}
                autoComplete="current-password"
                required
              />
              <Button submit variant="primary" loading={loading}>
                Log In
              </Button>
            </FormLayout>
          </Form>

          <Text variant="bodyMd" as="p">
            Don't have an account?{' '}
            <Link onClick={onNavigateToRegister}>Register here</Link>
          </Text>
        </BlockStack>
      </Card>
    </Page>
  );
}