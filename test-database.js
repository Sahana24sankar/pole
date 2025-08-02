const { dbQueries, testConnection } = require('./database');

async function testDatabase() {
  console.log('🧪 Testing SmartPole Database...\n');

  try {
    // Test 1: Connection
    console.log('1️⃣ Testing database connection...');
    const isConnected = await testConnection();
    console.log(isConnected ? '✅ Connection successful!' : '❌ Connection failed!');
    console.log('');

    if (!isConnected) {
      console.log('❌ Cannot proceed with tests without database connection.');
      return;
    }

    // Test 2: Health check
    console.log('2️⃣ Testing health check...');
    const health = await dbQueries.healthCheck();
    if (health.success) {
      console.log('✅ Health check passed!');
      console.log(`   - Total ads: ${health.data.totalAds}`);
      console.log(`   - Active ads: ${health.data.activeAds}`);
      console.log(`   - Database: ${health.data.database}`);
      console.log(`   - Status: ${health.data.status}`);
    } else {
      console.log('❌ Health check failed:', health.error);
    }
    console.log('');

    // Test 3: View current contents
    console.log('3️⃣ Viewing current database contents...');
    const contents = await dbQueries.viewContents(5);
    if (contents.success) {
      console.log(`✅ Found ${contents.data.length} records in database`);
    } else {
      console.log('❌ Error viewing contents:', contents.error);
    }
    console.log('');

    // Test 4: Insert test ad
    console.log('4️⃣ Testing ad insertion...');
    const testAd = await dbQueries.insertAd(1, '/test-image.jpg', 'test-user');
    if (testAd.success) {
      console.log('✅ Test ad inserted successfully!');
      console.log(`   - ID: ${testAd.data.id}`);
      console.log(`   - Pole: ${testAd.data.poletype}`);
      console.log(`   - Image: ${testAd.data.image}`);
    } else {
      console.log('❌ Error inserting test ad:', testAd.error);
    }
    console.log('');

    // Test 5: Get ads by pole
    console.log('5️⃣ Testing get ads by pole...');
    const poleAds = await dbQueries.getAdsByPole(1);
    if (poleAds.success) {
      console.log(`✅ Found ${poleAds.data.length} ads for pole 1`);
      poleAds.data.forEach((ad, index) => {
        console.log(`   ${index + 1}. ID: ${ad.id}, Image: ${ad.image}, Active: ${ad.isactive}`);
      });
    } else {
      console.log('❌ Error getting ads by pole:', poleAds.error);
    }
    console.log('');

    // Test 6: Clean up test data
    console.log('6️⃣ Cleaning up test data...');
    const cleanup = await dbQueries.cleanDatabase();
    if (cleanup.success) {
      console.log(`✅ Cleaned up ${cleanup.data.length} test records`);
    } else {
      console.log('❌ Error cleaning up:', cleanup.error);
    }
    console.log('');

    console.log('🎉 All tests completed!');
    console.log('\n📊 Final health check:');
    const finalHealth = await dbQueries.healthCheck();
    if (finalHealth.success) {
      console.log(`   - Total ads: ${finalHealth.data.totalAds}`);
      console.log(`   - Active ads: ${finalHealth.data.activeAds}`);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the tests
testDatabase().then(() => {
  console.log('\n🏁 Test script finished.');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
}); 