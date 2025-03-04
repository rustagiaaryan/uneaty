const mongoose = require('mongoose');

// Setup before tests run
beforeAll(async () => {
  // Use a fixed MongoDB URI for testing (this will be overridden in integration tests if needed)
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/uneaty-test';
  
  // Connect to MongoDB
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clean up after tests
afterAll(async () => {
  // Disconnect mongoose
  await mongoose.connection.close();
});

// Clear the database and collections between tests
afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});