import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Card, 
  Button, 
  Typography, 
  Badge, 
  Row, 
  Col, 
  Table, 
  Divider, 
  Modal, 
  Form, 
  Input, 
  Alert, 
  Space 
} from 'antd';
import { 
  LogoutOutlined, 
  EditOutlined, 
  UserOutlined, 
  BookOutlined, 
  MailOutlined, 
  ShopOutlined 
} from '@ant-design/icons';
import { useStudent } from '../globalstate/student';
import { useCourse } from '../globalstate/course';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function StudentDashboard() {
  const { 
    currentStudent, 
    studentEnrollments, 
    activeShop, 
    updateStudentProfile, 
    enrollInCourse, 
    logout, 
    error: studentError, 
    loading: studentLoading 
  } = useStudent();
  
  const { courses, fetchAllCourses } = useCourse();
  const navigate = useNavigate();

  // Edit profile state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Redirect to login if not logged in
  useEffect(() => {
    if (!currentStudent) {
      navigate('/login');
    } else {
      form.setFieldsValue({
        studentName: currentStudent.studentName,
        email: currentStudent.email,
      });
    }
  }, [currentStudent, navigate, form]);

  // Fetch courses dynamically based on student's shop context
  useEffect(() => {
    if (activeShop) {
      fetchAllCourses(activeShop);
    }
  }, [activeShop]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleUpdateProfile = useCallback(async (values: any) => {
    if (!currentStudent) return;
    const { studentName, email } = values;
    if (!studentName || !email) {
      alert('Please fill out all fields.');
      return;
    }

    const success = await updateStudentProfile({
      id: currentStudent.id,
      studentName,
      email,
    });

    if (success) {
      setEditModalOpen(false);
      alert('Profile updated successfully!');
    }
  }, [currentStudent, updateStudentProfile]);

  const handleEnrollClick = async (courseId: string) => {
    const success = await enrollInCourse(courseId);
    if (success) {
      alert('Enrolled in course successfully!');
    }
  };

  // Find other active courses student is NOT enrolled in yet
  const enrolledCourseIds = studentEnrollments.map(e => e.courseId);
  const otherAvailableCourses = courses.filter(
    c => !enrolledCourseIds.includes(c.id) && c.courseStatus === 'Active'
  );

  if (!currentStudent) {
    return null; // Redirects in useEffect
  }

  const enrolledColumns = [
    {
      title: 'Course Title',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
      render: (text: string) => <Text strong style={{ color: '#111827' }}>{text}</Text>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text: string) => <Badge status="default" text={text} />,
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Enrolled On',
      dataIndex: 'enrollmentDate',
      key: 'enrollmentDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'enrollmentStatus',
      key: 'enrollmentStatus',
      render: (status: string) => {
        const type = status === 'Completed' ? 'success' : 'warning';
        return <Badge status={type} text={status} />;
      },
    },
  ];

  const availableColumns = [
    {
      title: 'Course Title',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
      render: (text: string) => <Text strong style={{ color: '#111827' }}>{text}</Text>,
    },
    {
      title: 'Instructor',
      dataIndex: 'instructorName',
      key: 'instructorName',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text: string) => <Badge status="processing" text={text} />,
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => <span title={text}>{text}</span>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Button 
          type="primary" 
          size="small" 
          onClick={() => handleEnrollClick(record.id)}
          loading={studentLoading}
        >
          Enroll Now
        </Button>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f9fafb' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: '1.2' }}>
          <Title level={4} style={{ margin: 0, fontSize: '18px', color: '#111827' }}>
            Welcome back, {currentStudent.studentName}!
          </Title>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Student Portal Dashboard • Store: {activeShop}
          </Text>
        </div>

        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => setEditModalOpen(true)}
            style={{ fontWeight: '500' }}
          >
            Edit Profile Details
          </Button>
          <Button 
            danger 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            style={{ fontWeight: '500' }}
          >
            Log Out Account
          </Button>
        </Space>
      </Header>

      <Content style={{ padding: '40px', background: '#f9fafb' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {studentError && (
            <Alert 
              message="Operation failed" 
              description={studentError} 
              type="error" 
              showIcon 
              style={{ marginBottom: '24px', borderRadius: '8px' }} 
            />
          )}

          <Row gutter={[24, 24]}>
            {/* Main Area: Tables */}
            <Col xs={24} lg={18}>
              <Space direction="vertical" size="large" style={{ display: 'flex', width: '100%' }}>
                {/* Enrolled Courses */}
                <Card 
                  title={
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', color: '#111827' }}>
                      <BookOutlined /> My Enrolled Courses ({studentEnrollments.length})
                    </span>
                  }
                  style={{ borderRadius: '12px', border: '1px solid #f0f0f0' }}
                >
                  <Table 
                    dataSource={studentEnrollments} 
                    columns={enrolledColumns} 
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    locale={{ emptyText: 'You are not enrolled in any courses at the moment.' }}
                  />
                </Card>

                {/* Explore Courses */}
                <Card 
                  title={
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', color: '#111827' }}>
                      <ShopOutlined /> Explore Available Courses
                    </span>
                  }
                  style={{ borderRadius: '12px', border: '1px solid #f0f0f0' }}
                >
                  <Table 
                    dataSource={otherAvailableCourses} 
                    columns={availableColumns} 
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    locale={{ emptyText: 'No other courses are available at the moment. You have enrolled in all active catalogs!' }}
                  />
                </Card>
              </Space>
            </Col>

            {/* Sidebar: Profile Details */}
            <Col xs={24} lg={6}>
              <Card 
                title={
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', color: '#111827' }}>
                    <UserOutlined /> Student Profile
                  </span>
                }
                style={{ borderRadius: '12px', border: '1px solid #f0f0f0', height: '100%' }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Full Name</Text>
                    <Text strong style={{ fontSize: '14px', color: '#111827' }}>{currentStudent.studentName}</Text>
                  </div>
                  <Divider style={{ margin: '12px 0' }} />
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Email Address</Text>
                    <Text strong style={{ fontSize: '14px', color: '#111827' }}>{currentStudent.email}</Text>
                  </div>
                  <Divider style={{ margin: '12px 0' }} />
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Account Status</Text>
                    <Badge status={currentStudent.studentStatus === 'Active' ? 'success' : 'warning'} text={currentStudent.studentStatus} />
                  </div>
                  <Divider style={{ margin: '12px 0' }} />
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Total Enrollments</Text>
                    <Text strong style={{ fontSize: '14px', color: '#111827' }}>{studentEnrollments.length} Courses</Text>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>

      {/* Edit Profile Modal */}
      <Modal
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        title="Edit Profile Information"
        footer={null}
        destroyOnClose
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleUpdateProfile}
          style={{ marginTop: '16px' }}
        >
          <Form.Item 
            label="Full Name" 
            name="studentName"
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} />
          </Form.Item>
          
          <Form.Item 
            label="Email Address" 
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please input a valid email!' }
            ]}
          >
            <Input prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0, marginTop: '24px' }}>
            <Space>
              <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={studentLoading}>
                Update Profile
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
