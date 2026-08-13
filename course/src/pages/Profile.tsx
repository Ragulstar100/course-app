import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Card, FormLayout, TextField, Button } from '@shopify/polaris';
import { Avatar, Dropdown, message } from 'antd';
import { UserOutlined, LogoutOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateProfile, logout } from '../store/authSlice';

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.studentName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setCourse(user.course || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    message.success('Logged out successfully.');
    navigate('/');
  };

  const handleSave = async () => {
    if (!name || !email) {
      message.error('Name and Email are required.');
      return;
    }

    const resultAction = await dispatch(
      updateProfile({
        studentName: name,
        email: email.trim(),
        phone: phone.trim(),
        course: course.trim(),
        bio: bio.trim(),
      })
    );

    if (updateProfile.fulfilled.match(resultAction)) {
      message.success('Profile updated successfully!');
    } else {
      message.error(resultAction.payload as string || 'Failed to update profile');
    }
  };

  const dropdownItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
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
    if (key === 'dashboard') {
      navigate('/dashboard');
    } else if (key === 'logout') {
      handleLogout();
    }
  };

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
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg cursor-pointer"
          >
            C
          </button>
          <span className="font-bold text-slate-800 text-lg tracking-tight">Course Academy</span>
        </div>

        <div className="flex items-center gap-6">
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

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full py-10 px-6">
        <Layout>
          {/* Header Action Row */}
          <Layout.Section>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </Button>
                <h2 className="text-2xl font-bold text-slate-900">Student Profile</h2>
              </div>
              <Button 
                variant="primary" 
                onClick={handleSave} 
                loading={loading}
              >
                Save Profile
              </Button>
            </div>
          </Layout.Section>

          {/* Profile Form Card */}
          <Layout.Section>
            <Card>
              <div className="p-6">
                <FormLayout>
                  <FormLayout.Group condensed>
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
                  </FormLayout.Group>
                  
                  <FormLayout.Group condensed>
                    <TextField
                      label="Phone Number"
                      value={phone}
                      onChange={(val) => setPhone(val)}
                      type="tel"
                      autoComplete="tel"
                      placeholder="+1 (555) 019-2834"
                    />
                    <TextField
                      label="Target Major / Course"
                      value={course}
                      onChange={(val) => setCourse(val)}
                      autoComplete="off"
                      placeholder="Full-Stack Engineering"
                    />
                  </FormLayout.Group>

                  <TextField
                    label="Biography"
                    value={bio}
                    onChange={(val) => setBio(val)}
                    multiline={4}
                    autoComplete="off"
                    placeholder="Tell us a little bit about yourself, your learning goals, and experience..."
                  />
                </FormLayout>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 mt-12">
        © {new Date().getFullYear()} Course Academy. All rights reserved.
      </footer>
    </div>
  );
}
