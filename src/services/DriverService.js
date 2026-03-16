const Driver = require("../models/Driver.js");

module.exports = () => {

    const fetchByQuery = async (query) => {
        try {
            return await Driver.findOne(query);
        } catch (error) {
            console.error("Error fetching driver by query", { error: error.message });
            throw new Error("Database error");
        }
    };

    const create = async (userData) => {
        try {
            const user = new Driver(userData);
            await user.save();
            return user;
        } catch (error) {
            console.error("Error creating driver", { error: error.message });
            throw new Error("Database error");
        }
    };


    const update = async (query, data) => {
        try {
            return await Driver.findOneAndUpdate(query, data, { new: true });
        } catch (error) {
            console.error("Error updating driver", { error: error.message });
            throw new Error("Database error");
        }
    };
    const fetchAll = async (query = {}, skip = 0, limit = 10) => {
        return await Driver.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
    };
    const count = async (query = {}) => {
        return await Driver.countDocuments(query);
    };
    return {
        fetchByQuery,
        create,
        update,
        fetchAll,
        count,
    };
};