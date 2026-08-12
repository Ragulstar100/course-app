import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Page, 
  Card, 
  Form, 
  FormLayout, 
  TextField, 
  Button, 
  Banner, 
  Select, 
  BlockStack, 
  Text, 
  Link
} from '@shopify/polaris';
import { useStudent } from '../globalstate/student';
import { useCourse } from '../globalstate/course';

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

  const handleSubmit = useCallback(async () => {
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
  }, [studentName, email, password, enrolledCourseId, registerStudent, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f2f5 0%, #e2e8f0 100%)',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <Page narrowWidth>
          <BlockStack gap="600">
            {/* Header branding */}
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <Text variant="headingXl" as="h1" tone="base">
                Course Academy
              </Text>
              <Text variant="bodyMd" as="p" tone="subdued">
                Join our learning community and start studying today
              </Text>
            </div>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingLg" as="h2">Student Registration</Text>

                {studentError && (
                  <Banner tone="critical" title="Registration failed">
                    <p>{studentError}</p>
                  </Banner>
                )}

                {activeCourses.length === 0 && !coursesLoading && (
                  <Banner tone="warning" title="No courses available">
                    <p>
                      There are no active courses available for registration right now.{' '}
                      <Link onClick={() => navigate('/courses')}>Go to Course Management</Link> to create one.
                    </p>
                  </Banner>
                )}

                <Form onSubmit={handleSubmit}>
                  <FormLayout>
                    <TextField
                      label="Full Name"
                      value={studentName}
                      onChange={(val) => setStudentName(val)}
                      autoComplete="name"
                      requiredIndicator
                      placeholder="e.g. Alex Johnson"
                      disabled={activeCourses.length === 0}
                    />
                    <TextField
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(val) => setEmail(val)}
                      autoComplete="email"
                      requiredIndicator
                      placeholder="e.g. alex@example.com"
                      disabled={activeCourses.length === 0}
                    />
                    <TextField
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(val) => setPassword(val)}
                      autoComplete="new-password"
                      requiredIndicator
                      placeholder="At least 6 characters"
                      disabled={activeCourses.length === 0}
                    />
                    
                    {activeCourses.length > 0 && (
                      <Select
                        label="Choose Your Course"
                        options={courseOptions}
                        value={enrolledCourseId}
                        onChange={(val) => setEnrolledCourseId(val)}
                      />
                    )}

                    <Button 
                      submit 
                      variant="primary" 
                      loading={studentLoading} 
                      fullWidth 
                      size="large"
                      disabled={activeCourses.length === 0}
                    >
                      Register Account
                    </Button>
                  </FormLayout>
                </Form>

                <div style={{ borderTop: '1px solid #e1e3e5', paddingTop: '16px' }}>
                  <BlockStack gap="200" align="center">
                    <Text variant="bodyMd" as="p" tone="subdued">
                      Already have an account?{' '}
                      <Link onClick={() => navigate('/login')}>Log in here</Link>
                    </Text>
                    <Text variant="bodyMd" as="p" tone="subdued">
                      Are you an administrator?{' '}
                      <Link onClick={() => navigate('/courses')}>Manage Courses</Link>
                    </Text>
                  </BlockStack>
                </div>
              </BlockStack>
            </Card>

            {/* Back to Home Link */}
            <div style={{ textAlign: 'center' }}>
              <Link onClick={() => navigate('/')}>← Back to welcome screen</Link>
            </div>
          </BlockStack>
        </Page>
      </div>
    </div>
  );
}