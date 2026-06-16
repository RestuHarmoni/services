# RH Services Official Package Standard v10.0

Status: LOCKED

This file is the source reference for Aira, Admin Leads, Quotation Filing and the future Sales Workspace.

## Official Packages

### RH Starter

Setup: RM1299  
Maintenance: RM129/bulan

Best for:
- Bisnes baru
- Company profile
- Kontraktor, elektrik, plumbing, renovation
- Ejen hartanah / personal service

Includes:
- Company Profile Website
- Mobile responsive
- AI Chatbot Aira
- Lead Capture System
- Dashboard Basic
- SEO Asas
- Google Maps Integration
- WhatsApp CTA
- Contact Form

### RH Growth

Setup: RM1999  
Maintenance: RM179/bulan

Best for:
- Aircond, bengkel, event, rental
- Servis pelbagai
- Produk + servis
- Bisnes yang perlukan service/product listing

Includes RH Starter plus:
- Unlimited Service Listing
- Product Listing
- Blog / Artikel
- Portfolio / Gallery
- FAQ Management
- Video Embed
- Advanced Service Pages

### RH Ecosystem

Setup: RM2999  
Maintenance: RM249/bulan

Best for:
- Syarikat berkembang
- Multi servis
- Multi brand
- Franchise / multi-branch
- Ekosistem digital lengkap

Includes RH Growth plus:
- Company Profile Website + Service Website
- Service Website / Subdomain
- Advanced AI Chatbot
- Analytics Dashboard
- Lead Management Ready
- Multi Website Structure
- Ecosystem Architecture Ready

## Legacy Package Mapping

Old labels must be converted as follows:

| Legacy | Official |
|---|---|
| RH Basic | RH Starter |
| RH Standard | RH Growth |
| RH Professional | RH Growth |
| RH Premium | RH Ecosystem |
| RH Business | RH Growth |
| RH Pro | RH Ecosystem |

## Aira Rules

Aira must only recommend:

- RH Starter
- RH Growth
- RH Ecosystem

No other package label should be stored in `leads.recommended_package`.

## Sales Flow Alignment

The next Admin Panel phase should use this flow:

Lead Inbox → Prospect File → Quotation Filing → Negotiation → Won/Lost → Project Handover to Office RH
