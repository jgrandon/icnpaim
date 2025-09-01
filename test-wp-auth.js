// Script específico para probar autenticación de WordPress
import axios from 'axios';

const WP_API_BASE = 'https://icnpaim.cl/wp-json/wp/v2';
const WP_USER = 'martin.castillo@iacc.cl';
const WP_PASS = 'm1a3r0xDd.';

async function testWordPressAuth() {
  console.log('=== TESTING WORDPRESS AUTHENTICATION ===');
  console.log('User:', WP_USER);
  console.log('Password length:', WP_PASS.length);
  console.log('Target URL:', WP_API_BASE);
  
  // Test 1: Verificar que WordPress REST API está disponible
  try {
    console.log('\n1. Testing WordPress REST API availability...');
    const response = await axios.get('https://icnpaim.cl/wp-json/');
    console.log('✓ WordPress REST API is available');
    console.log('Available namespaces:', response.data.namespaces);
  } catch (error) {
    console.log('✗ WordPress REST API not available:', error.message);
    return;
  }
  
  // Test 2: Verificar autenticación básica
  try {
    console.log('\n2. Testing Basic Authentication...');
    const auth = Buffer.from(`${WP_USER}:${WP_PASS}`).toString('base64');
    console.log('Auth string length:', auth.length);
    console.log('Auth header:', `Basic ${auth.substring(0, 20)}...`);
    
    const headers = {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    };
    
    const userResponse = await axios.get(`${WP_API_BASE}/users/me`, { headers });
    console.log('✓ Authentication successful!');
    console.log('User ID:', userResponse.data.id);
    console.log('User name:', userResponse.data.name);
    console.log('User roles:', userResponse.data.roles);
    console.log('User capabilities keys:', Object.keys(userResponse.data.capabilities || {}));
    
    // Test 3: Verificar permisos de creación
    console.log('\n3. Testing post creation permissions...');
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
    console.log('\n❌ AUTHENTICATION FAILED');
    console.log('Status:', error.response?.status);
    console.log('Error code:', error.response?.data?.code);
    console.log('Error message:', error.response?.data?.message);
    console.log('Full error data:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('\n=== POSSIBLE SOLUTIONS ===');
      console.log('1. Check if Application Passwords are enabled in WordPress');
      console.log('2. Verify the Application Password is correct (not the regular password)');
      console.log('3. Ensure the user has Editor or Administrator role');
      console.log('4. Try generating a new Application Password');
      
      console.log('\n=== HOW TO CREATE APPLICATION PASSWORD ===');
      console.log('1. Go to WordPress admin → Users → Your Profile');
      console.log('2. Scroll down to "Application Passwords"');
      console.log('3. Enter name: "LTI Tool Integration"');
      console.log('4. Click "Add New Application Password"');
      console.log('5. Copy the generated password (NOT your regular password)');
    }
  }
}

testWordPressAuth();