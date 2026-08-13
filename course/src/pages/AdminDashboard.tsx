import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Card, Button } from '@shopify/polaris';
import { Table, Button as AntButton, Modal, Form, Input, Select, Tag, Popconfirm, Avatar, Dropdown, message, Badge, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
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

const MOCK_COURSE_DB_KEY = 'mock_course_db';

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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, serverOnline } = useAppSelector((state) => state.auth);

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  const [form] = Form.useForm();

  // Load courses
  const loadCourses = async () => {
    setLoading(true);
    if (serverOnline) {
      try {
        const data = await api.getCourses();
        setCourses(data);
      } catch (err) {
        message.error('Failed to load courses from backend. Falling back to local db.');
        loadLocalCourses();
      } finally {
        setLoading(false);
      }
    } else {
      loadLocalCourses();
      setLoading(false);
    }
  };

  const loadLocalCourses = () => {
    const localDb = localStorage.getItem(MOCK_COURSE_DB_KEY);
    if (localDb) {
      setCourses(JSON.parse(localDb));
    } else {
      localStorage.setItem(MOCK_COURSE_DB_KEY, JSON.stringify(DEFAULT_COURSES));
      setCourses(DEFAULT_COURSES);
    }
  };

  const saveLocalCourses = (updated: Course[]) => {
    localStorage.setItem(MOCK_COURSE_DB_KEY, JSON.stringify(updated));
    setCourses(updated);
  };

  useEffect(() => {
    loadCourses();
  }, [serverOnline]);

  const handleLogout = () => {
    dispatch(logout());
    message.success('Logged out successfully.');
    navigate('/');
  };

  // Open modal for Adding
  const handleAddClick = () => {
    setEditingCourse(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // Open modal for Editing
  const handleEditClick = (course: Course) => {
    setEditingCourse(course);
    form.setFieldsValue({
      courseTitle: course.courseTitle,
      description: course.description,
      instructorName: course.instructorName,
      category: course.category,
      duration: course.duration,
      courseStatus: course.courseStatus,
    });
    setIsModalOpen(true);
  };

  // Delete course
  const handleDelete = async (id: string) => {
    setLoading(true);
    if (serverOnline) {
      try {
        await api.deleteCourse(id, user?.token);
        message.success('Course deleted successfully from backend.');
        loadCourses();
      } catch (err: any) {
        message.error(err.message || 'Failed to delete course');
        setLoading(false);
      }
    } else {
      const localDb = localStorage.getItem(MOCK_COURSE_DB_KEY);
      const parsed: Course[] = localDb ? JSON.parse(localDb) : [];
      const updated = parsed.filter(c => c.id !== id);
      saveLocalCourses(updated);
      message.success('Course deleted successfully (Offline Mock Mode).');
      setLoading(false);
    }
  };

  // Submit form (Add or Update)
  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const coursePayload = {
        courseTitle: values.courseTitle,
        description: values.description,
        instructorName: values.instructorName,
        category: values.category,
        duration: values.duration,
        courseStatus: values.courseStatus,
      };

      if (editingCourse) {
        // Update
        if (serverOnline) {
          try {
            await api.updateCourse(editingCourse.id, coursePayload, user?.token);
            message.success('Course updated successfully on backend.');
            setIsModalOpen(false);
            loadCourses();
          } catch (err: any) {
            message.error(err.message || 'Failed to update course');
          }
        } else {
          const localDb = localStorage.getItem(MOCK_COURSE_DB_KEY);
          const parsed: Course[] = localDb ? JSON.parse(localDb) : [];
          const updated = parsed.map(c => 
            c.id === editingCourse.id 
              ? { ...c, ...coursePayload } 
              : c
          );
          saveLocalCourses(updated);
          message.success('Course updated successfully (Offline Mock Mode).');
          setIsModalOpen(false);
        }
      } else {
        // Create
        if (serverOnline) {
          try {
            await api.createCourse(coursePayload, user?.token);
            message.success('Course created successfully on backend.');
            setIsModalOpen(false);
            loadCourses();
          } catch (err: any) {
            message.error(err.message || 'Failed to create course');
          }
        } else {
          const localDb = localStorage.getItem(MOCK_COURSE_DB_KEY);
          const parsed: Course[] = localDb ? JSON.parse(localDb) : [];
          const newCourse: Course = {
            id: crypto.randomUUID(),
            ...coursePayload,
            createdDate: new Date().toISOString(),
            shop: 'quickstart-shop.myshopify.com'
          };
          parsed.push(newCourse);
          saveLocalCourses(parsed);
          message.success('Course created successfully (Offline Mock Mode).');
          setIsModalOpen(false);
        }
      }
    } catch (error) {
      // Form validation failed
      console.warn('Form validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ant Design Table Columns definition
  const columns = [
    {
      title: 'Course Title',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
      render: (text: string) => <strong className="text-slate-800">{text}</strong>,
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
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Status',
      dataIndex: 'courseStatus',
      key: 'courseStatus',
      render: (status: string) => (
        <Badge 
          status={status === 'Active' ? 'success' : 'default'} 
          text={status} 
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: Course) => (
        <Space size="middle">
          <AntButton 
            type="text" 
            icon={<EditOutlined className="text-blue-600" />} 
            onClick={() => handleEditClick(record)}
          />
          <Popconfirm
            title="Delete Course"
            description="Are you sure you want to delete this course?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <AntButton 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Space>
      ),
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
          {/* Header Action Card */}
          <Layout.Section>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Course Directory</h2>
                <p className="text-sm text-slate-500 mt-1">Manage, update, and publish academy course modules.</p>
              </div>
              <AntButton 
                type="primary" 
                size="large" 
                icon={<PlusOutlined />} 
                onClick={handleAddClick}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Add Course
              </AntButton>
            </div>
          </Layout.Section>

          {/* Courses Table Card */}
          <Layout.Section>
            <Card>
              <div className="p-2">
                <Table 
                  columns={columns} 
                  dataSource={courses} 
                  rowKey="id" 
                  loading={loading}
                  pagination={{ pageSize: 8 }}
                />
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </main>

      {/* Course Entry/Edit Modal */}
      <Modal
        title={editingCourse ? "Edit Course Module" : "Create New Course"}
        open={isModalOpen}
        onOk={handleFormSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={loading}
        okText={editingCourse ? "Save Changes" : "Create Course"}
        cancelText="Cancel"
        destroyOnClose
      >
        <Form 
          form={form} 
          layout="vertical" 
          name="courseForm"
          className="mt-4"
        >
          <Form.Item
            name="courseTitle"
            label="Course Title"
            rules={[
              { required: true, message: 'Please input the course title.' },
              { min: 3, message: 'Course title must be at least 3 characters long.' }
            ]}
          >
            <Input placeholder="Introduction to Python Programming" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: 'Please input the course description.' },
              { min: 5, message: 'Description must be at least 5 characters long.' }
            ]}
          >
            <Input.TextArea rows={3} placeholder="Provide a summary of the course modules, syllabus, and targets..." />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="instructorName"
              label="Instructor Name"
              rules={[{ required: true, message: 'Please input the instructor name.' }]}
            >
              <Input placeholder="Jane Doe" />
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select a category.' }]}
            >
              <Select placeholder="Select Category">
                <Select.Option value="Development">Development</Select.Option>
                <Select.Option value="Design">Design</Select.Option>
                <Select.Option value="Marketing">Marketing</Select.Option>
                <Select.Option value="Business">Business</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="duration"
              label="Duration"
              rules={[{ required: true, message: 'Please input the course duration.' }]}
            >
              <Input placeholder="e.g. 10 hours, 3 weeks" />
            </Form.Item>

            <Form.Item
              name="courseStatus"
              label="Course Status"
              initialValue="Active"
              rules={[{ required: true, message: 'Please select a status.' }]}
            >
              <Select>
                <Select.Option value="Active">Active</Select.Option>
                <Select.Option value="Inactive">Inactive</Select.Option>
              </Select>
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 mt-12">
        © {new Date().getFullYear()} Course Academy. Admin Console.
      </footer>
    </div>
  );
}
