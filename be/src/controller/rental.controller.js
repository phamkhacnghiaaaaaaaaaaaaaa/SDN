const Rental = require('../model/rental.model');
const Book = require('../model/book.model');
const User = require('../model/user.model');

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
        const { items, user_id } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Rental must contain at least one book.' });
        }
        
        const total_books = items.reduce((total, item) => total + item.quantity, 0);

        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.rental_available < total_books) {
            return res.status(400).json({ message: 'Not enough rental quota for this user' });
        }

        // 1. Check book availability for all items in the request
        for (const item of items) {
            const book = await Book.findById(item.book_id);
            if (!book) {
                return res.status(404).json({ message: `Book not found (ID: ${item.book_id})` });
            }
            if (book.available_quantity < item.quantity) {
                return res.status(400).json({ 
                    message: `Not enough stock for book: "${book.title}". Available: ${book.available_quantity}, Requested: ${item.quantity}` 
                });
            }
        }

        // 2. Decrement available_quantity of all items
        for (const item of items) {
            await Book.findByIdAndUpdate(item.book_id, {
                $inc: { available_quantity: -item.quantity }
            });
        }

        const remain_quota = user.rental_available - total_books;
        await User.findByIdAndUpdate(user_id, {
            $set: { rental_available: remain_quota }
        });

        // 3. Create and save the new rental
        const rentDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(rentDate.getDate() + 7);

        const newRental = new Rental({
            ...req.body,
            status: "pending",
            rent_date: rentDate,
            due_date: dueDate
        });
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

const deleteRental = async (req, res) => {
    try {
        await Rental.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Rental deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllRentals,
    createRental,
    updateRentalStatus,
    deleteRental
};
