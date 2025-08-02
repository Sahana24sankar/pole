const { dbQueries } = require('./database');

async function cleanupExpiredAds() {
  console.log('🧹 Cleaning up expired ads...');
  
  try {
    // Get all ads with expiry dates
    const result = await dbQueries.pool.query(`
      SELECT id, poletype, image, expirydate, createddate
      FROM pole_images 
      WHERE expirydate IS NOT NULL AND expirydate < NOW() AND isactive = true
    `);
    
    if (result.rows.length > 0) {
      console.log(`📅 Found ${result.rows.length} expired ads:`);
      
      for (const ad of result.rows) {
        console.log(`   - ID: ${ad.id}, Pole: ${ad.poletype}, Expired: ${ad.expirydate}`);
        
        // Deactivate expired ad
        await dbQueries.pool.query(`
          UPDATE pole_images 
          SET isactive = false, updateddate = NOW(), updatedby = 'system-cleanup'
          WHERE id = $1
        `, [ad.id]);
        
        console.log(`   ✅ Deactivated expired ad: ${ad.id}`);
      }
      
      console.log(`🎉 Cleanup completed! Deactivated ${result.rows.length} expired ads.`);
    } else {
      console.log('✅ No expired ads found.');
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  }
}

// Run cleanup
cleanupExpiredAds().then(() => {
  console.log('🏁 Cleanup script finished.');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Cleanup script failed:', error);
  process.exit(1);
}); 