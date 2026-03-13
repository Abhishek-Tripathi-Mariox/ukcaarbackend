const RiderService = require("../services/RiderService");

module.exports = () => {

    const createRider = async (req, res, next) => {
        try {
            console.log("Creating rider with data:", req.body);
            const { fullname, mobile, age, gender,userId } = req.body;
            const existingRider = await RiderService().fetchOneByQuery({ createdBy:userId, fullname, mobile });
            if (existingRider) {
                req.msg = "Rider with the same details already exists";
                return next();
            }
            // Create a new rider
            const newRider = await RiderService().create({ fullname, mobile, age, gender, createdBy: userId });
            req.rData = { newRider };
            req.msg = "Rider created successfully";
        } catch (error) {
            console.error("Error creating rider", error);
            req.rCode = 0;
            req.msg = "Failed to create rider";
            req.error = error;
        }
        next();
    };

    const getRiderDetails = async (req, res, next) => {
        try {
            const { userId } = req.body; 
            // Fetch rider details
            const rider = await RiderService().fetchByQuery({ createdBy: userId });
            if (!rider) {
                req.rCode = 0;
                req.msg = "Rider not found";
                return next();
            }
            req.rData = { rider };
            req.msg = "Rider details fetched successfully";
        } catch (error) {
            req.rCode = 0;
            req.msg = "Failed to fetch rider details";
            req.error = error;
        }
        next();
    };
    return {
        createRider,
        getRiderDetails
    }
}