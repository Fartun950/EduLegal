// Debug script to capture server startup errors
console.log('Starting server debug...\n');

try {
  console.log('1. Loading environment variables...');
  const { ENV } = await import('./config/env.js');
  console.log('   ✓ ENV loaded');
  console.log('   - MONGO_URI:', ENV.MONGO_URI ? 'Set' : 'Missing');
  console.log('   - JWT_SECRET:', ENV.JWT_SECRET ? 'Set' : 'Missing');
  console.log('   - PORT:', ENV.PORT);
  
  console.log('\n2. Loading database connection...');
  const connectDB = (await import('./config/db.js')).default;
  console.log('   ✓ connectDB loaded');
  
  console.log('\n3. Loading server...');
  await import('./server.js');
  console.log('   ✓ Server file loaded');
  
} catch (error) {
  console.error('\n❌ ERROR CAUGHT:');
  console.error('Name:', error.name);
  console.error('Message:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}


