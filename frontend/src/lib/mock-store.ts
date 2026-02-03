// In-memory store for development/mock purposes
// This will persist data as long as the server is running

export interface MockMessage {
    _id: string;
    content: string;
    sender: string;
    role: "user" | "other";
    domain: string;
    topic: string;
    timestamp: string;
    avatar?: string;
    attachments?: any[];
    createdAt: Date;
}

export interface MockResource {
    _id: string;
    title: string;
    type: "link" | "file";
    addedBy: string;
    domain: string;
    topic: string;
    url?: string;
    size?: string;
    createdAt: Date;
}

export interface MockComment {
    _id: string;
    content: string;
    author: string;
    resourceId: string;
    parentCommentId: string | null;
    mentions: string[];
    domain: string;
    topic: string;
    createdAt: Date;
}

export interface MockNotification {
    _id: string;
    userId: string;
    type: 'mention' | 'reply';
    commentId: string;
    resourceId: string;
    resourceTitle: string;
    triggeredBy: string;
    message: string;
    read: boolean;
    domain: string;
    topic: string;
    createdAt: Date;
}

// globalThis is used to persist across hot reloads in Next.js development
const globalStore = global as unknown as {
    mockMessages: MockMessage[];
    mockResources: MockResource[];
    mockComments: MockComment[];
    mockNotifications: MockNotification[];
};

if (!globalStore.mockMessages) {
    globalStore.mockMessages = [];
}

if (!globalStore.mockResources) {
    globalStore.mockResources = [];
}

if (!globalStore.mockComments) {
    globalStore.mockComments = [];
}

if (!globalStore.mockNotifications) {
    globalStore.mockNotifications = [];
}

export const mockStore = {
    getMessages: (domain: string, topic: string) => {
        return globalStore.mockMessages.filter(m => m.domain === domain && m.topic === topic);
    },
    addMessage: (message: Omit<MockMessage, "_id" | "createdAt">) => {
        const newMessage: MockMessage = {
            ...message,
            _id: Date.now().toString(),
            createdAt: new Date()
        };
        globalStore.mockMessages.push(newMessage);
        return newMessage;
    },
    getResources: (domain: string, topic: string) => {
        return globalStore.mockResources.filter(r => r.domain === domain && r.topic === topic);
    },
    addResource: (resource: Omit<MockResource, "_id" | "createdAt">) => {
        const newResource: MockResource = {
            ...resource,
            _id: Date.now().toString(),
            createdAt: new Date()
        };
        globalStore.mockResources.push(newResource);
        return newResource;
    },
    getComments: (resourceId: string) => {
        return globalStore.mockComments.filter(c => c.resourceId === resourceId);
    },
    addComment: (comment: Omit<MockComment, "_id" | "createdAt">) => {
        const newComment: MockComment = {
            ...comment,
            _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date()
        };
        globalStore.mockComments.push(newComment);
        return newComment;
    },
    getNotifications: (userId: string) => {
        return globalStore.mockNotifications.filter(n => n.userId === userId);
    },
    addNotification: (notification: Omit<MockNotification, "_id" | "createdAt">) => {
        const newNotification: MockNotification = {
            ...notification,
            _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date()
        };
        globalStore.mockNotifications.push(newNotification);
        return newNotification;
    },
    markNotificationsAsRead: (notificationIds: string[], userId: string) => {
        globalStore.mockNotifications.forEach(n => {
            if (notificationIds.includes(n._id) && n.userId === userId) {
                n.read = true;
            }
        });
    },
    getResourceById: (resourceId: string) => {
        return globalStore.mockResources.find(r => r._id === resourceId);
    },
    getCommentById: (commentId: string) => {
        return globalStore.mockComments.find(c => c._id === commentId);
    }
};
