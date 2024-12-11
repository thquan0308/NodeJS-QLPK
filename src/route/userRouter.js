const express = require("express");
import loginAdmin from '../controllers/Login/login.admin.controller';
import loginDoctor from '../controllers/Login/login.doctor.controller';
import loginBenhNhan from '../controllers/Login/login.user.controller';
import { quenMatKhauDoctor } from '../controllers/Login/quen.password.controller';
import { quenMatKhauBenhNhan } from '../controllers/Login/quen.password.user.controller';
const router = express.Router();

// route đăng nhập admin
router.post("/login-admin", loginAdmin.loginAccAdmin);
// route register admin
router.post("/register-admin", loginAdmin.registerAccAdmin);
// route logout  admin
router.post("/logout-admin", loginAdmin.logoutAdmin);

// route đăng nhập benh nhan
router.post("/login-benh-nhan", loginBenhNhan.loginBenhNhan);
// route register benh nhan
router.post("/register-benh-nhan", loginBenhNhan.registerBenhNhan);
// route logout  benh nhan
router.post("/logout-benh-nhan", loginBenhNhan.logoutBenhNhan);

router.get("/get-one-kh", loginBenhNhan.getOneAccKH);

router.get("/get-all-kh", loginBenhNhan.getAccKH);

router.put("/khoa-kh", loginBenhNhan.khoaAccKH);
router.delete("/delete-kh/:id", loginBenhNhan.deleteKH);

router.put("/doi-thong-tin", loginBenhNhan.doiThongTinKH)

router.put("/doi-mat-khau-doctor", loginDoctor.doiThongTinDoctor)

// route đăng nhập admin
router.post("/login-doctor", loginDoctor.loginDoctor);
router.post("/logout-doctor", loginDoctor.logoutDoctor);

router.post("/quen-mat-khau-doctor", quenMatKhauDoctor)

router.post("/quen-mat-khau-benh-nhan", quenMatKhauBenhNhan);

module.exports = router;