import React, { useState, useEffect } from "react";
import { CheckCircle, Clock, XCircle, BookOpen, AlertCircle } from "lucide-react";
import * as rentalService from "../../service/rental.service";
import { useAuth } from "../../context/AuthContext";
import { formatVND } from "../../config/constants";
import { useSettings } from "../../context/SettingsContext";
import toast from "react-hot-toast";

const getOverdueDays = (rental) => {
  if (rental.status !== "borrowed" || !rental.due_date) return 0;
  const diff = Date.now() - new Date(rental.due_date).getTime();
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
};

const RentalHistory = () => {
  const { user } = useAuth();
  const { rentalPeriodDays, lateFeePerDay } = useSettings();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelModal, setCancelModal] = useState({ isOpen: false, rentalId: null });

  const fetchRentals = async () => {
    try {
      const data = await rentalService.getMyRentals();
      const userId = user.id || user._id;
      const myRentals = data.filter(r => r.user_id?._id === userId || r.user_id === userId);

      myRentals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRentals(myRentals);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load rentals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, [user.id, user._id]);

  const confirmCancel = (id) => {
    setCancelModal({ isOpen: true, rentalId: id });
  };

  const executeCancel = async () => {
    try {
      await rentalService.cancelRental(cancelModal.rentalId);
      toast.success("Rental request cancelled successfully.");
      setCancelModal({ isOpen: false, rentalId: null });
      fetchRentals();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel rental");
      toast.error("Failed to cancel rental");
      setCancelModal({ isOpen: false, rentalId: null });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="rental-badge bg-warning/10 text-warning border border-warning/20 px-2 py-1 rounded text-xs flex items-center gap-1 w-max"><Clock size={12} /> Pending</span>;
      case 'accepted':
        return <span className="rental-badge bg-info/10 text-info border border-info/20 px-2 py-1 rounded text-xs flex items-center gap-1 w-max"><CheckCircle size={12} /> Accepted</span>;
      case 'borrowed':
        return <span className="rental-badge bg-secondary/10 text-secondary border border-secondary/20 px-2 py-1 rounded text-xs flex items-center gap-1 w-max"><BookOpen size={12} /> Borrowed</span>;
      case 'returned':
        return <span className="rental-badge bg-success/10 text-success border border-success/20 px-2 py-1 rounded text-xs flex items-center gap-1 w-max"><CheckCircle size={12} /> Returned</span>;
      case 'cancelled':
        return <span className="rental-badge bg-error/10 text-error border border-error/20 px-2 py-1 rounded text-xs flex items-center gap-1 w-max"><XCircle size={12} /> Cancelled</span>;
      default:
        return <span className="rental-badge bg-surface text-text-muted border border-border px-2 py-1 rounded text-xs flex items-center w-max">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary p-6 rounded-md shadow-shadow-sm">
      <h2 className="text-2xl font-bold mb-6 border-b border-border pb-4">Rental History</h2>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      {rentals.length === 0 ? (
        <div className="text-center py-12 bg-bg rounded-lg border border-border">
          <BookOpen className="mx-auto h-12 w-12 text-text-muted mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-text mb-2">No rentals yet</h3>
          <p className="text-text-muted">You haven't rented any books. Explore our library to find your next read!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {rentals.map((rental) => (
            <div key={rental._id} className="bg-bg rounded-lg border border-border overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-shadow-md">
              <div className="bg-surface px-5 py-3 border-b border-border flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Rental ID</p>
                    <p className="font-mono text-sm">{rental._id.substring(0, 8)}...</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Date</p>
                    <p className="text-sm">{formatDate(rental.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {getOverdueDays(rental) > 0 && (
                    <span className="rental-badge bg-error/10 text-error border border-error/20 px-2 py-1 rounded text-xs flex items-center gap-1 w-max font-semibold">
                      <AlertCircle size={12} /> Overdue {getOverdueDays(rental)}d
                    </span>
                  )}
                  {getStatusBadge(rental.status)}
                </div>
              </div>

              <div className="p-5">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <h4 className="font-semibold text-text border-b border-border pb-2">Books in this rental:</h4>
                    {rental.items?.map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        <img
                          src={`/images/${item.book_id?.cover_image}.jpg`}
                          alt={item.book_id?.title || "Book"}
                          className="w-16 h-24 object-cover rounded shadow-sm"
                          onError={(e) => { e.target.src = "https://via.placeholder.com/64x96?text=No+Cover" }}
                        />
                        <div>
                          <p className="font-medium text-white mb-1 line-clamp-1">{item.book_id?.title || "Unknown Book"}</p>
                          <p className="text-sm text-text-muted mb-2">Qty: {item.quantity}</p>
                          <p className="text-sm text-primary font-medium">{formatVND(item.unit_fee || item.book_id?.price || 0)} / {rentalPeriodDays} days</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="md:w-64 bg-surface p-4 rounded-md border border-border h-fit flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-text border-b border-border pb-2 mb-3">Summary</h4>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-text-muted">Total Quantity:</span>
                        <span>{rental.items?.reduce((acc, item) => acc + item.quantity, 0) || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-4">
                        <span className="text-text-muted">Expected Return:</span>
                        <span>{formatDate(rental.due_date)}</span>
                      </div>
                      {(() => {
                        const rentalFee = rental.fee || rental.items?.reduce((acc, item) => acc + (item.quantity * (item.unit_fee || item.book_id?.price || 0)), 0) || 0;
                        const lateFee = rental.late_fee || 0;
                        const overdueDays = getOverdueDays(rental);
                        const totalQty = rental.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
                        const estLateFee = overdueDays > 0 ? overdueDays * lateFeePerDay * totalQty : 0;
                        return (
                          <>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-text-muted">Rental Fee:</span>
                              <span>{formatVND(rentalFee)}</span>
                            </div>
                            {lateFee > 0 && (
                              <div className="flex justify-between text-sm mb-2 text-error">
                                <span>Late Fee:</span>
                                <span>{formatVND(lateFee)}</span>
                              </div>
                            )}
                            {lateFee === 0 && estLateFee > 0 && (
                              <div className="flex justify-between text-sm mb-2 text-warning">
                                <span>Est. Late Fee:</span>
                                <span>{formatVND(estLateFee)}</span>
                              </div>
                            )}
                            <div className="border-t border-border pt-3 mt-1 flex justify-between items-center">
                              <span className="font-medium">Total:</span>
                              <span className="text-lg font-bold text-primary">{formatVND(rentalFee + lateFee)}</span>
                            </div>
                            {rental.payment_status && rental.status !== 'pending' && rental.status !== 'cancelled' && (
                              <p className={`text-xs mt-2 font-semibold ${rental.payment_status === 'paid' ? 'text-success' : 'text-warning'}`}>
                                {rental.payment_status === 'paid' ? '● Paid' : rental.payment_status === 'refunded' ? '● Refunded' : '● Unpaid'}
                              </p>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    {rental.status === 'pending' && (
                      <button
                        onClick={() => confirmCancel(rental._id)}
                        className="w-full mt-6 bg-error/10 text-error hover:bg-error hover:text-white border border-error/20 py-2 rounded transition-colors text-sm font-medium"
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-bg-secondary p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 border border-border">
            <h3 className="text-xl font-bold mb-4">Cancel Rental</h3>
            <p className="text-text-muted mb-6">Are you sure you want to cancel this rental request? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setCancelModal({ isOpen: false, rentalId: null })}
                className="px-4 py-2 rounded-md border border-border hover:bg-surface transition-colors font-medium"
              >
                No, keep it
              </button>
              <button 
                onClick={executeCancel}
                className="px-4 py-2 rounded-md bg-error text-white hover:bg-error/90 transition-colors font-medium"
              >
                Yes, cancel it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalHistory;
