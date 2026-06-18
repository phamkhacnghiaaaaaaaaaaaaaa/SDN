const Rental = require('../model/rental.model');

const getAllRentals = async (req, res) => {
    try {
        const rentals = await Rental.find().populate('user_id items.book_id');
        res.status(200).json(rentals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createRental = async (req, res) => {
    try {
        const newRental = new Rental(req.body);
        await newRental.save();
        res.status(201).json(newRental);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateRentalStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updatedRental = await Rental.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.status(200).json(updatedRental);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getAllRentals,
    createRental,
    updateRentalStatus
};
