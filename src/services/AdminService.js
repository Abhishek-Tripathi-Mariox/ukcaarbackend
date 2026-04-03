const Admin = require("../models/Admin");
const { hashPassword } = require("../util/passwordUtil");

module.exports = () => {
  const fetchByQuery = async (query) => {
    try {
      return await Admin.findOne(query);
    } catch (error) {
      console.error("Error fetching admin by query", { error: error.message });
      throw new Error("Database error");
    }
  };

  const fetchAll = async (query = {}, skip = 0, limit = 20, sort = { createdAt: -1 }) => {
    try {
      return await Admin.find(query).skip(skip).limit(limit).sort(sort);
    } catch (error) {
      console.error("Error fetching admins", { error: error.message });
      throw new Error("Database error");
    }
  };

  const count = async (query = {}) => {
    try {
      return await Admin.countDocuments(query);
    } catch (error) {
      console.error("Error counting admins", { error: error.message });
      throw new Error("Database error");
    }
  };

  const create = async (data) => {
    try {
      const admin = new Admin(data);
      await admin.save();
      return admin;
    } catch (error) {
      console.error("Error creating admin", { error: error.message });
      throw new Error("Database error");
    }
  };

  const update = async (query, data) => {
    try {
      const hasOperator = data && Object.keys(data).some((k) => k.startsWith("$"));
      const normalizedUpdate = hasOperator ? data : { $set: data };
      return await Admin.findOneAndUpdate(query, normalizedUpdate, { new: true });
    } catch (error) {
      console.error("Error updating admin", { error: error.message });
      throw new Error("Database error");
    }
  };

  const ensureDefaultAdmin = async () => {
    try {
      const email = process.env.ADMIN_EMAIL || "admin@ukcaar.com";
      const existing = await Admin.findOne({ email });
      if (existing) return existing;

      const password = process.env.ADMIN_PASSWORD || "Admin@123";
      const passwordHash = await hashPassword(password);

      const admin = new Admin({
        name: process.env.ADMIN_NAME || "Super Admin",
        email,
        phone: process.env.ADMIN_PHONE || "9999999999",
        role: process.env.ADMIN_ROLE || "SuperAdmin",
        passwordHash,
        isActive: true,
      });

      await admin.save();
      console.log("Default admin seeded", { email });
      return admin;
    } catch (error) {
      console.error("Error ensuring default admin", { error: error.message });
      throw new Error("Database error");
    }
  };

  return {
    fetchByQuery,
    fetchAll,
    count,
    create,
    update,
    ensureDefaultAdmin,
  };
};
