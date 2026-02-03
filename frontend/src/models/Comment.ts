import mongoose, { Schema, model, models } from 'mongoose';

const CommentSchema = new Schema({
    content: { type: String, required: true },
    author: { type: String, required: true }, // Username of the commenter
    resourceId: { type: String, required: true }, // Reference to the resource
    parentCommentId: { type: String, default: null }, // For replies (null for top-level)
    mentions: [{ type: String }], // Array of @mentioned usernames
    domain: { type: String, required: true },
    topic: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Comment = models.Comment || model('Comment', CommentSchema);
export default Comment;
