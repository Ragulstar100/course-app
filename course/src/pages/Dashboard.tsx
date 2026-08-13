import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Card, Button, Text, Grid } from '@shopify/polaris';
import { Avatar, Dropdown, message, Tag } from 'antd';
import { UserOutlined, LogoutOutlined, BookOutlined, CalendarOutlined, TrophyOutlined, CompassOutlined, PlayCircleOutlined } from '@ant-design/icons';
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
      
      setCourses(activeServerCourses);

      // Fetch enrollments from server
      const enrollmentData = await api.getStudentEnrollments(user.token);
      setEnrolledCourseIds(enrollmentData.map((e: any) => e.courseId));
    } catch (err: any) {
      console.error('Error loading student dashboard data:', err);
      if (err.message && (err.message.includes('403') || err.message.includes('401'))) {
        message.error('Session expired or student account not found. Logging out...');
        dispatch(logout());
        navigate('/login');
      } else {
        message.error('Failed to load courses or enrollment data from server.');
      }
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

  const handleStartLearning = (title: string) => {
    message.info(`Welcome to "${title}"! Setting up your interactive class workstation...`);
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

  // Filter courses
  const enrolledCourses = courses.filter((c) => enrolledCourseIds.includes(c.id));
  const purchaseableCourses = courses.filter((c) => !enrolledCourseIds.includes(c.id));

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
              <div className="flex gap-3 font-sans">
                <Button onClick={() => navigate('/profile')}>
                  Edit Profile
                </Button>
                <Button variant="primary" onClick={scrollToCatalog}>
                  Explore Catalog
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
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 text-xl border border-indigo-100">
                      <BookOutlined />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Enrolled Courses</p>
                      <h4 className="text-2xl font-bold text-slate-800 mt-1">{enrolledCourses.length}</h4>
                    </div>
                  </div>
                </Card>
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                <Card>
                  <div className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 text-xl border border-amber-100">
                      <CompassOutlined />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Available to Buy</p>
                      <h4 className="text-2xl font-bold text-slate-800 mt-1">{purchaseableCourses.length}</h4>
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
                <div className="mt-4 space-y-3 font-sans">
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

          {/* ENROLLED COURSES SECTION */}
          <Layout.Section>
            <Card>
              <div className="p-6">
                <Text as="h3" variant="headingMd">Enrolled Courses</Text>
                <p className="text-xs text-slate-400 mt-1 mb-4">Access details and curriculum workspaces for your active courses.</p>
                
                {loading ? (
                  <div className="text-center py-6 text-slate-400">Loading courses...</div>
                ) : enrolledCourses.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                    <p className="text-sm text-slate-400 font-medium">You are not enrolled in any courses yet.</p>
                    <p className="text-xs text-slate-400 mt-1">Explore our catalog below to enroll and start learning!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {enrolledCourses.map((course) => (
                      <div key={course.id} className="border border-indigo-100 rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition bg-gradient-to-br from-white to-slate-50">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h4 className="font-bold text-slate-800 text-base">{course.courseTitle}</h4>
                            <Tag color="success">Enrolled</Tag>
                          </div>
                          <p className="text-xs text-slate-500 mb-4 leading-relaxed">{course.description}</p>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-indigo-50 mt-auto">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-slate-400">Instructor: <strong>{course.instructorName}</strong></span>
                            <span className="text-xs text-slate-400">Duration: <strong>{course.duration}</strong></span>
                            <span className="text-xs text-slate-400">Merchant: <strong>{course.shop}</strong></span>
                          </div>
                          <Button variant="primary" icon={<PlayCircleOutlined />} onClick={() => handleStartLearning(course.courseTitle)}>
                            Start Learning
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </Layout.Section>

          {/* AVAILABLE COURSES CATALOG */}
          <Layout.Section>
            <div id="courses-catalog">
              <Card>
                <div className="p-6">
                  <Text as="h3" variant="headingMd">Courses Available for Purchase</Text>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Click "Purchase" on any course below to instantly register and get immediate access.</p>
                  
                  {loading ? (
                    <div className="text-center py-6 text-slate-400">Loading courses...</div>
                  ) : purchaseableCourses.length === 0 ? (
                    <div className="text-center py-10 border border-slate-200 rounded-xl bg-slate-50">
                      <p className="text-sm text-slate-400 font-medium">You have purchased all available courses!</p>
                      <p className="text-xs text-slate-400 mt-1">Check back later for new modules and content.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      {purchaseableCourses.map((course) => (
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
                              <span className="text-xs text-slate-400">Merchant: <strong>{course.shop}</strong></span>
                            </div>
                            <Button variant="primary" onClick={() => handlePurchase(course.id)}>
                              Purchase
                            </Button>
                          </div>
                        </div>
                      ))}
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
