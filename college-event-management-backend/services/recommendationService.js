const User = require('../models/User');
const Event = require('../models/Event');

const DEFAULT_WEIGHTS = {
    skillMatchWeight: 0.6,
    branchWeight: 0.3,
    popularityWeight: 0.1,
};

function normalizeStringArray(arr) {
    if (!Array.isArray(arr)) return [];
    return arr
        .map((s) => (typeof s === 'string' ? s.trim().toLowerCase() : ''))
        .filter(Boolean);
}

function computeMatchScore({ skillRatio, branchMatch, popularityRatio, weights }) {
    const w = weights || DEFAULT_WEIGHTS;
    const score =
        (w.skillMatchWeight * skillRatio +
            w.branchWeight * (branchMatch ? 1 : 0) +
            w.popularityWeight * popularityRatio) *
        100;

    return Math.max(0, Math.min(100, Math.round(score)));
}

function buildReasons({ skillOverlap, branchMatch, popularityRatio, studentDepartment, studentYear, event }) {
    const reasons = [];

    // Skills (mapped to interests in current schema)
    if (skillOverlap.length > 0) {
        reasons.push(`Matches your ${skillOverlap[0]} interest`);
    }

    // Branch/department eligibility
    if (branchMatch) {
        if (event?.eligibility?.department?.includes('All')) {
            reasons.push('Open to all departments');
        } else if (studentDepartment) {
            reasons.push(`Eligible for ${studentDepartment} department`);
        } else {
            reasons.push('Eligible for your department');
        }
    }

    // Year eligibility
    if (Array.isArray(event?.eligibility?.year) && studentYear !== undefined) {
        reasons.push(`Eligible for year ${studentYear}`);
    }

    // Popularity
    if (popularityRatio >= 0.7) {
        reasons.push('Popular among students');
    } else if (popularityRatio >= 0.4) {
        reasons.push('Trending event');
    }

    return reasons.slice(0, 3);
}

async function getStudentRecommendations(studentId, options = {}) {
    const weights = options.weights || DEFAULT_WEIGHTS;

    const student = await User.findById(studentId).lean();
    if (!student || student.role !== 'student') {
        return { student: null, recommendations: [] };
    }

    const activeEvents = await Event.find({ status: { $in: ['upcoming', 'ongoing'] } })
        .select('title category date time venue eligibility registrationCount status')
        .lean();

    if (!activeEvents.length) {
        return { student, recommendations: [] };
    }

    const maxReg = Math.max(...activeEvents.map((e) => e.registrationCount || 0), 0);

    const studentSkills = normalizeStringArray(student.interests);
    const studentDept = student.department;
    const studentYear = student.year !== undefined && student.year !== null ? Number(student.year) : undefined;

    const scored = activeEvents
        .map((event) => {
            // Skill match ratio: overlap between student.interests and event.category/title keywords (fallback)
            // Note: The project schema does not currently include requiredSkills, so we map to a lightweight heuristic.
            const eventTokens = normalizeStringArray([
                event.category,
                ...(typeof event.title === 'string' ? event.title.split(/\s+/) : []),
            ]);
            const overlap = studentSkills.filter((s) => eventTokens.includes(s));
            const skillRatio = studentSkills.length ? overlap.length / studentSkills.length : 0;

            const eligibleDepts = event?.eligibility?.department || ['All'];
            const branchMatch = eligibleDepts.includes('All') || (studentDept ? eligibleDepts.includes(studentDept) : false);

            const eligibleYears = Array.isArray(event?.eligibility?.year) ? event.eligibility.year : [1, 2, 3, 4];
            const yearEligible = studentYear !== undefined ? eligibleYears.includes(studentYear) : true;

            // Popularity normalized
            const popularityRatio = maxReg > 0 ? (event.registrationCount || 0) / maxReg : 0;

            // If not eligible by year/department, down-rank heavily but still keep (so UI can show "No recommendations yet" cleanly)
            const hardEligible = branchMatch && yearEligible;
            const matchScore = hardEligible
                ? computeMatchScore({ skillRatio, branchMatch, popularityRatio, weights })
                : 0;

            const reasons = hardEligible
                ? buildReasons({
                      skillOverlap: overlap,
                      branchMatch,
                      popularityRatio,
                      studentDepartment: studentDept,
                      studentYear,
                      event,
                  })
                : [];

            return {
                event,
                matchScore,
                reasons,
                registrationCount: event.registrationCount || 0,
                hardEligible,
            };
        })
        .filter((x) => x.hardEligible)
        .sort((a, b) => {
            if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
            return (b.registrationCount || 0) - (a.registrationCount || 0);
        })
        .slice(0, 5)
        .map((x) => ({
            eventId: x.event._id,
            eventName: x.event.title,
            matchScore: x.matchScore,
            reasons: x.reasons,
            // Additional fields for frontend rendering without extra requests
            event: x.event,
        }));

    return { student, recommendations: scored };
}

module.exports = {
    getStudentRecommendations,
    DEFAULT_WEIGHTS,
};
