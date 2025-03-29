const Destination = require('../models/Destination');

exports.getDestinations = async (req, res) => {
    try {
        const destinations = await Destination.find().populate('deals');
        res.json(destinations);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.addDestination= async(req,res)=>{
    const { name,
        isPopular,
        imageUrls,}=req.body;
    try{

        if(!name){
            return res.status(400).json({message:"name is required"});
        }
        const destination = new Destination({
          name,
          isPopular,
          image:imageUrls,
        });
           await destination.save();
            return res.status(201).json({message:"created succefully destination"});
    }
    catch(error){
        console.log(error);
        res.status(500).json({error:'server error'});
    }
}

