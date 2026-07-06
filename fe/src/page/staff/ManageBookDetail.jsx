import React from "react";
import { useParams } from "react-router-dom";

const ManageBookDetail = () => {
    // Hook này dùng để lấy cái :id từ URL tí nữa mình cấu hình
    const { id } = useParams();

    return (
        <div className="bg-white p-6 rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Chi tiết Sách mã số: {id} (Staff Mode)</h1>
            <p className="text-gray-600">
                Nơi đây lát nữa ní thó code trang Chi tiết của thèng bạn đắp vào,
                rồi chế thêm mấy cái nút Update/Delete vào là chuẩn bài nha ehe.
            </p>
        </div>
    );
};

export default ManageBookDetail;