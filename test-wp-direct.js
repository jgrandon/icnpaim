// Script para probar la conexión directa con WordPress
import axios from 'axios';

const WP_API_BASE = 'https://icnpaim.cl/wp-json/wp/v2';

async function testDirectConnection() {
  console.log('=== TESTING DIRECT WORDPRESS CONNECTION ===');
  console.log('Target URL:', WP_API_BASE);
  
  try {
    // Test 1: Basic connectivity
    console.log('\n1. Testing basic WordPress REST API...');
    const response = await axios.get(WP_API_BASE.replace('/wp/v2', ''));
    console.log('✓ WordPress REST API is accessible');
    console.log('Site name:', response.data.name);
    console.log('Available namespaces:', response.data.namespaces);
    
    // Test 2: Check if our custom endpoints exist
    console.log('\n2. Testing custom LTI endpoints...');
    try {
      const pingResponse = await axios.get('https://icnpaim.cl/wp-json/lti/v1/ping');
      console.log('✓ LTI ping endpoint works:', pingResponse.data);
    } catch (error) {
      console.log('✗ LTI ping endpoint failed:', error.response?.status, error.response?.data?.message);
      console.log('This means the PHP functions are not loaded or active');
    }
    
    // Test 3: Check CPT endpoints
    console.log('\n3. Testing CPT endpoints...');
    const cpts = ['student', 'course', 'unit', 'progress', 'grade'];
    
    for (const cpt of cpts) {
      try {
        const cptResponse = await axios.get(`${WP_API_BASE}/${cpt}?per_page=1`);
        console.log(`✓ CPT '${cpt}' is accessible (${cptResponse.data.length} items)`);
      } catch (error) {
        console.log(`✗ CPT '${cpt}' failed:`, error.response?.status, error.response?.data?.message);
      }
    }
    
    // Test 4: Check authentication (if configured)
    console.log('\n4. Testing authentication...');
    const username = process.env.WORDPRESS_API_USER;
    const password = process.env.WORDPRESS_API_PASSWORD;
    
    if (username && password) {
      try {
        const auth = Buffer.from(`${username}:${password}`).toString('base64');
        const authResponse = await axios.get(`${WP_API_BASE}/users/me`, {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        });
        console.log('✓ Authentication works for user:', authResponse.data.name);
      } catch (error) {
        console.log('✗ Authentication failed:', error.response?.status, error.response?.data?.message);
      }
    } else {
      console.log('⚠ No WordPress credentials configured in environment');
    }
    
  } catch (error) {
    console.error('\n=== CONNECTION FAILED ===');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testDirectConnection();