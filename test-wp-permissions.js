// Script para probar permisos específicos de WordPress
import axios from 'axios';

const WP_API_BASE = 'https://icnpaim.cl/wp-json/wp/v2';
const WP_USER = 'martin.castillo@iacc.cl';
const WP_PASS = 'm1a3r0xDd.';

async function testWordPressPermissions() {
  console.log('=== TESTING WORDPRESS PERMISSIONS ===');
  console.log('User:', WP_USER);
  console.log('Target URL:', WP_API_BASE);
  
  const auth = Buffer.from(`${WP_USER}:${WP_PASS}`).toString('base64');
  const headers = {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // Test 1: Verificar usuario actual
    console.log('\n1. Testing current user permissions...');
    const userResponse = await axios.get(`${WP_API_BASE}/users/me`, { headers });
    console.log('✓ User authenticated successfully');
    console.log('User ID:', userResponse.data.id);
    console.log('User roles:', userResponse.data.roles);
    console.log('User capabilities:', userResponse.data.capabilities);
    
    // Test 2: Verificar endpoints básicos
    console.log('\n2. Testing basic WordPress endpoints...');
    const postsResponse = await axios.get(`${WP_API_BASE}/posts?per_page=1`, { headers });
    console.log('✓ Posts endpoint accessible');
    
    // Test 3: Verificar si los CPTs existen
    console.log('\n3. Testing CPT endpoints...');
    const cpts = ['student', 'course', 'unit', 'progress', 'grade'];
    
    for (const cpt of cpts) {
      try {
        const cptResponse = await axios.get(`${WP_API_BASE}/${cpt}?per_page=1`, { headers });
        console.log(`✓ CPT '${cpt}' is accessible (${cptResponse.data.length} items)`);
      } catch (error) {
        console.log(`✗ CPT '${cpt}' failed:`, error.response?.status, error.response?.data?.message);
        if (error.response?.status === 404) {
          console.log(`   → CPT '${cpt}' is NOT REGISTERED in WordPress`);
        } else if (error.response?.status === 401 || error.response?.status === 403) {
          console.log(`   → Permission denied for CPT '${cpt}'`);
        }
      }
    }
    
    // Test 4: Intentar crear un post de prueba
    console.log('\n4. Testing post creation permissions...');
    try {
      const testPost = {
        title: 'Test Post from LTI Tool',
        content: 'This is a test post to verify creation permissions',
        status: 'draft'
      };
      
      const createResponse = await axios.post(`${WP_API_BASE}/posts`, testPost, { headers });
      console.log('✓ Post creation successful, ID:', createResponse.data.id);
      
      // Limpiar el post de prueba
      await axios.delete(`${WP_API_BASE}/posts/${createResponse.data.id}?force=true`, { headers });
      console.log('✓ Test post cleaned up');
      
    } catch (error) {
      console.log('✗ Post creation failed:', error.response?.status, error.response?.data?.message);
    }
    
    // Test 5: Verificar endpoint personalizado
    console.log('\n5. Testing custom LTI endpoints...');
    try {
      const pingResponse = await axios.get('https://icnpaim.cl/wp-json/lti/v1/ping');
      console.log('✓ LTI ping endpoint works:', pingResponse.data);
    } catch (error) {
      console.log('✗ LTI ping endpoint failed:', error.response?.status);
      console.log('   → This means the PHP functions are NOT LOADED');
    }
    
  } catch (error) {
    console.error('\n=== AUTHENTICATION FAILED ===');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    console.error('\n=== POSSIBLE SOLUTIONS ===');
    console.error('1. Verify the Application Password is correct');
    console.error('2. Check that the user has Editor or Administrator role');
    console.error('3. Ensure Application Passwords are enabled in WordPress');
  }
}

testWordPressPermissions();