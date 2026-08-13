import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Card, Button, Text } from '@shopify/polaris';
import { Alert, message, Badge, Space } from 'antd';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { checkServerStatus, logout } from '../store/authSlice';

export default function Welcome() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, serverOnline, checkingServer } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check backend server status
    dispatch(checkServerStatus()).then((result) => {
      const isOnline = result.payload as boolean;
      if (!isOnline) {
        message.error({
          content: 'Server is offline. Running in Mock Offline Mode.',
          duration: 4,
          style: { marginTop: '20px' }
        });
      } else {
        message.success({
          content: 'Server is online. Connected to cource-api.',
          duration: 3,
          style: { marginTop: '20px' }
        });
      }
    });
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    message.success('Logged out successfully.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Header Banner for Server Status */}
      <div className="bg-white border-b border-slate-200 py-3 px-6 flex justify-between items-center shadow-xs">
        <Space size="middle">
          <span className="text-sm font-medium text-slate-600">Backend Status:</span>
          {checkingServer ? (
            <Badge status="processing" text="Checking Server..." />
          ) : serverOnline ? (
            <Badge status="success" text="Online (cource-api connected)" />
          ) : (
            <Badge status="error" text="Offline (Mock Mode active)" />
          )}
        </Space>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full py-12 px-6">
        <Layout>
          {/* Main Hero Section */}
          <Layout.Section>
            <div className="text-center py-10">
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-4 font-sans">
                Welcome to Course Academy
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">
                Empower your journey with industry-leading courses. Learn development, design, and business strategies directly from absolute professionals.
              </p>
              
              {!serverOnline && (
                <div className="max-w-xl mx-auto mb-8">
                  <Alert
                    message="Server is Offline"
                    description="The course-api server is currently offline. You can still test the entire application registration, login, profile, and logout flow using the Mock Offline Database."
                    type="warning"
                    showIcon
                    className="text-left"
                  />
                </div>
              )}

              <div className="flex gap-4 justify-center">
                {user ? (
                  <>
                    {user.isAdmin ? (
                      <Button variant="primary" size="large" onClick={() => navigate('/admin-dashboard')}>
                        Go to Admin Dashboard
                      </Button>
                    ) : (
                      <Button variant="primary" size="large" onClick={() => navigate('/dashboard')}>
                        Go to Student Dashboard
                      </Button>
                    )}
                    <Button size="large" onClick={handleLogout}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="primary" size="large" onClick={() => navigate('/register')}>
                      Register Now
                    </Button>
                    <Button size="large" onClick={() => navigate('/login')}>
                      Student Login
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Layout.Section>

          {/* Featured Sections */}
          <Layout.Section variant="oneThird">
            <Card>
              <div className="p-4">
                <div className="text-3xl mb-3">🚀</div>
                <Text as="h2" variant="headingMd">Modern Tech Stack</Text>
                <div className="mt-2 text-sm text-slate-500">
                  Learn Vite, React, Redux Toolkit, Shopify Polaris, and SQLite backends with modern typescript practices.
                </div>
              </div>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <div className="p-4">
                <div className="text-3xl mb-3">🛠️</div>
                <Text as="h2" variant="headingMd">Hands-on Sandbox</Text>
                <div className="mt-2 text-sm text-slate-500">
                  Test actual code blocks and database routes with comprehensive front-to-back integration logic.
                </div>
              </div>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <div className="p-4">
                <div className="text-3xl mb-3">🎓</div>
                <Text as="h2" variant="headingMd">Student Dashboard</Text>
                <div className="mt-2 text-sm text-slate-500">
                  Access student profile reading/updating, enrollments trackers, course directory, and direct logout hooks.
                </div>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Course Academy. Built with Shopify Polaris, Redux, and Ant Design.
      </footer>
    </div>
  );
}
