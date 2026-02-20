const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB\n');

        const CompanyVisit = require('./models/CompanyVisit');
        const User = require('./models/User');

        // Find an admin user
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log('❌ No admin user found. Please create an admin user first.');
            process.exit(1);
        }

        console.log(`👤 Using admin: ${admin.name} (${admin.email})\n`);

        // Create a test company visit
        const testVisit = {
            companyName: 'Google India',
            jobRole: 'Software Engineer',
            description: 'Google is hiring software engineers for their Bangalore office. Great opportunity for final year students.',
            eligibility: {
                department: ['CSE', 'IT', 'ECE'],
                year: [4],
                minCGPA: 7.5
            },
            visitDate: new Date('2025-04-20'),
            visitTime: '10:00 AM',
            venue: 'Placement Cell',
            package: '18-25 LPA',
            applicationDeadline: new Date('2025-04-10'),
            contactPerson: {
                name: 'Dr. Placement Officer',
                email: 'placement@college.edu',
                phone: '9876543210'
            },
            createdBy: admin._id
        };

        console.log('🏢 Creating test company visit...');
        console.log('Company visit data:', JSON.stringify(testVisit, null, 2));

        try {
            const visit = await CompanyVisit.create(testVisit);
            console.log('\n✅ Company visit created successfully!');
            console.log('Visit ID:', visit._id);
            console.log('Company:', visit.companyName);
            console.log('Job Role:', visit.jobRole);

            // Verify it was saved
            const savedVisit = await CompanyVisit.findById(visit._id);
            console.log('\n🔍 Verification - Company visit found in DB:', savedVisit ? 'YES ✅' : 'NO ❌');

            // Count total company visits
            const count = await CompanyVisit.countDocuments();
            console.log(`📊 Total company visits in database: ${count}`);

            // List all company visits
            const allVisits = await CompanyVisit.find();
            console.log('\n📋 All company visits in database:');
            allVisits.forEach((v, index) => {
                console.log(`   ${index + 1}. ${v.companyName} - ${v.jobRole} (${v._id})`);
            });

        } catch (error) {
            console.error('\n❌ Error creating company visit:', error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            if (error.errors) {
                console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
            }
        }

        mongoose.connection.close();
        console.log('\n✅ Test completed\n');
    })
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
