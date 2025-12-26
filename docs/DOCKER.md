# Docker Setup

This project includes complete Docker support using **Docker Compose profiles** for both development and production environments with a single unified configuration.

## Architecture Overview

The Docker setup uses:

- **Single `docker-compose.yml`** with profiles for dev/production environments
- **Single `Dockerfile`** with multi-stage builds (development/production targets)
- **Node.js 24 Alpine** base image for minimal footprint
- **Observability stack**: Prometheus + Grafana

## Quick Start

### Production Environment

```bash
# Build and start production stack (API + Prometheus + Grafana)
docker-compose --profile production up -d

# View logs
docker-compose logs -f api-prod

# Stop services
docker-compose --profile production down
```

### Development Environment

```bash
# Build and start dev stack with hot reload
docker-compose --profile dev up -d

# View logs
docker-compose logs -f api-dev

# Stop services
docker-compose --profile dev down
```

## Docker Compose Profiles

The project uses **Docker Compose profiles** to manage different environments in a single file:

| Profile      | Service    | Target       | Hot Reload | Use Case           |
| ------------ | ---------- | ------------ | ---------- | ------------------ |
| `production` | `api-prod` | `production` | No         | Production deploy  |
| `dev`        | `api-dev`  | `development`| Yes        | Local development  |

**Benefits**:

- Single source of truth (`docker-compose.yml`)
- No duplicate configuration
- Easy environment switching
- Shared infrastructure services (Prometheus, Grafana)

## Services

The stack includes:

- **API (Production)**: `http://localhost:3000` - Optimized production build
- **API (Development)**: `http://localhost:3000` - Hot reload enabled
- **Prometheus**: `http://localhost:9090` - Metrics collection
- **Grafana**: `http://localhost:3001` - Metrics visualization (admin/admin)

## API Endpoints

Once running, you can access:

- **API Documentation**: http://localhost:3000/docs
- **Liveness Probe**: http://localhost:3000/health/live
- **Readiness Probe**: http://localhost:3000/health/ready
- **Metrics**: http://localhost:3000/metrics
- **v1 Greetings**: http://localhost:3000/api/v1/greetings
- **v2 Greetings**: http://localhost:3000/api/v2/greetings

## Multi-Stage Dockerfile

The single `Dockerfile` uses multi-stage builds with different targets:

### Development Target

```dockerfile
FROM node:24-alpine AS development

# All dependencies (including dev)
# Hot reload with nodemon
# Source code mounted as volume
```

**Features**:

- Full development dependencies
- Hot reload on code changes
- Fast feedback loop

### Production Target

```dockerfile
FROM node:24-alpine AS production

# Only production dependencies
# Built with SWC
# Non-root user (nodejs:1001)
# Health checks included
```

**Features**:

- Minimal image size (Alpine)
- No build tools in final image
- Security hardened (non-root)
- Optimized for performance

**Multi-Stage Build Process**:

1. **Base**: Common dependencies and setup
2. **Dependencies**: Install all npm packages
3. **Development**: Dev target with hot reload
4. **Builder**: Build application with SWC
5. **Production**: Minimal production image

## Docker Commands Reference

### Production

```bash
# Start production stack
docker-compose --profile production up -d

# Build without cache
docker-compose --profile production build --no-cache

# View resource usage
docker stats

# Execute command in container
docker-compose exec api-prod sh

# Remove volumes (clean slate)
docker-compose --profile production down -v

# View logs (follow mode)
docker-compose logs -f api-prod prometheus grafana
```

### Development

```bash
# Start dev stack
docker-compose --profile dev up -d

# Rebuild and start
docker-compose --profile dev up -d --build

# View API logs only
docker-compose logs -f api-dev

# Restart API only
docker-compose restart api-dev

# Stop dev stack
docker-compose --profile dev down
```

### Both Profiles

```bash
# Start BOTH environments (not recommended - port conflicts)
docker-compose --profile dev --profile production up -d

# View all running containers
docker-compose ps

# View all services (including stopped)
docker-compose ps -a
```

## Environment Variables

### Production Profile

Default environment for `api-prod`:

```yaml
NODE_ENV: production
PORT: 3000
LOG_LEVEL: info
```

### Development Profile

Default environment for `api-dev`:

```yaml
NODE_ENV: development
PORT: 3000
LOG_LEVEL: debug
```

### Override with .env File

Create a `.env` file in the project root:

```bash
# Override for production
NODE_ENV=staging
LOG_LEVEL=warn
RATE_LIMIT_MAX=200
```

Docker Compose will automatically load these variables.

## Grafana Setup

1. Start services: `docker-compose --profile production up -d`
2. Open Grafana: http://localhost:3001
3. Login with:
   - **Username**: admin
   - **Password**: admin
4. Add Prometheus data source:
   - URL: `http://prometheus:9090`
   - Click "Save & Test"
5. Import dashboards or create custom ones

### Dashboard Ideas

- Request rate and latency (p50, p95, p99)
- Error rates by endpoint
- Active requests gauge
- Response time heatmap

## Prometheus

Access Prometheus UI at http://localhost:9090

Prometheus scrapes metrics from the API every 10 seconds.

### Useful Queries

```promql
# Request rate (requests/second)
rate(http_requests_total[5m])

# p95 response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# p99 response time
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# Requests in progress
http_requests_in_progress

# Error rate (4xx + 5xx)
sum(rate(http_requests_total{status_code=~"4..|5.."}[5m]))

# Request rate by version
sum(rate(http_requests_total[5m])) by (version)
```

## Health Checks

The production API container includes built-in health checks:

```yaml
healthcheck:
  test: ["CMD", "node", "-e", "...liveness check..."]
  interval: 30s
  timeout: 3s
  retries: 3
  start_period: 10s
```

**Check health status**:

```bash
docker inspect --format='{{json .State.Health}}' node-api-skeleton
```

**Health states**:

- `starting`: Container starting (grace period)
- `healthy`: Health check passing
- `unhealthy`: Health check failing (after retries)

## Volumes

Persistent data stored in Docker volumes:

- **prometheus-data**: Prometheus time-series database
- **grafana-data**: Grafana dashboards and configuration

**List volumes**:

```bash
docker volume ls | grep node-api-skeleton
```

**Backup volume**:

```bash
docker run --rm \
  -v prometheus-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/prometheus-backup.tar.gz -C /data .
```

**Restore volume**:

```bash
docker run --rm \
  -v prometheus-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/prometheus-backup.tar.gz -C /data
```

## Networks

All services run in the `app-network` bridge network for inter-container communication.

**Inspect network**:

```bash
docker network inspect node-api-skeleton_default
```

**Test connectivity**:

```bash
# From API to Prometheus
docker-compose exec api-prod wget -qO- http://prometheus:9090/-/healthy

# From Grafana to Prometheus
docker-compose exec grafana wget -qO- http://prometheus:9090/api/v1/status/config
```

## Building Standalone Image

Build and run the production image without Docker Compose:

```bash
# Build the image
docker build -t node-api-skeleton:2.1.0 .

# Run standalone
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e LOG_LEVEL=info \
  --name api \
  node-api-skeleton:2.1.0

# Push to registry
docker tag node-api-skeleton:2.1.0 your-registry/node-api-skeleton:2.1.0
docker push your-registry/node-api-skeleton:2.1.0
```

## Development Hot Reload

The dev profile mounts source code as volumes for hot reload:

```yaml
volumes:
  - ./src:/app/src:ro        # Source code (read-only)
  - ./test:/app/test:ro      # Tests (read-only)
  - /app/node_modules        # Preserve container node_modules
```

**How it works**:

1. Code changes in `./src` or `./test`
2. Nodemon detects changes inside container
3. Server automatically restarts
4. Changes reflected immediately

**Note**: `node_modules` is NOT mounted to avoid conflicts between host and container dependencies.

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in docker-compose.yml
ports:
  - "3001:3000"  # Host:Container
```

### Container Won't Start

```bash
# Check logs
docker-compose logs api-prod

# Check container status
docker-compose ps -a

# Rebuild from scratch
docker-compose --profile production down -v
docker-compose --profile production build --no-cache
docker-compose --profile production up -d
```

### Out of Disk Space

```bash
# Clean up unused resources
docker system prune -a

# Remove unused volumes
docker volume prune

# Remove specific volumes
docker volume rm node-api-skeleton_prometheus-data
```

### Health Check Failing

```bash
# Check health status
docker inspect node-api-skeleton | grep -A 10 Health

# Test health endpoint manually
docker-compose exec api-prod wget -qO- http://localhost:3000/health/live

# Check logs for errors
docker-compose logs --tail=100 api-prod
```

### Slow Build Times

```bash
# Enable BuildKit for faster builds
export DOCKER_BUILDKIT=1
docker-compose --profile production build

# Or use as one-liner
DOCKER_BUILDKIT=1 docker-compose --profile production build

# Check .dockerignore to exclude unnecessary files
cat .dockerignore
```

### Hot Reload Not Working (Dev)

```bash
# Ensure volumes are mounted correctly
docker-compose ps api-dev

# Check nodemon is running
docker-compose logs api-dev | grep nodemon

# Restart container
docker-compose restart api-dev
```

## Security Best Practices

The Docker setup follows security best practices:

1. **Non-root user**: Production runs as `nodejs` (UID 1001)
2. **Multi-stage build**: No dev dependencies or build tools in production
3. **Minimal base**: Alpine Linux for smaller attack surface
4. **Health checks**: Automatic failure detection and restart
5. **Read-only volumes**: Source code mounted read-only in dev
6. **Signal handling**: dumb-init for proper SIGTERM handling
7. **Environment validation**: Zod validates env vars at startup
8. **Security headers**: Helmet middleware enabled
9. **Rate limiting**: Configurable rate limits per endpoint

## Performance Optimization

### Layer Caching

The Dockerfile is optimized for layer caching:

```dockerfile
# 1. Copy package files first (changes rarely)
COPY package*.json ./

# 2. Install dependencies (cached unless package.json changes)
RUN npm ci

# 3. Copy source code last (changes frequently)
COPY . .
```

### .dockerignore

Exclude unnecessary files to speed up builds:

```
node_modules
npm-debug.log
dist
coverage
.git
.env
*.md
```

### Resource Limits (Optional)

Add resource limits in `docker-compose.yml`:

```yaml
services:
  api-prod:
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 512M
        reservations:
          cpus: "0.5"
          memory: 256M
```

## CI/CD Integration

The project includes a **Docker Image Size** workflow that compares image sizes between base and PR branches.

**Manual CI/CD example**:

```yaml
name: Docker Build

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t node-api-skeleton .

      - name: Run health check
        run: |
          docker-compose --profile production up -d
          sleep 10
          curl -f http://localhost:3000/health/live
          docker-compose --profile production down
```

## Monitoring Stack

### Prometheus Configuration

The `prometheus.yml` file configures scraping:

```yaml
scrape_configs:
  - job_name: 'node-api'
    scrape_interval: 10s
    static_configs:
      - targets: ['api-prod:3000', 'api-dev:3000']
```

### Available Metrics

- `http_request_duration_seconds`: Request latency histogram
- `http_requests_total`: Total request counter
- `http_requests_in_progress`: Active requests gauge
- `nodejs_*`: Node.js runtime metrics (memory, CPU, event loop)

### Alerting (Optional)

Add alerting rules to `prometheus.yml`:

```yaml
rule_files:
  - 'alerts.yml'

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']
```

## Docker Compose Profiles Reference

| Command                                          | Effect                                    |
| ------------------------------------------------ | ----------------------------------------- |
| `docker-compose up -d`                           | Starts only Prometheus + Grafana          |
| `docker-compose --profile dev up -d`             | Starts dev API + infrastructure           |
| `docker-compose --profile production up -d`      | Starts production API + infrastructure    |
| `docker-compose --profile dev --profile production up -d` | Starts BOTH APIs (port conflict) |

**Best Practice**: Use one profile at a time to avoid port conflicts.

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Profiles](https://docs.docker.com/compose/profiles/)
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Prometheus Docker](https://prometheus.io/docs/prometheus/latest/installation/#using-docker)
- [Grafana Docker](https://grafana.com/docs/grafana/latest/setup-grafana/installation/docker/)
- [Alpine Linux](https://alpinelinux.org/)
