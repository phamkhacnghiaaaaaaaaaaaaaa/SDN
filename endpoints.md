# Library Management System - API Endpoints

**Base URL**: `http://localhost:9999/api`

## 1. User Management
| Method | Endpoint | Description | Body / Params |
| :--- | :--- | :--- | :--- |
| `POST` | `/users/register` | Register a new account | `{ fullname, email, password }` |
| `POST` | `/users/login` | Login to the system | `{ email, password }` |
| `GET` | `/users` | Get all users | None |

## 2. Book Management
| Method | Endpoint | Description | Body / Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/books` | List all books | None |
| `GET` | `/books/:id` | Get book detail | `id` (ObjectId) |
| `POST` | `/books` | Create a new book | `{ title, description, isbn, cover_image, pdf_url, price, quantity, available_quantity, category_id, author_id, publisher_id }` |
| `PUT` | `/books/:id` | Update book info | `id`, `{ ...fields }` |
| `DELETE` | `/books/:id` | Delete a book | `id` |

## 3. Rental Management
| Method | Endpoint | Description | Body / Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/rentals` | List all rentals | None |
| `POST` | `/rentals` | Create a new rental | `{ user_id, due_date, items: [{ book_id, quantity }] }` |
| `PATCH` | `/rentals/:id/status` | Update rental status | `id`, `{ status }` (Pending, Giao sách, Đã trả, Hủy) |

---
*Note: Ensure `npm start` or `npm run dev` is running in the `be` folder before testing.*
