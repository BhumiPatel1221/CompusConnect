/**
 * PM2 Ecosystem Configuration
 * Enables clustering and load balancing across CPU cores
 */
module.exports = {
    apps: [
        {
            name: 'college-event-api',
            script: './server.js',
            instances: 'max', // Creates one instance per CPU core
            exec_mode: 'cluster', // Enables load balancing
            env: {
                NODE_ENV: 'development',
                PORT: 5000,
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5000,
            },
            // Auto-restart on crashes
            autorestart: true,
            // Max memory before restart (1GB)
            max_memory_restart: '1G',
            // Logging
            error_file: './logs/error.log',
            out_file: './logs/out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
        },
    ],
};
