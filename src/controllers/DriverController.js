const DriverService = require("../services/DriverService");
const otpUtil = require("../util/otpUtil");
const tokenUtil = require("../util/tokenUtil");
const fileUploadService = require("../util/s3");


module.exports = () => {

    const sendOtp = async (req, res, next) => {
        try {
            const { mobile } = req.body;

            const otp = otpUtil.generateOtp();
            await otpUtil.storeOtp(mobile, otp);

            console.log(`Sending OTP ${otp} to mobile ${mobile}`);
            req.rData = { mobile, otp: "115577" };
            req.msg = "OTP sent successfully";
            next()
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
                licenseNumber,
                insuranceNumber
            } = req.body;

            let updateData = {
                vehicleType,
                vehicleNumber,
                licenseNumber,
                insuranceNumber
            };

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
            if (req.files && req.files.passbookfile) {
                const file = req.files.passbookfile;
                const uploadRes = await fileUploadService.uploadFileToAws(file);

                updateData["bankDetails.passbookfile"] = uploadRes.images[0];
            }
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

    return {
        sendOtp,
        verifyOtp,
        updateDriverProfile,
        updateDriverVehicleDetails,
        getDriverDetails,
        updateBankDetail,
        updateDrivingLicenseDetails,
        updateDrivingRcDetails,
        updateActiveInactiveStatus
    };
}