console.log('Testing route imports...');

try {
    console.log('1. Testing authRoutes...');
    require('./routes/authRoutes');
    console.log('✓ authRoutes loaded successfully');
} catch (error) {
    console.log('✗ authRoutes failed:', error.message);
    console.log(error.stack);
}

try {
    console.log('2. Testing eventRoutes...');
    require('./routes/eventRoutes');
    console.log('✓ eventRoutes loaded successfully');
} catch (error) {
    console.log('✗ eventRoutes failed:', error.message);
    console.log(error.stack);
}

try {
    console.log('3. Testing registrationRoutes...');
    require('./routes/registrationRoutes');
    console.log('✓ registrationRoutes loaded successfully');
} catch (error) {
    console.log('✗ registrationRoutes failed:', error.message);
    console.log(error.stack);
}

try {
    console.log('4. Testing companyVisitRoutes...');
    require('./routes/companyVisitRoutes');
    console.log('✓ companyVisitRoutes loaded successfully');
} catch (error) {
    console.log('✗ companyVisitRoutes failed:', error.message);
    console.log(error.stack);
}

console.log('\\nAll tests complete!');
