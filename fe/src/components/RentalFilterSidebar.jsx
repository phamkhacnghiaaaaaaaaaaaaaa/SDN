import React from "react";
import { Search } from "lucide-react";

const RentalFilterSidebar = ({
    searchUser,
    setSearchUser,
    selectedStatus,
    setSelectedStatus
}) => {
    return (
        <div className="bg-bg-secondary p-5 rounded-3xl shadow-lg border border-border w-full flex flex-col gap-6 text-text">
            <h2 className="text-xl font-bold border-b border-border pb-3">Filter Rentals</h2>

            {/* Customer Search */}
            <div>
                <label className="block text-xs font-bold uppercase text-text-muted mb-2">Search Customer</label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Enter customer name..."
                        className="w-full bg-bg border border-border rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-primary transition-all text-text"
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                </div>
            </div>

            {/* Status Filters */}
            <div>
                <label className="block text-xs font-bold uppercase text-text-muted mb-3">Order Status</label>
                <div className="flex flex-col gap-2">
                    {["all", "pending", "accepted", "borrowed", "returned", "cancelled"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-left border transition-all capitalize ${
                                selectedStatus === status
                                    ? "bg-primary text-white border-primary"
                                    : "bg-surface border-border hover:bg-surface/50 text-text-muted hover:text-white"
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RentalFilterSidebar;
