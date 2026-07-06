const BOOK_ID = "684f123456789abcdef12345";

console.log("dashboard.js loaded");

async function loadDashboard() {
  try {
    // =====================
    // Categories
    // =====================
    const categoryRes = await fetch("http://localhost:9999/api/categories");
    const categories = await categoryRes.json();

    document.getElementById("categoryCount").innerText = categories.length;

    const list = document.getElementById("categoryList");
    list.innerHTML = "";

    categories.forEach((category) => {
      const li = document.createElement("li");
      li.textContent = category.name;
      list.appendChild(li);
    });

    // =====================
    // Likes
    // =====================

    const likeRes = await fetch(`http://localhost:9999/api/favourites/`);

    const likeData = await likeRes.json();

    let totalLikes = 0;

    // Case 1: API trả object { totalLikes: number }
    if (!Array.isArray(likeData)) {
      totalLikes = likeData.totalLikes || 0;
    }

    // Case 2: API trả array aggregate
    else {
      totalLikes = likeData.reduce(
        (sum, item) => sum + (item.totalLikes || 0),
        0,
      );
    }
    console.log("LIKE API RESPONSE:", likeData);
    console.log("SETTING LIKE:", likeData.totalLikes);

    document.getElementById("likeCount").innerText = likeData.totalLikes;

    document.getElementById("likeCount").innerText = totalLikes;
    console.log(document.getElementById("likeCount"));

    // =====================
    // Available Books
    // =====================
    const bookRes = await fetch(
      `http://localhost:9999/api/books/available/667104a3f123456789012346`,
    );

    const bookData = await bookRes.json();

    document.getElementById("availableCount").innerText =
      bookData.availableQuantity || 0;
  } catch (error) {
    console.error("Dashboard error:", error);
  }
}

loadDashboard();
