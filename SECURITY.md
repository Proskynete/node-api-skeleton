# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### 1. Do NOT open a public issue

To protect users, please **do not** report security vulnerabilities through public GitHub issues.

### 2. Report privately

Send a detailed report to: **soy@eduardoalvarez.dev** or use [GitHub Security Advisories](https://github.com/proskynete/node-api-skeleton/security/advisories/new)

### 3. Include in your report

- **Description**: Clear description of the vulnerability
- **Impact**: What could an attacker do with this vulnerability?
- **Reproduction**: Step-by-step instructions to reproduce
- **Affected versions**: Which versions are impacted
- **Suggested fix**: If you have one (optional)

### 4. Response timeline

- **Initial response**: Within 48 hours
- **Status update**: Within 7 days
- **Fix timeline**: Depends on severity
  - **Critical**: 24-48 hours
  - **High**: 7 days
  - **Medium**: 30 days
  - **Low**: 90 days

### 5. Disclosure policy

- We follow **responsible disclosure** principles
- You will be credited for the discovery (if you wish)
- We will coordinate public disclosure after the fix is released
- We aim to publish security advisories within 7 days of the fix

## Security Best Practices

### For Users

When using this API skeleton:

1. **Environment Variables**

   ```bash
   # NEVER commit .env files
   # Use strong secrets in production
   # Rotate credentials regularly
   ```

2. **Dependencies**

   ```bash
   # Keep dependencies updated
   npm audit
   npm audit fix

   # Use Dependabot (already configured)
   ```

3. **Rate Limiting**

   ```bash
   # Configure rate limits in production
   RATE_LIMIT_MAX=100
   RATE_LIMIT_TIME_WINDOW=60000
   ```

4. **HTTPS Only**
   - Always use HTTPS in production
   - Configure helmet properly (already included)
   - Set secure cookies

5. **Input Validation**
   - All inputs are validated with Zod schemas
   - Never trust user input
   - Sanitize data before processing

6. **Authentication & Authorization**
   - Implement JWT or session-based auth
   - Use bcrypt for password hashing (min 10 rounds)
   - Implement RBAC (Role-Based Access Control)

### For Contributors

1. **Code Review**
   - All PRs require review
   - Security-sensitive changes need extra scrutiny

2. **Dependencies**
   - Avoid dependencies with known vulnerabilities
   - Check `npm audit` before submitting PRs
   - Prefer well-maintained packages

3. **Secrets**
   - Never hardcode secrets
   - Use environment variables
   - Add sensitive patterns to `.gitignore`

4. **Common Vulnerabilities**
   - SQL/NoSQL Injection: Use parameterized queries
   - XSS: Sanitize output
   - CSRF: Use CSRF tokens
   - Command Injection: Avoid `eval()`, validate shell commands
   - Path Traversal: Validate file paths

## Security Features

This skeleton includes:

- **Rate Limiting**: Global and per-route protection
- **CORS**: Configurable cross-origin policies
- **Helmet**: Security headers (CSP, HSTS, etc.)
- **Input Validation**: Zod schemas for runtime validation
- **Error Handling**: No stack traces in production
- **Logging**: Structured logs for security auditing
- **Health Checks**: Detect compromised services
- **Dependency Scanning**: Automated with Dependabot
- **Docker Security**: Multi-stage builds, non-root user

## Security Checklist for Production

Before deploying:

- [ ] Environment variables configured (no defaults)
- [ ] HTTPS enabled with valid certificates
- [ ] Rate limiting configured appropriately
- [ ] Helmet security headers enabled
- [ ] CORS configured for specific origins
- [ ] Authentication/authorization implemented
- [ ] Database credentials rotated
- [ ] Secrets management solution (e.g., AWS Secrets Manager)
- [ ] Security monitoring and alerting
- [ ] Regular dependency updates scheduled
- [ ] Backup and disaster recovery plan
- [ ] Incident response plan documented

## Known Security Considerations

### Current Limitations

1. **In-Memory Storage**: The example uses in-memory repositories. In production:
   - Use proper database with encryption at rest
   - Implement connection pooling
   - Use prepared statements

2. **No Built-in Authentication**: You must implement:
   - JWT/Session-based auth
   - Password hashing (bcrypt/argon2)
   - OAuth2/OIDC if needed

3. **Rate Limiting**: Default configuration is permissive:
   - Adjust limits based on your use case
   - Implement distributed rate limiting (Redis) for multi-instance deployments

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Fastify Security](https://fastify.dev/docs/latest/Guides/Recommendations/)
- [npm Security](https://docs.npmjs.com/security-and-safety)

## Contact

- **Security Contact**: [YOUR_EMAIL]
- **General Contact**: [YOUR_EMAIL]
- **GitHub Security**: Use [Security Advisories](https://github.com/proskynete/node-api-skeleton/security/advisories)

## Hall of Fame

We appreciate responsible disclosure. Contributors who report valid security issues will be listed here (with permission):

<!-- No vulnerabilities reported yet -->

---

**Last Updated**: December 2024
**Version**: 2.1.0
