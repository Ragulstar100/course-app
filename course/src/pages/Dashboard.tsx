import { useNavigate } from 'react-router-dom';
import { Layout, Card, Button, Text, Grid } from '@shopify/polaris';
import { Avatar, Dropdown, message } from 'antd';
import { UserOutlined, LogoutOutlined, BookOutlined, CalendarOutlined, TrophyOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/authSlice';

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    message.success('Logged out successfully.');
    navigate('/');
  };

  const dropdownItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'profile') {
      navigate('/profile');
    } else if (key === 'logout') {
      handleLogout();
    }
  };

  // Fallback initials for Avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 h-16 px-8 flex justify-between items-center shadow-xs sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
            C
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">Course Academy</span>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-slate-600 hidden sm:inline">
            Welcome, <strong className="text-slate-900">{user?.studentName}</strong>
          </span>

          <Dropdown menu={{ items: dropdownItems, onClick: handleMenuClick }} trigger={['click']} placement="bottomRight">
            <a onClick={(e) => e.preventDefault()} className="cursor-pointer">
              <Avatar 
                size={40} 
                style={{ backgroundColor: '#1890ff', verticalAlign: 'middle', cursor: 'pointer' }}
                icon={<UserOutlined />}
              >
                {user?.studentName ? getInitials(user.studentName) : ''}
              </Avatar>
            </a>
          </Dropdown>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full py-10 px-6">
        <Layout>
          {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-md mb-6">
              <h2 className="text-3xl font-extrabold mb-2">Welcome Back, {user?.studentName}!</h2>
              <p className="text-blue-100 max-w-2xl text-sm leading-relaxed mb-4">
                Track your course assignments, explore new modules, and update your personal student profile.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => navigate('/profile')}>
                  Edit Profile
                </Button>
                <Button onClick={() => navigate('/')}>
                  Go to Welcome Page
                </Button>
              </div>
            </div>
          </Layout.Section>

          {/* Quick Metrics */}
          <Layout.Section>
            <Grid>
              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                <Card>
                  <div className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-xl border border-blue-100">
                      <BookOutlined />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Purchased Courses</p>
                      <h4 className="text-2xl font-bold text-slate-800 mt-1">0</h4>
                    </div>
                  </div>
                </Card>
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                <Card>
                  <div className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 text-xl border border-indigo-100">
                      <BookOutlined />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Enrolled Courses</p>
                      <h4 className="text-2xl font-bold text-slate-800 mt-1">{user?.course ? 1 : 0} Active</h4>
                    </div>
                  </div>
                </Card>
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                <Card>
                  <div className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 text-xl border border-emerald-100">
                      <TrophyOutlined />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Completed Modules</p>
                      <h4 className="text-2xl font-bold text-slate-800 mt-1">0 Modules</h4>
                    </div>
                  </div>
                </Card>
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                <Card>
                  <div className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 text-xl border border-purple-100">
                      <CalendarOutlined />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Member Since</p>
                      <h4 className="text-sm font-bold text-slate-800 mt-2">
                        {user?.createdDate ? new Date(user.createdDate).toLocaleDateString() : 'N/A'}
                      </h4>
                    </div>
                  </div>
                </Card>
              </Grid.Cell>
            </Grid>
          </Layout.Section>

          {/* Academic Profile Details */}
          <Layout.Section variant="oneThird">
            <Card>
              <div className="p-6">
                <Text as="h3" variant="headingMd">Student Details</Text>
                <div className="mt-4 space-y-3">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Registered Email</span>
                    <p className="text-sm text-slate-700 mt-0.5">{user?.email}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Contact Phone</span>
                    <p className="text-sm text-slate-700 mt-0.5">{user?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Target Major/Course</span>
                    <p className="text-sm text-slate-700 mt-0.5">{user?.course || 'Not declared'}</p>
                  </div>
                </div>
              </div>
            </Card>
          </Layout.Section>

          {/* Biography and Description */}
          <Layout.Section>
            <Card>
              <div className="p-6">
                <Text as="h3" variant="headingMd">Student Biography</Text>
                <p className="text-sm text-slate-500 mt-4 leading-relaxed italic">
                  {user?.bio || 'You haven\'t added a biography yet. Go to your Profile settings to write your bio and tell us about your goals.'}
                </p>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Course Academy. All rights reserved.
      </footer>
    </div>
  );
}
