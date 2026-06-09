// OFFICE RH Package + Template Commercial Registry
// Extracted from OFFICE-main.zip and renamed for commercial package/template structure.

export const RH_PACKAGE_RULES = {
  "RH_Basic": [
    "hero",
    "about",
    "services",
    "contact",
    "whatsapp"
  ],
  "RH_Standard": [
    "hero",
    "about",
    "services",
    "gallery",
    "faq",
    "testimonials",
    "contact",
    "whatsapp"
  ],
  "RH_Professional": [
    "hero",
    "trust",
    "about",
    "services",
    "portfolio",
    "caseStudies",
    "leadForm",
    "contact",
    "whatsapp"
  ],
  "RH_Premium": [
    "hero",
    "trust",
    "about",
    "services",
    "productCatalog",
    "booking",
    "faq",
    "portfolio",
    "leadForm",
    "contact",
    "whatsapp"
  ]
};

export const RH_PACKAGE_META = {
  "RH_Basic": {
    "code": "RH_Basic",
    "old_code": "PACKAGE_A",
    "name": "RH Basic Website Package",
    "commercial_name": "Basic Presence",
    "level": 1,
    "sections": [
      "hero",
      "about",
      "services",
      "contact",
      "whatsapp"
    ],
    "purpose": "Website asas untuk bisnes kecil yang perlukan profil, servis dan WhatsApp CTA."
  },
  "RH_Standard": {
    "code": "RH_Standard",
    "old_code": "PACKAGE_B",
    "name": "RH Standard Website Package",
    "commercial_name": "Standard Business",
    "level": 2,
    "sections": [
      "hero",
      "about",
      "services",
      "gallery",
      "faq",
      "testimonials",
      "contact",
      "whatsapp"
    ],
    "purpose": "Website bisnes lengkap dengan galeri, FAQ dan testimonial."
  },
  "RH_Professional": {
    "code": "RH_Professional",
    "old_code": "PACKAGE_C",
    "name": "RH Professional Website Package",
    "commercial_name": "Professional Growth",
    "level": 3,
    "sections": [
      "hero",
      "trust",
      "about",
      "services",
      "portfolio",
      "caseStudies",
      "leadForm",
      "contact",
      "whatsapp"
    ],
    "purpose": "Website profesional untuk kredibiliti, portfolio, case study dan lead form."
  },
  "RH_Premium": {
    "code": "RH_Premium",
    "old_code": "PACKAGE_D",
    "name": "RH Premium Website Package",
    "commercial_name": "Premium Conversion",
    "level": 4,
    "sections": [
      "hero",
      "trust",
      "about",
      "services",
      "productCatalog",
      "booking",
      "faq",
      "portfolio",
      "leadForm",
      "contact",
      "whatsapp"
    ],
    "purpose": "Website premium untuk katalog produk/pakej, booking flow dan conversion lengkap."
  }
};

export const RH_TEMPLATE_RULES = {
  "RH_Basic_Classic": {
    "code": "RH_Basic_Classic",
    "old_code": "BASIC_01",
    "name": "RH Basic Classic",
    "className": "tpl-basic-01",
    "tier": "RH_Basic",
    "layout": "Simple centered service website"
  },
  "RH_Basic_Modern": {
    "code": "RH_Basic_Modern",
    "old_code": "BASIC_02",
    "name": "RH Basic Modern",
    "className": "tpl-basic-02",
    "tier": "RH_Basic",
    "layout": "Modern split hero with feature stack"
  },
  "RH_Standard_Corporate": {
    "code": "RH_Standard_Corporate",
    "old_code": "CORPORATE_01",
    "name": "RH Standard Corporate",
    "className": "tpl-corporate-01",
    "tier": "RH_Standard",
    "layout": "Corporate hero with stats and trust layout"
  },
  "RH_Professional_Lead": {
    "code": "RH_Professional_Lead",
    "old_code": "LANDING_01",
    "name": "RH Professional Lead Page",
    "className": "tpl-landing-01",
    "tier": "RH_Professional",
    "layout": "High-conversion landing page"
  },
  "RH_Premium_Showcase": {
    "code": "RH_Premium_Showcase",
    "old_code": "AGENCY_01",
    "name": "RH Premium Showcase",
    "className": "tpl-agency-01",
    "tier": "RH_Premium",
    "layout": "Creative showcase with visual board and catalog-ready sections"
  },
  "RH_Custom_Project": {
    "code": "RH_Custom_Project",
    "old_code": "CUSTOM",
    "name": "RH Custom Project",
    "className": "tpl-corporate-01",
    "tier": "RH_Premium",
    "layout": "Custom layout based on client scope"
  }
};

export const RH_TEMPLATE_ALIASES = {
  "A01": "RH_Basic_Classic",
  "A02": "RH_Standard_Corporate",
  "A03": "RH_Basic_Modern",
  "B01": "RH_Standard_Corporate",
  "B02": "RH_Basic_Modern",
  "B03": "RH_Basic_Classic",
  "C01": "RH_Professional_Lead",
  "C02": "RH_Standard_Corporate",
  "C03": "RH_Premium_Showcase",
  "D01": "RH_Premium_Showcase",
  "D02": "RH_Standard_Corporate",
  "D03": "RH_Professional_Lead",
  "PRO_01": "RH_Professional_Lead",
  "PRO_02": "RH_Standard_Corporate",
  "PRO_03": "RH_Premium_Showcase",
  "BUSINESS_01": "RH_Professional_Lead",
  "BUSINESS_02": "RH_Standard_Corporate",
  "BUSINESS_03": "RH_Premium_Showcase"
};

export const RH_OLD_PACKAGE_TO_NEW = {
  "PACKAGE_A": "RH_Basic",
  "PACKAGE_B": "RH_Standard",
  "PACKAGE_C": "RH_Professional",
  "PACKAGE_D": "RH_Premium"
};
export const RH_OLD_TEMPLATE_TO_NEW = {
  "BASIC_01": "RH_Basic_Classic",
  "BASIC_02": "RH_Basic_Modern",
  "CORPORATE_01": "RH_Standard_Corporate",
  "LANDING_01": "RH_Professional_Lead",
  "AGENCY_01": "RH_Premium_Showcase",
  "CUSTOM": "RH_Custom_Project"
};

export function normalizePackageCode(code = 'RH_Basic') {
  const raw = String(code || 'RH_Basic').trim();
  return RH_PACKAGE_META[raw] ? raw : (RH_OLD_PACKAGE_TO_NEW[raw.toUpperCase()] || raw);
}

export function normalizeTemplateCode(code = 'RH_Basic_Classic') {
  const raw = String(code || 'RH_Basic_Classic').trim();
  const upper = raw.toUpperCase();
  return RH_TEMPLATE_RULES[raw] ? raw : (RH_TEMPLATE_ALIASES[upper] || RH_OLD_TEMPLATE_TO_NEW[upper] || raw);
}
