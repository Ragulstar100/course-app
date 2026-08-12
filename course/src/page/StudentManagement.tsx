import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Page, 
  Layout, 
  Card, 
  Button, 
  Text, 
  Badge, 
  Modal, 
  FormLayout, 
  Select, 
  Banner,
  InlineStack,
  BlockStack,
  IndexTable,
  Divider,
  Tabs,
  TextField,
  Link
} from '@shopify/polaris';
import { useShopify } from '../globalstate/shopify';
import { useStudent, type Student, type EnrollmentDetails } from '../globalstate/student';
import { useCourse } from '../globalstate/course';

export default function StudentManagement() {
  const { shop, token, customers, fetchCustomers } = useShopify();
  const { 
    students, 
    allShopEnrollments, 
    error: studentError, 
    fetchAllStudents, 
    adminEnrollStudent, 
    adminFetchAllEnrollments, 
    adminUpdateEnrollment, 
    adminDeleteEnrollment, 
    adminDeleteStudent,
    registerStudent
  } = useStudent();
  const { courses, fetchAllCourses } = useCourse();
  const navigate = useNavigate();

  // Tab State (0 = Enrollments, 1 = Students list)
  const [selectedTab, setSelectedTab] = useState(0);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);

  // Form Fields State
  const [studentSource, setStudentSource] = useState<'existing' | 'shopify'>('existing');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedShopifyCustomerId, setSelectedShopifyCustomerId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  
  // Custom password for registering student via Shopify customer sync
  const [customPassword, setCustomPassword] = useState('WelcomeLMS123!');

  // Fetch data
  useEffect(() => {
    if (!shop || !token) {
      navigate('/');
      return;
    }
    fetchAllStudents(token);
    adminFetchAllEnrollments(token);
    fetchAllCourses(shop, token);
    fetchCustomers();
  }, [shop, token]);

  // Handle enrollment submit
  const handleEnrollSubmit = useCallback(async () => {
    if (!token || !shop) return;
    setEnrollmentError(null);

    if (!selectedCourseId) {
      setEnrollmentError('Please select a course.');
      return;
    }

    let finalStudentId = '';

    if (studentSource === 'existing') {
      if (!selectedStudentId) {
        setEnrollmentError('Please select a student.');
        return;
      }
      finalStudentId = selectedStudentId;
    } else {
      // Shopify customer integration path
      if (!selectedShopifyCustomerId) {
        setEnrollmentError('Please select a Shopify customer.');
        return;
      }
      
      const customer = customers.find(c => c.id === selectedShopifyCustomerId);
      if (!customer) {
        setEnrollmentError('Selected Shopify customer not found.');
        return;
      }

      // First, check if the customer is already registered as a student in our database
      const existingStudent = students.find(s => s.email === customer.email);
      if (existingStudent) {
        finalStudentId = existingStudent.id;
      } else {
        // Register the customer as a student in LMS database
        const tempPassword = customPassword || 'WelcomeLMS123!';
        const regSuccess = await registerStudent({
          studentName: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          password: tempPassword,
        });

        if (!regSuccess) {
          setEnrollmentError('Failed to register the Shopify customer as an LMS student.');
          return;
        }

        // Re-fetch students and resolve the new student ID
        await fetchAllStudents(token);
        // Find them
        const newlyCreated = students.find(s => s.email === customer.email);
        if (newlyCreated) {
          finalStudentId = newlyCreated.id;
        } else {
          // Fallback check by re-fetching and scanning
          const freshResponse = await fetch(`http://localhost:1000/student`, {
            headers: { 'Authorization': `Bearer ${token}`, 'X-Shop-Domain': shop }
          });
          const freshStudents: Student[] = await freshResponse.json();
          const found = freshStudents.find(s => s.email === customer.email);
          if (found) {
            finalStudentId = found.id;
          } else {
            setEnrollmentError('Registered student but could not locate record.');
            return;
          }
        }
      }
    }

    // Now call backend admin enroll student
    const success = await adminEnrollStudent(finalStudentId, selectedCourseId, token);
    if (success) {
      setModalOpen(false);
      // Clean form fields
      setSelectedStudentId('');
      setSelectedShopifyCustomerId('');
      setSelectedCourseId('');
      setEnrollmentError(null);
    } else {
      setEnrollmentError(studentError || 'Enrollment failed. This student might already be enrolled in this course.');
    }
  }, [
    token,
    shop,
    studentSource,
    selectedStudentId,
    selectedShopifyCustomerId,
    selectedCourseId,
    customers,
    students,
    customPassword,
    adminEnrollStudent,
    registerStudent,
    fetchAllStudents,
    studentError
  ]);

  const toggleEnrollmentStatus = async (enrollment: EnrollmentDetails) => {
    if (!token) return;
    const newStatus = enrollment.enrollmentStatus === 'In Progress' ? 'Completed' : 'In Progress';
    await adminUpdateEnrollment(enrollment.id, newStatus, token);
  };

  const handleDeleteEnrollment = async (id: string) => {
    if (!token) return;
    if (window.confirm('Are you sure you want to unenroll this student from this course?')) {
      await adminDeleteEnrollment(id, token);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!token) return;
    if (window.confirm('Deleting this student will ALSO delete all of their course enrollments. Proceed?')) {
      await adminDeleteStudent(id, token);
    }
  };

  const handleOpenModal = () => {
    setEnrollmentError(null);
    // Set default select selections
    if (students.length > 0) setSelectedStudentId(students[0].id);
    if (customers.length > 0) setSelectedShopifyCustomerId(customers[0].id);
    const activeCourses = courses.filter(c => c.courseStatus === 'Active');
    if (activeCourses.length > 0) setSelectedCourseId(activeCourses[0].id);
    setModalOpen(true);
  };

  // Select dropdown option arrays
  const studentOptions = students.map(s => ({
    label: `${s.studentName} (${s.email})`,
    value: s.id
  }));

  const shopifyCustomerOptions = customers.map(c => ({
    label: `${c.firstName} ${c.lastName} (${c.email})`,
    value: c.id
  }));

  const courseOptions = courses
    .filter(c => c.courseStatus === 'Active')
    .map(c => ({
      label: c.courseTitle,
      value: c.id
    }));

  const enrollmentRows = allShopEnrollments.map((e, index) => (
    <IndexTable.Row id={e.id} key={e.id} position={index}>
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">{e.studentName}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>{e.studentEmail}</IndexTable.Cell>
      <IndexTable.Cell>{e.courseTitle}</IndexTable.Cell>
      <IndexTable.Cell>{new Date(e.enrollmentDate).toLocaleDateString()}</IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={e.enrollmentStatus === 'Completed' ? 'success' : 'attention'}>
          {e.enrollmentStatus}
        </Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <InlineStack gap="200">
          <Button size="slim" onClick={() => toggleEnrollmentStatus(e)}>
            Toggle Status
          </Button>
          <Button size="slim" tone="critical" onClick={() => handleDeleteEnrollment(e.id)}>
            Remove
          </Button>
        </InlineStack>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  const studentRows = students.map((s, index) => {
    const studentEnrollCount = allShopEnrollments.filter(e => e.studentId === s.id).length;
    return (
      <IndexTable.Row id={s.id} key={s.id} position={index}>
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">{s.studentName}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{s.email}</IndexTable.Cell>
        <IndexTable.Cell>
          {s.shopifyCustomerId ? (
            <Badge tone="success">Shopify Customer</Badge>
          ) : (
            <Badge>LMS Direct</Badge>
          )}
        </IndexTable.Cell>
        <IndexTable.Cell>{new Date(s.createdDate).toLocaleDateString()}</IndexTable.Cell>
        <IndexTable.Cell>{studentEnrollCount} courses</IndexTable.Cell>
        <IndexTable.Cell>
          <Button size="slim" tone="critical" onClick={() => handleDeleteStudent(s.id)}>
            Delete Student
          </Button>
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  return (
    <Page
      title="Student & Enrollment Manager"
      subtitle="Enroll students, verify course progress, and sync with your Shopify customer database"
      primaryAction={{
        content: 'Create Enrollment',
        onAction: handleOpenModal,
      }}
      backAction={{
        content: 'Dashboard',
        onAction: () => navigate('/dashboard'),
      }}
    >
      <BlockStack gap="500">
        {studentError && (
          <Banner tone="critical" title="Database Error">
            <p>{studentError}</p>
          </Banner>
        )}

        <Layout>
          <Layout.Section>
            <Card padding="0">
              <Tabs
                tabs={[
                  { id: 'enrollments', content: `Active Enrollments (${allShopEnrollments.length})` },
                  { id: 'students', content: `All Registered Students (${students.length})` },
                ]}
                selected={selectedTab}
                onSelect={(val) => setSelectedTab(val)}
              />
              <Divider />
              
              {selectedTab === 0 ? (
                /* Enrollments Table */
                allShopEnrollments.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <Text variant="bodyLg" as="p" tone="subdued">
                      No student enrollments found. Click "Create Enrollment" to enroll a student!
                    </Text>
                  </div>
                ) : (
                  <IndexTable
                    resourceName={{ singular: 'enrollment', plural: 'enrollments' }}
                    itemCount={allShopEnrollments.length}
                    headings={[
                      { title: 'Student Name' },
                      { title: 'Email' },
                      { title: 'Course' },
                      { title: 'Enrolled Date' },
                      { title: 'Status' },
                      { title: 'Actions' },
                    ]}
                    selectable={false}
                  >
                    {enrollmentRows}
                  </IndexTable>
                )
              ) : (
                /* Students Table */
                students.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <Text variant="bodyLg" as="p" tone="subdued">
                      No registered students found. Register students from the Student Portal.
                    </Text>
                  </div>
                ) : (
                  <IndexTable
                    resourceName={{ singular: 'student', plural: 'students' }}
                    itemCount={students.length}
                    headings={[
                      { title: 'Student Name' },
                      { title: 'Email Address' },
                      { title: 'Source' },
                      { title: 'Registered Date' },
                      { title: 'Enrollments' },
                      { title: 'Actions' },
                    ]}
                    selectable={false}
                  >
                    {studentRows}
                  </IndexTable>
                )
              )}
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>

      {/* Enroll Student Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Enroll Student in Course"
        primaryAction={{
          content: 'Enroll Student',
          onAction: handleEnrollSubmit,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setModalOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <FormLayout>
            {enrollmentError && (
              <Banner tone="critical" title="Enrollment validation failed">
                <p>{enrollmentError}</p>
              </Banner>
            )}

            <Select
              label="Student Source Selection"
              options={[
                { label: 'Choose Existing LMS Student', value: 'existing' },
                { label: 'Link Synced Shopify Customer', value: 'shopify' },
              ]}
              value={studentSource}
              onChange={(val) => {
                setStudentSource(val as 'existing' | 'shopify');
                setEnrollmentError(null);
              }}
            />

            {studentSource === 'existing' ? (
              studentOptions.length > 0 ? (
                <Select
                  label="Select LMS Student"
                  options={studentOptions}
                  value={selectedStudentId}
                  onChange={(val) => setSelectedStudentId(val)}
                />
              ) : (
                <Banner tone="warning">
                  No registered LMS students. Register students or choose "Link Synced Shopify Customer" to sync from Shopify.
                </Banner>
              )
            ) : (
              shopifyCustomerOptions.length > 0 ? (
                <BlockStack gap="400">
                  <Select
                    label="Select Shopify Customer"
                    options={shopifyCustomerOptions}
                    value={selectedShopifyCustomerId}
                    onChange={(val) => setSelectedShopifyCustomerId(val)}
                  />
                  <TextField
                    label="LMS Student Password (for account setup)"
                    type="password"
                    value={customPassword}
                    onChange={(val) => setCustomPassword(val)}
                    autoComplete="off"
                    helpText="This password will be assigned to the student for logging into their Dashboard."
                  />
                </BlockStack>
              ) : (
                <Banner tone="warning">
                  No customers found in your Shopify database. Syncing customers requires configuring API keys.
                </Banner>
              )
            )}

            {courseOptions.length > 0 ? (
              <Select
                label="Select Course"
                options={courseOptions}
                value={selectedCourseId}
                onChange={(val) => setSelectedCourseId(val)}
              />
            ) : (
              <Banner tone="warning">
                No active courses available. Please <Link onClick={() => navigate('/courses')}>create active courses</Link> first.
              </Banner>
            )}
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
