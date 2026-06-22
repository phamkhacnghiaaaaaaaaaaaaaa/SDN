const BOOK_ID = "ID_SACH_CUA_BAN";
console.log("dashboard.js loaded");

async function loadDashboard() {
  try {
    // Categories
    const categoryRes = await fetch("http://localhost:9999/api/categories");

    const categories = await categoryRes.json();

    document.getElementById("categoryCount").innerText = categories.length;

    const list = document.getElementById("categoryList");

    categories.forEach((category) => {
      const li = document.createElement("li");

      li.textContent = category.name;

      list.appendChild(li);
    });

    // Likes
    const likeRes = await fetch(
      `http://localhost:9999/api/favourites/count/684f123456789abcdef12345`,
    );

    const likeData = await likeRes.json();

    document.getElementById("likeCount").innerText = likeData.totalLikes;

    // Available Books
    const bookRes = await fetch(
      `http://localhost:9999/api/books/available/667104a3f123456789012346`,
    );

    const bookData = await bookRes.json();

    document.getElementById("availableCount").innerText =
      bookData.availableQuantity;
  } catch (error) {
    console.error(error);
  }
}

loadDashboard();
