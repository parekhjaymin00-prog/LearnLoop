import { Router, Request, Response } from 'express';
import { testDatabaseConnection, getConnectionStatus } from '../../lib/db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const startTime = Date.now();
        const isDatabaseConnected = await testDatabaseConnection();
        const connectionStatus = getConnectionStatus();
        const healthData = { serverStatus: 'UP', databaseStatus: isDatabaseConnected ? 'CONNECTED' : 'DISCONNECTED', databaseName: connectionStatus.databaseName, serverTime: new Date().toISOString(), responseTime: `${Date.now() - startTime}ms`, environment: process.env.NODE_ENV || 'development' };
        res.status(isDatabaseConnected ? 200 : 503).json(healthData);
    } catch (error: any) {
        res.status(503).json({ serverStatus: 'UP', databaseStatus: 'ERROR', error: error.message });
    }
});

export default router;
