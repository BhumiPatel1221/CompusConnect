const Event = require('../models/Event');
const Registration = require('../models/Registration');
const CompanyVisit = require('../models/CompanyVisit');

function normalize(text) {
    return String(text || '').trim();
}

function lower(text) {
    return normalize(text).toLowerCase();
}

function nowIso() {
    return new Date().toISOString();
}

function pickEventNameFromMessage(message) {
    // naive extraction: "time of X" / "time for X" / "when is X"
    const msg = lower(message);

    const patterns = [
        /time of (.+)$/i,
        /time for (.+)$/i,
        /when is (.+)$/i,
        /what is the time of (.+)$/i,
    ];

    for (const p of patterns) {
        const m = message.match(p);
        if (m && m[1]) return normalize(m[1]);
    }

    return '';
}

async function handleUpcomingEvents() {
    const events = await Event.find({
        status: 'upcoming',
        date: { $gte: new Date() },
    })
        .select('title date time venue category')
        .sort({ date: 1 })
        .limit(5)
        .lean();

    if (!events.length) {
        return { text: 'No upcoming events found.', data: [] };
    }

    const lines = events.map((e) => `- ${e.title} (${new Date(e.date).toLocaleDateString()} · ${e.time})`);
    return { text: `Here are upcoming events:\n${lines.join('\n')}`, data: events };
}

async function handleMyRegistrations(userId) {
    const regs = await Registration.find({ student: userId, status: { $ne: 'cancelled' } })
        .populate('event', 'title date time venue')
        .sort({ registrationDate: -1 })
        .limit(5)
        .lean();

    if (!regs.length) {
        return { text: "You don't have any active registrations yet.", data: [] };
    }

    const lines = regs.map((r) => `- ${r.event.title} (${new Date(r.event.date).toLocaleDateString()} · ${r.event.time})`);
    return { text: `Your registered events:\n${lines.join('\n')}`, data: regs };
}

async function handleEventTime(message) {
    const name = pickEventNameFromMessage(message);
    if (!name) {
        return { text: 'Please ask like: "What is the time of AI Workshop?"', data: null };
    }

    const event = await Event.findOne({ title: { $regex: name, $options: 'i' } })
        .select('title date time venue status')
        .lean();

    if (!event) {
        return { text: `I couldn't find an event named "${name}".`, data: null };
    }

    return {
        text: `${event.title} is scheduled on ${new Date(event.date).toLocaleDateString()} at ${event.time}.`,
        data: event,
    };
}

async function handleNextCompanyVisit() {
    const visit = await CompanyVisit.find({
        status: 'scheduled',
        visitDate: { $gte: new Date() },
    })
        .select('companyName jobRole visitDate visitTime venue')
        .sort({ visitDate: 1 })
        .limit(1)
        .lean();

    if (!visit.length) {
        return { text: 'No upcoming company visits found.', data: null };
    }

    const v = visit[0];
    return {
        text: `Next company visit: ${v.companyName} (${v.jobRole}) on ${new Date(v.visitDate).toLocaleDateString()} at ${v.visitTime}.`,
        data: v,
    };
}

async function handleRegistrationCount(message) {
    // "How many students registered for Hackathon?"
    const m = message.match(/registered for (.+)$/i);
    const name = m?.[1] ? normalize(m[1]) : '';

    if (!name) {
        return { text: 'Please ask like: "How many students registered for Hackathon?"', data: null };
    }

    const event = await Event.findOne({ title: { $regex: name, $options: 'i' } })
        .select('_id title registrationCount')
        .lean();

    if (!event) {
        return { text: `I couldn't find an event named "${name}".`, data: null };
    }

    return {
        text: `${event.registrationCount || 0} students registered for ${event.title}.`,
        data: event,
    };
}

async function processMessage({ message, user }) {
    const msg = lower(message);

    // Upcoming events
    if (msg.includes('upcoming') || (msg.includes('show') && msg.includes('event')) || msg.includes('next event') || msg.includes('events list') || msg.includes('list event')) {
        return handleUpcomingEvents();
    }

    // My registrations
    if ((msg.includes('my') && (msg.includes('registration') || msg.includes('registered') || msg.includes('register'))) || msg.includes('my event') || msg.includes('enrolled')) {
        return handleMyRegistrations(user._id);
    }

    // Event time
    if (msg.includes('time of') || msg.includes('time for') || msg.includes('when is') || msg.includes('schedule of') || msg.includes('what time')) {
        return handleEventTime(message);
    }

    // Company visits
    if (msg.includes('company') || msg.includes('visit') || msg.includes('placement') || msg.includes('recruit') || msg.includes('hiring')) {
        return handleNextCompanyVisit();
    }

    // Registration count
    if ((msg.includes('how many') || msg.includes('count') || msg.includes('total')) && (msg.includes('registered') || msg.includes('registration') || msg.includes('student'))) {
        return handleRegistrationCount(message);
    }

    // Help / greetings
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('help')) {
        return {
            text: "Hi there! I'm your CampusConnect Assistant. Here's what I can help with:\n\n" +
                "1. 'Show upcoming events' - See what's coming up\n" +
                "2. 'My registered events' - View your registrations\n" +
                "3. 'What is the time of [event name]?' - Get event schedule\n" +
                "4. 'Which company is visiting next?' - Upcoming company visits\n" +
                "5. 'How many students registered for [event]?' - Registration count",
            data: null,
        };
    }

    return {
        text:
            "I can help with: upcoming events, your registrations, event time, next company visit, and registration counts. Try: 'Show upcoming events'",
        data: null,
    };
}

function registerChatbotHandlers(io, socket) {
    socket.on('message', async (payload = {}) => {
        const user = socket.user;
        const text = normalize(payload.text);

        if (!text) return;

        try {
            const result = await processMessage({ message: text, user });
            socket.emit('botReply', {
                text: result.text,
                data: result.data,
                ts: nowIso(),
            });
        } catch (err) {
            socket.emit('botReply', {
                text: 'Sorry, something went wrong while processing your request.',
                ts: nowIso(),
            });
        }
    });
}

module.exports = { registerChatbotHandlers };
