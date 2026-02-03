import { NextResponse } from 'next/server';
import { testDatabaseConnection, getConnectionStatus } from '@/lib/db';

export async function GET() {
    try {
        const startTime = Date.now();

        // Test database connection
        const isDatabaseConnected = await testDatabaseConnection();
        const connectionStatus = getConnectionStatus();

        const healthData = {
            serverStatus: 'UP',
            databaseStatus: isDatabaseConnected ? 'CONNECTED' : 'DISCONNECTED',
            databaseName: connectionStatus.databaseName || 'N/A',
            serverTime: new Date().toISOString(),
            timestamp: Date.now(),
            responseTime: `${Date.now() - startTime}ms`,
            environment: process.env.NODE_ENV || 'development',
            mockMode: process.env.MOCK_MODE === 'true',
        };

        console.log('🏥 [HEALTH] Health check performed:', {
            database: healthData.databaseStatus,
            responseTime: healthData.responseTime,
        });

        return NextResponse.json(healthData, {
            status: isDatabaseConnected ? 200 : 503,
        });
    } catch (error: any) {
        console.error('❌ [HEALTH] Health check failed:', error.message);

        return NextResponse.json({
            serverStatus: 'UP',
            databaseStatus: 'ERROR',
            databaseName: 'N/A',
            serverTime: new Date().toISOString(),
            timestamp: Date.now(),
            error: error.message,
            environment: process.env.NODE_ENV || 'development',
        }, {
            status: 503,
        });
    }
}
