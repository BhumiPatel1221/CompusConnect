const recommendationService = require('../services/recommendationService');

/**
 * GET /api/recommendations/:studentId
 */
exports.getRecommendations = async (req, res, next) => {
    try {
        const { studentId } = req.params;

        if (req.user?.role === 'student' && String(req.user.id) !== String(studentId)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            });
        }

        const { recommendations } = await recommendationService.getStudentRecommendations(studentId);

        return res.status(200).json({
            success: true,
            data: recommendations,
        });
    } catch (error) {
        next(error);
    }
};
