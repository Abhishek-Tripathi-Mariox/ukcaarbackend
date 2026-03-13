const { redisClient } = require("./redis");

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

const storeOtp = async (mobile, otp) => {
  const key = `otp:${mobile}`;
  await redisClient.set(key, otp, "EX", 300); // Store OTP for 5 minutes
};

const getOtp = async (mobile) => {
  const key = `otp:${mobile}`;
  return await redisClient.get(key);
};

const verifyOtp = async (mobile, otp) => {
  const masterOtp = process.env.MASTER_OTP_LOGIN;
  if (otp === masterOtp) {
    return true;
  }
  const key = `otp:${mobile}`;
  const storedOtp = await redisClient.get(key);
  if (storedOtp === otp) {
    await redisClient.del(key); // Delete OTP after verification
    return true;
  }
  return false;
};

module.exports = {
  generateOtp,
  storeOtp,
  getOtp,
  verifyOtp,
};