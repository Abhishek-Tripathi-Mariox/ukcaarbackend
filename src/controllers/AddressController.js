const AddressService = require("../services/AddressService");

module.exports = () => {
  const addAddress = async (req, res, next) => {
    try {
      const { userId } = req.body; // Extracted by verifyUserToken middleware
      const {  city, state, zipCode, houseNo, landmark,email,fullName ,addressType} = req.body;

      // Add a new address
      const address = await AddressService().create({
        userId,
        city,
        state,
        zipCode,
        houseNo,
        landmark,
        email,
        fullName,
        addressType
      });

      req.rData = { address };
      req.msg = "Address added successfully";
    } catch (error) {
      req.msg = "Failed to add address";
      req.error = error;
    }
    next();
  };

  const getAddresses = async (req, res, next) => {
    try {
      const { userId } = req.body; // Extracted by verifyUserToken middleware

      // Fetch all addresses for the user
      const addresses = await AddressService().fetchByQuery({ userId });

      req.rData = { addresses };
      req.msg = "Addresses fetched successfully";
    } catch (error) {
      req.msg = "Failed to fetch addresses";
      req.error = error;
    }
    next();
  };

  const deleteAddress = async (req, res, next) => {
    try {
      const { userId } = req.body; // Extracted by verifyUserToken middleware
      const { id } = req.params;

      // Delete the address
      const deletedAddress = await AddressService().deleteAddress({ _id: id, userId });

      if (!deletedAddress) {
        req.msg = "Address not found or cannot be deleted";
        return next();
      }

      req.rData = { address: deletedAddress };
      req.msg = "Address deleted successfully";
    } catch (error) {
      req.msg = "Failed to delete address";
      req.error = error;
    }
    next();
  };

  const updateAddress = async (req, res, next) => {
    try {
      const { userId } = req.body;
      const { id } = req.params;

      const {
        city,
        state,
        zipCode,
        houseNo,
        landmark,
        customerInstructions,
        email,
        fullName,
        addressType,
      } = req.body;

      const updateData = {
        city,
        state,
        zipCode,
        houseNo,
        landmark,
        customerInstructions,
        email,
        fullName,
        addressType,
      };
      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key],
      );

      if (Object.keys(updateData).length === 0) {
        req.rCode = 0;
        req.msg = "No fields to update";
        return next();
      }

      const updatedAddress = await AddressService().update(
        { _id: id, userId },
        updateData,
      );

      if (!updatedAddress) {
        req.rCode = 5;
        req.msg = "Address not found";
        return next();
      }

      req.rData = { address: updatedAddress };
      req.msg = "Address updated successfully";
    } catch (error) {
      req.msg = "Failed to update address";
      req.error = error;
    }
    next();
  };

  return {
    addAddress,
    getAddresses,
    deleteAddress,
    updateAddress,
  };
};
