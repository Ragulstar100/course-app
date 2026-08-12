import React, { useState, useCallback } from 'react';
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
import { useStudent } from '../globalstate/student.jsx';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

export default function RegisterPage({ onNavigateToLogin }: RegisterPageProps) {
  const { registerStudent, loading, error } = useStudent();

  const [studentName, setStudentName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enrolledCourseId, setEnrolledCourseId] = useState('course_react_101');

  const courseOptions = [
    { label: 'React & Node.js Bootcamp (101)', value: 'course_react_101' },
    { label: 'Advanced TypeScript Architecture (201)', value: 'course_ts_201' },
  ];

  const handleSubmit = useCallback(async () => {
    const success = await registerStudent({
      studentName,
      email,
      password,
      enrolledCourseId,
    });
    if (success) {
      alert('Registration successful! Please log in.');
      onNavigateToLogin();
    }
  }, [studentName, email, password, enrolledCourseId, registerStudent, onNavigateToLogin]);

  return (
    <Page narrowWidth title="Student Portal">
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h2">Create a Student Account</Text>

          {error && <Banner tone="critical">{error}</Banner>}

          <Form onSubmit={handleSubmit}>
            <FormLayout>
              <TextField
                label="Full Name"
                value={studentName}
                onChange={(val) => setStudentName(val)}
                autoComplete="name"
                required
              />
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(val) => setEmail(val)}
                autoComplete="email"
                required
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(val) => setPassword(val)}
                autoComplete="new-password"
                required
              />
              <Select
                label="Enrolled Course"
                options={courseOptions}
                value={enrolledCourseId}
                onChange={(val) => setEnrolledCourseId(val)}
              />
              <Button submit variant="primary" loading={loading}>
                Register
              </Button>
            </FormLayout>
          </Form>

          <Text variant="bodyMd" as="p">
            Already have an account?{' '}
            <Link onClick={onNavigateToLogin}>Log in here</Link>
          </Text>
        </BlockStack>
      </Card>
    </Page>
  );
}