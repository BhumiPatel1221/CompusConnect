const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB\n');

        const Event = require('./models/Event');
        const User = require('./models/User');

        // Find an admin user
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log('❌ No admin user found. Please create an admin user first.');
            process.exit(1);
        }

        console.log(`👤 Using admin: ${admin.name} (${admin.email})\n`);

        // Create a test event
        const testEvent = {
            title: 'Test Event - Database Verification',
            description: 'This is a test event to verify database connectivity and event creation',
            category: 'technical',
            date: new Date('2025-03-15'),
            time: '10:00',
            venue: 'Test Auditorium',
            eligibility: {
                department: ['All'],
                year: [1, 2, 3, 4]
            },
            maxCapacity: 100,
            createdBy: admin._id
        };

        console.log('📝 Creating test event...');
        console.log('Event data:', JSON.stringify(testEvent, null, 2));

        try {
            const event = await Event.create(testEvent);
            console.log('\n✅ Event created successfully!');
            console.log('Event ID:', event._id);
            console.log('Event Title:', event.title);

            // Verify it was saved
            const savedEvent = await Event.findById(event._id);
            console.log('\n🔍 Verification - Event found in DB:', savedEvent ? 'YES ✅' : 'NO ❌');

            // Count total events
            const count = await Event.countDocuments();
            console.log(`📊 Total events in database: ${count}`);

            // List all events
            const allEvents = await Event.find();
            console.log('\n📋 All events in database:');
            allEvents.forEach((evt, index) => {
                console.log(`   ${index + 1}. ${evt.title} (${evt._id})`);
            });

        } catch (error) {
            console.error('\n❌ Error creating event:', error);
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
