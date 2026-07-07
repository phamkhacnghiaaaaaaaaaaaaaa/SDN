import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyReadingProgress } from "../../service/reading_progress.service";
import { BookOpen, Calendar } from "lucide-react";

const ReadingBooks = () => {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await getMyReadingProgress();
        setProgressData(data.progress || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load reading progress");
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

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

  if (error) {
    return <div className="text-error bg-error/10 p-4 rounded-md border border-error/20">{error}</div>;
  }

  if (progressData.length === 0) {
    return (
      <div className="bg-bg-secondary rounded-md p-10 text-center flex flex-col items-center justify-center">
        <BookOpen size={48} className="text-text-muted mb-4 opacity-50" />
        <h3 className="text-xl font-bold mb-2">Not Reading Anything Yet</h3>
        <p className="text-text-muted mb-6">You don't have any books currently in progress.</p>
        <button onClick={() => navigate('/my-rentals')} className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-md transition-colors font-medium">
          Check Your Rentals
        </button>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary p-6 rounded-md shadow-shadow-sm">
      <h2 className="text-2xl font-bold mb-6 border-b border-border pb-4">Currently Reading</h2>
      <div className="flex flex-col gap-4">
        {progressData.map((item) => {
          const b = item.book_id;
          if (!b) return null;
          
          return (
            <div key={item._id} className="p-4 bg-bg rounded-md flex gap-5 hover:bg-surface transition-colors cursor-pointer" onClick={() => navigate(`/books/${b._id}`)}>
              <img
                className="w-20 h-28 object-cover rounded-sm flex-shrink-0"
                src={`/images/${b.cover_image}.jpg`}
                alt={b.title}
                onError={(e) => { e.target.src = "https://via.placeholder.com/64x96?text=No+Cover" }}
              />
              <div className="flex-1 flex flex-col justify-center">
                <Link to={`/books/${b._id}`} onClick={(e) => e.stopPropagation()}>
                  <h3 className="font-semibold text-lg text-white hover:text-primary mb-1">
                    {b.title}
                  </h3>
                </Link>
                <p className="text-text-muted text-sm mb-3">
                  {b.author_id?.name || "Unknown"}
                </p>
                <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1.5 text-primary bg-primary/10 px-3 py-1 rounded-full">
                        <BookOpen size={14} />
                        <span>Page {item.current_page}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-muted">
                        <Calendar size={14} />
                        <span>Last read: {formatDate(item.last_read)}</span>
                    </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReadingBooks;
