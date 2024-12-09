const mongoose = require('mongoose');

// Giả sử đây là ObjectId mặc định bạn muốn đặt ===> mặc định là ADMIN
const defaultRoleId = new mongoose.Types.ObjectId("66df1d48dcb551b86e4f7039");

const AccAdmin_Schema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    firstName: { type: String, default: "Quân" },
    lastName: { type: String, default: "Trần" },
    address: { type: String, default: "HCM" },
    phone: { type: String },
    gender: { type: Boolean, default: true },
    isActive: { type: Boolean, default: false },
    image: { type: String },
    tokenAccess: { type: String },
    roleId: {
        ref: "Role",
        type: mongoose.SchemaTypes.ObjectId,
        default: defaultRoleId // Đặt giá trị mặc định
    },
},
    {
        timestamps: true,   // createAt, updateAt
    }
);
module.exports = mongoose.model("AccAdmin", AccAdmin_Schema);