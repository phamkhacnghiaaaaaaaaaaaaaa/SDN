const Rental = require('../model/rental.model');
const Book = require('../model/book.model');

const validTransitions = {
    'pending': ['accepted', 'cancelled'],
    'accepted': ['borrowed', 'cancelled'],
    'borrowed': ['returned'],
    'cancelled': [],
    'returned': []
};

const updateStatusByStaff = async (req, res) => {
    try {
        const { status: nextStatus } = req.body;
        const rental = await Rental.findById(req.params.id);
        if (!rental) return res.status(404).json({ message: 'Rental not found' });

        const currentStatus = rental.status;

        // 1. Validate State Machine
        if (!validTransitions[currentStatus].includes(nextStatus)) {
            return res.status(400).json({ message: `Cannot move from ${currentStatus} to ${nextStatus}` });
        }

        // 2. Xử lý Logic Kho
        // Khi duyệt đơn (Pending -> Accepted): Trừ kho
        if (nextStatus === 'accepted') {
            for (const item of rental.items) {
                const book = await Book.findById(item.book_id);
                if (book.available_quantity < item.quantity)
                    return res.status(400).json({ message: `Insufficient stock: ${book.title}` });
                await Book.findByIdAndUpdate(item.book_id, { $inc: { available_quantity: -item.quantity } });
            }
        }

        // Khi trả sách (Borrowed -> Returned): Cộng lại kho
        if (nextStatus === 'returned') {
            for (const item of rental.items) {
                await Book.findByIdAndUpdate(item.book_id, { $inc: { available_quantity: item.quantity } });
            }
        }

        // Khi hủy đơn (Accepted -> Cancelled): Hoàn lại kho đã trừ trước đó
        if (nextStatus === 'cancelled' && currentStatus === 'accepted') {
            for (const item of rental.items) {
                await Book.findByIdAndUpdate(item.book_id, { $inc: { available_quantity: item.quantity } });
            }
        }

        rental.status = nextStatus;
        await rental.save();
        res.status(200).json(rental);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getAllRentalsByStaff = async (req, res) => {
    const rentals = await Rental.find().populate('user_id items.book_id');
    res.json(rentals);
};

// edit rental từ staff - các field khi trong trạng thái accept
// use - case khi trước đó đã accept rồi nhưng lúc đến lấy sách thk kia muốn đổi.
// use-case khi staff tạo cái mới và tạo nhầm data -> phải edit lại. => trừ stock sách tương ứng.
const updateRentalByStaff = async (req, res) => {
    try {
        const { items, ...updateData } = req.body;
        const rental = await Rental.findById(req.params.id);
        if (!rental) return res.status(404).json({ message: 'Rental not found' });

        // Logic đổi sách nếu status đã là 'accepted'
        if (items && rental.status === 'accepted') {
            // 1. Hoàn lại kho sách cũ
            for (const item of rental.items) {
                await Book.findByIdAndUpdate(item.book_id, { $inc: { available_quantity: item.quantity } });
            }
            // 2. Trừ kho sách mới
            for (const item of items) {
                const book = await Book.findById(item.book_id);
                if (book.available_quantity < item.quantity)
                    return res.status(400).json({ message: `Insufficient stock for ${book.title}` });
                await Book.findByIdAndUpdate(item.book_id, { $inc: { available_quantity: -item.quantity } });
            }
            rental.items = items;
        }

        Object.assign(rental, updateData);
        await rental.save();
        res.status(200).json(rental);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// delete rental từ staff - vì có tạo nên phải có xóa, - ai biết được. - ko Restrict được cái này. 
const deleteRentalByStaff = async (req, res) => {
    try {
        const rental = await Rental.findById(req.params.id);
        if (!rental) return res.status(404).json({ message: 'Rental not found' });

        // Nếu đã từng accept thì phải hoàn kho
        if (rental.status === 'accepted') {
            for (const item of rental.items) {
                await Book.findByIdAndUpdate(item.book_id, { $inc: { available_quantity: item.quantity } });
            }
        }

        await Rental.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Rental deleted and stock reverted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// create rental từ staff -> cho phép trạng thái là borrowed luôn - tức người ta đến lấy trực tiếp.
const createRentalByStaff = async (req, res) => {
    try {
        const { items, user_id, status } = req.body;
        const targetStatus = status || 'pending'; // Mặc định pending nếu ko chọn

        // Nếu staff chọn 'accepted' hoặc 'borrowed' ngay từ đầu -> Trừ kho luôn
        if (['accepted', 'borrowed'].includes(targetStatus)) {
            for (const item of items) {
                const book = await Book.findById(item.book_id);
                if (book.available_quantity < item.quantity)
                    return res.status(400).json({ message: `Insufficient stock: ${book.title}` });
                await Book.findByIdAndUpdate(item.book_id, { $inc: { available_quantity: -item.quantity } });
            }
        }

        const rentDate = new Date();
        const dueDate = new Date(rentDate); // Tạo bản sao từ rentDate
        dueDate.setDate(dueDate.getDate() + 14);

        const newRental = new Rental({
            user_id,
            items,
            status: targetStatus,
            rent_date: rentDate,
            due_date: dueDate
        });
        await newRental.save();
        res.status(201).json(newRental);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
module.exports = {
    getAllRentalsByStaff,
    createRentalByStaff,
    updateRentalByStaff,
    updateStatusByStaff,
    deleteRentalByStaff
};