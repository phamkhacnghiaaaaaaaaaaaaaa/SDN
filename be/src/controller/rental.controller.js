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

        for (const item of items) {
            const book = await Book.findById(item.book_id);
            if (!book) return res.status(404).json({ message: `Book not found (ID: ${item.book_id})` });
            if (book.available_quantity < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for "${book.title}". Available: ${book.available_quantity}` });
            }
        }

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
        const { status: nextStatus } = req.body;
        const { id: requesterId, role: requesterRole } = req.user;

        const rental = await Rental.findById(req.params.id);
        if (!rental) return res.status(404).json({ message: 'Rental not found' });

        const currentStatus = rental.status;

        // Authorization
        if (requesterRole === 'User') {
            const isOwner = rental.user_id.toString() === requesterId;
            const isCancelling = currentStatus === 'pending' && nextStatus === 'cancelled';
            if (!isOwner || !isCancelling) {
                return res.status(403).json({ message: 'Access denied: Users can only cancel their own pending rentals.' });
            }
        }

        // State Machine
        const validTransitions = {
            'pending': ['accepted', 'cancelled'],
            'accepted': ['borrowed'],
            'borrowed': ['returned'],
            'cancelled': [],
            'returned': []
        };

        if (!validTransitions[currentStatus].includes(nextStatus)) {
            return res.status(400).json({ message: `Invalid status transition: From "${currentStatus}" to "${nextStatus}"` });
        }

        // Stock handling
        if (currentStatus !== 'accepted' && nextStatus === 'accepted') {
            for (const item of rental.items) {
                const book = await Book.findById(item.book_id);
                if (book.available_quantity < item.quantity) return res.status(400).json({ message: `Insufficient stock for book: ${book.title}` });
                await Book.findByIdAndUpdate(item.book_id, { $inc: { available_quantity: -item.quantity } });
            }
        }

        rental.status = nextStatus;
        const updatedRental = await rental.save();
        res.status(200).json(updatedRental);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteRental = async (req, res) => {
    try {
        const { id: requesterId, role: requesterRole } = req.user;

        const rental = await Rental.findById(req.params.id);
        if (!rental) return res.status(404).json({ message: 'Rental not found' });

        // Rule Phân quyền mới: Chủ đơn (khách) hoặc Nhân viên (Staff/Admin)
        const isOwner = rental.user_id.toString() === requesterId;
        const isLibraryStaff = ['Admin', 'Staff'].includes(requesterRole);

        if (!isOwner && !isLibraryStaff) {
            return res.status(403).json({ message: 'Access denied: You do not have permission to delete this rental' });
        }

        // Rule: Only delete if 'pending' or 'cancelled'
        if (!['pending', 'cancelled'].includes(rental.status)) {
            return res.status(400).json({ message: `Cannot delete rental with status: ${rental.status}` });
        }

        await Rental.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Rental deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllRentals, createRental, updateRentalStatus, deleteRental };
