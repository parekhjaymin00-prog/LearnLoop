import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI && process.env.MOCK_MODE !== 'true') {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (process.env.MOCK_MODE === 'true') {
        console.log('🔧 [DB] Running in MOCK MODE - Database disabled');
        return null;
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        console.log('🔌 [DB] Attempting to connect to MongoDB...');

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            console.log('✅ [DB] Successfully connected to MongoDB');
            console.log(`📊 [DB] Database: ${mongoose.connection.db?.databaseName || 'unknown'}`);
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e: any) {
        cached.promise = null;
        console.error('❌ [DB] Failed to connect to MongoDB');
        console.error(`❌ [DB] Error: ${e.message}`);
        console.error(`❌ [DB] Stack: ${e.stack}`);
        throw e;
    }

    return cached.conn;
}

/**
 * Test database connection with a simple query
 */
export async function testDatabaseConnection(): Promise<boolean> {
    try {
        if (process.env.MOCK_MODE === 'true') {
            return true;
        }

        const connection = await connectDB();
        if (!connection) {
            return false;
        }

        // Perform a simple ping operation
        if (mongoose.connection.db) {
            await mongoose.connection.db.admin().ping();
        }
        return true;
    } catch (error: any) {
        console.error('❌ [DB] Connection test failed:', error.message);
        return false;
    }
}

/**
 * Get current database connection status
 */
export function getConnectionStatus() {
    if (process.env.MOCK_MODE === 'true') {
        return {
            status: 'MOCK_MODE',
            databaseName: 'mock-database',
            readyState: 'mock',
        };
    }

    if (!cached.conn) {
        return {
            status: 'DISCONNECTED',
            databaseName: null,
            readyState: mongoose.connection.readyState,
        };
    }

    const readyStates: { [key: number]: string } = {
        0: 'DISCONNECTED',
        1: 'CONNECTED',
        2: 'CONNECTING',
        3: 'DISCONNECTING',
    };

    return {
        status: readyStates[mongoose.connection.readyState] || 'UNKNOWN',
        databaseName: mongoose.connection.db?.databaseName || null,
        readyState: mongoose.connection.readyState,
    };
}

export default connectDB;
