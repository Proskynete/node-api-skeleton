# Docker Setup

This project includes complete Docker support for both development and production environments.

## Quick Start

### Production

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Development

```bash
# Build and start dev environment with hot reload
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f api

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## Services

The stack includes:

- **API** (Node API Skeleton): `http://localhost:3000`
- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3001`

## API Endpoints

Once running, you can access:

- **API Documentation**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health
- **Liveness Probe**: http://localhost:3000/health/live
- **Readiness Probe**: http://localhost:3000/health/ready
- **Metrics**: http://localhost:3000/metrics
- **v1 Greetings**: http://localhost:3000/api/v1/greetings
- **v2 Greetings**: http://localhost:3000/api/v2/greetings

## Grafana Setup

1. Open Grafana: http://localhost:3001
2. Login with:
   - **Username**: admin
   - **Password**: admin
3. Add Prometheus as data source:
   - URL: `http://prometheus:9090`
   - Click "Save & Test"
4. Import dashboards or create custom ones

## Prometheus

Access Prometheus UI at http://localhost:9090

Prometheus is configured to scrape metrics from the API every 10 seconds.

### Query Examples

```promql
# Request rate
rate(http_requests_total[5m])

# p95 response time
histogram_quantile(0.95, http_request_duration_seconds_bucket)

# Requests in progress
http_requests_in_progress
```

## Docker Commands Reference

### Production

```bash
# Build without cache
docker-compose build --no-cache

# Start services
docker-compose up -d

# Scale API instances
docker-compose up -d --scale api=3

# View resource usage
docker stats

# Execute command in container
docker-compose exec api sh

# Remove volumes (clean slate)
docker-compose down -v
```

### Development

```bash
# Build dev image
docker-compose -f docker-compose.dev.yml build

# Start with build
docker-compose -f docker-compose.dev.yml up -d --build

# View API logs only
docker-compose -f docker-compose.dev.yml logs -f api

# Restart API only
docker-compose -f docker-compose.dev.yml restart api
```

## Building Production Image

```bash
# Build the image
docker build -t node-api-skeleton:latest .

# Run standalone
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e LOG_LEVEL=info \
  node-api-skeleton:latest

# Push to registry
docker tag node-api-skeleton:latest your-registry/node-api-skeleton:1.0.0
docker push your-registry/node-api-skeleton:1.0.0
```

## Multi-Stage Build

The production Dockerfile uses multi-stage builds:

1. **Builder Stage**: Installs dependencies and builds with SWC
2. **Production Stage**: Minimal Alpine image with only production dependencies

Benefits:

- Smaller final image size
- Faster builds (caches dependencies)
- More secure (no build tools in production)

## Health Checks

The API container includes built-in health checks:

```yaml
healthcheck:
  test: ["CMD", "node", "-e", "...health check..."]
  interval: 30s
  timeout: 3s
  retries: 3
  start_period: 10s
```

Check health status:

```bash
docker inspect --format='{{json .State.Health}}' node-api-skeleton
```

## Volumes

Persistent data is stored in Docker volumes:

- **prometheus-data**: Prometheus time-series database
- **grafana-data**: Grafana dashboards and configuration

List volumes:

```bash
docker volume ls
```

Backup volume:

```bash
docker run --rm -v prometheus-data:/data -v $(pwd):/backup alpine tar czf /backup/prometheus-backup.tar.gz -C /data .
```

## Networks

All services run in the `app-network` bridge network for inter-container communication.

Inspect network:

```bash
docker network inspect node-api-skeleton_app-network
```

## Environment Variables

### Production (docker-compose.yml)

- `NODE_ENV=production`
- `PORT=3000`
- `LOG_LEVEL=info`

### Development (docker-compose.dev.yml)

- `NODE_ENV=development`
- `PORT=3000`
- `LOG_LEVEL=debug`

Override in `.env` file:

```bash
NODE_ENV=staging
LOG_LEVEL=warn
```

## Troubleshooting

### Port already in use

```bash
# Find process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in docker-compose.yml
ports:
  - "3001:3000"
```

### Container won't start

```bash
# Check logs
docker-compose logs api

# Check container status
docker ps -a

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Out of disk space

```bash
# Clean up unused resources
docker system prune -a

# Remove volumes
docker volume prune
```

### Slow build

```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker build .

# Or set as default
export DOCKER_BUILDKIT=1
```

## Security Best Practices

The Docker setup follows security best practices:

1. **Non-root user**: API runs as user `nodejs` (UID 1001)
2. **Multi-stage build**: No build tools in production image
3. **Minimal base**: Alpine Linux for smaller attack surface
4. **Health checks**: Automatic container restart on failure
5. **Read-only volumes**: Prometheus config mounted read-only
6. **Signal handling**: dumb-init for proper process management

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Docker Build

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t node-api-skeleton .

      - name: Run tests
        run: |
          docker-compose up -d
          sleep 10
          curl http://localhost:3000/health
          docker-compose down
```

## Performance Tips

1. **Layer caching**: Order Dockerfile commands from least to most frequently changed
2. **.dockerignore**: Exclude unnecessary files to speed up builds
3. **BuildKit**: Enable for parallel builds and better caching
4. **Resource limits**: Set memory/CPU limits in docker-compose.yml

Example resource limits:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 512M
        reservations:
          cpus: "0.5"
          memory: 256M
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Prometheus Docker](https://prometheus.io/docs/prometheus/latest/installation/#using-docker)
- [Grafana Docker](https://grafana.com/docs/grafana/latest/installation/docker/)
