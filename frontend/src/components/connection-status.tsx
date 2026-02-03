'use client';

import { useState, useEffect } from 'react';
import { Activity, Database, Server, RefreshCw } from 'lucide-react';

interface HealthStatus {
    serverStatus: string;
    databaseStatus: string;
    databaseName: string;
    serverTime: string;
    responseTime?: string;
    mockMode?: boolean;
}

export function ConnectionStatus() {
    const [health, setHealth] = useState<HealthStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastCheck, setLastCheck] = useState<Date | null>(null);

    const checkHealth = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            setHealth(data);
            setLastCheck(new Date());

            if (process.env.NODE_ENV === 'development') {
                console.log('🏥 [HEALTH] Status:', data);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch health status');
            console.error('❌ [HEALTH] Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check immediately on mount
        checkHealth();

        // Auto-refresh every 30 seconds
        const interval = setInterval(checkHealth, 30000);

        return () => clearInterval(interval);
    }, []);

    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    const isHealthy = health?.serverStatus === 'UP' && health?.databaseStatus === 'CONNECTED';

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-background border rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Connection Status
                </h3>
                <button
                    onClick={checkHealth}
                    disabled={loading}
                    className="p-1 hover:bg-accent rounded disabled:opacity-50"
                    title="Refresh status"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {error && (
                <div className="text-xs text-destructive mb-2 p-2 bg-destructive/10 rounded">
                    {error}
                </div>
            )}

            {health && (
                <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Server className="w-3 h-3" />
                            Backend:
                        </span>
                        <span className={`font-medium ${health.serverStatus === 'UP' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {health.serverStatus}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Database className="w-3 h-3" />
                            Database:
                        </span>
                        <span className={`font-medium ${health.databaseStatus === 'CONNECTED' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {health.databaseStatus}
                        </span>
                    </div>

                    {health.databaseName && health.databaseName !== 'N/A' && (
                        <div className="text-muted-foreground text-[10px]">
                            DB: {health.databaseName}
                        </div>
                    )}

                    {health.mockMode && (
                        <div className="text-orange-600 dark:text-orange-400 text-[10px] font-medium">
                            ⚠️ MOCK MODE
                        </div>
                    )}

                    {health.responseTime && (
                        <div className="text-muted-foreground text-[10px]">
                            Response: {health.responseTime}
                        </div>
                    )}

                    {lastCheck && (
                        <div className="text-muted-foreground text-[10px] pt-1 border-t">
                            Last check: {lastCheck.toLocaleTimeString()}
                        </div>
                    )}
                </div>
            )}

            {!health && !error && !loading && (
                <div className="text-xs text-muted-foreground">
                    Checking status...
                </div>
            )}

            {/* Overall indicator */}
            <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-background"
                style={{ backgroundColor: isHealthy ? '#22c55e' : '#ef4444' }}
                title={isHealthy ? 'All systems operational' : 'System issues detected'}
            />
        </div>
    );
}
