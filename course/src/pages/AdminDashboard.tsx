import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Card, Grid } from '@shopify/polaris';
import { Table, Tag, Avatar, Dropdown, message, Badge, Space } from 'antd';
import { UserOutlined, LogoutOutlined, TeamOutlined, CheckCircleOutlined, ShopOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/authSlice';
import { api } from '../services/api';

interface Student {
  id: string;
  studentName: string;
  email: string;
  studentStatus: 'Active' | 'Inactive';
  createdDate: string;
  shopifyCustomerId?: string | null;
  shop: string;
  phone?: string;
  course?: string;
  bio?: string;
}

const MOCK_STUDENT_DB_KEY = 'mock_student_db';

const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'student-1',
    studentName: 'Ragul Star',
    email: 'ragulstar100@gmail.com',
    studentStatus: 'Active',
    phone: '+91 98765 43210',
    course: 'Development',
    bio: 'Passionate learner focused on building high-performance Shopify apps with Vite, React, Polaris, and Node.js.',
    createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    shop: 'quickstart-shop.myshopify.com'
  },
  {
    id: 'student-2',
    studentName: 'Alice Johnson',
    email: 'alice.j@example.com',
    studentStatus: 'Active',
    phone: '+1 555-0143',
    course: 'Design',
    bio: 'UI/UX specialist diving deep into typography, interactive mockups, and modular component design systems.',
    createdDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    shop: 'quickstart-shop.myshopify.com'
  },
  {
    id: 'student-3',
    studentName: 'Michael Brown',
    email: 'michael.brown@example.com',
    studentStatus: 'Inactive',
    phone: 'Not provided',
    course: 'Marketing',
    bio: 'Growth hacker analyzing search optimization methodologies, keyword tracking, and conversions auditing.',
    createdDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    shop: 'partner-development-shop.myshopify.com'
  }
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, serverOnline } = useAppSelector((state) => state.auth);

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  // Load students
  const loadStudents = async () => {
    setLoading(true);
    if (serverOnline && user?.token) {
      try {
        const data = await api.getStudents(user.token);
        setStudents(data);
      } catch (err) {
        message.error('Failed to load students from backend. Falling back to local db.');
        loadLocalStudents();
      } finally {
        setLoading(false);
      }
    } else {
      loadLocalStudents();
      setLoading(false);
    }
  };

  const loadLocalStudents = () => {
    const localDb = localStorage.getItem(MOCK_STUDENT_DB_KEY);
    if (localDb) {
      setStudents(JSON.parse(localDb));
    } else {
      localStorage.setItem(MOCK_STUDENT_DB_KEY, JSON.stringify(DEFAULT_STUDENTS));
      setStudents(DEFAULT_STUDENTS);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [serverOnline, user]);

  const handleLogout = () => {
    dispatch(logout());
    message.success('Logged out successfully.');
    navigate('/');
  };

  // Ant Design Table Columns for Students
  const columns = [
    {
      title: 'Student Name',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (text: string) => (
        <Space size="middle">
          <Avatar 
            style={{ backgroundColor: '#4f46e5', verticalAlign: 'middle' }}
            icon={<UserOutlined />}
          />
          <strong className="text-slate-800 font-semibold">{text}</strong>
        </Space>
      ),
    },
    {
      title: 'Email Address',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => <span className="text-slate-600 font-mono text-xs">{email}</span>,
    },
    {
      title: 'Target Major / Course',
      dataIndex: 'course',
      key: 'course',
      render: (course: string) => course ? <Tag color="blue">{course}</Tag> : <span className="text-slate-400 italic text-xs">Not declared</span>,
    },
    {
      title: 'Phone Number',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => <span className="text-slate-600">{phone || 'Not provided'}</span>,
    },
    {
      title: 'Shopify Store',
      dataIndex: 'shop',
      key: 'shop',
      render: (shop: string) => (
        <Space size="small">
          <ShopOutlined className="text-slate-400" />
          <span className="text-xs text-slate-500 font-mono">{shop}</span>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'studentStatus',
      key: 'studentStatus',
      render: (status: string) => (
        <Badge 
          status={status === 'Active' ? 'success' : 'default'} 
          text={<span className="text-xs">{status}</span>} 
        />
      ),
    },
    {
      title: 'Joined Date',
      dataIndex: 'createdDate',
      key: 'createdDate',
      render: (dateStr: string) => {
        try {
          return <span className="text-xs text-slate-500">{new Date(dateStr).toLocaleDateString()}</span>;
        } catch {
          return <span className="text-xs text-slate-500">N/A</span>;
        }
      },
    },
  ];

  const dropdownItems = [
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  // Metrics Calculations
  const totalStudents = students.length;
  const activeStudentsCount = students.filter(s => s.studentStatus === 'Active').length;
  const linkedShopifyCount = students.filter(s => s.shopifyCustomerId || s.shop).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 h-16 px-8 flex justify-between items-center shadow-xs sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">Admin Console</span>
          {serverOnline ? (
            <Tag color="success" className="ml-2">Live API</Tag>
          ) : (
            <Tag color="warning" className="ml-2">Mock Offline</Tag>
          )}
        </div>

        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-slate-600 hidden sm:inline">
            Administrator: <strong className="text-slate-900">{user?.studentName}</strong>
          </span>

          <Dropdown menu={{ items: dropdownItems }} trigger={['click']} placement="bottomRight">
            <a onClick={(e) => e.preventDefault()} className="cursor-pointer">
              <Avatar 
                size={40} 
                style={{ backgroundColor: '#87d068', verticalAlign: 'middle', cursor: 'pointer' }}
                icon={<UserOutlined />}
              />
            </a>
          </Dropdown>
        </div>
      </header>

      {/* Main Admin Section */}
      <main className="flex-1 max-w-6xl mx-auto w-full py-10 px-6">
        <Layout>
          {/* Header Action Title */}
          <Layout.Section>
            <div className="mb-6">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Directory</h2>
              <p className="text-sm text-slate-500 mt-1">Review student profiles, system registration details, and target course modules.</p>
            </div>
          </Layout.Section>

          {/* Quick Metrics Grid */}
          <Layout.Section>
            <Grid>
              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4 }}>
                <Card>
                  <div className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 text-xl border border-indigo-100">
                      <TeamOutlined />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Registered</p>
                      <h4 className="text-2xl font-bold text-slate-800 mt-1">{totalStudents} Students</h4>
                    </div>
                  </div>
                </Card>
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4 }}>
                <Card>
                  <div className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 text-xl border border-emerald-100">
                      <CheckCircleOutlined />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Status</p>
                      <h4 className="text-2xl font-bold text-slate-800 mt-1">{activeStudentsCount} Active</h4>
                    </div>
                  </div>
                </Card>
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4 }}>
                <Card>
                  <div className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 text-xl border border-amber-100">
                      <ShopOutlined />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Linked to Shopify</p>
                      <h4 className="text-2xl font-bold text-slate-800 mt-1">{linkedShopifyCount} Shops</h4>
                    </div>
                  </div>
                </Card>
              </Grid.Cell>
            </Grid>
          </Layout.Section>

          {/* Students Directory Table Card */}
          <Layout.Section>
            <Card>
              <div className="p-2">
                <Table 
                  columns={columns} 
                  dataSource={students} 
                  rowKey="id" 
                  loading={loading}
                  pagination={{ pageSize: 8 }}
                  expandable={{
                    expandedRowRender: (record) => (
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Student Biography</p>
                        <p className="text-sm text-slate-600 italic">
                          "{record.bio || 'This student has not updated their biography yet.'}"
                        </p>
                      </div>
                    ),
                    rowExpandable: () => true,
                  }}
                />
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 mt-12">
        © {new Date().getFullYear()} Course Academy. Admin Console.
      </footer>
    </div>
  );
}
