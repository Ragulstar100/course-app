import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Page, 
  Layout, 
  Card, 
  Grid, 
  Text, 
  BlockStack, 
  InlineStack, 
  Badge, 
  Divider, 
  Button, 
  IndexTable, 
  Banner,
  Box
} from '@shopify/polaris';
import { useShopify } from '../globalstate/shopify';
import { useStudent } from '../globalstate/student';

export default function AdminDashboard() {
  const { shop, token, shopName, shopEmail, logoutAdmin } = useShopify();
  const { dashboardData, loading, error, adminFetchDashboardStats } = useStudent();
  const navigate = useNavigate();

  useEffect(() => {
    if (!shop || !token) {
      navigate('/');
    } else {
      adminFetchDashboardStats(token);
    }
  }, [shop, token]);

  const handleRefresh = useCallback(() => {
    if (token) {
      adminFetchDashboardStats(token);
    }
  }, [token]);

  if (!shop || !token) {
    return null;
  }

  const stats = dashboardData?.stats || {
    totalCourses: 0,
    totalStudents: 0,
    totalEnrollments: 0,
    completedEnrollments: 0,
    activeEnrollments: 0
  };

  const recentEnrollments = dashboardData?.recentEnrollments || [];

  const rowMarkup = recentEnrollments.map(
    (enrollment, index) => (
      <IndexTable.Row
        id={enrollment.id}
        key={enrollment.id}
        position={index}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {enrollment.studentName}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{enrollment.studentEmail}</IndexTable.Cell>
        <IndexTable.Cell>{enrollment.courseTitle}</IndexTable.Cell>
        <IndexTable.Cell>
          {new Date(enrollment.enrollmentDate).toLocaleDateString()}
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Badge tone={enrollment.enrollmentStatus === 'Completed' ? 'success' : 'attention'}>
            {enrollment.enrollmentStatus}
          </Badge>
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <Page
      title={`${shopName} LMS Dashboard`}
      subtitle={`LMS Store Domain: ${shop}`}
      primaryAction={{
        content: 'Manage Courses',
        onAction: () => navigate('/courses'),
      }}
      secondaryActions={[
        {
          content: 'Manage Students & Enrollments',
          onAction: () => navigate('/students'),
        },
        {
          content: 'Sync with Shopify',
          onAction: handleRefresh,
          loading: loading,
        },
        {
          content: 'Logout Admin',
          destructive: true,
          onAction: () => {
            logoutAdmin();
            navigate('/');
          }
        }
      ]}
      backAction={{
        content: 'Back to Welcome',
        onAction: () => navigate('/'),
      }}
    >
      <BlockStack gap="500">
        {error && (
          <Banner tone="critical" title="Failed to load dashboard metrics">
            <p>{error}</p>
          </Banner>
        )}

        {/* Analytics stats grids */}
        <Grid>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
            <Card>
              <BlockStack gap="200">
                <Text variant="headingSm" as="h3" tone="subdued">TOTAL COURSES</Text>
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="heading3xl" as="p" fontWeight="bold">
                    {stats.totalCourses}
                  </Text>
                  <span style={{ fontSize: '32px' }}>📚</span>
                </InlineStack>
              </BlockStack>
            </Card>
          </Grid.Cell>

          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
            <Card>
              <BlockStack gap="200">
                <Text variant="headingSm" as="h3" tone="subdued">REGISTERED STUDENTS</Text>
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="heading3xl" as="p" fontWeight="bold">
                    {stats.totalStudents}
                  </Text>
                  <span style={{ fontSize: '32px' }}>👥</span>
                </InlineStack>
              </BlockStack>
            </Card>
          </Grid.Cell>

          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
            <Card>
              <BlockStack gap="200">
                <Text variant="headingSm" as="h3" tone="subdued">TOTAL ENROLLMENTS</Text>
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="heading3xl" as="p" fontWeight="bold">
                    {stats.totalEnrollments}
                  </Text>
                  <span style={{ fontSize: '32px' }}>🎯</span>
                </InlineStack>
              </BlockStack>
            </Card>
          </Grid.Cell>

          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
            <Card>
              <BlockStack gap="200">
                <Text variant="headingSm" as="h3" tone="subdued">IN PROGRESS STUDYING</Text>
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="heading3xl" as="p" fontWeight="bold" tone="caution">
                    {stats.activeEnrollments}
                  </Text>
                  <Badge tone="attention">Active studying</Badge>
                </InlineStack>
              </BlockStack>
            </Card>
          </Grid.Cell>

          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
            <Card>
              <BlockStack gap="200">
                <Text variant="headingSm" as="h3" tone="subdued">COMPLETED ENROLLMENTS</Text>
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="heading3xl" as="p" fontWeight="bold" tone="success">
                    {stats.completedEnrollments}
                  </Text>
                  <Badge tone="success">Finished</Badge>
                </InlineStack>
              </BlockStack>
            </Card>
          </Grid.Cell>
        </Grid>

        {/* Detailed Layout */}
        <Layout>
          {/* Recent enrollments */}
          <Layout.Section>
            <Card padding="0">
              <div style={{ padding: '20px' }}>
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingMd" as="h3">
                    Recent Enrolled Students
                  </Text>
                  <Button variant="plain" onClick={handleRefresh} loading={loading}>
                    Refresh List
                  </Button>
                </InlineStack>
              </div>
              <Divider />
              
              {recentEnrollments.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <Text variant="bodyLg" as="p" tone="subdued">
                    No enrollments recorded yet. Go to Student Manager to enroll your first student.
                  </Text>
                </div>
              ) : (
                <IndexTable
                  resourceName={{ singular: 'enrollment', plural: 'enrollments' }}
                  itemCount={recentEnrollments.length}
                  headings={[
                    { title: 'Student Name' },
                    { title: 'Email' },
                    { title: 'Course Enrolled' },
                    { title: 'Enrollment Date' },
                    { title: 'Status' },
                  ]}
                  selectable={false}
                >
                  {rowMarkup}
                </IndexTable>
              )}
            </Card>
          </Layout.Section>

          {/* Quick Actions Panel */}
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h3">Quick Actions</Text>
                <Divider />
                
                <BlockStack gap="200">
                  <Button fullWidth variant="primary" onClick={() => navigate('/courses')}>
                    Add New Course
                  </Button>
                  <Button fullWidth onClick={() => navigate('/students')}>
                    Enroll Student
                  </Button>
                  <Button fullWidth onClick={() => navigate('/students')}>
                    View Student Profiles
                  </Button>
                </BlockStack>
                
                <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                  <BlockStack gap="200">
                    <Text variant="headingSm" as="h4">Shopify Metadata</Text>
                    <Text variant="bodySm" as="p" tone="subdued">
                      Connected to <strong>{shopName}</strong> ({shopEmail || 'no email'})
                    </Text>
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
