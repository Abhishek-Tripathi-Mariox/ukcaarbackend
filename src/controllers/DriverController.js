const DriverService = require("../services/DriverService");
const otpUtil = require("../util/otpUtil");
const tokenUtil = require("../util/tokenUtil");
const fileUploadService = require("../util/s3");
const RideService = require("../services/RideService");
const mongoose = require("mongoose");

module.exports = () => {

    const sendOtp = async (req, res, next) => {
        try {
            const { mobile } = req.body;

            const otp = otpUtil.generateOtp();
            await otpUtil.storeOtp(mobile, otp);

            console.log(`Sending OTP ${otp} to mobile ${mobile}`);
            req.rData = { mobile, otp: "115577" };
            req.msg = "OTP sent successfully";
        } catch (error) {
            console.error("Error sending OTP", error);
            req.msg = "Failed to send OTP";
            req.error = error;
        }
        next();
    };

    const verifyOtp = async (req, res, next) => {
        try {
            const { mobile, otp } = req.body;

            // Verify OTP from Redis
            const isValid = await otpUtil.verifyOtp(mobile, otp);

            if (!isValid) {
                req.msg = "Invalid or expired OTP";
                return next();
            }

            let user = await DriverService().fetchByQuery({ mobile });
            if (!user) {
                user = await DriverService().create({ mobile });
            }

            const token = tokenUtil.generateToken({ driverId: user._id });
            req.rData = { user, token };
            req.msg = "OTP verified successfully";
        } catch (error) {
            req.msg = "Failed to verify OTP";
            req.error = error;
        }
        next();
    };

    const updateDriverProfile = async (req, res, next) => {
        try {
            const { driverId } = req.body;

            const {
                fullname,
                mobile,
                email,
                ridepreference,
                address,
                dateOfBirth
            } = req.body;

            let updateData = {
                fullname,
                mobile,
                email,
                ridepreference,
                address,
                dateOfBirth
            };
            if (req.files && req.files.profilePhoto) {
                const file = req.files.profilePhoto;
                const uploadRes = await fileUploadService.uploadFileToAws(file);

                updateData["profilePhoto"] = uploadRes.images[0];
            }
            // remove undefined values
            Object.keys(updateData).forEach(
                (key) => updateData[key] === undefined && delete updateData[key]
            );

            const updatedDriver = await DriverService().update(
                { _id: driverId },
                { $set: updateData }
            );

            req.rData = { driver: updatedDriver };
            req.msg = "Driver profile updated successfully";

        } catch (error) {
            req.msg = "Failed to update driver profile";
            req.error = error;
        }

        next();
    };

    const updateDriverVehicleDetails = async (req, res, next) => {
        try {
            const { driverId } = req.body;

            const {
                vehicleType,
                vehicleNumber,
                registrationNumber,
                model,
                color,
                manufacturingYear,
                seatingCapacity,
                licenseNumber,
                insuranceNumber
            } = req.body;

            let updateData = {
                "vehicle.vehicleType": vehicleType,
                "vehicle.model": model,
                "vehicle.color": color,
                "vehicle.registrationNumber": registrationNumber || vehicleNumber,
                "vehicle.manufacturingYear": manufacturingYear,
                "vehicle.seatingCapacity": seatingCapacity,
            };

            // Backward-compat mappings (optional)
            if (licenseNumber) {
                updateData["documents.drivingLicense.number"] = licenseNumber;
            }
            if (insuranceNumber) {
                // if schema doesn't have number, mongoose will ignore in strict mode unless added later
                updateData["documents.insurance.number"] = insuranceNumber;
            }

            // remove undefined values
            Object.keys(updateData).forEach(
                (key) => updateData[key] === undefined && delete updateData[key]
            );

            const updatedDriver = await DriverService().update(
                { _id: driverId },
                { $set: updateData }
            );

            req.rData = { driver: updatedDriver };
            req.msg = "Driver vehicle details updated successfully";

        } catch (error) {
            req.msg = "Failed to update driver vehicle details";
            req.error = error;
        }

        next();
    };

    const getDriverDetails = async (req, res, next) => {
        try {
            const { driverId } = req.body;

            const driver = await DriverService().fetchByQuery({ _id: driverId });

            if (!driver) {
                req.msg = "Driver not found";
                return next();
            }

            req.rData = { driver };
            req.msg = "Driver details fetched successfully";
        } catch (error) {
            req.msg = "Failed to fetch driver details";
            req.error = error;
        }
        next();
    };

    const updateDrivingLicenseDetails = async (req, res, next) => {
        try {
            const { driverId, drivingLicenseNumber, expiryDate } = req.body;

            let updateData = {};

            // license number
            if (drivingLicenseNumber) {
                updateData["documents.drivingLicense.number"] = drivingLicenseNumber;
            }

            // expiry date
            if (expiryDate) {
                updateData["documents.drivingLicense.expiryDate"] = new Date(expiryDate);
            }

            // license image upload
            if (req.files && req.files.licenseImage) {
                const file = req.files.licenseImage;
                const uploadRes = await fileUploadService.uploadFileToAws(file);

                updateData["documents.drivingLicense.file"] = uploadRes.images[0];
            }

            // remove undefined values
            Object.keys(updateData).forEach(
                (key) => updateData[key] === undefined && delete updateData[key]
            );

            const updatedDriver = await DriverService().update(
                { _id: driverId },
                { $set: updateData }
            );

            req.rData = { driver: updatedDriver };
            req.msg = "Driving license details updated successfully";

        } catch (error) {
            req.msg = "Error in updating license details";
            req.error = error;
        }

        next();
    };

    const updateBankDetail = async (req, res, next) => {
        try {
            const { driverId } = req.body;
            const {
                accountHolderName,
                bankName,
                accountNumber,
                ifscCode,
                branchName
            } = req.body;

            let updateData = {
                "bankDetails.accountHolderName": accountHolderName,
                "bankDetails.bankName": bankName,
                "bankDetails.accountNumber": accountNumber,
                "bankDetails.ifscCode": ifscCode,
                "bankDetails.branchName": branchName
            };

            if (req.files && req.files.passbookfile) {
                const file = req.files.passbookfile;
                const uploadRes = await fileUploadService.uploadFileToAws(file);
                updateData["bankDetails.passbookfile"] = uploadRes.images[0];
            }

            // remove undefined values
            Object.keys(updateData).forEach(
                (key) => updateData[key] === undefined && delete updateData[key]
            );

            const updatedDriver = await DriverService().update(
                { _id: driverId },
                { $set: updateData }
            );

            req.rData = { driver: updatedDriver };
            req.msg = "Driver bank details updated successfully";
        } catch (error) {
            req.msg = "Failed to update";
            req.error = error;
        }

        next();
    };

    const updateDrivingRcDetails = async (req, res, next) => {
        try {
            const { driverId } = req.body;

            let updateData = {};

            // rc expiry date
            if (req.body.rcExpiryDate) {
                updateData["documents.rc.expiryDate"] = new Date(req.body.rcExpiryDate);
            }

            // rc image upload
            if (req.files && req.files.rcImage) {
                const file = req.files.rcImage;
                const uploadRes = await fileUploadService.uploadFileToAws(file);

                updateData["documents.rc.file"] = uploadRes.images[0];
            }

            // remove undefined values
            Object.keys(updateData).forEach(
                (key) => updateData[key] === undefined && delete updateData[key]
            );

            const updatedDriver = await DriverService().update(
                { _id: driverId },
                { $set: updateData }
            );

            req.rData = { driver: updatedDriver };
            req.msg = "RC details updated successfully";

        } catch (error) {
            req.msg = "Error in updating RC details";
            req.error = error;
        }

        next();
    };

    const updateActiveInactiveStatus = async (req, res, next) => {
        try {
            const { driverId, status } = req.body;

            if (!["Active", "Inactive"].includes(status)) {
                req.msg = "Invalid status value";
                return next();
            }

            const updatedDriver = await DriverService().update(
                { _id: driverId },
                { $set: { status } }
            );

            req.rData = { driver: updatedDriver };
            req.msg = `Driver status updated to ${status} successfully`;

        } catch (error) {
            req.msg = "Failed to update driver status";
            req.error = error;
        }

        next();
    };
    const getAllDrivers = async (req, res, next) => {
        try {
            let { page = 1, limit = 10 } = req.query;

            page = parseInt(page);
            limit = parseInt(limit);

            const skip = (page - 1) * limit;

            const drivers = await DriverService().fetchAll({}, skip, limit);
            const totalDrivers = await DriverService().count({});

            req.rData = {
                drivers,
                pagination: {
                    total: totalDrivers,
                    page,
                    limit,
                    totalPages: Math.ceil(totalDrivers / limit)
                }
            };

            req.msg = "Drivers fetched successfully";
        } catch (error) {
            req.msg = "Failed to fetch drivers";
            req.error = error;
        }

        next();
    };

    const getScheduleRides = async (req, res, next) => {
        try {
            const { driverId } = req.body;

            // Fetch scheduled rides for the driver
            const scheduledRides = await RideService().fetchAll({
                driverId,
                status: "scheduled"
            });
            const count = await RideService().count({ driverId, status: "scheduled" });
            req.rData = { scheduledRides, count };
            req.msg = "Scheduled rides fetched successfully";
        } catch (error) {
            req.msg = "Failed to fetch scheduled rides";
            req.error = error;
        }
        next();
    };

    const updateDriverLocation = async (req, res, next) => {
        try {
            const { driverId, latitude, longitude } = req.body;

            if (latitude === undefined || longitude === undefined) {
                req.rCode = 0;
                req.msg = "latitude and longitude are required";
                return next();
            }

            const updatedDriver = await DriverService().update(
                { _id: driverId },
                {
                    $set: {
                        currentLocation: {
                            type: "Point",
                            coordinates: [parseFloat(longitude), parseFloat(latitude)],
                        },
                        lastLocationUpdatedAt: new Date(),
                    },
                }
            );

            req.rData = { driver: updatedDriver };
            req.msg = "Driver location updated successfully";
        } catch (error) {
            req.msg = "Failed to update driver location";
            req.error = error;
        }
        next();
    };

    const getRideRequests = async (req, res, next) => {
        try {
            const { driverId } = req.body;
            let { page = 1, limit = 10, latitude, longitude, maxDistanceMeters, includeScheduled } = req.query;

            page = parseInt(page);
            limit = parseInt(limit);
            const skip = (page - 1) * limit;

            const baseStatus = includeScheduled === "1"
                ? { $in: ["requested", "booked", "scheduled"] }
                : { $in: ["requested", "booked"] };

            const query = {
                driverId: null,
                status: baseStatus,
                rejectedByDrivers: { $ne: driverId },
            };

            if (latitude !== undefined && longitude !== undefined) {
                const maxDistance = maxDistanceMeters ? parseInt(maxDistanceMeters) : 5000;
                query.pickupLocation = {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [parseFloat(longitude), parseFloat(latitude)],
                        },
                        $maxDistance: maxDistance,
                    },
                };
            }

            const rides = await RideService().fetchByQuery(query, null, { skip, limit });
            const total = await RideService().count(query);

            req.rData = {
                rides,
                pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
            };
            req.msg = "Ride requests fetched successfully";
        } catch (error) {
            req.msg = "Failed to fetch ride requests";
            req.error = error;
        }
        next();
    };

    const acceptRideRequest = async (req, res, next) => {
        try {
            const { driverId, rideId } = req.body;

            const updatedRide = await RideService().findOneAndUpdate(
                {
                    _id: rideId,
                    driverId: null,
                    status: { $in: ["requested", "booked", "scheduled"] },
                    rejectedByDrivers: { $ne: driverId },
                },
                { $set: { driverId, status: "accepted", acceptedAt: new Date() } }
            );

            if (!updatedRide) {
                req.rCode = 5;
                req.msg = "Ride not found or already accepted";
                return next();
            }

            req.rData = { ride: updatedRide };
            req.msg = "Ride accepted successfully";
        } catch (error) {
            req.msg = "Failed to accept ride";
            req.error = error;
        }
        next();
    };

    const rejectRideRequest = async (req, res, next) => {
        try {
            const { driverId, rideId } = req.body;

            const updatedRide = await RideService().findOneAndUpdate(
                {
                    _id: rideId,
                    driverId: null,
                    status: { $in: ["requested", "booked", "scheduled"] },
                },
                { $addToSet: { rejectedByDrivers: driverId } }
            );

            if (!updatedRide) {
                req.rCode = 5;
                req.msg = "Ride not found";
                return next();
            }

            req.rData = { ride: updatedRide };
            req.msg = "Ride rejected successfully";
        } catch (error) {
            req.msg = "Failed to reject ride";
            req.error = error;
        }
        next();
    };

    const getCurrentRide = async (req, res, next) => {
        try {
            const { driverId } = req.body;

            const ride = await RideService().fetchOne({
                driverId,
                status: { $in: ["accepted", "arrived", "started", "booked"] },
            }, null, { sort: { updatedAt: -1 } });

            req.rData = { ride };
            req.msg = "Current ride fetched successfully";
        } catch (error) {
            req.msg = "Failed to fetch current ride";
            req.error = error;
        }
        next();
    };

    const arriveAtPickup = async (req, res, next) => {
        try {
            const { driverId, rideId } = req.body;

            const updatedRide = await RideService().findOneAndUpdate(
                { _id: rideId, driverId, status: { $in: ["accepted", "booked"] } },
                { $set: { status: "arrived", arrivedAt: new Date() } }
            );

            if (!updatedRide) {
                req.rCode = 5;
                req.msg = "Ride not found";
                return next();
            }

            req.rData = { ride: updatedRide };
            req.msg = "Arrived at pickup successfully";
        } catch (error) {
            req.msg = "Failed to update arrival";
            req.error = error;
        }
        next();
    };

    const verifyPickupOtp = async (req, res, next) => {
        try {
            const { driverId, rideId, otp } = req.body;

            const ride = await RideService().fetchOne({ _id: rideId, driverId });
            if (!ride) {
                req.rCode = 5;
                req.msg = "Ride not found";
                return next();
            }

            if (!ride.pickupOtp) {
                req.rCode = 0;
                req.msg = "Pickup OTP not available for this ride";
                return next();
            }

            if (`${otp}` !== `${ride.pickupOtp}`) {
                req.rCode = 0;
                req.msg = "Invalid OTP";
                return next();
            }

            const updatedRide = await RideService().findOneAndUpdate(
                { _id: rideId, driverId },
                { $set: { pickupOtpVerified: true } }
            );

            req.rData = { ride: updatedRide };
            req.msg = "OTP verified successfully";
        } catch (error) {
            req.msg = "Failed to verify OTP";
            req.error = error;
        }
        next();
    };

    const startRide = async (req, res, next) => {
        try {
            const { driverId, rideId, otp } = req.body;

            const ride = await RideService().fetchOne({ _id: rideId, driverId });
            if (!ride) {
                req.rCode = 5;
                req.msg = "Ride not found";
                return next();
            }

            let pickupOtpVerified = !!ride.pickupOtpVerified;
            if (!pickupOtpVerified && otp !== undefined) {
                pickupOtpVerified = `${otp}` === `${ride.pickupOtp}`;
            }

            if (!pickupOtpVerified) {
                req.rCode = 0;
                req.msg = "Pickup OTP verification required";
                return next();
            }

            const updatedRide = await RideService().findOneAndUpdate(
                { _id: rideId, driverId, status: { $in: ["accepted", "arrived", "booked"] } },
                { $set: { status: "started", startedAt: new Date(), pickupOtpVerified: true } }
            );

            if (!updatedRide) {
                req.rCode = 0;
                req.msg = "Ride cannot be started";
                return next();
            }

            req.rData = { ride: updatedRide };
            req.msg = "Ride started successfully";
        } catch (error) {
            req.msg = "Failed to start ride";
            req.error = error;
        }
        next();
    };

    const completeRide = async (req, res, next) => {
        try {
            const { driverId, rideId, fare, distanceKm, durationMin } = req.body;

            const update = {
                status: "completed",
                completedAt: new Date(),
            };
            if (fare !== undefined) update.fare = parseFloat(fare);
            if (distanceKm !== undefined) update.distanceKm = parseFloat(distanceKm);
            if (durationMin !== undefined) update.durationMin = parseFloat(durationMin);

            const updatedRide = await RideService().findOneAndUpdate(
                { _id: rideId, driverId, status: { $in: ["started", "accepted", "arrived", "booked"] } },
                { $set: update }
            );

            if (!updatedRide) {
                req.rCode = 0;
                req.msg = "Ride cannot be completed";
                return next();
            }

            req.rData = { ride: updatedRide };
            req.msg = "Ride completed successfully";
        } catch (error) {
            req.msg = "Failed to complete ride";
            req.error = error;
        }
        next();
    };

    const getDriverRideHistory = async (req, res, next) => {
        try {
            const { driverId } = req.body;
            let { page = 1, limit = 10, status } = req.query;

            page = parseInt(page);
            limit = parseInt(limit);
            const skip = (page - 1) * limit;

            const query = { driverId };
            if (status) query.status = status;

            const rides = await RideService().fetchByQuery(query, null, { skip, limit });
            const total = await RideService().count(query);

            req.rData = {
                rides,
                pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
            };
            req.msg = "Driver ride history fetched successfully";
        } catch (error) {
            req.msg = "Failed to fetch driver ride history";
            req.error = error;
        }
        next();
    };

    const getEarningsSummary = async (req, res, next) => {
        try {
            const { driverId } = req.body;
            const { startDate, endDate, timezone } = req.query;

            const tz = timezone || "UTC";
            const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const end = endDate ? new Date(endDate) : new Date();

            const driverObjectId = new mongoose.Types.ObjectId(driverId);

            const rows = await RideService().aggregate([
                {
                    $match: {
                        driverId: driverObjectId,
                        status: "completed",
                        completedAt: { $gte: start, $lte: end },
                    },
                },
                {
                    $group: {
                        _id: {
                            day: {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$completedAt",
                                    timezone: tz,
                                },
                            },
                        },
                        totalFare: { $sum: "$fare" },
                        totalRides: { $sum: 1 },
                    },
                },
                { $sort: { "_id.day": 1 } },
            ]);

            const totals = await RideService().aggregate([
                {
                    $match: {
                        driverId: driverObjectId,
                        status: "completed",
                        completedAt: { $gte: start, $lte: end },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalFare: { $sum: "$fare" },
                        totalRides: { $sum: 1 },
                    },
                },
            ]);

            req.rData = {
                range: { startDate: start.toISOString(), endDate: end.toISOString(), timezone: tz },
                totals: totals[0] || { totalFare: 0, totalRides: 0 },
                byDay: rows.map((r) => ({ day: r._id.day, totalFare: r.totalFare, totalRides: r.totalRides })),
            };
            req.msg = "Earnings summary fetched successfully";
        } catch (error) {
            req.msg = "Failed to fetch earnings summary";
            req.error = error;
        }
        next();
    };

    const getJourneys = async (req, res, next) => {
        try {
            const { driverId } = req.body;
            let { page = 1, limit = 10, category, status } = req.query;

            page = parseInt(page);
            limit = parseInt(limit);
            const skip = (page - 1) * limit;

            const now = new Date();
            const query = { driverId };

            // If status is explicitly provided, prefer it.
            if (status) {
                if (status.includes(",")) {
                    query.status = { $in: status.split(",").map((s) => s.trim()) };
                } else {
                    query.status = status;
                }
            } else {
                const cat = (category || "all").toLowerCase();
                if (cat === "completed") {
                    query.status = "completed";
                } else if (cat === "scheduled") {
                    query.status = "scheduled";
                    query.scheduledTime = { $gte: now };
                } else if (cat === "upcoming") {
                    query.status = { $in: ["accepted", "arrived", "started", "scheduled"] };
                } else if (cat === "past") {
                    query.status = { $in: ["completed", "canceled"] };
                } else {
                    // all journeys for this driver
                    query.status = { $in: ["accepted", "arrived", "started", "completed", "canceled", "scheduled", "booked"] };
                }
            }

            const rides = await RideService().fetchByQuery(query, null, { skip, limit, sort: { updatedAt: -1 } });
            const total = await RideService().count(query);

            req.rData = {
                rides,
                pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
            };
            req.msg = "Journeys fetched successfully";
        } catch (error) {
            req.msg = "Failed to fetch journeys";
            req.error = error;
        }
        next();
    };

    const getJourneyDetails = async (req, res, next) => {
        try {
            const { driverId } = req.body;
            const { rideId } = req.params;

            const ride = await RideService().fetchOne({ _id: rideId, driverId });
            if (!ride) {
                req.rCode = 5;
                req.msg = "Ride not found";
                return next();
            }

            req.rData = { ride };
            req.msg = "Journey details fetched successfully";
        } catch (error) {
            req.msg = "Failed to fetch journey details";
            req.error = error;
        }
        next();
    };

    const emergencySos = async (req, res, next) => {
        try {
            const { driverId, rideId, message, latitude, longitude } = req.body;
            console.log("EMERGENCY_SOS", {
                driverId,
                rideId,
                message,
                latitude,
                longitude,
                at: new Date().toISOString(),
            });
            req.rData = { ok: true };
            req.msg = "Emergency SOS received";
        } catch (error) {
            req.msg = "Failed to send SOS";
            req.error = error;
        }
        next();
    };
    return {
        sendOtp,
        verifyOtp,
        updateDriverProfile,
        updateDriverVehicleDetails,
        getDriverDetails,
        updateBankDetail,
        updateDrivingLicenseDetails,
        updateDrivingRcDetails,
        updateActiveInactiveStatus,
        getAllDrivers,
        getScheduleRides,
        updateDriverLocation,
        getRideRequests,
        acceptRideRequest,
        rejectRideRequest,
        getCurrentRide,
        arriveAtPickup,
        verifyPickupOtp,
        startRide,
        completeRide,
        getDriverRideHistory,
        getEarningsSummary,
        getJourneys,
        getJourneyDetails,
        emergencySos
    };
}
