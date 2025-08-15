import { createRequire } from 'module';
const require = createRequire(import.meta.url);

async function testAPI() {
  try {
    console.log('Testing CQRS Sync Stats...');
    
    // Use native fetch if available (Node 18+), otherwise use a simple HTTP request
    const response = await fetch('http://localhost:3000/api/sync/stats');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('Sync Stats Response:', JSON.stringify(data, null, 2));
    
    console.log('\nTesting Fast Products API...');
    
    const fastResponse = await fetch('http://localhost:3000/api/fast/products');
    
    if (!fastResponse.ok) {
      throw new Error(`HTTP error! status: ${fastResponse.status}`);
    }
    
    const fastData = await fastResponse.json();
    
    console.log('Fast Products Response:', JSON.stringify(fastData, null, 2));
    
    // If read model is empty, suggest running sync
    if (data.success && data.data.readModel.products === 0) {
      console.log('\n⚠️  Read model appears to be empty. Consider running sync endpoints.');
      console.log('POST /api/sync/full to sync all data from write to read model.');
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('Make sure the server is running on http://localhost:3000');
    }
  }
}

testAPI();
