import React, { useState, useEffect } from "react";
import { Check, X, Clock, Calendar, CheckCircle2, User, BookOpen, AlertCircle } from "lucide-react";
import * as rentalService from "../../service/rental.service";
import RentalFilterSidebar from "../../components/RentalFilterSidebar";
import CreateRental from "./CreateRental";

const ManageRentals = () => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filter states
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [searchUser, setSearchUser] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    useEffect(() => {
        fetchRentals();
    }, []);

    const fetchRentals = async () => {
        setLoading(true);
        try {
            const data = await rentalService.getAllRentalsByStaff();
            setRentals(data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load rentals");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, nextStatus) => {
        try {
            await rentalService.updateStatusByStaff(id, nextStatus);
            alert(`Updated status to ${nextStatus}!`);
            fetchRentals();
        } catch (err) {
            alert(err.response?.data?.message || `Failed to update status to ${nextStatus}`);
        }
    };

    // Filter logic
    const filteredRentals = rentals.filter((rental) => {
        const matchesStatus = selectedStatus === "all" || rental.status === selectedStatus;
        const customerName = rental.user_id?.fullname || rental.user_id?.username || "";
        const matchesUser = customerName.toLowerCase().includes(searchUser.toLowerCase());
        return matchesStatus && matchesUser;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
            case "accepted": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "borrowed": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
            case "returned": return "bg-green-500/10 text-green-500 border-green-500/20";
            case "cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
            default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
        }
    };

    if (loading) return <div className="py-20 text-center animate-pulse">Loading rental orders...</div>;

    return (
        <div className="grid grid-cols-12 gap-6 relative pb-16 min-h-[calc(100vh-100px)]">
            {/* Sidebar Filter */}
            <div className="col-span-3">
                <RentalFilterSidebar
                    searchUser={searchUser}
                    setSearchUser={setSearchUser}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                />
            </div>

            {/* Main Rentals List */}
            <div className="col-span-9 flex flex-col h-full relative">
                {/* Create Rental Button - Top Right */}
                <div className="absolute top-0 right-0 z-10">
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 text-sm"
                    >
                        + Create Rental
                    </button>
                </div>

                <h1 className="text-2xl font-extrabold text-white mb-6">Manage Rental Orders</h1>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-6">
                        {error}
                    </div>
                )}

                {/* Rentals Table */}
                <div className="bg-bg-secondary rounded-3xl border border-border shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-surface/30">
                                    <th className="p-4 text-xs font-bold uppercase text-text-muted">Customer</th>
                                    <th className="p-4 text-xs font-bold uppercase text-text-muted">Rented Books</th>
                                    <th className="p-4 text-xs font-bold uppercase text-text-muted">Date Details</th>
                                    <th className="p-4 text-xs font-bold uppercase text-text-muted">Status</th>
                                    <th className="p-4 text-xs font-bold uppercase text-text-muted text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredRentals.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-text-muted italic">
                                            No rental orders found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRentals.map((rental) => (
                                        <tr key={rental._id} className="hover:bg-surface/10 transition-colors">
                                            {/* Customer info */}
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                                                        {rental.user_id?.fullname ? rental.user_id.fullname[0].toUpperCase() : "U"}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white text-sm">{rental.user_id?.fullname || "Unknown User"}</p>
                                                        <p className="text-xs text-text-muted">{rental.user_id?.email || rental.user_id?.username}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Books Rented */}
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1 max-w-xs">
                                                    {rental.items?.map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 text-xs text-text-muted">
                                                            <BookOpen size={12} className="text-primary flex-shrink-0" />
                                                            <span className="truncate flex-grow font-semibold text-white">{item.book_id?.title || "Unknown Book"}</span>
                                                            <span className="bg-surface/50 border border-border px-1.5 py-0.5 rounded text-[10px]">x{item.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>

                                            {/* Date info */}
                                            <td className="p-4">
                                                <div className="text-xs text-text-muted space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={12} />
                                                        <span>Rented: {new Date(rental.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    {rental.return_date && (
                                                        <div className="flex items-center gap-1.5 font-semibold text-success">
                                                            <CheckCircle2 size={12} />
                                                            <span>Returned: {new Date(rental.return_date).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${getStatusColor(rental.status)}`}>
                                                    {rental.status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {rental.status === "pending" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleUpdateStatus(rental._id, "accepted")}
                                                                className="p-1.5 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white transition-all"
                                                                title="Accept Order"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateStatus(rental._id, "cancelled")}
                                                                className="p-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                                                                title="Cancel Order"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {rental.status === "accepted" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleUpdateStatus(rental._id, "borrowed")}
                                                                className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all"
                                                                title="Deliver Books"
                                                            >
                                                                Deliver
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateStatus(rental._id, "cancelled")}
                                                                className="p-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                                                                title="Cancel Order"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {rental.status === "borrowed" && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(rental._id, "returned")}
                                                            className="px-2.5 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-xs transition-all"
                                                            title="Confirm Return"
                                                        >
                                                            Return
                                                        </button>
                                                    )}
                                                    {["returned", "cancelled"].includes(rental.status) && (
                                                        <span className="text-xs text-text-muted italic">No actions</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Rental Modal */}
            <CreateRental
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onRentalCreated={() => fetchRentals()}
            />
        </div>
    );
};

export default ManageRentals;