const { Validator } = require("node-input-validator");
const { validate, validations } = require("./index");
const { body } = require("express-validator");

module.exports = () => {

  const validateSendOtp = async (req, res, next) => {
    const v = new Validator(req.body, {
      mobile: validations.general.requiredString
    });
    validate(v, res, next, req);
  };

  const validateVerifyOtp = async (req, res, next) => {
    const v = new Validator(req.body, {
      mobile: validations.general.requiredString,
      otp: validations.general.requiredString
    });
    validate(v, res, next, req);
  };

  const validateAddAddress = async (req, res, next) => {
    const v = new Validator(req.body, {
      city: validations.general.requiredString,
      state: validations.general.requiredString,
      zipCode: validations.general.requiredString,
      houseNo: validations.general.requiredString,
      email: validations.general.requiredString,
      fullName: validations.general.requiredString
    });
    validate(v, res, next, req);
  };  

  const validateAddPaymentMethod = async (req, res, next) => {
    const v = new Validator(req.body, {
      cardName: validations.general.requiredString,
      cardNumber: validations.general.requiredString,
      expiryDate: validations.general.requiredString,  
      cvc: validations.general.requiredString,
      zipCode: validations.general.requiredString,
    });
    validate(v, res, next, req);
  }
  
  const bookRideValidator = async (req, res, next) => {
    const v = new Validator(req.body, {

      pickupLatitude: "required|numeric|min:-90|max:90",
      pickupLongitude: "required|numeric|min:-180|max:180",

      dropoffLatitude: "required|numeric|min:-90|max:90",
      dropoffLongitude: "required|numeric|min:-180|max:180",

      rideType: "required|in:Economy,Premium,Comfort"
    });

    validate(v, res, next, req);
  };

const scheduleRideValidator = async (req, res, next) => {
  const v = new Validator(req.body, {

    pickupLatitude: "required|numeric|min:-90|max:90",
    pickupLongitude: "required|numeric|min:-180|max:180",

    dropoffLatitude: "required|numeric|min:-90|max:90",
    dropoffLongitude: "required|numeric|min:-180|max:180",

    rideType: "required|in:Economy,Premium,Comfort",

  });

  validate(v, res, next, req);
};

const acceptRideValidator = async (req, res, next) => {
  const v = new Validator(req.body, {
    rideId: validations.general.requiredString,
    driverId: validations.general.requiredString
  });

  validate(v, res, next, req);
};
  

  const validateRegisterRider = async (req, res, next) => {
    const v = new Validator(req.body, {
      fullname: validations.general.requiredString,
      mobile: validations.general.requiredString,
      gender: validations.general.requiredString,
    });
    validate(v, res, next, req);
  };
  return {
    validateSendOtp,
    validateVerifyOtp,
    validateAddAddress,
    validateAddPaymentMethod,
    bookRideValidator,
    scheduleRideValidator,
    acceptRideValidator,
    validateRegisterRider,
}
};
