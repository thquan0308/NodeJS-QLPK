const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AccAdmin = require('../../model/AccAdmin'); // Đường dẫn đến model của bạn
const ChuyenKhoa = require('../../model/ChuyenKhoa'); // Đường dẫn đến model của bạn
const ChucVu = require('../../model/ChucVu'); // Đường dẫn đến model của bạn
const Role = require('../../model/Role'); // Đường dẫn đến model của bạn
const Doctor = require('../../model/Doctor');
const ThoiGianGio = require('../../model/ThoiGianGio');
const PhongKham = require('../../model/PhongKham');
require('dotenv').config();
// Secret key cho JWT
const JWT_SECRET = process.env.JWT_SECRET;
// const moment = require('moment');
const moment = require('moment-timezone');
const KhamBenh = require('../../model/KhamBenh');

const nodemailer = require('nodemailer');

const BenhNhan = require('../../model/BenhNhan')

module.exports = {
    fetchAllDoctor: async (req, res) => {
        try {
            const { page, limit, firstName, lastName, address } = req.query; // Lấy trang và kích thước trang từ query

            // Chuyển đổi thành số
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);

            // Tính toán số bản ghi bỏ qua
            const skip = (pageNumber - 1) * limitNumber;

            // Tạo query tìm kiếm
            const query = {};

            // Thêm điều kiện sắp xếp
            const sortOrder = req.query.sortOrder || 'desc'; // Nhận giá trị sắp xếp từ query, mặc định là 'desc'
            const sortField = req.query.sortField || '_id'; // Mặc định sắp xếp theo _id
            // if (firstName) {
            //     query.firstName = { $regex: firstName, $options: 'i' }; // Tìm kiếm không phân biệt chữ hoa chữ thường
            // }
            // if (lastName) {
            //     query.lastName = { $regex: lastName, $options: 'i' };
            // }
            // Tạo điều kiện tìm kiếm
            if (firstName || lastName || address) {
                const searchKeywords = (firstName || '') + ' ' + (lastName || '') + ' ' + (address || '');
                const keywordsArray = searchKeywords.trim().split(/\s+/);

                const searchConditions = keywordsArray.map(keyword => ({
                    $or: [
                        { firstName: { $regex: keyword, $options: 'i' } },
                        { lastName: { $regex: keyword, $options: 'i' } },
                        { address: { $regex: keyword, $options: 'i' } },
                    ]
                }));

                query.$or = searchConditions;
            }

            // Tìm tất cả bác sĩ với phân trang
            const fetchAll = await Doctor.find(query)
                .populate("chucVuId chuyenKhoaId phongKhamId roleId")
                .populate({
                    path: 'thoiGianKham.thoiGianId', // Đường dẫn đến trường cần populate
                    model: 'ThoiGianGio' // Tên model của trường cần populate
                })
                .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 }) // Sắp xếp theo trường và thứ tự
                .skip(skip)
                .limit(limitNumber);

            console.log("fetchAll: ", fetchAll);


            const totalDoctors = await Doctor.countDocuments(query); // Đếm tổng số bác sĩ

            const totalPages = Math.ceil(totalDoctors / limitNumber); // Tính số trang

            return res.status(200).json({
                data: fetchAll,
                totalDoctors,
                totalPages,
                currentPage: pageNumber,
                message: "Đã tìm ra tất cả bác sĩ",
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra khi tìm tài khoản bác sĩ.",
                error: error.message,
            });
        }
    },

    fetchAllChuyenKhoa: async (req, res) => {
        try {
            const { page, limit, name } = req.query;

            // Chuyển đổi thành số
            const pageNumber = parseInt(page, 10) || 1; // Mặc định là trang 1 nếu không có
            const limitNumber = parseInt(limit, 10) || 10; // Mặc định là 10 bản ghi mỗi trang

            // Tính toán số bản ghi bỏ qua
            const skip = Math.max((pageNumber - 1) * limitNumber, 0);

            // Tạo query tìm kiếm
            const query = {};
            // Tạo điều kiện tìm kiếm
            if (name) {
                const searchKeywords = (name || '')
                const keywordsArray = searchKeywords.trim().split(/\s+/);

                const searchConditions = keywordsArray.map(keyword => ({
                    name: { $regex: keyword, $options: 'i' } // Tìm kiếm không phân biệt chữ hoa chữ thường
                }));

                query.$or = searchConditions;
            }

            let fetchAll = await ChuyenKhoa.find(query).skip(skip).limit(limitNumber);

            const totalChuyenKhoa = await ChuyenKhoa.countDocuments(query); // Đếm tổng số chức vụ

            const totalPages = Math.ceil(totalChuyenKhoa / limitNumber); // Tính số trang

            return res.status(200).json({
                data: fetchAll,
                totalChuyenKhoa,
                totalPages,
                currentPage: pageNumber,
                message: "Đã tìm ra tất cả chuyên khoa",
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra khi tìm Chuyên khoa của bác sĩ.",
                error: error.message,
            });
        }
    },

    fetchAllChucVu: async (req, res) => {
        try {
            const { page, limit, name } = req.query; // Lấy trang và kích thước trang từ query            

            // Chuyển đổi thành số
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);

            // Tính toán số bản ghi bỏ qua
            const skip = (pageNumber - 1) * limitNumber;

            // Tạo query tìm kiếm
            const query = {};
            if (name) {
                // query.name = { $regex: name, $options: 'i' }; // Tìm kiếm không phân biệt chữ hoa chữ thường
                query.name = { $regex: `.*${name}.*`, $options: 'i' }; // Tìm kiếm gần đúng
            }

            // Tìm tất cả bác sĩ với phân trang
            const fetchAll = await ChucVu.find(query)
                .skip(skip)
                .limit(limitNumber);

            const totalChucVu = await ChucVu.countDocuments(query); // Đếm tổng số chức vụ

            const totalPages = Math.ceil(totalChucVu / limitNumber); // Tính số trang

            return res.status(200).json({
                data: fetchAll,
                totalChucVu,
                totalPages,
                currentPage: pageNumber,
                message: "Đã tìm ra tất cả chức vụ",
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra khi tìm chức vụ của bác sĩ.",
                error: error.message,
            });
        }
    },

    fetchAllPhongKham: async (req, res) => {
        try {
            const { page, limit, name, address } = req.query; // Lấy trang và kích thước trang từ query

            // Chuyển đổi thành số
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);

            // Tính toán số bản ghi bỏ qua
            const skip = (pageNumber - 1) * limitNumber;

            // Tạo query tìm kiếm
            const query = {};
            // Tạo điều kiện tìm kiếm
            if (name || address) {
                const searchKeywords = (name || '') + ' ' + (address || '');
                const keywordsArray = searchKeywords.trim().split(/\s+/);

                const searchConditions = keywordsArray.map(keyword => ({
                    $or: [
                        { name: { $regex: keyword, $options: 'i' } },
                        { address: { $regex: keyword, $options: 'i' } },
                    ]
                }));

                query.$or = searchConditions;
            }

            let fetchAll = await PhongKham.find(query).skip(skip).limit(limitNumber);

            const totalPhongKham = await PhongKham.countDocuments(query); // Đếm tổng số chức vụ

            const totalPages = Math.ceil(totalPhongKham / limitNumber); // Tính số trang

            return res.status(200).json({
                data: fetchAll,
                totalPhongKham,
                totalPages,
                currentPage: pageNumber,
                message: "Đã tìm ra tất cả chức vụ",
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra khi tìm phòng khám của bác sĩ.",
                error: error.message,
            });
        }
    },

    fetchAllThoiGianGio: async (req, res) => {

        const resGio = await ThoiGianGio.find({})
        if (resGio) {
            return res.status(200).json({
                data: resGio,
                message: "Đã tìm ra tất cả thoi gian",
            });
        } else {
            return res.status(500).json({
                message: "Có lỗi xảy ra",
            });
        }
    },


    createDoctor: async (req, res) => {
        try {
            let { email, password, firstName, lastName, address, phoneNumber, giaKhamVN, giaKhamNuocNgoai,
                chucVuId, gender, image, chuyenKhoaId, phongKhamId, roleId, mota, } = req.body

            console.log("chucVuId: ", chucVuId);
            console.log("chuyenKhoaId: ", chuyenKhoaId);
            console.log("giaKhamVN: ", giaKhamVN);
            console.log("giaKhamNuocNgoai: ", giaKhamNuocNgoai);


            if (!email || !password || !firstName || !lastName) {
                return res.status(400).json({
                    message: "Vui lòng cung cấp đầy đủ thông tin (email, password, firstName, lastName)"
                });
            }

            const existingDoctor = await Doctor.findOne({ email: email });
            if (existingDoctor) {
                return res.status(409).json({
                    message: "Email đã tồn tại. Vui lòng sử dụng email khác."
                });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            let createDoctor = await Doctor.create({
                email,
                password: hashedPassword,
                firstName, lastName, address, phoneNumber,
                chucVuId: chucVuId || [],
                gender, image,
                chuyenKhoaId: chuyenKhoaId || [],
                phongKhamId, roleId, mota, giaKhamVN, giaKhamNuocNgoai,
            })

            if (createDoctor) {
                console.log("thêm thành công tài khoản");
                return res.status(200).json({
                    data: createDoctor,
                    message: "Thêm tài khoản bác sĩ thành công"
                })
            } else {
                return res.status(404).json({
                    message: "Thêm tài khoản bác sĩ thất bại"
                })
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra khi thêm tài khoản bác sĩ.",
                error: error.message,
            });
        }
    },

    createChucVu: async (req, res) => {
        try {
            let { name, description } = req.body

            if (!name) {
                return res.status(400).json({
                    message: "Vui lòng cung cấp đầy đủ thông tin (name)"
                });
            }

            // tìm tên chức vụ bác sĩ chính xác nếu trùng thì không được thêm
            const existingChucVu = await ChucVu.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
            if (existingChucVu) {
                return res.status(409).json({
                    message: "Tên chức vụ đã tồn tại. Vui lòng sử dụng chức vụ khác."
                });
            }

            let createChucVu = await ChucVu.create({ name, description })

            if (createChucVu) {
                console.log("thêm thành công chức vụ");
                return res.status(200).json({
                    data: createChucVu,
                    message: "Thêm chức vụ bác sĩ thành công"
                })
            } else {
                return res.status(404).json({
                    message: "Thêm chức vụ bác sĩ thất bại"
                })
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra khi thêm chức vụ bác sĩ.",
                error: error.message,
            });
        }
    },

    createPhongKham: async (req, res) => {
        try {
            let { name, address, description, image } = req.body
            console.log("anhr: ", image);


            if (!name || !address) {
                return res.status(400).json({
                    message: "Vui lòng cung cấp đầy đủ thông tin (tên phòng khám, địa chỉ)"
                });
            }

            let createPhongKham = await PhongKham.create({ name, address, description, image })

            if (createPhongKham) {
                console.log("thêm thành công phòng khám");
                return res.status(200).json({
                    data: createPhongKham,
                    message: "Thêm phòng khám thành công"
                })
            } else {
                return res.status(404).json({
                    message: "Thêm phòng khám thất bại"
                })
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra khi thêm phòng khám.",
                error: error.message,
            });
        }
    },

    createChuyenKhoa: async (req, res) => {
        try {
            let { name, description, image } = req.body
            console.log("anhr: ", image);

            // tìm tên chuyên khoa bác sĩ chính xác nếu trùng thì không được thêm
            const existingChuyenKhoa = await ChuyenKhoa.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
            if (existingChuyenKhoa) {
                return res.status(409).json({
                    message: "Tên chuyên khoa đã tồn tại. Vui lòng sử dụng chuyên khoa khác."
                });
            }

            if (!name) {
                return res.status(400).json({
                    message: "Vui lòng cung cấp đầy đủ thông tin (tên chuyên khoa)"
                });
            }

            let createChuyenKhoa = await ChuyenKhoa.create({ name, description, image })

            if (createChuyenKhoa) {
                console.log("thêm thành công chuyên khoa");
                return res.status(200).json({
                    data: createChuyenKhoa,
                    message: "Thêm chuyên khoa thành công"
                })
            } else {
                return res.status(404).json({
                    message: "Thêm chuyên khoa thất bại"
                })
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra khi thêm chuyên khoa.",
                error: error.message,
            });
        }
    },


    updateDoctor: async (req, res) => {
        try {
            let { _id, email, password, firstName, lastName, address, phoneNumber, giaKhamVN, giaKhamNuocNgoai,
                chucVuId, gender, image, chuyenKhoaId, phongKhamId, roleId, mota, } = req.body

            console.log("id: ", _id);

            // Hash the password
            // const hashedPassword = await bcrypt.hash(password, 10);

            let createDoctor = await Doctor.updateOne({ _id: _id }, {
                email,
                // password: hashedPassword, 
                firstName, lastName, address, phoneNumber,
                chucVuId: chucVuId || [],
                gender, image,
                chuyenKhoaId: chuyenKhoaId || [],
                phongKhamId, roleId, mota,
                giaKhamVN, giaKhamNuocNgoai,
            })

            if (createDoctor) {
                console.log("Chỉnh sửa thành công tài khoản");
                return res.status(200).json({
                    data: createDoctor,
                    message: "Chỉnh sửa tài khoản bác sĩ thành công"
                })
            } else {
                return res.status(404).json({
                    message: "Chỉnh sửa tài khoản bác sĩ thất bại"
                })
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra khi Chỉnh sửa tài khoản bác sĩ.",
                error: error.message,
            });
        }
    },

    updateChucVu: async (req, res) => {
        try {
            let { _id, name, description } = req.body

            console.log("id: ", _id);

            let createChucVu = await ChucVu.updateOne({ _id: _id }, { name, description })

            if (createChucVu) {
                console.log("Chỉnh sửa thành công chức vụ");
                return res.status(200).json({
                    data: createChucVu,
                    message: "Chỉnh sửa chức vụ bác sĩ thành công"
                })
            } else {
                return res.status(404).json({
                    message: "Chỉnh sửa chức vụ bác sĩ thất bại"
                })
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra khi Chỉnh sửa tài khoản bác sĩ.",
                error: error.message,
            });
        }
    },

    updatePhongKham: async (req, res) => {
        try {
            let { _id, name, address, description, image } = req.body

            let createPhongKham = await PhongKham.updateOne({ _id: _id }, { name, address, description, image })

            if (createPhongKham) {
                console.log("Chỉnh sửa thành công tài khoản");
                return res.status(200).json({
                    data: createPhongKham,
                    message: "Chỉnh sửa phòng khám thành công"
                })
            } else {
                return res.status(404).json({
                    message: "Chỉnh sửa phòng khám thất bại"
                })
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra khi Chỉnh sửa phòng khám.",
                error: error.message,
            });
        }
    },

    updateChuyenKhoa: async (req, res) => {
        try {
            let { _id, name, description, image } = req.body

            let updateChuyenKhoa = await ChuyenKhoa.updateOne({ _id: _id }, { name, description, image })

            if (updateChuyenKhoa) {
                return res.status(200).json({
                    data: updateChuyenKhoa,
                    message: "Chỉnh sửa chuyên khoa thành công"
                })
            } else {
                return res.status(404).json({
                    message: "Chỉnh sửa chuyên khoa thất bại"
                })
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra khi Chỉnh sửa chuyên khoa.",
                error: error.message,
            });
        }
    },


    deleteDoctor: async (req, res) => {
        const _id = req.params.id

        let xoaAD = await Doctor.deleteOne({ _id: _id })

        if (xoaAD) {
            return res.status(200).json({
                data: xoaAD,
                message: "Bạn đã xoá tài khoản bác sĩ thành công!"
            })
        } else {
            return res.status(500).json({
                message: "Bạn đã xoá tài khoản bác sĩ thất bại!"
            })
        }
    },

    deleteChucVu: async (req, res) => {
        const _id = req.params.id

        let xoaAD = await ChucVu.deleteOne({ _id: _id })

        if (xoaAD) {
            return res.status(200).json({
                data: xoaAD,
                message: "Bạn đã xoá chức vụ bác sĩ thành công!"
            })
        } else {
            return res.status(500).json({
                message: "Bạn đã xoá chức vụ bác sĩ thất bại!"
            })
        }
    },

    deletePhongKham: async (req, res) => {
        const _id = req.params.id

        let xoaAD = await PhongKham.deleteOne({ _id: _id })

        if (xoaAD) {
            return res.status(200).json({
                data: xoaAD,
                message: "Bạn đã xoá phòng khám thành công!"
            })
        } else {
            return res.status(500).json({
                message: "Bạn đã xoá phòng khám thất bại!"
            })
        }
    },

    deleteChuyenKhoa: async (req, res) => {
        const _id = req.params.id

        let xoaAD = await ChuyenKhoa.deleteOne({ _id: _id })

        if (xoaAD) {
            return res.status(200).json({
                data: xoaAD,
                message: "Bạn đã xoá chuyên khoa thành công!"
            })
        } else {
            return res.status(500).json({
                message: "Bạn đã xoá chuyên khoa thất bại!"
            })
        }
    },

    // them thoi gian kham benh cho doctor
    addTimeKhamBenhDoctor: async (req, res) => {
        const { date, time, _id } = req.body;
        console.log("date: ", date);
        console.log("time: ", time);
        console.log("_id: ", _id);

        try {
            const doctor = await Doctor.findById(_id);
            if (!doctor) {
                return res.status(404).json({ message: 'Bác sĩ không tồn tại!' });
            }

            // Convert date from request, ensuring the correct format
            const requestDate = moment(date, 'DD-MM-YYYY').startOf('day').format('YYYY-MM-DD');

            if (!moment(requestDate, 'YYYY-MM-DD', true).isValid()) {
                return res.status(400).json({ message: 'Ngày không hợp lệ!' });
            }

            // Check if there's already a time slot for the given date
            const existingTimeSlot = doctor.thoiGianKham.find(slot => slot.date === requestDate);

            if (existingTimeSlot) {
                // Update existing time slot
                const existingTimeIds = existingTimeSlot.thoiGianId.map(id => id.toString());
                const newTimeIds = time.filter(timeId => !existingTimeIds.includes(timeId));
                existingTimeSlot.thoiGianId = [...new Set([...existingTimeSlot.thoiGianId, ...newTimeIds])];
            } else {
                // Create a new time slot if none exists
                doctor.thoiGianKham.push({ date: requestDate, thoiGianId: time });
            }

            // Call the removeExpiredTimeSlots method to clean up any expired time slots
            await doctor.removeExpiredTimeSlots();

            // Save changes
            await doctor.save();
            return res.status(200).json({ message: 'Cập nhật lịch trình khám bệnh thành công!', data: doctor });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra!', error });
        }
    },

    addTimeKhamBenhDoctor1: async (req, res) => {
        const { date, time, _id } = req.body; // Lấy _id từ body
        console.log("date: ", date);
        console.log("time: ", time);
        console.log("_id: ", _id);

        try {
            // Tìm bác sĩ theo ID
            const doctor = await Doctor.findById(_id);
            if (!doctor) {
                return res.status(404).json({ message: 'Bác sĩ không tồn tại!' });
            }

            // Chuyển đổi ngày từ request
            // const requestDate = moment(date).startOf('day');
            // const requestDate = moment(date).tz('Asia/Bangkok').startOf('day');
            // console.log("requestDate: ", requestDate);


            // // Kiểm tra xem thời gian đã tồn tại cho ngày này chưa
            // const existingTimeSlot = doctor.thoiGianKham.find(slot => {
            //     const slotDate = moment(slot.date).tz('Asia/Bangkok').startOf('day'); // Đảm bảo so sánh đúng múi giờ
            //     console.log("slotDate: ",slotDate);                
            //     return slotDate.isSame(requestDate, 'day');
            // });

            // Chuyển đổi ngày từ request, đảm bảo đúng định dạng
            const requestDate = moment(date, 'DD-MM-YYYY').startOf('day').format('YYYY-MM-DD');

            if (!moment(requestDate, 'YYYY-MM-DD', true).isValid()) {
                return res.status(400).json({ message: 'Ngày không hợp lệ!' });
            }

            // Xóa các lịch trình cũ
            // doctor.thoiGianKham = doctor.thoiGianKham.filter(slot => moment(slot.date).isSameOrAfter(moment(), 'day'));

            // Kiểm tra xem thời gian đã tồn tại cho ngày này chưa
            const existingTimeSlot = doctor.thoiGianKham.find(slot => slot.date === requestDate);

            if (existingTimeSlot) {
                // Lấy mảng các thoiGianId hiện tại
                const existingTimeIds = existingTimeSlot.thoiGianId.map(id => id.toString());

                // Lọc ra các thời gian mới không có trong existingTimeIds
                const newTimeIds = time.filter(timeId => !existingTimeIds.includes(timeId));

                // Cập nhật thoiGianId với các ID mới
                existingTimeSlot.thoiGianId = [...new Set([...existingTimeSlot.thoiGianId, ...newTimeIds])];

                // Xóa đi các thoiGianId không còn trong danh sách mới
                existingTimeSlot.thoiGianId = existingTimeSlot.thoiGianId.filter(timeId => time.includes(timeId.toString()));
            } else {
                // Nếu chưa tồn tại, tạo một lịch khám mới
                // doctor.thoiGianKham.push({ date: requestDate.toDate(), thoiGianId: time });
                doctor.thoiGianKham.push({ date: requestDate, thoiGianId: time });
            }

            // Lưu thay đổi
            await doctor.save();

            return res.status(200).json({ message: 'Cập nhật lịch trình khám bệnh thành công!', data: doctor });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra!', error });
        }
    },

    // xóa lịch trình quá cũ
    deleteOldTimeSlots: async (req, res) => {
        const { _id } = req.body; // Lấy _id từ body
        console.log("_id: ", _id);

        try {
            // Tìm bác sĩ theo ID
            const doctor = await Doctor.findById(_id);
            if (!doctor) {
                return res.status(404).json({ message: 'Bác sĩ không tồn tại!' });
            }

            // Xóa các lịch trình cũ
            // doctor.thoiGianKham = doctor.thoiGianKham.filter(slot => moment(slot.date).isSameOrAfter(moment(), 'day'));

            // Lọc các lịch trình đã qua
            const oldSlots = doctor.thoiGianKham.filter(slot => moment(slot.date).isBefore(moment(), 'day'));

            console.log("oldSlots: ", oldSlots);


            // Kiểm tra xem có lịch trình cũ không
            if (oldSlots.length === 0) {
                return res.status(400).json({ message: 'Không có lịch trình cũ để xóa!' });
            }

            // Xóa các lịch trình cũ
            doctor.thoiGianKham = doctor.thoiGianKham.filter(slot => moment(slot.date).isSameOrAfter(moment(), 'day'));

            // Lưu thay đổi
            await doctor.save();

            return res.status(200).json({ message: 'Đã xóa các lịch trình cũ thành công!', data: doctor });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra!', error });
        }
    },

    // API để lấy thời gian khám của bác sĩ theo ngày
    getTimeSlotsByDoctorAndDate: async (req, res) => {
        const { doctorId, date } = req.query; // Lấy doctorId và date từ query
        console.log("doctorId, date: ", doctorId, date);

        try {
            // Tìm bác sĩ theo ID
            const doctor = await Doctor.findById(doctorId);
            if (!doctor) {
                return res.status(404).json({ message: 'Bác sĩ không tồn tại!' });
            }

            // Chuyển đổi ngày từ query
            const queryDate = moment.utc(date).startOf('day');

            const timeSlot = doctor.thoiGianKham.find(slot => {
                const slotDate = moment.utc(slot.date).startOf('day');
                return slotDate.isSame(queryDate);
            });

            if (timeSlot) {
                // Lấy danh sách thoiGianId
                const timeGioIds = timeSlot.thoiGianId;

                // Tìm các tenGio tương ứng với thoiGianId
                const timeGioList = await ThoiGianGio.find({ _id: { $in: timeGioIds } });

                // Tạo mảng các tenGio

                const tenGioArray = timeGioList.map(item => item.tenGio);
                console.log("tenGioArray: ", tenGioArray);


                return res.status(200).json({
                    message: 'Lấy thời gian thành công!',
                    timeSlots: timeSlot.thoiGianId,
                    tenGioArray,
                    timeGioList
                });
            } else {
                return res.status(200).json({ message: 'Không có thời gian khám cho ngày này!', timeSlots: [] });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra!', error });
        }
    },

    // tìm ra doctor để hiển thị chi tiết
    fetchDoctorById: async (req, res) => {

        let id = req.query.id
        console.log("id doctor: ", id);
        try {
            const doctor = await Doctor.findById(id)
                .populate("chucVuId chuyenKhoaId phongKhamId roleId")
                .populate({
                    path: 'thoiGianKham.thoiGianId', // Đường dẫn đến trường cần populate
                    model: 'ThoiGianGio' // Tên model của trường cần populate
                })
            if (!doctor) {
                return res.status(404).json({ message: 'Bác sĩ không tồn tại!' });
            }
            return res.status(200).json({
                message: "Đã tìm thấy bác sĩ",
                data: doctor
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra!', error });
        }
    },

    // tìm tt bác sĩ khi bệnh nhân đặt lịch (hiển thị lên page đặt lịch)
    fetchDoctorByNgayGio: async (req, res) => {
        try {
            const { id, idGioKhamBenh, ngayKham } = req.query; // Lấy doctorId và date từ query
            console.log("id, idGioKhamBenh, ngayKham: ", id, idGioKhamBenh, ngayKham);

            // Tìm bác sĩ theo ID
            const doctor = await Doctor.findById(id).populate("chucVuId chuyenKhoaId phongKhamId roleId")
            if (!doctor) {
                return res.status(404).json({ message: 'Bác sĩ không tồn tại!' });
            }

            const timeGio = await ThoiGianGio.findById(idGioKhamBenh);
            if (!timeGio) {
                return res.status(404).json({ message: 'tên giờ không tồn tại!' });
            }

            return res.status(200).json({
                message: 'Da tim thay!',
                infoDoctor: doctor,
                tenGio: timeGio,
                ngayKham: ngayKham
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra!', error });
        }
    },

    datLichKham: async (req, res) => {
        try {
            const { _idDoctor, _idTaiKhoan, patientName, email,
                gender, phone, dateBenhNhan, address, lidokham,
                hinhThucTT, tenGioKham, ngayKhamBenh, giaKham
            } = req.body

            // Parse the date
            const [day, month, year] = ngayKhamBenh.split('/').map(Number);
            const appointmentDate = new Date(year, month - 1, day);

            // Parse the time range for the new appointment
            const [startTimeStr, endTimeStr] = tenGioKham.split(' - ');
            const [startHour, startMinute] = startTimeStr.split(':').map(Number);
            const [endHour, endMinute] = endTimeStr.split(':').map(Number);

            const newStartTime = new Date(appointmentDate);
            newStartTime.setHours(startHour, startMinute);

            const newEndTime = new Date(appointmentDate);
            newEndTime.setHours(endHour, endMinute);

            // Check for existing appointments
            const existingAppointments = await KhamBenh.find({
                _idDoctor,
                ngayKhamBenh
            });

            // Check for overlapping appointments
            for (const appointment of existingAppointments) {
                const [existingStartStr, existingEndStr] = appointment.tenGioKham.split(' - ');
                const [existingStartHour, existingStartMinute] = existingStartStr.split(':').map(Number);
                const [existingEndHour, existingEndMinute] = existingEndStr.split(':').map(Number);

                const existingStartTime = new Date(appointmentDate);
                existingStartTime.setHours(existingStartHour, existingStartMinute);

                const existingEndTime = new Date(appointmentDate);
                existingEndTime.setHours(existingEndHour, existingEndMinute);

                // Check if there's an overlap
                if (newStartTime < existingEndTime && newEndTime > existingStartTime) {
                    return res.status(400).json({ message: 'Có vẻ lịch khám này đã có bệnh nhân đăng ký rồi. Vui lòng chọn thời gian khác.' });
                }
            }

            let datlich = await KhamBenh.create({
                _idDoctor, _idTaiKhoan, patientName, email,
                gender, phone, dateBenhNhan, address, lidokham,
                hinhThucTT, tenGioKham, ngayKhamBenh, giaKham
            })

            if (!datlich) {
                return res.status(404).json({ message: 'Đặt lịch thất bại!' });
            }

            return res.status(200).json({
                message: 'Đặt lịch khám thành công!',
                data: datlich
            });


        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra!', error });
        }
    },

    getLichHen: async (req, res) => {
        try {
            let idKH = req.query.idKhachHang

            const findLichHen = await KhamBenh.find({ _idTaiKhoan: idKH })
                .populate("_idDoctor _idTaiKhoan")
                .populate({
                    path: '_idDoctor',
                    populate: [
                        { path: 'chucVuId' },
                        { path: 'chuyenKhoaId' },
                        { path: 'phongKhamId' },
                    ]
                })
                .populate({
                    path: '_idTaiKhoan',
                    model: 'BenhNhan'
                })
                .sort({ createdAt: -1 }); // Sắp xếp theo thứ tự giảm dần của createdAt

            if (!findLichHen) {
                return res.status(404).json({ message: 'Tìm lịch hẹn thất bại!' });
            }

            return res.status(200).json({
                message: 'Tìm lịch hẹn thành công!',
                data: findLichHen
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra!', error });
        }
    },


    //----------------------------------------------------------------
    // updateTrangThaiDaKham: async (req, res) => {
    //     try {
    //         // Lấy thông tin từ request body
    //         const { idLichHen } = req.body;

    //         // Kiểm tra nếu không có idLichHen
    //         if (!idLichHen) {
    //             return res.status(400).json({ message: 'Thiếu id lịch hẹn!' });
    //         }

    //         // Tìm lịch hẹn hiện tại
    //         const lichHen = await KhamBenh.findById(idLichHen);

    //         // Kiểm tra nếu không tìm thấy lịch hẹn
    //         if (!lichHen) {
    //             return res.status(404).json({ message: 'Không tìm thấy lịch hẹn!' });
    //         }

    //         // Xác định trạng thái mới dựa trên trạng thái hiện tại
    //         const newStatus = lichHen.trangThai === "Đã xác nhận" ? "Chưa xác nhận" : "Đã xác nhận";

    //         // Cập nhật trạng thái của lịch hẹn
    //         const updatedLichHen = await KhamBenh.findByIdAndUpdate(
    //             idLichHen,
    //             { trangThai: newStatus }, // Chuyển đổi trạng thái
    //             { new: true } // Trả về dữ liệu mới sau khi cập nhật
    //         )
    //             .populate("_idDoctor _idTaiKhoan") // Populate liên kết tương tự
    //             .populate({
    //                 path: '_idDoctor',
    //                 populate: [
    //                     { path: 'chucVuId' },
    //                     { path: 'chuyenKhoaId' },
    //                     { path: 'phongKhamId' },
    //                 ]
    //             })
    //             .populate({
    //                 path: '_idTaiKhoan',
    //                 model: 'BenhNhan'
    //             });

    //         // Trả về phản hồi thành công
    //         return res.status(200).json({
    //             message: 'Cập nhật trạng thái thành công!',
    //             data: updatedLichHen
    //         });
    //     } catch (error) {
    //         console.error(error);
    //         return res.status(500).json({ message: 'Có lỗi xảy ra!', error });
    //     }
    // },

    // // Controller để cập nhật ghi chú (bệnh án)
    // updateGhiChuBenhAn: async (req, res) => {
    //     try {
    //         const { idLichHen, ghiChu } = req.body;  // Lấy thông tin từ request body

    //         // Kiểm tra nếu không có idLichHen hoặc ghiChu
    //         if (!idLichHen || !ghiChu) {
    //             return res.status(400).json({ message: 'Thiếu id lịch hẹn hoặc ghi chú!' });
    //         }

    //         // Tìm lịch hẹn hiện tại
    //         const lichHen = await KhamBenh.findById(idLichHen);

    //         // Kiểm tra nếu không tìm thấy lịch hẹn
    //         if (!lichHen) {
    //             return res.status(404).json({ message: 'Không tìm thấy lịch hẹn!' });
    //         }

    //         // Cập nhật ghi chú bệnh án
    //         lichHen.ghiChu = ghiChu;  // Gán giá trị ghi chú vào trường ghiChu

    //         // Lưu cập nhật
    //         const updatedLichHen = await lichHen.save();

    //         // Trả về phản hồi thành công
    //         return res.status(200).json({
    //             message: 'Cập nhật ghi chú bệnh án thành công!',
    //             data: updatedLichHen
    //         });
    //     } catch (error) {
    //         console.error(error);
    //         return res.status(500).json({ message: 'Có lỗi xảy ra!', error });
    //     }
    // },



    // tìm ra chuyenKhoa để hiển thị chi tiết
    fetchChuyenKhoaByID: async (req, res) => {

        let id = req.query.id
        console.log("id chuyenKhoa: ", id);
        try {
            const chuyenKhoa = await ChuyenKhoa.findById(id)

            if (!chuyenKhoa) {
                return res.status(404).json({ message: 'Chuyên khoa không tồn tại!' });
            }
            return res.status(200).json({
                message: "Đã tìm thấy Chuyên khoa",
                data: chuyenKhoa
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra!', error });
        }
    },

    fetchDoctorByChuyenKhoa: async (req, res) => {
        let id = req.query.idChuyenKhoa
        console.log("id chuyenKhoa: ", id);

        try {
            const doctor = await Doctor.find({ chuyenKhoaId: id })
                .populate("chucVuId chuyenKhoaId phongKhamId roleId")
                .populate({
                    path: 'thoiGianKham.thoiGianId', // Đường dẫn đến trường cần populate
                    model: 'ThoiGianGio' // Tên model của trường cần populate
                })

            if (!doctor) {
                return res.status(404).json({ message: 'Doctor không tồn tại!' });
            }
            return res.status(200).json({
                message: "Đã tìm thấy Doctor",
                data: doctor
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra!', error });
        }

    },

    handleHuyOrder: async (req, res) => {
        try {
            let id = req.query.idHuy

            let checkOrder = await KhamBenh.findById({ _id: id })

            if (!checkOrder) {
                return res.status(404).json({
                    message: "Lịch hẹn không tồn tại!",
                    errCode: -1,
                });
            }

            let updateOrder = await KhamBenh.updateOne(
                { _id: id },
                { trangThai: 'Đã đặt lịch', trangThaiHuyDon: 'Đã Hủy' }
            )
            if (updateOrder) {
                return res.status(200).json({
                    message: "Hủy Lịch hẹn thành công!",
                    errCode: 0,
                    data: updateOrder
                })
            } else {
                return res.status(500).json({
                    message: "Hủy Lịch hẹn thất bại!",
                    errCode: -1,
                })
            }
        } catch (error) {
            return res.status(500).json({
                message: 'Đã xảy ra lỗi!',
                error: error.message,
            });
        }
    },

    findAllLichHen: async (req, res) => {
        try {

            const { page, limit, sort, order, lichHen } = req.query;

            // Chuyển đổi thành số
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);

            // Tính toán số bản ghi bỏ qua
            const skip = (pageNumber - 1) * limitNumber;

            const query = {};
            // Tạo điều kiện tìm kiếm
            if (lichHen) {
                const searchKeyword = lichHen.trim() // Lấy 6 ký tự cuối của lichHen
                query._id = { $regex: `${searchKeyword}`, $options: 'i' }; // So sánh 6 ký tự đầu của _id
            }

            // tang/giam
            let sortOrder = 1; // tang dn
            if (order === 'desc') {
                sortOrder = -1;
            }

            let findOrder = await KhamBenh.find(query)
                .skip(skip)
                .limit(limitNumber)
                .populate('_idDoctor _idTaiKhoan')
                .populate({
                    path: '_idDoctor', // Populate thông tin bác sĩ
                    populate: {
                        path: 'phongKhamId', // Populate phongKhamId từ Doctor
                        model: 'PhongKham' // Model của phongKhamId là PhongKham
                    }
                })
                .sort({ [sort]: sortOrder })

            // Tính tổng 
            let totalOrder = await KhamBenh.countDocuments(query);
            let totalPage = Math.ceil(totalOrder / limitNumber)

            if (findOrder) {
                return res.status(200).json({
                    message: "Tìm Order thành công!",
                    errCode: 0,
                    data: {
                        findOrder: findOrder,
                        totalOrder: totalOrder,
                        totalPages: totalPage,  // Tổng số trang
                        currentPage: pageNumber,  // Trang hiện tại
                    }
                })
            } else {
                return res.status(500).json({
                    message: "Tìm Order thất bại!",
                    errCode: -1,
                })
            }
        } catch (error) {
            return res.status(500).json({
                message: 'Đã xảy ra lỗi!',
                error: error.message,
            });
        }
    },

    findAllLichHenByDoctor: async (req, res) => {
        try {

            const { page, limit, sort, order, idDoctor } = req.query;

            // Chuyển đổi thành số
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);

            // Tính toán số bản ghi bỏ qua
            const skip = (pageNumber - 1) * limitNumber;

            // tang/giam
            let sortOrder = 1; // tang dn
            if (order === 'desc') {
                sortOrder = -1;
            }

            let findOrder = await KhamBenh.find({ _idDoctor: idDoctor })
                .skip(skip)
                .limit(limitNumber)
                .populate('_idDoctor _idTaiKhoan')
                .populate({
                    path: '_idDoctor', // Populate thông tin bác sĩ
                    populate: {
                        path: 'phongKhamId', // Populate phongKhamId từ Doctor
                        model: 'PhongKham' // Model của phongKhamId là PhongKham
                    }
                })
                .sort({ [sort]: sortOrder })

            // Tính tổng 
            let totalOrder = await KhamBenh.countDocuments({ _idDoctor: idDoctor });
            let totalPage = Math.ceil(totalOrder / limitNumber)

            if (findOrder) {
                return res.status(200).json({
                    message: "Tìm Order thành công!",
                    errCode: 0,
                    data: {
                        findOrder: findOrder,
                        totalOrder: totalOrder,  // Tổng số Order cho sản phẩm này
                        totalPages: totalPage,  // Tổng số trang
                        currentPage: pageNumber,  // Trang hiện tại
                    }
                })
            } else {
                return res.status(500).json({
                    message: "Tìm Order thất bại!",
                    errCode: -1,
                })
            }
        } catch (error) {
            return res.status(500).json({
                message: 'Đã xảy ra lỗi!',
                error: error.message,
            });
        }
    },

    fetchAllDoctorById: async (req, res) => {
        try {
            const { _id } = req.query; // Lấy trang và kích thước trang từ query            

            const fetchAll = await Doctor.findOne({ _id: _id })
                .populate("chucVuId chuyenKhoaId phongKhamId roleId")
                .populate({
                    path: 'thoiGianKham.thoiGianId', // Đường dẫn đến trường cần populate
                    model: 'ThoiGianGio' // Tên model của trường cần populate
                })

            return res.status(200).json({
                data: fetchAll,
                message: "Đã tìm ra bác sĩ",
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra khi tìm tài khoản bác sĩ.",
                error: error.message,
            });
        }
    },

    fetchPhongKhamByID: async (req, res) => {

        let id = req.query.id
        console.log("id pk: ", id);
        try {
            const pk = await PhongKham.findById(id)

            if (!pk) {
                return res.status(404).json({ message: 'Phong Kham không tồn tại!' });
            }
            return res.status(200).json({
                message: "Đã tìm thấy Phong Kham",
                data: pk
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra!', error });
        }
    },

    fetchDoctorByPhongKham: async (req, res) => {
        let id = req.query.idPhongKham
        console.log("idPhongKham: ", id);

        try {
            const doctor = await Doctor.find({ phongKhamId: id })
                .populate("chucVuId chuyenKhoaId phongKhamId roleId")
                .populate({
                    path: 'thoiGianKham.thoiGianId', // Đường dẫn đến trường cần populate
                    model: 'ThoiGianGio' // Tên model của trường cần populate
                })

            if (!doctor) {
                return res.status(404).json({ message: 'Doctor không tồn tại!' });
            }
            return res.status(200).json({
                message: "Đã tìm thấy Doctor",
                data: doctor
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra!', error });
        }
    },

    // ---------------
    xacNhanLich: async (req, res) => {
        try {
            // const id = req.params.id
            const { id, trangThaiXacNhan } = req.body;
            console.log("active: ", trangThaiXacNhan);

            const updatedAccount = await KhamBenh.findByIdAndUpdate(id, { trangThaiXacNhan }, { new: true });

            if (updatedAccount) {
                return res.status(200).json({ message: "Cập nhật thành công", data: updatedAccount });
            } else {
                return res.status(404).json({ message: "Tài khoản không tìm thấy" });
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra.",
                error: error.message,
            });
        }
    },

    updateTTBN: async (req, res) => {
        try {
            let { _id, benhAn, trangThaiKham } = req.body

            console.log("id: ", _id);

            let createChucVu = await KhamBenh.updateOne({ _id: _id }, { benhAn, trangThaiKham })

            if (createChucVu) {
                console.log("Chỉnh sửa thành công thông tin khám");
                return res.status(200).json({
                    data: createChucVu,
                    message: "Chỉnh sửa thông tin khám bác sĩ thành công"
                })
            } else {
                return res.status(404).json({
                    message: "Chỉnh sửa thông tin khám bác sĩ thất bại"
                })
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra khi Chỉnh sửa tài khoản bác sĩ.",
                error: error.message,
            });
        }
    },


}