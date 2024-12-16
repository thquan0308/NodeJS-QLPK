const express = require('express');
const bodyParser = require('body-parser');
const viewEngine = require('./config/viewEngine');
const initWebRoutes = require('./route/web');
const userRouter = require('./route/userRouter');
const doctorRouter = require('./route/doctorRouter');
const uploadRouter = require('./route/uploadRouter');
const cauhoiRouter = require('./route/cauHoiRouter');
const connectDB = require('./config/connectDB');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const Doctor = require('./model/Doctor');
const cron = require('node-cron');
const moment = require('moment');

require("dotenv").config();

let app = express();
let port = process.env.PORT || 6969;
const hostname = process.env.HOST_NAME;

connectDB();

// Cài đặt CORS
// app.use(
//     cors({
//       origin: "http://localhost:3000", // Thay bằng domain của frontend
//       credentials: true,
//     })
// );
const allowedOrigins = [
    'http://localhost:3000', // Local development
    'http://localhost:3001', // Local development
    "https://react-qlpk.vercel.app",
    "https://react-qlpk-doctor.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) { // Dùng includes thay cho indexOf
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.options('*', cors()); // Enable preflight requests for all routes



// Config bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Đặt thư mục public/uploads làm public để có thể truy cập
app.use('/uploads', express.static(path.join(__dirname, './public/uploads')));


// Config app
viewEngine(app);
// Định nghĩa các route cho API
app.use("/api/users", userRouter);
app.use("/api/doctor", doctorRouter);
// Sử dụng uploadRouter
app.use("/api/doctor", uploadRouter); // Đặt đường dẫn cho upload
app.use("/api/cauhoi", cauhoiRouter); // Đặt đường dẫn cho upload


// Lập lịch để chạy mỗi ngày vào lúc 00:00
// cron.schedule('0 0 * * *', async () => {
//   try {
//       const doctors = await Doctor.find();

//       for (const doctor of doctors) {
//           // Lọc các lịch trình đã qua
//           doctor.thoiGianKham = doctor.thoiGianKham.filter(slot => moment(slot.date).isSameOrAfter(moment(), 'day'));
//           // Lưu thay đổi
//           await doctor.save();
//       }
//       console.log('Đã tự động xóa các lịch trình cũ thành công!');
//   } catch (error) {
//       console.error('Có lỗi xảy ra khi xóa lịch trình cũ:', error);
//   }
// });

// Hoặc sử dụng setInterval để kiểm tra thường xuyên
setInterval(async () => {
    try {
        const doctors = await Doctor.find();

        for (const doctor of doctors) {
            doctor.thoiGianKham = doctor.thoiGianKham.filter(slot => moment(slot.date).isSameOrAfter(moment(), 'day'));
            await doctor.save();
        }
        console.log('Đã tự động xóa các lịch trình cũ thành công!');
    } catch (error) {
        console.error('Có lỗi xảy ra khi xóa lịch trình cũ:', error);
    }
}, 1000 * 60 * 1); // 1 phút


app.listen(port, () => {
    console.log("backend nodejs is running on the port:", port, `\n http://localhost:${port}`);
});
