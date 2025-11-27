// Test script to check server startup
import('./server.js').catch((error) => {
  console.error('❌ Server failed to start:');
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  process.exit(1);
});


