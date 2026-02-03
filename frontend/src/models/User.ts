import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Optional for Google users
    avatar: { type: String },
    googleId: { type: String },
    isGoogleAccount: { type: Boolean, default: false },
    notificationsEnabled: { type: Boolean, default: true },
    mentionsEnabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

// Prevent model overwrite on hot reload
const User = models.User || model('User', UserSchema);
export default User;
