import mongoose, { Schema, model, models } from 'mongoose';

const MessageSchema = new Schema({
    content: { type: String, required: true },
    sender: { type: String, required: true },
    role: { type: String, enum: ['user', 'other'], default: 'user' },
    domain: { type: String, required: true },
    topic: { type: String, required: true },
    timestamp: { type: String }, // Storing formatted display time
    createdAt: { type: Date, default: Date.now },
    avatar: { type: String }, // Initials or URL
    attachments: [{
        name: String,
        type: { type: String, enum: ['image', 'file'] }
    }]
});

const Message = models.Message || model('Message', MessageSchema);
export default Message;
