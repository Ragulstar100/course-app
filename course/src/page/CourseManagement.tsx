import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Page, 
  Layout, 
  Card, 
  IndexTable, 
  Button, 
  Text, 
  Badge, 
  Modal, 
  FormLayout, 
  TextField, 
  Select, 
  Banner,
  InlineStack,
  BlockStack,
  Divider
} from '@shopify/polaris';
import { useCourse, type Course } from '../globalstate/course';
import { useShopify } from '../globalstate/shopify';

export default function CourseManagement() {
  const { shop, token, products } = useShopify();
  const { 
    courses, 
    loading, 
    error, 
    fetchAllCourses, 
    createCourse, 
    updateCourse, 
    deleteCourse 
  } = useCourse();

  const navigate = useNavigate();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form Fields State
  const [courseTitle, setCourseTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [courseStatus, setCourseStatus] = useState<'Active' | 'Inactive'>('Active');
  const [shopifyProductId, setShopifyProductId] = useState('');

  // Fetch courses scoped by shop
  useEffect(() => {
    if (!shop || !token) {
      navigate('/');
      return;
    }
    fetchAllCourses(shop, token);
  }, [shop, token]);

  const handleRefresh = () => {
    if (shop && token) {
      fetchAllCourses(shop, token);
    }
  };

  // Form Submission
  const handleFormSubmit = useCallback(async () => {
    if (!shop || !token) return;
    setValidationError(null);

    if (!courseTitle || !description || !instructorName || !category || !duration) {
      setValidationError('Please fill in all required course fields.');
      return;
    }

    const courseData = {
      courseTitle,
      description,
      instructorName,
      category,
      duration,
      courseStatus,
      shopifyProductId: shopifyProductId || null,
    };

    let success = false;
    if (isEditing && editingId) {
      success = await updateCourse({ id: editingId, ...courseData }, shop, token);
    } else {
      success = await createCourse(courseData, shop, token);
    }

    if (success) {
      handleCloseModal();
    } else {
      setValidationError('Operation failed. Please verify form values.');
    }
  }, [
    isEditing, 
    editingId, 
    courseTitle, 
    description, 
    instructorName, 
    category, 
    duration, 
    courseStatus, 
    shopifyProductId,
    shop,
    token,
    createCourse, 
    updateCourse
  ]);

  // Modal actions
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId('');
    setCourseTitle('');
    setDescription('');
    setInstructorName('');
    setCategory('');
    setDuration('');
    setCourseStatus('Active');
    setShopifyProductId('');
    setValidationError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (course: Course) => {
    setIsEditing(true);
    setEditingId(course.id);
    setCourseTitle(course.courseTitle);
    setDescription(course.description);
    setInstructorName(course.instructorName);
    setCategory(course.category);
    setDuration(course.duration);
    setCourseStatus(course.courseStatus);
    setShopifyProductId(course.shopifyProductId || '');
    setValidationError(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleDeleteCourse = async (id: string) => {
    if (!shop || !token) return;
    if (window.confirm('Deleting this course will delete all associated student enrollments. Continue?')) {
      await deleteCourse(id, shop, token);
    }
  };

  const toggleCourseStatus = async (course: Course) => {
    if (!shop || !token) return;
    const newStatus = course.courseStatus === 'Active' ? 'Inactive' : 'Active';
    await updateCourse({ id: course.id, courseStatus: newStatus }, shop, token);
  };

  // Prepare product select dropdown options
  const productOptions = [
    { label: 'None - Do not link to Shopify Product', value: '' },
    ...products.map(p => ({
      label: p.title,
      value: p.id
    }))
  ];

  // Table row renderer
  const rowMarkup = courses.map(
    (course, index) => {
      // Find associated product title
      const linkedProduct = products.find(p => p.id === course.shopifyProductId);
      return (
        <IndexTable.Row
          id={course.id}
          key={course.id}
          position={index}
        >
          <IndexTable.Cell>
            <BlockStack gap="100">
              <Text variant="bodyMd" fontWeight="bold" as="span">
                {course.courseTitle}
              </Text>
              {linkedProduct && (
                <Text variant="bodyXs" as="p" tone="subdued">
                  Linked: {linkedProduct.title}
                </Text>
              )}
            </BlockStack>
          </IndexTable.Cell>
          <IndexTable.Cell>{course.instructorName}</IndexTable.Cell>
          <IndexTable.Cell>{course.category}</IndexTable.Cell>
          <IndexTable.Cell>{course.duration}</IndexTable.Cell>
          <IndexTable.Cell>
            <Badge tone={course.courseStatus === 'Active' ? 'success' : 'attention'}>
              {course.courseStatus}
            </Badge>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <InlineStack gap="200">
              <Button size="slim" onClick={() => handleOpenEditModal(course)}>
                Edit
              </Button>
              <Button size="slim" onClick={() => toggleCourseStatus(course)}>
                Toggle Status
              </Button>
              <Button size="slim" tone="critical" onClick={() => handleDeleteCourse(course.id)}>
                Delete
              </Button>
            </InlineStack>
          </IndexTable.Cell>
        </IndexTable.Row>
      );
    }
  );

  return (
    <Page
      title="Course Manager Dashboard"
      subtitle="Create, update, and associate training courses with your Shopify product listings"
      primaryAction={{
        content: 'Create Course',
        onAction: handleOpenAddModal,
      }}
      backAction={{
        content: 'Dashboard',
        onAction: () => navigate('/dashboard'),
      }}
    >
      <BlockStack gap="500">
        {error && (
          <Banner tone="critical" title="Database Error">
            <p>{error}</p>
          </Banner>
        )}

        <Layout>
          <Layout.Section>
            <Card padding="0">
              <div style={{ padding: '20px' }}>
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingMd" as="h3">
                    Available Courses List ({courses.length})
                  </Text>
                  <Button variant="plain" onClick={handleRefresh} loading={loading}>
                    Refresh Table
                  </Button>
                </InlineStack>
              </div>
              <Divider />
              {courses.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <Text variant="bodyLg" as="p" tone="subdued">
                    No courses found. Click "Create Course" to add your first course!
                  </Text>
                </div>
              ) : (
                <IndexTable
                  resourceName={{ singular: 'course', plural: 'courses' }}
                  itemCount={courses.length}
                  headings={[
                    { title: 'Course Title' },
                    { title: 'Instructor' },
                    { title: 'Category' },
                    { title: 'Duration' },
                    { title: 'Status' },
                    { title: 'Actions' },
                  ]}
                  selectable={false}
                >
                  {rowMarkup}
                </IndexTable>
              )}
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h3">Course Analytics</Text>
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text variant="bodyMd" as="span" tone="subdued">Total Courses:</Text>
                    <Text variant="bodyMd" fontWeight="bold" as="span">{courses.length}</Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text variant="bodyMd" as="span" tone="subdued">Active Courses:</Text>
                    <Text variant="bodyMd" fontWeight="bold" as="span" tone="success">
                      {courses.filter(c => c.courseStatus === 'Active').length}
                    </Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text variant="bodyMd" as="span" tone="subdued">Inactive Courses:</Text>
                    <Text variant="bodyMd" fontWeight="bold" as="span" tone="caution">
                      {courses.filter(c => c.courseStatus === 'Inactive').length}
                    </Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text variant="bodyMd" as="span" tone="subdued">Shopify Integrated:</Text>
                    <Text variant="bodyMd" fontWeight="bold" as="span" tone="base">
                      {courses.filter(c => c.shopifyProductId).length} courses linked
                    </Text>
                  </InlineStack>
                </BlockStack>
                <Divider />
                <BlockStack gap="200">
                  <Button onClick={() => navigate('/students')} variant="secondary" fullWidth>
                    Manage Student Enrollments
                  </Button>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>

      {/* Add / Edit Course Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title={isEditing ? 'Edit Course Details' : 'Create New Course'}
        primaryAction={{
          content: isEditing ? 'Save Changes' : 'Create Course',
          onAction: handleFormSubmit,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: handleCloseModal,
          },
        ]}
      >
        <Modal.Section>
          <FormLayout>
            {validationError && (
              <Banner tone="critical" title="Form validation failed">
                <p>{validationError}</p>
              </Banner>
            )}

            <TextField
              label="Course Title"
              value={courseTitle}
              onChange={(val) => setCourseTitle(val)}
              autoComplete="off"
              placeholder="e.g. React Native Mobile Boot Camp"
              requiredIndicator
            />
            <TextField
              label="Description"
              value={description}
              onChange={(val) => setDescription(val)}
              multiline={3}
              autoComplete="off"
              placeholder="Detail course curriculum and training objectives..."
              requiredIndicator
            />
            
            <FormLayout.Group>
              <TextField
                label="Instructor Name"
                value={instructorName}
                onChange={(val) => setInstructorName(val)}
                autoComplete="off"
                placeholder="e.g. Dr. Arthur Pendragon"
                requiredIndicator
              />
              <TextField
                label="Category"
                value={category}
                onChange={(val) => setCategory(val)}
                autoComplete="off"
                placeholder="e.g. Engineering, Business"
                requiredIndicator
              />
            </FormLayout.Group>

            <FormLayout.Group>
              <TextField
                label="Duration"
                value={duration}
                onChange={(val) => setDuration(val)}
                autoComplete="off"
                placeholder="e.g. 10 weeks"
                requiredIndicator
              />
              <Select
                label="Course Status"
                options={[
                  { label: 'Active', value: 'Active' },
                  { label: 'Inactive', value: 'Inactive' },
                ]}
                value={courseStatus}
                onChange={(val) => setCourseStatus(val as 'Active' | 'Inactive')}
              />
            </FormLayout.Group>

            <Select
              label="Associated Shopify Product (Shopify Sync)"
              options={productOptions}
              value={shopifyProductId}
              onChange={(val) => setShopifyProductId(val)}
              helpText="Linking this course to a product allows automatic checkouts and associates LMS catalogs with store products."
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
