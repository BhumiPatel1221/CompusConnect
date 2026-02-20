# Load Balancing Setup

## PM2 Clustering (Built-in Load Balancing)

This application uses **PM2** for automatic load balancing across all CPU cores.

### How It Works:
- Creates one Node.js instance per CPU core
- Distributes incoming requests across all instances
- Automatic failover if one instance crashes

### Capacity Increase:
- **Single instance**: ~100-200 concurrent requests
- **With clustering (4 cores)**: ~400-800 concurrent requests
- **With clustering (8 cores)**: ~800-1600 concurrent requests

---

## Installation

```bash
# Install PM2 globally
npm install -g pm2
```

---

## Usage

### Start with Load Balancing:
```bash
npm run cluster
```

### Monitor Performance:
```bash
pm2 monit
```

### View Logs:
```bash
npm run cluster:logs
```

### Stop Cluster:
```bash
npm run cluster:stop
```

### Restart Cluster:
```bash
npm run cluster:restart
```

---

## Configuration

See `ecosystem.config.js` for clustering settings:
- **instances**: 'max' (uses all CPU cores)
- **exec_mode**: 'cluster' (enables load balancing)
- **max_memory_restart**: '1G' (auto-restart if memory exceeds 1GB)

---

## Production Deployment

For production, you can also use:
- **Nginx** as reverse proxy + load balancer
- **AWS ELB** (Elastic Load Balancer)
- **Docker Swarm** or **Kubernetes** for container orchestration
