const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB\n');

        const Registration = require('./models/Registration');
        const Event = require('./models/Event');
        const User = require('./models/User');

        // Find a student user
        const student = await User.findOne({ role: 'student' });
        if (!student) {
            console.log('❌ No student user found. Please create a student user first.');
            process.exit(1);
        }

        console.log(`👤 Using student: ${student.name} (${student.email})`);
        console.log(`   Department: ${student.department}, Year: ${student.year}\n`);

        // Find an event
        const event = await Event.findOne({ status: 'upcoming' });
        if (!event) {
            console.log('❌ No upcoming event found. Please create an event first.');
            process.exit(1);
        }

        console.log(`📅 Using event: ${event.title}`);
        console.log(`   Date: ${event.date}, Venue: ${event.venue}\n`);

        // Check if already registered
        const existing = await Registration.findOne({
            event: event._id,
            student: student._id
        });

        if (existing) {
            console.log('⚠️  Student is already registered for this event');
            console.log('Registration ID:', existing._id);
            console.log('Status:', existing.status);
            console.log('\n📊 Total registrations in database:', await Registration.countDocuments());
            mongoose.connection.close();
            return;
        }

        // Create a test registration
        const testRegistration = {
            event: event._id,
            student: student._id
        };

        console.log('📝 Creating test registration...');
        console.log('Registration data:', JSON.stringify(testRegistration, null, 2));

        try {
            const registration = await Registration.create(testRegistration);
            console.log('\n✅ Registration created successfully!');
            console.log('Registration ID:', registration._id);
            console.log('Event:', event.title);
            console.log('Student:', student.name);
            console.log('Status:', registration.status);

            // Verify it was saved
            const savedRegistration = await Registration.findById(registration._id);
            console.log('\n🔍 Verification - Registration found in DB:', savedRegistration ? 'YES ✅' : 'NO ❌');

            // Update event registration count
            event.registrationCount += 1;
            await event.save();
            console.log('✅ Event registration count updated:', event.registrationCount);

            // Count total registrations
            const count = await Registration.countDocuments();
            console.log(`📊 Total registrations in database: ${count}`);

            // List all registrations for this student
            const studentRegs = await Registration.find({ student: student._id })
                .populate('event', 'title date');
            console.log(`\n📋 All registrations for ${student.name}:`);
            studentRegs.forEach((reg, index) => {
                console.log(`   ${index + 1}. ${reg.event.title} - ${reg.status} (${reg._id})`);
            });

        } catch (error) {
            console.error('\n❌ Error creating registration:', error);
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
