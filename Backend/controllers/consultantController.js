const {getAllConsultants} = require("../models/consultantModel");

const fetchConsultants = async(req, res) => {
    try{
        const {data, error} = await getAllConsultants();

        if(error) return res.status(400).json({error: error.message});

        res.json(data);
    }
    catch(err){
        res.status(500).json({error: err.message});
    }
};

module.exports = {fetchConsultants};