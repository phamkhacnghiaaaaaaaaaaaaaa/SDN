const Rental = require('../model/rental.model');
const Book = require('../model/book.model');
const Setting = require('../model/setting.model');

// Tính phí trễ hạn: số ngày quá hạn * phí/ngày * tổng số bản
const calcLateFee = (rental, returnDate, lateFeePerDay) => {
    if (!rental.due_date || returnDate <= rental.due_date) return 0;
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysLate = Math.ceil((returnDate - rental.due_date) / msPerDay);
    const totalCopies = rental.items.reduce((sum, it) => sum + it.quantity, 0);
    return daysLate * lateFeePerDay * totalCopies;
};

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
        // Khi duyệt đơn (Pending -> Accepted): Trừ kho + thu phí thuê
        if (nextStatus === 'accepted') {
            for (const item of rental.items) {
                const book = await Book.findById(item.book_id);
                if (book.available_quantity < item.quantity)
                    return res.status(400).json({ message: `Insufficient stock: ${book.title}` });
                await Book.findByIdAndUpdate(item.book_id, { $inc: { available_quantity: -item.quantity } });
            }
            // Chốt phí thuê nếu chưa có (đơn cũ) và đánh dấu đã thanh toán
            if (!rental.fee || rental.fee === 0) {
                let fee = 0;
                for (const item of rental.items) {
                    const book = await Book.findById(item.book_id);
                    const unit_fee = item.unit_fee || book?.price || 0;
                    item.unit_fee = unit_fee;
                    fee += unit_fee * item.quantity;
                }
                rental.fee = fee;
            }
            rental.payment_status = 'paid';
            rental.paid_at = new Date();
        }

        // Khi trả sách (Borrowed -> Returned): Cộng lại kho + tính phí trễ hạn
        if (nextStatus === 'returned') {
            for (const item of rental.items) {
                await Book.findByIdAndUpdate(item.book_id, { $inc: { available_quantity: item.quantity } });
            }
            const returnDate = new Date();
            const { late_fee_per_day } = await Setting.getSingleton();
            rental.return_date = returnDate;
            rental.late_fee = calcLateFee(rental, returnDate, late_fee_per_day);
        }

        // Khi hủy đơn (Accepted -> Cancelled): Hoàn lại kho đã trừ + hoàn phí
        if (nextStatus === 'cancelled' && currentStatus === 'accepted') {
            for (const item of rental.items) {
                await Book.findByIdAndUpdate(item.book_id, { $inc: { available_quantity: item.quantity } });
            }
            if (rental.payment_status === 'paid') {
                rental.payment_status = 'refunded';
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
            // 2. Trừ kho sách mới + tính lại phí thuê
            let fee = 0;
            const pricedItems = [];
            for (const item of items) {
                const book = await Book.findById(item.book_id);
                if (book.available_quantity < item.quantity)
                    return res.status(400).json({ message: `Insufficient stock for ${book.title}` });
                await Book.findByIdAndUpdate(item.book_id, { $inc: { available_quantity: -item.quantity } });
                const unit_fee = book.price || 0;
                fee += unit_fee * item.quantity;
                pricedItems.push({ book_id: item.book_id, quantity: item.quantity, unit_fee });
            }
            rental.items = pricedItems;
            rental.fee = fee;
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

        // Tính phí thuê + đóng băng đơn giá thuê từng bản
        const pricedItems = [];
        let fee = 0;
        for (const item of items) {
            const book = await Book.findById(item.book_id);
            if (!book) return res.status(404).json({ message: `Book not found (ID: ${item.book_id})` });
            const unit_fee = book.price || 0;
            fee += unit_fee * item.quantity;
            pricedItems.push({ book_id: item.book_id, quantity: item.quantity, unit_fee });
        }

        // Nếu staff chọn 'accepted' hoặc 'borrowed' ngay từ đầu -> Trừ kho luôn
        const alreadyOut = ['accepted', 'borrowed'].includes(targetStatus);
        if (alreadyOut) {
            for (const item of items) {
                const book = await Book.findById(item.book_id);
                if (book.available_quantity < item.quantity)
                    return res.status(400).json({ message: `Insufficient stock: ${book.title}` });
                await Book.findByIdAndUpdate(item.book_id, { $inc: { available_quantity: -item.quantity } });
            }
        }

        const { rental_period_days } = await Setting.getSingleton();
        const rentDate = new Date();
        const dueDate = new Date(rentDate); // Tạo bản sao từ rentDate
        dueDate.setDate(dueDate.getDate() + rental_period_days);

        const newRental = new Rental({
            user_id,
            items: pricedItems,
            fee,
            payment_status: alreadyOut ? 'paid' : 'unpaid',
            paid_at: alreadyOut ? rentDate : undefined,
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
// Gia hạn đơn thuê: chỉ áp dụng cho đơn đang 'accepted' hoặc 'borrowed'.
// Cộng thêm 1 kỳ hạn vào due_date và tính thêm 1 kỳ phí thuê.
const extendRental = async (req, res) => {
    try {
        const rental = await Rental.findById(req.params.id);
        if (!rental) return res.status(404).json({ message: 'Rental not found' });

        if (!['accepted', 'borrowed'].includes(rental.status)) {
            return res.status(400).json({ message: `Cannot extend a rental with status "${rental.status}"` });
        }

        const { rental_period_days } = await Setting.getSingleton();

        // Nếu đơn đã quá hạn thì gia hạn tính từ hôm nay, ngược lại nối tiếp due_date
        const now = new Date();
        const base = rental.due_date && rental.due_date > now ? new Date(rental.due_date) : now;
        const newDue = new Date(base);
        newDue.setDate(newDue.getDate() + rental_period_days);
        rental.due_date = newDue;

        // Thu thêm 1 kỳ phí thuê (dựa trên đơn giá đã đóng băng)
        const periodFee = rental.items.reduce(
            (sum, it) => sum + (it.unit_fee || 0) * it.quantity,
            0
        );
        rental.fee = (rental.fee || 0) + periodFee;
        rental.extensions = (rental.extensions || 0) + 1;

        await rental.save();
        res.status(200).json(rental);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getAllRentalsByStaff,
    createRentalByStaff,
    updateRentalByStaff,
    updateStatusByStaff,
    deleteRentalByStaff,
    extendRental
};