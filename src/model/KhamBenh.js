const mongoose = require('mongoose');

const KhamBenh_Schema = new mongoose.Schema({             
        _idDoctor: {ref: "Doctor", type: mongoose.SchemaTypes.ObjectId},     
        _idTaiKhoan: {ref: "BenhNhan", type: mongoose.SchemaTypes.ObjectId},     
        patientName: { type: String },        
        email: { type: String },        
        gender: { type: Boolean },        
        phone: { type: String },        
        dateBenhNhan: { type: String },        
        address: { type: String },        
        lidokham: { type: String },        
        hinhThucTT: { type: Boolean },        
        tenGioKham: { type: String },        
        ngayKhamBenh: { type: String },        
        giaKham: { type: String },  
        trangThai: { 
            type: String, 
            enum: ["Đã đặt lịch", "Chưa đặt lịch"], 
            default: "Đã đặt lịch" 
        },   
        trangThaiHuyDon: { 
            type: String, 
            enum: ["Đã Hủy", "Không Hủy"], 
            default: "Không Hủy" 
        },   
    },
    { 
        timestamps: true,   // createAt, updateAt
    }
);
module.exports = mongoose.model("KhamBenh", KhamBenh_Schema);