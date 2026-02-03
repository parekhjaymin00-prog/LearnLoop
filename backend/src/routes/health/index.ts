import { Router, Request, Response } from 'express';
import { testDatabaseConnection, getConnectionStatus } from '../../lib/db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
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

        res.status(isDatabaseConnected ? 200 : 503).json(healthData);
    } catch (error: any) {
        console.error('❌ [HEALTH] Health check failed:', error.message);

        res.status(503).json({
            serverStatus: 'UP',
            databaseStatus: 'ERROR',
            databaseName: 'N/A',
            serverTime: new Date().toISOString(),
            timestamp: Date.now(),
            error: error.message,
            environment: process.env.NODE_ENV || 'development',
        });
    }
});

export default router;
