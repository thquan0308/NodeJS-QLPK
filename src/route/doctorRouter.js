const express = require("express");
import userDoctor from '../controllers/User/user.doctor.controller';
const router = express.Router();

// get all doctor
router.get("/fetch-all-doctor", userDoctor.fetchAllDoctor);
// find doctor by id
router.get("/fetch-doctor-by-id", userDoctor.fetchAllDoctorById);
// route create doctor
router.post("/create-doctor", userDoctor.createDoctor);
// route update doctor
router.put("/update-doctor", userDoctor.updateDoctor);
// route delete doctor
router.delete("/delete-doctor/:id", userDoctor.deleteDoctor);


// get all Chuyên khoa
router.get("/fetch-all-chuyen-khoa", userDoctor.fetchAllChuyenKhoa);
// get by id
router.get("/fetch-chuyen-khoa-by-id", userDoctor.fetchChuyenKhoaByID);
// route create Chuyên khoa
router.post("/create-chuyen-khoa", userDoctor.createChuyenKhoa);
// route delete Chuyên khoa
router.delete("/delete-chuyen-khoa/:id", userDoctor.deleteChuyenKhoa);
// route update Chuyên khoa
router.put("/update-chuyen-khoa", userDoctor.updateChuyenKhoa);


// get all Chức vụ
router.get("/fetch-all-chuc-vu", userDoctor.fetchAllChucVu);
// route create Chức vụ
router.post("/create-chuc-vu", userDoctor.createChucVu);
// route update Chức vụ
router.put("/update-chuc-vu", userDoctor.updateChucVu);
// route delete Chức vụ
router.delete("/delete-chuc-vu/:id", userDoctor.deleteChucVu);


// get all phòng khám
router.get("/fetch-all-phong-kham", userDoctor.fetchAllPhongKham);
// route create phòng khám
router.post("/create-phong-kham", userDoctor.createPhongKham);
// route delete phòng khám
router.delete("/delete-phong-kham/:id", userDoctor.deletePhongKham);
// route update Chức vụ
router.put("/update-phong-kham", userDoctor.updatePhongKham);

// fetch all thoi gian gio
router.get("/fetch-all-time-gio", userDoctor.fetchAllThoiGianGio);
// API để lấy thời gian khám của bác sĩ theo ngày
router.get("/get-time-slots", userDoctor.getTimeSlotsByDoctorAndDate);
// them thoi gian kham benh
router.post("/add-time", userDoctor.addTimeKhamBenhDoctor);
// xóa lịch trình cũ đi
router.post('/delete-old-time-slots', userDoctor.deleteOldTimeSlots);
// tìm ra doctor để hiển thị chi tiết
router.get('/view-doctor', userDoctor.fetchDoctorById);
// hiển thị info doctor kèm theo thgian khám cho page đặt lịch khám
router.get('/page-dat-lich-kham', userDoctor.fetchDoctorByNgayGio);
// dat lich kham
router.post("/dat-lich-kham", userDoctor.datLichKham);
// get lich hen
router.get("/lich-hen", userDoctor.getLichHen);


// cập nhật trạng thái đã khám xong cho bệnh nhân
// router.put("/cap-nhat-trang-thai", userDoctor.updateTrangThaiDaKham);
// //
// router.post("/update-ghi-chu-benh-an", userDoctor.updateGhiChuBenhAn);


// tim bac si thong qua id chuyen khoa
router.get("/doctor-chuyen-khoa", userDoctor.fetchDoctorByChuyenKhoa);

router.post("/huy-order", userDoctor.handleHuyOrder);
router.get("/find-all-order", userDoctor.findAllLichHen)
router.get("/find-all-order-by-doctor", userDoctor.findAllLichHenByDoctor)

router.get("/fetch-phong-kham-by-id", userDoctor.fetchPhongKhamByID);
router.get("/doctor-phong-kham", userDoctor.fetchDoctorByPhongKham);

module.exports = router;