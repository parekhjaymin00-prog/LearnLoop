import mongoose, { Schema, model, models } from 'mongoose';

const NotificationSchema = new Schema({
    userId: { type: String, required: true }, // User receiving the notification
    type: { type: String, enum: ['mention', 'reply', 'comment'], required: true },
    commentId: { type: String, required: true }, // Reference to the comment
    resourceId: { type: String, required: true }, // Reference to the resource
    resourceTitle: { type: String }, // For display purposes
    triggeredBy: { type: String, required: true }, // User who triggered the notification
    message: { type: String, required: true }, // Notification message text
    read: { type: Boolean, default: false },
    domain: { type: String, required: true },
    topic: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Notification = models.Notification || model('Notification', NotificationSchema);
export default Notification;
