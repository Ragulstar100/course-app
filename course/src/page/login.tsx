import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Alert, Typography, Space } from 'antd';
import { MailOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useStudent } from '../globalstate/student';

const { Title, Text, Link } = Typography;

export default function LoginPage() {
  const { loginStudent, loading, error } = useStudent();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onFinish = async () => {
    if (!email || !password) return;
    const success = await loginStudent({ email, password });
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f9fafb',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header branding */}
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ margin: '0 0 8px', fontSize: '28px', color: '#111827' }}>
              Course Academy
            </Title>
            <Text type="secondary">
              Unlock your potential with premium learning courses
            </Text>
          </div>

          <Card 
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              border: '1px solid #f0f0f0',
              background: '#ffffff'
            }}
            bodyStyle={{ padding: '32px' }}
          >
            <Title level={3} style={{ margin: '0 0 24px', fontSize: '20px', textAlign: 'center', color: '#111827' }}>
              Student Login
            </Title>
            
            {error && (
              <Alert 
                message={error} 
                type="error" 
                showIcon 
                style={{ marginBottom: '20px', borderRadius: '8px' }} 
              />
            )}

            <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
              <Form.Item 
                label="Email Address" 
                required
              >
                <Input 
                  prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} 
                  placeholder="e.g. alex@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ height: '40px', borderRadius: '6px' }}
                />
              </Form.Item>

              <Form.Item 
                label="Password" 
                required
              >
                <Input.Password 
                  prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ height: '40px', borderRadius: '6px' }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: '16px' }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block 
                  loading={loading}
                  size="large"
                  style={{ height: '42px', fontWeight: '600', borderRadius: '6px' }}
                >
                  Log In
                </Button>
              </Form.Item>
            </Form>

            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px', textAlign: 'center', fontSize: '13px' }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text type="secondary">
                  Don't have a student account?{' '}
                  <Link onClick={() => navigate('/register')} style={{ fontWeight: '500' }}>Register here</Link>
                </Text>
                <Text type="secondary">
                  Are you an administrator?{' '}
                  <Link onClick={() => navigate('/courses')} style={{ fontWeight: '500' }}>Manage Courses</Link>
                </Text>
              </Space>
            </div>
          </Card>

          {/* Back to Home Link */}
          <div style={{ textAlign: 'center' }}>
            <Link onClick={() => navigate('/')} style={{ color: '#8c8c8c' }}>
              <ArrowLeftOutlined style={{ marginRight: '6px' }} /> Back to welcome screen
            </Link>
          </div>
        </Space>
      </div>
    </div>
  );
}