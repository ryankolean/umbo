# DNS — eatumbo.com

Reference for the move from Squarespace hosting to GitHub Pages on the apex
domain. Captured 2026-09-07.

## Target state

Apex `eatumbo.com` serves the GitHub Pages site. `www` is a `CNAME` to
`ryankolean.github.io`, which GitHub 301-redirects to the apex. Google Workspace
mail for `sarah@eatumbo.com` is unaffected.

| Type  | Host              | Value                                 | TTL  | Purpose |
|-------|-------------------|---------------------------------------|------|---------|
| A     | `@`               | `185.199.108.153`                     | 600  | GitHub Pages |
| A     | `@`               | `185.199.109.153`                     | 600  | GitHub Pages |
| A     | `@`               | `185.199.110.153`                     | 600  | GitHub Pages |
| A     | `@`               | `185.199.111.153`                     | 600  | GitHub Pages |
| AAAA  | `@`               | `2606:50c0:8000::153`                 | 600  | GitHub Pages |
| AAAA  | `@`               | `2606:50c0:8001::153`                 | 600  | GitHub Pages |
| AAAA  | `@`               | `2606:50c0:8002::153`                 | 600  | GitHub Pages |
| AAAA  | `@`               | `2606:50c0:8003::153`                 | 600  | GitHub Pages |
| CNAME | `www`             | `ryankolean.github.io.`               | 600  | redirects to apex |
| MX    | `@`               | `smtp.google.com.` (priority `1`)     | 3600 | Google Workspace mail |
| TXT   | `@`               | `v=spf1 include:_spf.google.com ~all` | 3600 | SPF |
| TXT   | `google._domainkey` | DKIM — see below                    | 3600 | DKIM |

### DKIM (single value, no line breaks)

```
v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5K9rkfiboaE97baNCFyozNJgvXX7hk6tJiMoT6NsBF+nLRxEe1Xn7c+rgg9CSzrncVHcAzRE8ZG44TBNLP3c5DHtFh6ypSIjeBB1tjVQ7TjmNjAIKYROZUDAn3+h+ADKxRtTz4QmxuEnBGPg1WrE05vXOEvPBzlaO/fxJV3jOpTkzGWg4Zpc8sd36YZEbLazPngLGyfFjOaVYwmcvRv0aJjpA0hJrYOInVRQY+kZSAVScNzACp+4xjai23wnOAGgw1YNrXu9GmghU2s7pMwinL4XAO1a0zk7BnoJZMn1lwXX9ho7+tEJCHl6XvaoBYLPKSq68GnxpnhjkMrO5OYeVwIDAQAB
```

Some panels (Porkbun included) accept the value unquoted and split it into
255-char strings themselves. Paste it as one line.

## Records captured from the old zone (Google Cloud DNS)

Authoritative NS at capture time: `ns-cloud-a{1,2,3,4}.googledomains.com`.

| Type  | Host                 | Value                                        | Carry over? |
|-------|----------------------|----------------------------------------------|-------------|
| A     | `@`                  | `198.49.23.145`                              | No — Squarespace |
| CNAME | `www`                | `ext-sq.squarespace.com.`                    | No — Squarespace |
| CNAME | `_domainconnect`     | `_domainconnect.domains.squarespace.com.`    | No — Squarespace |
| MX    | `@`                  | `1 smtp.google.com.`                         | **Yes** |
| TXT   | `@`                  | `v=spf1 include:_spf.google.com ~all`        | **Yes** |
| TXT   | `google._domainkey`  | DKIM (above)                                 | **Yes** |

No `CAA`, no `_dmarc`, no other subdomains found in the sweep.

> Adding a `_dmarc` TXT record (`v=DMARC1; p=none; rua=mailto:sarah@eatumbo.com`)
> would be a cheap improvement, but it did not exist before — not carried over
> silently.

## Order of operations

The transfer to Porkbun must complete before the nameservers can move.
Building the Porkbun zone **before** flipping NS means mail and web resolve the
instant the delegation changes — no gap.

1. Transfer of `eatumbo.com` to Porkbun completes (registrar status leaves
   `pendingTransfer`).
2. In Porkbun DNS, enter the full **target state** table above — every row,
   including MX/SPF/DKIM.
3. Only then point the nameservers at Porkbun:
   `curitiba.ns.porkbun.com`, `fortaleza.ns.porkbun.com`,
   `maceio.ns.porkbun.com`, `salvador.ns.porkbun.com`.
4. Wait for delegation to propagate (registry NS TTL can be up to 48h).
5. GitHub repo → Settings → Pages → **Enforce HTTPS** once the certificate
   provisions (Let's Encrypt, usually minutes after DNS resolves).
6. Google Search Console + Bing Webmaster Tools: add `eatumbo.com` as a
   property, submit `https://eatumbo.com/sitemap.xml`.

## Verification

```bash
dig +short A eatumbo.com          # expect the four 185.199.x.153 addresses
dig +short CNAME www.eatumbo.com  # expect ryankolean.github.io.
dig +short MX eatumbo.com         # expect 1 smtp.google.com.
dig +short TXT eatumbo.com        # expect the SPF record
curl -sI https://eatumbo.com | head -3
curl -sI https://www.eatumbo.com | head -3   # expect 301 to the apex
```

Send a test message to `sarah@eatumbo.com` after the cutover and confirm it
lands. Mail is the one thing here with no undo.
