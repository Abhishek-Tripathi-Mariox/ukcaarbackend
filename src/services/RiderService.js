const Rider = require("../models/Rider.js");

module.exports = () => {

    const create = async (data) => {
        const newRider = new Rider(data);
        await newRider.save();
        return newRider;
    }

    const fetchOneByQuery = async (query) => {
        return await Rider.findOne(query);
    }

    const fetchByQuery = async (query) => {
        return await Rider.find(query);
    }
    
    return {
        create,
        fetchOneByQuery,
        fetchByQuery
    }
}
