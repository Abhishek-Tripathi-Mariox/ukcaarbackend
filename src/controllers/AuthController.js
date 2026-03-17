const UserService = require("../services/UserService");
const otpUtil = require("../util/otpUtil"); 
const tokenUtil = require("../util/tokenUtil"); 

module.exports = () => {

  const sendOtp = async (req, res, next) => {
    try {
      const { mobile } = req.body;

      const otp = otpUtil.generateOtp();
      await otpUtil.storeOtp(mobile, otp);

      console.log(`Sending OTP ${otp} to mobile ${mobile}`);
      req.rData = { mobile,otp:"115577" };
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

      let user = await UserService().fetchByQuery({ mobile });
      if (!user) {
        user = await UserService().create({ mobile });
      }

      const token = tokenUtil.generateToken({ user_id: user._id });
      req.rData = { user, token };
      req.msg = "OTP verified successfully";
    } catch (error) {
      req.msg = "Failed to verify OTP";
      req.error = error;
    }
    next();
  };

  const updateProfile = async (req, res, next) => {
    try {
      const { userId } = req.body;
      const { fullname, email, phone, address, zipCode, state, latitude, longitude } = req.body;

      let location;
      if (latitude && longitude) {
        location = {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        };
      }

      // Update user profile
      const updatedUser = await UserService().update(
        { _id: userId },
        { fullname, email, phone, address, zipCode, state, location }
      );

      req.rData = { user: updatedUser };
      req.msg = "Profile updated successfully";
    } catch (error) {
      req.msg = "Failed to update profile";
      req.error = error;
    }
    next();
  };



  const applyReferralCode = async (req, res, next) => {
    try {
      const { userId } = req.body; // Extracted by verifyUserToken middleware
      const { referralCode } = req.body;

      // Check if referral code exists
      const referrer = await UserService().fetchByQuery({ referralCode });
      if (!referrer) {
        req.msg = "Invalid referral code";
        return next();
      }

      // Update user with referrerId
      const updatedUser = await UserService().update(
        { _id: userId },
        { referrerId: referrer._id }
      );

      req.rData = { user: updatedUser };
      req.msg = "Referral code applied successfully";
    } catch (error) {
      req.msg = "Failed to apply referral code";
      req.error = error;
    }
    next();
  };

  const getUserDetails = async (req, res, next) => {
    try {
        
      const { userId } = req.body;

      // Fetch user details
      const user = await UserService().fetchByQuery({ _id: userId });

      if (!user) {
        req.msg = "User not found";
        return next();
      }

      req.rData = { user };
      req.msg = "User details fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch user details";
      req.error = error;
    }
    next();
  };

  const updateNotificationSettings = async (req, res, next) => {
    try {
      const { userId, pushNotification, promotionalNotification } = req.body;

      const updateData = {};
      if (pushNotification !== undefined) updateData.pushNotification = !!pushNotification;
      if (promotionalNotification !== undefined) updateData.promotionalNotification = !!promotionalNotification;

      if (Object.keys(updateData).length === 0) {
        req.rCode = 0;
        req.msg = "No fields to update";
        return next();
      }

      const user = await UserService().update({ _id: userId }, updateData);
      req.rData = { user };
      req.msg = "Notification settings updated successfully";
    } catch (error) {
      req.msg = "Failed to update notification settings";
      req.error = error;
    }
    next();
  };

  return {
    sendOtp,
    verifyOtp,
    updateProfile,
    applyReferralCode,
    getUserDetails,
    updateNotificationSettings,
  };
};
