# Security Policy

## Security Summary

This document outlines security considerations for the African Fashion eCommerce application.

## Dependency Vulnerabilities

### Current Status (as of 2026-02-17)

**Known Issues:**
- **Next.js 14.2.35**: Contains known DoS vulnerabilities (GHSA-9g9p-9gw9-jx7f, GHSA-h25m-26qc-wcjf)
  - **Impact**: These vulnerabilities primarily affect self-hosted deployments
  - **Mitigation**: When deploying to Railway, Vercel, or Netlify, these platforms provide infrastructure-level protection against DoS attacks
  - **Recommendation**: Update to Next.js 15+ when stable and compatible with the application

### Mitigation Strategies

1. **Use Managed Platforms**: Deploy to Railway, Vercel, or Netlify which provide:
   - DDoS protection
   - Rate limiting
   - CDN caching
   - Automatic security patches

2. **Environment Variables**: Never commit sensitive data
   - All secrets are in `.env` (which is gitignored)
   - Use `.env.example` as a template only
   - Rotate secrets regularly

3. **Input Validation**: The application uses:
   - Zod for schema validation
   - React Hook Form for form validation
   - Type safety with TypeScript

## Security Best Practices Implemented

✅ **No Hardcoded Secrets**: All API keys and secrets use environment variables  
✅ **XSS Protection**: No use of `dangerouslySetInnerHTML`  
✅ **CSRF Protection**: Using NextAuth.js with built-in CSRF tokens  
✅ **Type Safety**: Full TypeScript coverage  
✅ **Secure Dependencies**: Using maintained, reputable packages  
✅ **Authentication**: NextAuth.js for secure authentication flows  
✅ **Payment Security**: Stripe integration (PCI compliant)  

## Reporting a Vulnerability

If you discover a security vulnerability, please:

1. **Do NOT** open a public issue
2. Email the maintainers directly (contact information in repository)
3. Provide:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Checklist for Deployment

Before deploying to production, ensure:

- [ ] All environment variables are set correctly
- [ ] `.env` file is NOT committed to version control
- [ ] NEXTAUTH_SECRET is generated using `openssl rand -base64 32`
- [ ] Production Stripe keys are configured (not test keys)
- [ ] CORS is properly configured on your backend API
- [ ] SSL/TLS is enabled (automatic on Railway/Vercel/Netlify)
- [ ] Rate limiting is enabled (check your platform settings)
- [ ] Monitoring/logging is configured

## Dependencies to Update

The following dependencies should be updated in future releases:

1. **Next.js** - Update to 15.x when stable
   - Current: 14.2.35
   - Target: 15.5.9+
   - Blockers: Breaking changes, need testing

2. **ESLint** - Update to ESLint 9
   - Current: 8.57.1 (deprecated)
   - Target: 9.x
   - Note: No security impact, just maintenance

## Environment Variable Security

### Required Variables (Production)

```env
# Authentication - MUST be kept secret
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=<your production URL>

# Payment Processing - MUST be kept secret
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Public Variables (safe to expose to client)
NEXT_PUBLIC_API_URL=<your backend API>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Never Commit
- Real API keys or secrets
- Production credentials
- User data or PII
- Internal URLs or endpoints

## Additional Resources

- [Next.js Security Best Practices](https://nextjs.org/docs/pages/building-your-application/deploying/production-checklist)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Railway Security](https://docs.railway.app/reference/security)
- [Vercel Security](https://vercel.com/docs/security/security-overview)

## Updates

This security policy is reviewed and updated regularly. Last update: 2026-02-17

---

**Note**: While we strive for security, this is an eCommerce platform handling sensitive data. Always:
- Keep dependencies updated
- Monitor for security advisories
- Review code changes for security implications
- Use security scanning tools in CI/CD
- Follow principle of least privilege
