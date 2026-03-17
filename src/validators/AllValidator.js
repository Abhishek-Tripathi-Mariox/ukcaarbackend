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

  const validateApplyReferralCode = async (req, res, next) => {
    const v = new Validator(req.body, {
      referralCode: validations.general.requiredString,
    });
    validate(v, res, next, req);
  };
  
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
    scheduledTime: validations.general.requiredString,

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

const validateDriverRideId = async (req, res, next) => {
  const v = new Validator(req.body, {
    rideId: validations.general.requiredString,
  });
  validate(v, res, next, req);
};

const validateVerifyPickupOtp = async (req, res, next) => {
  const v = new Validator(req.body, {
    rideId: validations.general.requiredString,
    otp: validations.general.requiredString,
  });
  validate(v, res, next, req);
};

const validateUpdateDriverLocation = async (req, res, next) => {
  const v = new Validator(req.body, {
    latitude: "required|numeric|min:-90|max:90",
    longitude: "required|numeric|min:-180|max:180",
  });
  validate(v, res, next, req);
};

const validateCompleteRide = async (req, res, next) => {
  const v = new Validator(req.body, {
    rideId: validations.general.requiredString,
    fare: "numeric",
    distanceKm: "numeric",
    durationMin: "numeric",
  });
  validate(v, res, next, req);
};

const validateSubmitReview = async (req, res, next) => {
  const v = new Validator(req.body, {
    rideId: validations.general.requiredString,
    rating: "required|integer|min:1|max:5",
    comment: "string",
  });
  validate(v, res, next, req);
};

const validateCashoutRequest = async (req, res, next) => {
  const v = new Validator(req.body, {
    amount: "required|numeric|min:1",
    note: "string",
  });
  validate(v, res, next, req);
};

const validateCancelCashout = async (req, res, next) => {
  const v = new Validator(req.body, {
    cashoutId: validations.general.requiredString,
  });
  validate(v, res, next, req);
};

const validateMarkRidePaid = async (req, res, next) => {
  const v = new Validator(req.body, {
    rideId: validations.general.requiredString,
    paymentMethodId: "string",
    paymentRef: "string",
  });
  validate(v, res, next, req);
};

const validateEmergencySos = async (req, res, next) => {
  const v = new Validator(req.body, {
    rideId: "string",
    message: "string",
    latitude: "numeric",
    longitude: "numeric",
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
    validateApplyReferralCode,
    bookRideValidator,
    scheduleRideValidator,
    acceptRideValidator,
    validateDriverRideId,
    validateVerifyPickupOtp,
    validateUpdateDriverLocation,
    validateCompleteRide,
    validateSubmitReview,
    validateCashoutRequest,
    validateCancelCashout,
    validateMarkRidePaid,
    validateEmergencySos,
    validateRegisterRider,
}
};
