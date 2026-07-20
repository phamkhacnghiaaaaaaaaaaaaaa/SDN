const Publisher = require('../model/publisher.model');

const getAllPublishers = async (req, res) => {
    try {
        const publishers = await Publisher.find();
        res.status(200).json(publishers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPublisherById = async (req, res) => {
    try {
        const publisher = await Publisher.findById(req.params.id);
        if (!publisher) return res.status(404).json({ message: 'Publisher not found' });
        res.status(200).json(publisher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createPublisher = async (req, res) => {
    try {
        const newPublisher = new Publisher(req.body);
        await newPublisher.save();
        res.status(201).json(newPublisher);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updatePublisher = async (req, res) => {
    try {
        const updatedPublisher = await Publisher.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPublisher) return res.status(404).json({ message: 'Publisher not found' });
        res.status(200).json(updatedPublisher);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deletePublisher = async (req, res) => {
    try {
        await Publisher.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Publisher deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllPublishers,
    getPublisherById,
    createPublisher,
    updatePublisher,
    deletePublisher
};
