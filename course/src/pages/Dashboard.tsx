import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Card, Button, Text, Grid } from '@shopify/polaris';
import { Avatar, Dropdown, message, Tag } from 'antd';
import { UserOutlined, LogoutOutlined, BookOutlined, CalendarOutlined, TrophyOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/authSlice';
import { api } from '../services/api';

interface Course {
  id: string;
  courseTitle: string;
  description: string;
  instructorName: string;
  category: string;
  duration: string;
  courseStatus: 'Active' | 'Inactive';
  createdDate: string;
  shop: string;
}

const DEFAULT_COURSES: Course[] = [
  {
    id: 'course-1',
    courseTitle: 'Introduction to React & Redux',
    description: 'Learn the core concepts of React components, state, hooks, and Redux Toolkit slices.',
    instructorName: 'Ragul Son',
    category: 'Development',
    duration: '8 hours',
    courseStatus: 'Active',
    createdDate: new Date().toISOString(),
    shop: 'quickstart-shop.myshopify.com'
  },
  {
    id: 'course-2',
    courseTitle: 'Shopify App Development',
    description: 'Master Shopify App Bridge, Polaris UI, SQLite integrations, and webhooks.',
    instructorName: 'Jane Doe',
    category: 'Development',
    duration: '14 hours',
    courseStatus: 'Active',
    createdDate: new Date().toISOString(),
    shop: 'quickstart-shop.myshopify.com'
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, serverOnline } = useAppSelector((state) => state.auth);

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      // Fetch courses from server
      const coursesData = await api.getCourses();
      const activeServerCourses = coursesData.filter(c => c.courseStatus === 'Active');
      
      // Always include DEFAULT_COURSES to ensure they show up in dev/production
      const merged = [...activeServerCourses];
      DEFAULT_COURSES.forEach(defCourse => {
        if (!merged.some(c => c.id === defCourse.id)) {
          merged.push(defCourse);
        }
      });
      setCourses(merged);

      // Fetch enrollments from server
      const enrollmentData = await api.getStudentEnrollments(user.token);
      setEnrolledCourseIds(enrollmentData.map((e: any) => e.courseId));
    } catch (err: any) {
      console.error('Error loading student dashboard data:', err);
      message.error('Failed to load courses or enrollment data from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [serverOnline, user]);

  const handlePurchase = async (courseId: string) => {
    if (!user?.token) {
      message.error('You must be logged in to purchase a course.');
      return;
    }

    try {
      await api.enrollInCourse(user.token, courseId);
      message.success('Course purchased successfully!');
      loadData();
    } catch (err: any) {
      message.error(err.message || 'Purchase failed.');
    }
  };

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

  const scrollToCatalog = () => {
    const catalogElement = document.getElementById('courses-catalog');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 h-16 px-8 flex justify-between items-center shadow-xs sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold text-lg">
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
                style={{ backgroundColor: '#475569', verticalAlign: 'middle', cursor: 'pointer' }}
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
          <Layout.Section>
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-slate-800 shadow-sm mb-6">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome Back, {user?.studentName}!</h2>
              <p className="text-slate-500 max-w-2xl text-sm leading-relaxed mb-4">
                Track your course assignments, explore new modules, and update your personal student profile.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => navigate('/profile')}>
                  Edit Profile
                </Button>
                <Button variant="primary" onClick={scrollToCatalog}>
                  Enroll in Courses
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
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 text-xl border border-slate-100">
                      <BookOutlined />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Purchased Courses</p>
                      <h4 className="text-2xl font-bold text-slate-800 mt-1">{enrolledCourseIds.length}</h4>
                    </div>
                  </div>
                </Card>
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                <Card>
                  <div className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 text-xl border border-slate-100">
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

          {/* Courses Directory / Available Courses */}
          <Layout.Section>
            <div id="courses-catalog">
              <Card>
                <div className="p-6">
                  <Text as="h3" variant="headingMd">Available Courses Catalog</Text>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Click "Purchase" on any course below to instantly purchase it.</p>
                  
                  {loading ? (
                    <div className="text-center py-6 text-slate-400">Loading courses...</div>
                  ) : courses.length === 0 ? (
                    <div className="text-center py-6 text-slate-400">No active courses available at this moment.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      {courses.map((course) => {
                        const isPurchased = enrolledCourseIds.includes(course.id);
                        return (
                          <div key={course.id} className="border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:shadow-sm transition bg-white">
                            <div>
                              <div className="flex justify-between items-start gap-2 mb-2">
                                <h4 className="font-bold text-slate-800 text-base">{course.courseTitle}</h4>
                                <Tag color="blue">{course.category}</Tag>
                              </div>
                              <p className="text-xs text-slate-500 mb-4 leading-relaxed">{course.description}</p>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-auto">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs text-slate-400">Instructor: <strong>{course.instructorName}</strong></span>
                                <span className="text-xs text-slate-400">Duration: <strong>{course.duration}</strong></span>
                              </div>
                              {isPurchased ? (
                                <Tag color="success" className="px-3 py-1 font-semibold text-xs rounded-lg m-0 animate-pulse">Purchased</Tag>
                              ) : (
                                <Button variant="primary" onClick={() => handlePurchase(course.id)}>
                                  Purchase
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </Layout.Section>
        </Layout>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Course Academy. All rights reserved.
      </footer>
    </div>
  );
}
