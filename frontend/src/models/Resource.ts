import mongoose, { Schema, model, models } from 'mongoose';

const ResourceSchema = new Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['link', 'file'], required: true },
    url: { type: String }, // For links
    size: { type: String }, // For files
    addedBy: { type: String, required: true }, // Storing name/email for simplicity initially
    domain: { type: String, required: true }, // e.g., 'technology'
    topic: { type: String, required: true }, // e.g., 'full-stack'
    createdAt: { type: Date, default: Date.now },
});

const Resource = models.Resource || model('Resource', ResourceSchema);
export default Resource;
