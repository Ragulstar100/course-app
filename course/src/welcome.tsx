import React, { useState } from 'react';
import { useShopify } from './globalstate/shopify';
import { 
  Layout, 
  Typography, 
  Button, 
  Card, 
  Tabs, 
  Form, 
  Input, 
  Switch, 
  Alert, 
  Row, 
  Col, 
  Space,
  Badge
} from 'antd';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

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
  const [accessToken, setAccessToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const handleInstallClick = () => {
    if (!shopDomain) {
      alert('Please enter a valid shop domain');
      return;
    }
    authenticateAdmin(shopDomain, !useRealOAuth);
  };

  const handleManualConnectSubmit = async () => {
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
    <Layout style={{ minHeight: '100vh', background: '#ffffff' }}>
      <Header style={{ 
        background: '#ffffff', 
        borderBottom: '1px solid #f0f0f0', 
        padding: '0 40px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        height: '70px',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(24, 144, 255, 0.2)'
          }}>
            <span style={{ fontSize: '20px' }}>🎓</span>
          </div>
          <Text strong style={{ fontSize: '18px', letterSpacing: '-0.3px', color: '#111827' }}>
            Course Academy
          </Text>
        </div>

        <Space size="middle">
          <Button 
            type="text" 
            onClick={onTrackOrders}
            style={{ fontWeight: '500' }}
          >
            Student Portal
          </Button>
          {activeShop ? (
            <Button 
              type="primary" 
              onClick={onManageProducts}
              style={{ fontWeight: '600' }}
            >
              Go to Admin Panel
            </Button>
          ) : (
            <Button 
              type="primary" 
              href="#install-section"
              style={{ fontWeight: '600' }}
            >
              Install Shopify App
            </Button>
          )}
        </Space>
      </Header>

      <Content style={{ padding: '60px 40px', background: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row gutter={[48, 48]} align="middle">
            {/* Left Info Column */}
            <Col xs={24} lg={14}>
              <Space direction="vertical" size="large" style={{ display: 'flex' }}>
                <Space>
                  <span style={{
                    background: 'rgba(24, 144, 255, 0.08)',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    border: '1px solid rgba(24, 144, 255, 0.2)',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}>
                    <Badge status="processing" style={{ marginRight: '8px' }} />
                    <Text strong style={{ color: '#1890ff', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>
                      Shopify LMS Integration App
                    </Text>
                  </span>
                </Space>
                <Title level={1} style={{ fontSize: '48px', margin: 0, lineHeight: 1.15, color: '#111827' }}>
                  Manage Courses &<br/> Enrollments <span style={{ background: 'linear-gradient(90deg, #1890ff 0%, #722ed1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Directly in Shopify</span>
                </Title>
                <Paragraph style={{ fontSize: '16px', color: '#595959', maxWidth: '560px', margin: 0, lineHeight: 1.6 }}>
                  Upgrade your Shopify store into a fully functional course platform. Sync your customer records, link courses with products, and let merchants run training bootcamps with ease.
                </Paragraph>
                <Space size="middle" style={{ marginTop: '16px' }}>
                  <Button 
                    type="primary" 
                    size="large" 
                    onClick={onRegister}
                    style={{ height: '48px', padding: '0 24px', fontWeight: '600', borderRadius: '8px' }}
                  >
                    Student Registration
                  </Button>
                  <Button 
                    size="large" 
                    onClick={onLogin}
                    style={{ height: '48px', padding: '0 24px', fontWeight: '600', borderRadius: '8px' }}
                  >
                    Student Login
                  </Button>
                </Space>
              </Space>
            </Col>

            {/* Right Install Column */}
            <Col xs={24} lg={10} id="install-section">
              <Card 
                style={{ 
                  borderRadius: '16px', 
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #f0f0f0',
                  background: '#ffffff'
                }}
                bodyStyle={{ padding: '32px' }}
              >
                <Title level={3} style={{ marginTop: 0, marginBottom: '8px', fontSize: '22px', color: '#111827' }}>
                  Merchant Installation
                </Title>
                <Paragraph style={{ color: '#8c8c8c', fontSize: '13px', marginBottom: '24px' }}>
                  Connect your Shopify store using the Client ID and Secret configured in the backend environment.
                </Paragraph>

                {connectError && (
                  <Alert 
                    message={connectError} 
                    type="error" 
                    showIcon 
                    style={{ marginBottom: '20px', borderRadius: '8px' }} 
                  />
                )}

                <Tabs defaultActiveKey="1" style={{ marginBottom: '16px' }}>
                  <Tabs.TabPane tab="Standard Install (OAuth)" key="1">
                    <Form layout="vertical" onFinish={handleInstallClick}>
                      <Form.Item label="Shopify Store Domain" required>
                        <Input 
                          placeholder="e.g. your-store.myshopify.com" 
                          value={shopDomain}
                          onChange={(e) => setShopDomain(e.target.value)}
                          style={{ height: '40px', borderRadius: '6px' }}
                        />
                      </Form.Item>
                      
                      <div style={{ 
                        background: '#fafafa', 
                        padding: '16px', 
                        borderRadius: '8px', 
                        marginBottom: '20px',
                        border: '1px solid #f0f0f0' 
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <Text strong style={{ fontSize: '13px', display: 'block', color: '#111827' }}>Use Real OAuth Flow</Text>
                            <Text type="secondary" style={{ fontSize: '11px' }}>Requires app configuration in Shopify Partners</Text>
                          </div>
                          <Switch checked={useRealOAuth} onChange={(val) => setUseRealOAuth(val)} />
                        </div>
                      </div>

                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        block 
                        size="large"
                        style={{ height: '44px', fontWeight: '600', borderRadius: '6px' }}
                      >
                        🚀 {useRealOAuth ? 'Authenticate App via Shopify' : 'Launch Simulated Admin Panel'}
                      </Button>
                    </Form>
                  </Tabs.TabPane>
                  
                  <Tabs.TabPane tab="Direct Token Connect" key="2">
                    <Form layout="vertical" onFinish={handleManualConnectSubmit}>
                      <Form.Item label="Shopify Store Domain" required>
                        <Input 
                          placeholder="e.g. your-store.myshopify.com" 
                          value={shopDomain}
                          onChange={(e) => setShopDomain(e.target.value)}
                          style={{ height: '40px', borderRadius: '6px' }}
                        />
                      </Form.Item>

                      <Form.Item label="Shopify Admin API Access Token" required>
                        <Input.Password 
                          placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx" 
                          value={accessToken}
                          onChange={(e) => setAccessToken(e.target.value)}
                          style={{ height: '40px', borderRadius: '6px' }}
                        />
                      </Form.Item>
                      
                      <Paragraph type="secondary" style={{ fontSize: '11px', lineHeight: 1.4, marginBottom: '20px' }}>
                        Go to Shopify Settings &gt; App and sales channels &gt; Develop apps. Create a Custom App with <strong>read_products</strong> and <strong>write_customers, read_customers</strong> scopes, install it, and paste its API token here.
                      </Paragraph>

                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        block 
                        size="large"
                        loading={isConnecting}
                        style={{ height: '44px', fontWeight: '600', borderRadius: '6px' }}
                      >
                        🔌 Verify & Connect Store
                      </Button>
                    </Form>
                  </Tabs.TabPane>
                </Tabs>

                <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px solid #f5f5f5', fontSize: '12px' }}>
                  {activeShop ? (
                    <Text type="success" strong>
                      Connected to shop: <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px', fontStyle: 'normal' }}>{activeShop}</code>
                    </Text>
                  ) : (
                    <Text type="secondary">Not connected to any Shopify session</Text>
                  )}
                </div>
              </Card>
            </Col>
          </Row>

          {/* Marketing boxes */}
          <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid #f0f0f0' }}>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <Card bordered={false} style={{ background: '#fafafa', borderRadius: '12px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '12px' }}>🛡️</div>
                  <Title level={4} style={{ marginTop: 0, color: '#111827' }}>Shopify OAuth</Title>
                  <Paragraph type="secondary" style={{ fontSize: '13px', margin: 0 }}>
                    Standard embedded Shopify authorization flow using App Bridge sessions and token persistence.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card bordered={false} style={{ background: '#fafafa', borderRadius: '12px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '12px' }}>📦</div>
                  <Title level={4} style={{ marginTop: 0, color: '#111827' }}>Products Link</Title>
                  <Paragraph type="secondary" style={{ fontSize: '13px', margin: 0 }}>
                    Query products from the Shopify Admin GraphQL API and bind them directly to training courses.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card bordered={false} style={{ background: '#fafafa', borderRadius: '12px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '12px' }}>👥</div>
                  <Title level={4} style={{ marginTop: 0, color: '#111827' }}>Student Enrollments</Title>
                  <Paragraph type="secondary" style={{ fontSize: '13px', margin: 0 }}>
                    Prevent duplicate registrations with unique database constraints. Switch enrollment status cleanly.
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </Content>

      <Footer style={{ 
        textAlign: 'center', 
        background: '#fafafa', 
        borderTop: '1px solid #f0f0f0', 
        color: '#8c8c8c',
        padding: '24px 0',
        fontSize: '12px'
      }}>
        &copy; {new Date().getFullYear()} Course Academy. Built with Ant Design and Express SQLite backend.
      </Footer>
    </Layout>
  );
}