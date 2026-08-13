import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, Button, Alert, Typography, Space } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useStudent } from '../globalstate/student';
import { useCourse } from '../globalstate/course';

const { Title, Text, Link } = Typography;

export default function RegisterPage() {
  const { registerStudent, activeShop, loading: studentLoading, error: studentError } = useStudent();
  const { courses, fetchAllCourses, loading: coursesLoading } = useCourse();
  const navigate = useNavigate();

  const [studentName, setStudentName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enrolledCourseId, setEnrolledCourseId] = useState('');

  // Fetch courses dynamically on mount
  useEffect(() => {
    fetchAllCourses(activeShop);
  }, [activeShop]);

  // Filter active courses for enrollment
  const activeCourses = courses.filter(c => c.courseStatus === 'Active');

  // Set default enrolledCourseId when activeCourses changes
  useEffect(() => {
    if (activeCourses.length > 0 && !enrolledCourseId) {
      setEnrolledCourseId(activeCourses[0].id);
    }
  }, [activeCourses, enrolledCourseId]);

  const courseOptions = activeCourses.map(c => ({
    label: `${c.courseTitle} - ${c.instructorName} (${c.duration})`,
    value: c.id,
  }));

  const onFinish = async () => {
    if (!studentName || !email || !password || !enrolledCourseId) {
      alert('Please fill out all fields and select a course.');
      return;
    }
    const success = await registerStudent({
      studentName,
      email,
      password,
      enrolledCourseId,
    });
    if (success) {
      alert('Registration successful! Please log in.');
      navigate('/login');
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
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header branding */}
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ margin: '0 0 8px', fontSize: '28px', color: '#111827' }}>
              Course Academy
            </Title>
            <Text type="secondary">
              Join our learning community and start studying today
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
              Student Registration
            </Title>
            
            {studentError && (
              <Alert 
                message={studentError} 
                type="error" 
                showIcon 
                style={{ marginBottom: '20px', borderRadius: '8px' }} 
              />
            )}

            {activeCourses.length === 0 && !coursesLoading && (
              <Alert 
                message="No courses available"
                description={
                  <span>
                    There are no active courses available for registration right now.{' '}
                    <Link onClick={() => navigate('/courses')} style={{ fontWeight: '500' }}>Go to Course Management</Link> to create one.
                  </span>
                }
                type="warning"
                showIcon
                style={{ marginBottom: '20px', borderRadius: '8px' }}
              />
            )}

            <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
              <Form.Item 
                label="Full Name" 
                required
              >
                <Input 
                  prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} 
                  placeholder="e.g. Alex Johnson" 
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  disabled={activeCourses.length === 0}
                  style={{ height: '40px', borderRadius: '6px' }}
                />
              </Form.Item>

              <Form.Item 
                label="Email Address" 
                required
              >
                <Input 
                  prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} 
                  placeholder="e.g. alex@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={activeCourses.length === 0}
                  style={{ height: '40px', borderRadius: '6px' }}
                />
              </Form.Item>

              <Form.Item 
                label="Password" 
                required
              >
                <Input.Password 
                  prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} 
                  placeholder="At least 6 characters" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={activeCourses.length === 0}
                  style={{ height: '40px', borderRadius: '6px' }}
                />
              </Form.Item>
              
              {activeCourses.length > 0 && (
                <Form.Item 
                  label="Choose Your Course" 
                  required
                >
                  <Select
                    options={courseOptions}
                    value={enrolledCourseId}
                    onChange={(val) => setEnrolledCourseId(val)}
                    style={{ height: '40px' }}
                  />
                </Form.Item>
              )}

              <Form.Item style={{ marginBottom: '16px', marginTop: '24px' }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block 
                  loading={studentLoading}
                  disabled={activeCourses.length === 0}
                  size="large"
                  style={{ height: '42px', fontWeight: '600', borderRadius: '6px' }}
                >
                  Register Account
                </Button>
              </Form.Item>
            </Form>

            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px', textAlign: 'center', fontSize: '13px' }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text type="secondary">
                  Already have an account?{' '}
                  <Link onClick={() => navigate('/login')} style={{ fontWeight: '500' }}>Log in here</Link>
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