# RH OFFICIAL PACKAGES & UI TEMPLATE v1.0

Status: LOCKED FOR UI REFERENCE  
Source checked: Quotation package dropdown + Aira package text screenshot  
Scope: Package reference only. Do not modify Leads, Prospects, Quotations, Invoices, Projects, Subscriptions, Articles, Storage, Staff, Dashboard.

---

## 1. Official Package List

Current live system has **5 package options** in Quotation:

1. RH Basic — RM799
2. RH Starter — RM1299
3. RH Growth — RM1999
4. RH Ecosystem — RM2999
5. Custom / RH Enterprise — Custom quotation

Aira currently says “4 pilihan utama” and lists Basic, Growth, Ecosystem, Enterprise. This must be aligned with Quotation because Quotation is the sales document source.

---

## 2. Package Pricing Standard

| Package | Setup Price | Maintenance | Quotation Label | Aira Label |
|---|---:|---:|---|---|
| RH Basic | RM799 | RM79 / bulan | RH Basic - RM799 | RH Basic |
| RH Starter | RM1299 | To confirm in system / recommended RM129 bulan | RH Starter - RM1299 | RH Starter |
| RH Growth | RM1999 | RM129 / bulan | RH Growth - RM1999 | RH Growth |
| RH Ecosystem | RM2999 | RM249 / bulan | RH Ecosystem - RM2999 | RH Ecosystem |
| Custom / RH Enterprise | Custom quotation | Custom | Custom | RH Enterprise / Custom |

> Note: Maintenance for RH Starter must be confirmed if already stored in system config. Do not guess inside production logic. If no existing value, use RM129/bulan only after SUPER_ADMIN approval.

---

## 3. Package Positioning

### RH Basic
For small business owners who need a simple website presence and basic lead capture.

Recommended for:
- Solo business
- New service business
- Basic company profile
- Simple landing website
- Budget-sensitive client

Core includes:
- Website basic / personal web
- Mobile responsive layout
- Basic SEO setup
- Contact / inquiry flow
- Aira lead capture
- Basic admin visibility

---

### RH Starter
For businesses that need a stronger profile website than Basic, with better structure and presentation.

Recommended for:
- PMKS
- Contractor
- Consultant
- Local service company
- Company profile with multiple pages

Core includes:
- Professional company profile website
- Multiple service sections
- Mobile responsive layout
- Basic SEO setup
- Aira lead capture
- Basic dashboard
- Google-friendly structure

---

### RH Growth
For businesses that want website + lead system + stronger conversion support.

Recommended for:
- Growing service company
- Business with multiple services
- Company that wants more structured sales follow-up
- Client who needs quotation/lead management support

Core includes:
- Professional website
- Service/product listing structure
- Aira AI chatbot
- Lead capture system
- Blog/articles support
- Dashboard basic
- SEO setup
- Conversion-focused layout

---

### RH Ecosystem
For businesses that need a complete digital sales ecosystem.

Recommended for:
- Multi-service company
- Event/rental/service business
- Business that needs dashboard workflow
- Business that wants website + content + lead + automation

Core includes:
- Website ecosystem
- AI chatbot Aira
- Lead management
- Articles/blog system
- Dashboard workflow
- Quotation/invoice-ready sales pipeline
- SEO and content structure
- Maintenance/subscription readiness

---

### Custom / RH Enterprise
For custom systems and larger requirements.

Recommended for:
- CRM
- ERP
- Booking system
- Inventory system
- Multi-branch workflow
- Custom dashboard
- Client portal
- Internal operation system

Core includes:
- Requirement analysis
- Custom quotation
- Custom UI/UX
- Custom database design
- Workflow automation
- Role/permission system
- Reporting dashboard
- Integration planning

---

## 4. Official Aira Package Text

Aira must be updated to match Quotation:

```text
Kami ada 5 pilihan utama:

RH Basic — RM799 + maintenance RM79/bulan
RH Starter — RM1299 + maintenance mengikut tetapan semasa
RH Growth — RM1999 + maintenance RM129/bulan
RH Ecosystem — RM2999 + maintenance RM249/bulan
RH Enterprise / Custom — Custom quotation

Aira boleh cadangkan pakej berdasarkan jenis bisnes, domain, hosting, objektif, budget dan keperluan sistem anda.
```

If RH Starter maintenance is confirmed as RM129/bulan, update Aira text to:

```text
RH Starter — RM1299 + maintenance RM129/bulan
```

---

## 5. Package UI Card Template

Each package card should use this structure:

```text
[Package Name]
Short positioning statement

Setup Price
Maintenance Price

Best For:
- item 1
- item 2
- item 3

Includes:
- item 1
- item 2
- item 3

CTA:
[Cadangkan Pakej Ini]
```

---

## 6. Recommended UI Layout

### Desktop
Use 5 cards in a responsive grid:

- Row 1: Basic, Starter, Growth
- Row 2: Ecosystem, Enterprise/Custom

Highlight recommended package:

- Starter = “Popular untuk PMKS”
- Growth = “Best untuk scaling”
- Ecosystem = “Complete system”

### Mobile
Use stacked package cards:

1. Basic
2. Starter
3. Growth
4. Ecosystem
5. Enterprise/Custom

Each card must be short, readable, and not too long.

---

## 7. System Consistency Rule

The following modules must use the same package list:

- Aira popup
- Aira Knowledge
- Lead recommended package
- Prospect package
- Quotation package dropdown
- Invoice package reference
- Project package reference
- Subscription maintenance plan
- Reports package analytics

Do not allow package names to drift between modules.

---

## 8. Required Future Fix

Aira currently shows 4 packages, while Quotation shows 5 options. Aira must be updated to include RH Starter or the Quotation dropdown must be standardized. Since Quotation is already showing 5 options, the recommended fix is:

```text
Update Aira to 5 package options.
```

Files likely involved in future fix:

```text
index.html
admin/aira-knowledge.html
admin/assets/aira-knowledge.js
```

Do not modify these files while only creating this MD reference.
