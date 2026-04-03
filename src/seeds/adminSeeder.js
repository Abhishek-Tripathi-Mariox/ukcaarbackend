const AdminService = require("../services/AdminService");

module.exports = async function seedDefaultAdmin() {
  return AdminService().ensureDefaultAdmin();
};
