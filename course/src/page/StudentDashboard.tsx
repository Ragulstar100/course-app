import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Page, 
  Layout, 
  Card, 
  Button, 
  Text, 
  Badge, 
  BlockStack, 
  InlineStack, 
  Box, 
  Divider, 
  FormLayout, 
  TextField, 
  Banner,
  Modal
} from '@shopify/polaris';
import { useStudent } from '../globalstate/student';
import { useCourse } from '../globalstate/course';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

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
  const [studentName, setStudentName] = useState('');
  const [email, setEmail] = useState('');

  // Redirect to login if not logged in
  useEffect(() => {
    if (!currentStudent) {
      navigate('/login');
    } else {
      setStudentName(currentStudent.studentName);
      setEmail(currentStudent.email);
    }
  }, [currentStudent, navigate]);

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

  const handleUpdateProfile = useCallback(async () => {
    if (!currentStudent) return;
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
  }, [currentStudent, studentName, email, updateStudentProfile]);

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

  // Define AG Grid columns for Enrolled Courses
  const enrolledColumnDefs = [
    { 
      field: 'courseTitle', 
      headerName: 'Course Title', 
      minWidth: 200,
      flex: 1.5,
      cellRenderer: (params: any) => (
        <div style={{ fontWeight: '600', color: '#1c1e21', display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.value}
        </div>
      )
    },
    { 
      field: 'category', 
      headerName: 'Category', 
      minWidth: 120,
      flex: 1,
      cellRenderer: (params: any) => (
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Badge>{params.value}</Badge>
        </div>
      )
    },
    { 
      field: 'duration', 
      headerName: 'Duration', 
      minWidth: 100,
      flex: 0.8,
      cellRenderer: (params: any) => (
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.value}
        </div>
      )
    },
    { 
      field: 'enrollmentDate', 
      headerName: 'Enrolled On', 
      minWidth: 140,
      flex: 1.2,
      cellRenderer: (params: any) => (
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.value ? new Date(params.value).toLocaleDateString() : ''}
        </div>
      )
    },
    { 
      field: 'enrollmentStatus', 
      headerName: 'Status', 
      minWidth: 130,
      flex: 1,
      cellRenderer: (params: any) => {
        const status = params.value;
        const tone = status === 'Completed' ? 'success' : 'attention';
        return (
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Badge tone={tone}>{status}</Badge>
          </div>
        );
      }
    }
  ];

  // Define AG Grid columns for Explore Available Courses
  const availableColumnDefs = [
    { 
      field: 'courseTitle', 
      headerName: 'Course Title', 
      minWidth: 200,
      flex: 1.2,
      cellRenderer: (params: any) => (
        <div style={{ fontWeight: '600', color: '#1c1e21', display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.value}
        </div>
      )
    },
    { 
      field: 'instructorName', 
      headerName: 'Instructor', 
      minWidth: 130,
      flex: 1,
      cellRenderer: (params: any) => (
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.value}
        </div>
      )
    },
    { 
      field: 'category', 
      headerName: 'Category', 
      minWidth: 120,
      flex: 1,
      cellRenderer: (params: any) => (
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Badge>{params.value}</Badge>
        </div>
      )
    },
    { 
      field: 'duration', 
      headerName: 'Duration', 
      minWidth: 100,
      flex: 0.8,
      cellRenderer: (params: any) => (
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.value}
        </div>
      )
    },
    { 
      field: 'description', 
      headerName: 'Description', 
      minWidth: 220,
      flex: 2,
      cellRenderer: (params: any) => (
        <div 
          title={params.value} 
          style={{ 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            display: 'flex', 
            alignItems: 'center', 
            height: '100%',
            width: '100%'
          }}
        >
          {params.value}
        </div>
      )
    },
    { 
      headerName: 'Action', 
      minWidth: 120,
      flex: 1,
      cellRenderer: (params: any) => {
        const courseId = params.data.id;
        return (
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Button 
              size="slim" 
              variant="primary" 
              onClick={() => handleEnrollClick(courseId)}
              loading={studentLoading}
            >
              Enroll
            </Button>
          </div>
        );
      }
    }
  ];

  if (!currentStudent) {
    return null; // Redirects in useEffect
  }

  return (
    <Page
      title={`Welcome back, ${currentStudent.studentName}!`}
      subtitle={`Student Portal Dashboard • Store: ${activeShop}`}
      primaryAction={{
        content: 'Edit Profile Details',
        onAction: () => setEditModalOpen(true),
      }}
      secondaryActions={[
        {
          content: 'Log Out Account',
          destructive: true,
          onAction: handleLogout,
        }
      ]}
    >
      <BlockStack gap="500">
        {studentError && (
          <Banner tone="critical" title="Operation failed">
            <p>{studentError}</p>
          </Banner>
        )}

        <Layout>
          {/* Enrolled Courses list */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingLg" as="h2">
                  My Enrolled Courses ({studentEnrollments.length})
                </Text>
                <Divider />

                {studentEnrollments.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center' }}>
                    <Text variant="bodyLg" as="p" tone="subdued">
                      You are not enrolled in any courses at the moment.
                    </Text>
                    <div style={{ marginTop: '16px' }}>
                      <a href="#explore-courses" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold shadow-md hover:bg-indigo-500 transition-colors">
                        Browse Course Catalog
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="ag-theme-quartz" style={{ height: '300px', width: '100%' }}>
                    <AgGridReact
                      rowData={studentEnrollments}
                      columnDefs={enrolledColumnDefs}
                      pagination={true}
                      paginationPageSize={5}
                      paginationPageSizeSelector={[5, 10, 20]}
                      rowHeight={52}
                    />
                  </div>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Student Profile Info Sidebar */}
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h3">Student Profile</Text>
                <Divider />
                <BlockStack gap="300">
                  <div>
                    <Text variant="bodySm" as="p" tone="subdued">Full Name</Text>
                    <Text variant="bodyMd" fontWeight="bold" as="p">{currentStudent.studentName}</Text>
                  </div>
                  <div>
                    <Text variant="bodySm" as="p" tone="subdued">Email Address</Text>
                    <Text variant="bodyMd" fontWeight="bold" as="p">{currentStudent.email}</Text>
                  </div>
                  <div>
                    <Text variant="bodySm" as="p" tone="subdued">Account Status</Text>
                    <Badge tone={currentStudent.studentStatus === 'Active' ? 'success' : 'attention'}>
                      {currentStudent.studentStatus}
                    </Badge>
                  </div>
                  <div>
                    <Text variant="bodySm" as="p" tone="subdued">Total Enrollments</Text>
                    <Text variant="bodyMd" fontWeight="bold" as="p">{studentEnrollments.length} Courses</Text>
                  </div>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Explore Other Courses */}
          <Layout.Section>
            <div id="explore-courses">
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingLg" as="h2">Explore Available Courses</Text>
                  <Divider />

                  {otherAvailableCourses.length === 0 ? (
                    <Text variant="bodyMd" as="p" tone="subdued">
                      No other courses are available at the moment. You have enrolled in all active catalogs!
                    </Text>
                  ) : (
                    <div className="ag-theme-quartz" style={{ height: '350px', width: '100%' }}>
                      <AgGridReact
                        rowData={otherAvailableCourses}
                        columnDefs={availableColumnDefs}
                        pagination={true}
                        paginationPageSize={5}
                        paginationPageSizeSelector={[5, 10, 20]}
                        rowHeight={52}
                      />
                    </div>
                  )}
                </BlockStack>
              </Card>
            </div>
          </Layout.Section>
        </Layout>
      </BlockStack>

      {/* Edit Profile Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Profile Information"
        primaryAction={{
          content: 'Update Profile',
          onAction: handleUpdateProfile,
          loading: studentLoading
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setEditModalOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Full Name"
              value={studentName}
              onChange={(val) => setStudentName(val)}
              autoComplete="name"
              requiredIndicator
            />
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(val) => setEmail(val)}
              autoComplete="email"
              requiredIndicator
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
