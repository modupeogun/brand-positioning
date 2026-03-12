# Positioning IQ — Complete Setup Guide

You have a fully-built brand positioning quiz website. This guide walks you through getting it live, connecting AI-powered results, collecting emails, and setting up automated follow-up sequences.

No coding knowledge needed — just follow each step.

---

## What You Have

| Piece | Status |
|-------|--------|
| Multi-page website (Home, About, Case Studies, Quiz) | Built |
| 10-question brand positioning quiz | Built |
| Email capture gate (name, brand, email) | Built |
| AI-generated personalized results (Playbook, Case Study, Content Strategy, 5-Day Email Series) | Built |
| Results display with 4 tabs | Built |
| Serverless API proxy (keeps your API key safe) | Built |
| Webhook integration for automation | Built |
| Email provider integration (Kit / Mailchimp) | Built |

---

## Step 1: Get an Anthropic API Key (powers the AI results)

1. Go to **console.anthropic.com**
2. Sign up or log in
3. Click **API Keys** in the left sidebar
4. Click **Create Key** → name it "Positioning IQ" → copy the key
5. Save it somewhere safe — you'll need it in Step 3

**Cost**: Each quiz completion uses roughly $0.01–$0.03 of API credits. Anthropic gives you $5 free to start.

---

## Step 2: Create a Netlify Account (free hosting)

1. Go to **app.netlify.com**
2. Sign up with your GitHub account (or email)
3. Once logged in, click **"Add new site"** → **"Import an existing project"**
4. Select **GitHub** as your Git provider
5. Find and select your `brand-positioning` repository
6. Leave all settings as default — Netlify auto-detects the `netlify.toml` config
7. Click **"Deploy site"**

Your site is now live at a URL like `https://random-name-12345.netlify.app`

**To get a custom domain** (like `positioningiq.yourbrand.com`):
- In Netlify → Site settings → Domain management → Add custom domain
- Follow the DNS instructions provided

---

## Step 3: Add Your API Key to Netlify

1. In Netlify, go to **Site configuration** → **Environment variables**
2. Click **Add a variable**
3. Key: `ANTHROPIC_API_KEY`
4. Value: paste the API key from Step 1
5. Click **Save**
6. Go to **Deploys** → click **"Trigger deploy"** → **"Deploy site"**

Your quiz now generates real, personalized AI results for every brand that takes it.

---

## Step 4: Choose Your Email Provider

You need an email platform to (a) collect subscriber emails and (b) send them their results + follow-up emails. Pick ONE:

### Option A: Kit (formerly ConvertKit) — Recommended for creators

**Why Kit**: Free up to 10,000 subscribers, great automations, built for creators.

1. Go to **app.kit.com** → sign up (free plan)
2. Go to **Grow** → **Forms** → **Create a form**
3. Choose any template (it won't be visible — we use their API)
4. After creating, go to the form's **Settings** — copy the **Form ID** (number in the URL)
5. Go to **Settings** → **General** → copy your **Public API key**
6. In your `index.html` file, find these two lines and replace them:

```
const KIT_FORM_ID='YOUR_KIT_FORM_ID_HERE';
// replace with your form ID number, e.g.:
const KIT_FORM_ID='4839201';
```

```
api_key:'YOUR_KIT_PUBLIC_API_KEY_HERE',
// replace with your public API key, e.g.:
api_key:'pk_abc123def456',
```

7. **Set up custom fields in Kit** (so it receives the brand data):
   - Go to Settings → Subscribers → Custom fields
   - Create these fields: `brand_name`, `archetype`, `positioning`, `core_message`, `storytelling_model`

8. **Create a Tag**: Go to Grow → Tags → create a tag called `positioning-iq-completed`

### Option B: Mailchimp — If you're already using it

1. Log into Mailchimp → **Audience** → **Signup forms** → **Embedded forms**
2. Copy the form **action URL** (looks like `https://xyz.us1.list-manage.com/subscribe/post?u=...&id=...`)
3. In your `index.html`, find and replace:

```
const MAILCHIMP_URL='YOUR_MAILCHIMP_FORM_ACTION_URL_HERE';
// replace with your form action URL
```

4. In Mailchimp, add merge fields: `FNAME`, `BRAND`, `ARCHETYPE`

---

## Step 5: Set Up the Webhook (for full automation)

The webhook sends ALL quiz data (answers + AI results) to an automation platform. This lets you build powerful email sequences.

### Using Make.com (recommended — free tier available)

1. Go to **make.com** → sign up (free)
2. Click **Create a new scenario**
3. Add a **Webhooks** module → **Custom webhook** → click **"Add"**
4. Copy the webhook URL it generates
5. In your `index.html`, find and replace:

```
const url='YOUR_MAKE_OR_ZAPIER_WEBHOOK_URL_HERE';
// replace with your Make webhook URL, e.g.:
const url='https://hook.us1.make.com/abc123xyz';
```

6. Back in Make.com, click **"Run once"** → go take the quiz on your site → Make will capture all the fields
7. Now build your automation (see email sequences below)

### Using Zapier (alternative)

1. Go to **zapier.com** → create a Zap
2. Trigger: **Webhooks by Zapier** → **Catch Hook**
3. Copy the webhook URL → paste it in `index.html` (same spot as above)
4. Test by taking the quiz → Zapier captures the data
5. Add actions for your email sequences

---

## Step 6: Build Your Email Sequences

### Email 1: Instant Results Delivery (send immediately)

**Subject**: Your Positioning IQ results are ready, {{first_name}}

**Body idea**:
> Hi {{first_name}},
>
> You just took the Positioning IQ quiz for **{{brand_name}}** — and the results are in.
>
> **Your Brand Archetype**: {{archetype}}
>
> **Your Positioning Statement**: {{positioning_statement}}
>
> **Your Core Message**: {{core_message}}
>
> [Full results are on the website — here's your link back]
>
> Over the next 5 days, I'm going to send you a short series that helps you actually *use* this positioning. Not theory — real moves.
>
> Talk soon,
> [Your name]

### Email 2: Day 2 — "How to brief a designer using your positioning"

**Subject**: How to turn your positioning into visuals (Day 2 of 5)

### Email 3: Day 3 — "Writing in your brand voice consistently"

**Subject**: Your brand voice cheat sheet (Day 3 of 5)

### Email 4: Day 4 — "The one piece of content to post this week"

**Subject**: Post this on [platform] today (Day 4 of 5)

### Email 5: Day 5 — "What to do next" (pitch your service)

**Subject**: The thing most brands get wrong after this (Day 5 of 5)

### How to wire this in Make.com:

```
Webhook trigger
  → Module 1: Send Email (immediate results — use the fields above)
  → Module 2: Wait 1 day → Send Email 2
  → Module 3: Wait 1 day → Send Email 3
  → Module 4: Wait 1 day → Send Email 4
  → Module 5: Wait 1 day → Send Email 5
```

Or in **Kit**: Create a Visual Automation:
- Trigger: "Subscribes to form [your form]"
- Send Email 1 immediately
- Wait 1 day → Send Email 2
- Wait 1 day → Send Email 3
- (etc.)

Use the custom fields (`archetype`, `positioning`, `core_message`) in your email templates with Kit's personalization tags.

---

## Step 7: Re-deploy After Changes

Every time you edit `index.html` with new webhook URLs or API keys:

1. Save the file
2. Commit to GitHub: Netlify auto-deploys on every push
3. Or in Netlify: Deploys → Trigger deploy

---

## Quick Reference: What Goes Where

| What | Where to put it |
|------|-----------------|
| `ANTHROPIC_API_KEY` | Netlify → Site configuration → Environment variables |
| Kit Form ID | `index.html` → search for `KIT_FORM_ID` |
| Kit Public API Key | `index.html` → search for `YOUR_KIT_PUBLIC_API_KEY_HERE` |
| Mailchimp URL | `index.html` → search for `MAILCHIMP_URL` |
| Make/Zapier Webhook | `index.html` → search for `MAKE_OR_ZAPIER` |

---

## How It All Flows

```
Visitor lands on your site
        ↓
Takes the 10-question quiz
        ↓
Enters name, brand name, email
        ↓
  ┌─────┴─────┐
  ↓            ↓
AI generates   Email captured
results via    by Kit/Mailchimp
Claude API     (subscriber added)
  ↓            ↓
Results shown  Webhook fires to
on screen      Make.com/Zapier
  ↓            ↓
  └─────┬─────┘
        ↓
Make.com sends results email
+ 5-day follow-up sequence
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Quiz shows generic results | Check that `ANTHROPIC_API_KEY` is set in Netlify environment variables, then redeploy |
| Email not captured | Check Kit/Mailchimp config — make sure Form ID and API key are correct |
| Webhook not firing | Open browser DevTools (F12) → Console tab → look for "Webhook failed" errors |
| Site not updating | Push to GitHub and wait 1-2 minutes for Netlify to auto-deploy |

---

## Cost Summary

| Service | Free tier | Paid if needed |
|---------|-----------|----------------|
| Netlify (hosting) | 100GB bandwidth/month | $19/mo |
| Anthropic API (AI) | $5 free credits | ~$0.02 per quiz |
| Kit (email) | 10,000 subscribers | $29/mo |
| Make.com (automation) | 1,000 operations/month | $9/mo |

**Total to start: $0** — all services have free tiers.
