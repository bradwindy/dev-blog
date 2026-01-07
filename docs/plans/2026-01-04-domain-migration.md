# Domain Migration: dev-blog to www.windybank.net

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Host the dev-blog project at www.windybank.net with redirects from windybank.net, bradley.windybank.net, windybank.nz, and www.windybank.nz.

**Architecture:** Remove domains from personal-site Vercel project, add www.windybank.net to dev-blog project, configure Vercel redirects for other domains, update Cloudflare DNS to use recommended Vercel endpoints with proxying disabled.

**Tech Stack:** Vercel CLI, Cloudflare flarectl, Next.js vercel.json

---

## Current State

### Cloudflare DNS - windybank.net
| Type | Name | Content | Proxied |
|------|------|---------|---------|
| A | windybank.net | 76.76.21.21 | Yes |
| CNAME | bradley.windybank.net | cname.vercel-dns.com | Yes |
| CNAME | www.windybank.net | cname.vercel-dns.com | Yes |

### Cloudflare DNS - windybank.nz
| Type | Name | Content | Proxied |
|------|------|---------|---------|
| A | windybank.nz | 76.76.21.21 | No |
| CNAME | www.windybank.nz | cname.vercel-dns.com | No |

### Vercel Projects
- `personal-site` → Currently at www.windybank.net
- `dev-blog` → Currently at dev-blog-snowy.vercel.app (this project)

---

## Task 1: Remove Domains from personal-site Project

**Context:** The domains are currently attached to the personal-site project. They must be removed before we can add them to dev-blog.

**Step 1: List domains on personal-site project**

Run in Vercel dashboard or CLI. Note all domains attached to personal-site that we need to move:
- www.windybank.net
- windybank.net
- bradley.windybank.net
- www.windybank.nz
- windybank.nz

**Step 2: Remove domains from personal-site**

```bash
# Remove each domain from the personal-site project
vercel domains rm www.windybank.net --yes
vercel domains rm windybank.net --yes
vercel domains rm bradley.windybank.net --yes
vercel domains rm www.windybank.nz --yes
vercel domains rm windybank.nz --yes
```

> **CHECKPOINT:** Confirm domains are removed before proceeding.

---

## Task 2: Add Primary Domain to dev-blog Project

**Step 1: Add www.windybank.net as primary domain**

```bash
cd /Users/bradley/Developer/dev-blog
vercel domains add www.windybank.net
```

**Step 2: Verify domain is added**

```bash
vercel domains ls
```

Expected: www.windybank.net appears in the list.

---

## Task 3: Add Redirect Domains to dev-blog Project

**Step 1: Add all redirect domains to Vercel**

```bash
vercel domains add windybank.net
vercel domains add bradley.windybank.net
vercel domains add windybank.nz
vercel domains add www.windybank.nz
```

**Step 2: Create vercel.json with redirects**

**File:** Create `/Users/bradley/Developer/dev-blog/vercel.json`

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "destination": "https://www.windybank.net/:path*",
      "permanent": true
    }
  ]
}
```

Note: This redirect applies to all domains except the primary (www.windybank.net).

**Step 3: Deploy to apply redirects**

```bash
vercel --prod
```

---

## Task 4: Update Cloudflare DNS Records (REQUIRES USER APPROVAL)

**Context:** Vercel now recommends dynamic CNAME records instead of the legacy 76.76.21.21 IP. Proxying should be disabled (DNS-only) per Vercel recommendations.

### DNS Changes for windybank.net

**IMPORTANT:** Get the exact recommended records from Vercel dashboard for dev-blog project. The CNAME target will be something like `cname.vercel-dns.com` or a project-specific address.

**Step 1: Update windybank.net apex (A → CNAME if supported, or keep A with new IP)**

```bash
# If Cloudflare supports CNAME flattening for apex:
CF_API_TOKEN="4PPnQlrUkpOstY3NvGIYJfwJeZmy_ONV8BBkXH-L" ~/go/bin/flarectl dns update \
  --zone windybank.net \
  --id b2f40556d70d32243b1de3d37ed1862e \
  --type CNAME \
  --name windybank.net \
  --content cname.vercel-dns.com \
  --proxy=false
```

**Step 2: Update bradley.windybank.net (disable proxy)**

```bash
CF_API_TOKEN="4PPnQlrUkpOstY3NvGIYJfwJeZmy_ONV8BBkXH-L" ~/go/bin/flarectl dns update \
  --zone windybank.net \
  --id f6f261a1c5081068a0f392f12c714932 \
  --type CNAME \
  --name bradley.windybank.net \
  --content cname.vercel-dns.com \
  --proxy=false
```

**Step 3: Update www.windybank.net (disable proxy)**

```bash
CF_API_TOKEN="4PPnQlrUkpOstY3NvGIYJfwJeZmy_ONV8BBkXH-L" ~/go/bin/flarectl dns update \
  --zone windybank.net \
  --id 5467066e97dd5972ae7f3d4f053c440c \
  --type CNAME \
  --name www.windybank.net \
  --content cname.vercel-dns.com \
  --proxy=false
```

### DNS Changes for windybank.nz

**Step 4: Update windybank.nz apex**

```bash
CF_API_TOKEN="4PPnQlrUkpOstY3NvGIYJfwJeZmy_ONV8BBkXH-L" ~/go/bin/flarectl dns update \
  --zone windybank.nz \
  --id 8eb746a002a36d2bd310d3e6b58054b0 \
  --type CNAME \
  --name windybank.nz \
  --content cname.vercel-dns.com \
  --proxy=false
```

**Step 5: Confirm www.windybank.nz is correct (already DNS-only)**

```bash
# www.windybank.nz already points to cname.vercel-dns.com with proxy=false
# Verify it's still correct:
CF_API_TOKEN="4PPnQlrUkpOstY3NvGIYJfwJeZmy_ONV8BBkXH-L" ~/go/bin/flarectl dns list --zone windybank.nz
```

---

## Task 5: Verify SSL Certificates

**Step 1: Check SSL status in Vercel**

```bash
vercel certs ls
```

**Step 2: Wait for certificates to provision**

Vercel automatically provisions Let's Encrypt certificates. This may take a few minutes after DNS propagates.

---

## Task 6: Test All Domains

**Step 1: Test primary domain**

```bash
curl -I https://www.windybank.net
```

Expected: HTTP 200

**Step 2: Test redirects**

```bash
curl -I https://windybank.net
curl -I https://bradley.windybank.net
curl -I https://windybank.nz
curl -I https://www.windybank.nz
```

Expected: HTTP 308 (Permanent Redirect) to https://www.windybank.net

---

## Task 7: Commit Configuration

**Step 1: Commit vercel.json**

```bash
git add vercel.json
git commit -m "feat: add domain redirects to www.windybank.net

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Summary of Changes

| Domain | Before | After |
|--------|--------|-------|
| www.windybank.net | personal-site | dev-blog (primary) |
| windybank.net | personal-site | dev-blog (redirect) |
| bradley.windybank.net | personal-site | dev-blog (redirect) |
| windybank.nz | personal-site | dev-blog (redirect) |
| www.windybank.nz | personal-site | dev-blog (redirect) |

| Cloudflare Record | Before | After |
|-------------------|--------|-------|
| windybank.net | A 76.76.21.21 (proxied) | CNAME cname.vercel-dns.com (DNS-only) |
| www.windybank.net | CNAME (proxied) | CNAME (DNS-only) |
| bradley.windybank.net | CNAME (proxied) | CNAME (DNS-only) |
| windybank.nz | A 76.76.21.21 | CNAME cname.vercel-dns.com |
| www.windybank.nz | CNAME (already DNS-only) | No change |
