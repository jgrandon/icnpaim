import wpClient from './wp-client.js';

// Script para probar la conexión con WordPress
async function testWordPressConnection() {
  console.log('=== TESTING WORDPRESS CONNECTION ===');
  
  try {
    // Test 1: Ping WordPress
    console.log('1. Testing basic connectivity...');
    const pingResponse = await wpClient.client.get('/');
    console.log('✓ WordPress REST API is accessible');
    console.log('Available routes:', Object.keys(pingResponse.data.routes || {}));
    
    // Test 2: Check if our CPTs exist
    console.log('\n2. Testing CPT endpoints...');
    const cpts = ['student', 'course', 'unit', 'progress', 'grade'];
    
    for (const cpt of cpts) {
      try {
        const response = await wpClient.client.get(`/${cpt}?per_page=1`);
        console.log(`✓ CPT '${cpt}' is accessible (${response.data.length} items found)`);
      } catch (error) {
        console.log(`✗ CPT '${cpt}' failed:`, error.response?.status, error.response?.data?.message);
      }
    }
    
    // Test 3: Try to create a test student
    console.log('\n3. Testing student creation...');
    const testStudent = await wpClient.findOrCreateStudent({
      sub: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User'
    });
    console.log('✓ Test student created/updated:', testStudent.id);
    
    // Test 4: Try to create a test course
    console.log('\n4. Testing course creation...');
    const testCourse = await wpClient.findOrCreateCourse({
      contextId: 'test-course-456',
      title: 'Test Course',
      label: 'TEST101'
    });
    console.log('✓ Test course created/updated:', testCourse.id);
    
    // Test 5: Link them
    console.log('\n5. Testing student-course linking...');
    await wpClient.linkStudentToCourse(testStudent.id, testCourse.id);
    console.log('✓ Student-course link completed');
    
    console.log('\n=== ALL TESTS PASSED ===');
    
  } catch (error) {
    console.error('\n=== TEST FAILED ===');
    console.error('Error:', error.message);
    console.error('Response:', error.response?.data);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

// Export for use in routes or run directly
export { testWordPressConnection };
