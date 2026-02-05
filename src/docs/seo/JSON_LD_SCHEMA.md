# JSON-LD Schema Reference

Complete reference guide for the JSON-LD structured data implementation on globalstrategic.tech.

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Root Schema: ProfessionalService](#root-schema-professionalservice)
3. [Nested Schema: Person (Founder)](#nested-schema-person-founder)
4. [Credential Objects](#credential-objects)
5. [Skills Association](#skills-association)
6. [Validation](#validation)
7. [Update Guidelines](#update-guidelines)

## Schema Overview

The site implements a hierarchical JSON-LD schema with the following structure:

```
ProfessionalService (Organization)
├── name: Global Strategic Technology
├── url: https://globalstrategic.tech
├── logo: https://globalstrategic.tech/icon.svg
├── sameAs: [LinkedIn company profile]
├── founder: Person
│   ├── name: Reid Peryam
│   ├── jobTitle: Strategic Technology Advisor
│   ├── sameAs: [LinkedIn personal profile]
│   ├── alumniOf: [Educational institutions]
│   └── hasCredential: [18 credential objects]
├── description: Company mission statement
├── knowsAbout: [10 expertise areas]
└── address: PostalAddress
```

## Root Schema: ProfessionalService

### Purpose

Identifies Global Strategic Technology as a professional services organization specializing in M&A technical advisory.

### Schema Definition

```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Global Strategic Technology",
  "url": "https://globalstrategic.tech",
  "logo": "https://globalstrategic.tech/icon.svg",
  "sameAs": [
    "https://www.linkedin.com/company/global-strategic-technologies/"
  ],
  "description": "Strategic Technology Advisory focusing on M&A technical due diligence, platform modernization, and AI/data strategy.",
  "knowsAbout": [
    "Technical Due Diligence",
    "M&A Tech Strategy",
    "AI Strategy",
    "Platform Modernization",
    "Cloud Architecture",
    "Digital Transformation",
    "Data Strategy",
    "Kubernetes",
    "Blockchain",
    "Cloud-Native Architecture"
  ],
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "US"
  },
  "founder": { /* Person object */ }
}
```

### Field Descriptions

| Field | Type | Purpose |
|-------|------|---------|
| `@context` | String | Schema.org namespace (always "https://schema.org") |
| `@type` | String | Schema type (ProfessionalService for advisory firms) |
| `name` | String | Official organization name |
| `url` | URL | Primary website URL |
| `logo` | URL | Organization logo (should be SVG or PNG) |
| `sameAs` | Array[URL] | Links to social profiles (LinkedIn, Twitter, etc.) |
| `description` | String | Brief description of services (155-160 chars recommended) |
| `knowsAbout` | Array[String] | Areas of expertise and specialization |
| `address` | PostalAddress | Business location (at minimum, country) |
| `founder` | Person | Founder information with credentials |

### SEO Impact

**Search Engine Recognition**:
- Identifies organization type in search results
- Enables "Knowledge Panel" display on Google
- Improves local search visibility
- Enhances brand recognition in SERPs

**LinkedIn Integration**:
- `sameAs` link drives traffic to company LinkedIn
- Establishes ownership verification
- Improves LinkedIn SEO for company profile

## Nested Schema: Person (Founder)

### Purpose

Establishes the founder as a recognized authority in the industry through education, credentials, and expertise documentation.

### Schema Definition

```json
{
  "@type": "Person",
  "name": "Reid Peryam",
  "jobTitle": "Strategic Technology Advisor",
  "sameAs": [
    "https://www.linkedin.com/in/reidperyam/"
  ],
  "alumniOf": [
    {
      "@type": "CollegeOrUniversity",
      "name": "UC Berkeley Haas School of Business"
    },
    {
      "@type": "CollegeOrUniversity",
      "name": "Boston University"
    }
  ],
  "hasCredential": [ /* Array of 18 credential objects */ ]
}
```

### Field Descriptions

| Field | Type | Purpose |
|-------|------|---------|
| `@type` | String | Schema type (Person) |
| `name` | String | Full name of founder |
| `jobTitle` | String | Current professional title |
| `sameAs` | Array[URL] | Links to social profiles (LinkedIn, etc.) |
| `alumniOf` | Array[Organization] | Educational background |
| `hasCredential` | Array[Credential] | Professional certifications and education |

### Authority Building

The Person schema contributes to authority through:

1. **Education Association**: Links to prestigious institutions (UC Berkeley, Boston University)
2. **Credential Count**: 18 documented certifications
3. **Credential Diversity**: Mix of technical, leadership, and executive education
4. **Recency**: Recent credentials (2023) show continued learning
5. **Expiration Tracking**: Shows maintained active certifications

## Credential Objects

### Credential Schema Structure

All credentials follow the `EducationalOccupationalCredential` schema:

```json
{
  "@type": "EducationalOccupationalCredential",
  "name": "Credential Name",
  "credentialCategory": "Professional Certification" | "Executive Education",
  "issuedBy": {
    "@type": "Organization" | "CollegeOrUniversity",
    "name": "Issuing Organization Name"
  },
  "dateIssued": "YYYY-MM",
  "dateExpires": "YYYY-MM",  // Optional: omit if non-expiring
  "credentialId": "UNIQUE_CREDENTIAL_ID",
  "skills": ["Skill 1", "Skill 2", "Skill 3"]
}
```

### Field Descriptions

| Field | Type | Purpose | Required |
|-------|------|---------|----------|
| `@type` | String | Always "EducationalOccupationalCredential" | Yes |
| `name` | String | Full credential name | Yes |
| `credentialCategory` | String | Type of credential | Yes |
| `issuedBy` | Organization | Issuing body | Yes |
| `dateIssued` | Date | Issue date (YYYY-MM format) | Yes |
| `dateExpires` | Date | Expiration date (YYYY-MM format) | No* |
| `credentialId` | String | Credential ID for verification | Yes |
| `skills` | Array[String] | Skills associated with credential | Recommended |

*`dateExpires` is optional. Omit for non-expiring credentials (degrees, permanent certifications).

### Current Credentials (18 Total)

#### Microsoft Certifications (5)

**1. DevOps Engineer Expert**
```json
{
  "@type": "EducationalOccupationalCredential",
  "name": "Microsoft Certified: DevOps Engineer Expert",
  "credentialCategory": "Professional Certification",
  "issuedBy": {"@type": "Organization", "name": "Microsoft"},
  "dateIssued": "2021-06",
  "dateExpires": "2027-06",
  "credentialId": "6C14577815D1D876",
  "skills": ["Azure DevOps", "Software Development Life Cycle (SDLC)", "Software Development", "Azure Solutions"]
}
```
**Status**: Active (expires Jun 2027)

**2. Azure Solutions Architect Expert**
```json
{
  "@type": "EducationalOccupationalCredential",
  "name": "Microsoft Certified: Azure Solutions Architect Expert",
  "credentialCategory": "Professional Certification",
  "issuedBy": {"@type": "Organization", "name": "Microsoft"},
  "dateIssued": "2021-04",
  "dateExpires": "2027-04",
  "credentialId": "AD20FA63C42592C5",
  "skills": ["Software Solution Development", "Cloud-Native Architecture", "Azure Solutions", "Microsoft Azure"]
}
```
**Status**: Active (expires Apr 2027)

**3. Azure Developer Associate**
```json
{
  "@type": "EducationalOccupationalCredential",
  "name": "Microsoft Certified: Azure Developer Associate",
  "credentialCategory": "Professional Certification",
  "issuedBy": {"@type": "Organization", "name": "Microsoft"},
  "dateIssued": "2021-05",
  "dateExpires": "2026-05",
  "credentialId": "AD895CD745DD2DD8",
  "skills": ["Software Development", "Microsoft Azure", "Azure Solutions", "Azure DevOps", "Cloud-Native Applications"]
}
```
**Status**: Active (expires May 2026)

**4. Azure AI Engineer Associate**
```json
{
  "@type": "EducationalOccupationalCredential",
  "name": "Microsoft Certified: Azure AI Engineer Associate",
  "credentialCategory": "Professional Certification",
  "issuedBy": {"@type": "Organization", "name": "Microsoft"},
  "dateIssued": "2021-09",
  "dateExpires": "2026-09",
  "credentialId": "Not specified",
  "skills": ["Artificial Intelligence (AI)", "Machine Learning", "Cloud-Native Architecture", "Microsoft Azure"]
}
```
**Status**: Active (expires Sep 2026)

**5. Azure AI Fundamentals**
```json
{
  "@type": "EducationalOccupationalCredential",
  "name": "Microsoft Certified: Azure AI Fundamentals",
  "credentialCategory": "Professional Certification",
  "issuedBy": {"@type": "Organization", "name": "Microsoft"},
  "dateIssued": "2021-08",
  "credentialId": "H943-8317",
  "skills": ["Artificial Intelligence (AI)", "Machine Learning", "Software Development", "Neural Networks", "Microsoft Azure"]
}
```
**Status**: Active (no expiration)

#### UC Berkeley Haas Executive Education (11)

All issued by: `University of California, Berkeley, Haas School of Business`

**6. Certificate of Business Excellence (2023-09)**
- ID: 82675585
- Skills: AI, Digital Transformation, Product Management, Blockchain, Data Strategy, Executive Leadership

**7. Berkeley Executive Leadership Program (2023-03)**
- ID: 70041714
- Skills: Organizational Leadership, Systems Thinking, Culture Change, Stakeholder Management

**8. Digital Transformation (2023-01)**
- ID: 66187273
- Skills: Organizational Leadership, Digital Transformation, Product Management, Technology Strategy, Data Strategy, Enterprise Architecture

**9. Artificial Intelligence: Business Strategies and Applications (2023-04)**
- ID: 71228917
- Skills: AI, Machine Learning, Business Strategy, Neural Networks

**10. Blockchain and Cryptocurrencies (2023-08)**
- ID: 79127223
- Skills: Cryptocurrency, Blockchain

**11. Excellence In Technology Strategy (2022-04)**
- ID: 49757257
- Skills: Organizational Leadership, Digital Transformation, Product Management, Technology Strategy, Business Strategy, Enterprise Architecture

**12. Data Strategy (2022-06)**
- ID: 52691267
- Skills: Product Management, Technology Strategy, Data Strategy, Business Strategy, Enterprise Architecture

**13. Product Management Studio (2022-08)**
- ID: 56795945
- Skills: Organizational Leadership, Product Management, Systems Thinking, Technology Strategy, Design Thinking

**14. Business Analytics for Leaders (2022-04)**
- ID: 49371816
- Skills: AI, Product Management, Machine Learning, Technology Strategy, Data Strategy, Business Strategy

**15. Leading Complex Projects (2022-01)**
- ID: 45714456
- Skills: Organizational Leadership, Digital Transformation, Product Management, Project Management, Stakeholder Management

#### Infrastructure Certifications (2)

**16. CKAD: Certified Kubernetes Application Developer**
```json
{
  "@type": "EducationalOccupationalCredential",
  "name": "CKAD: Certified Kubernetes Application Developer",
  "credentialCategory": "Professional Certification",
  "issuedBy": {"@type": "Organization", "name": "The Linux Foundation"},
  "dateIssued": "2021-02",
  "dateExpires": "2024-02",
  "credentialId": "LF-nk1u2e8ck!",
  "skills": ["Software Development", "Kubernetes", "DevOps"]
}
```
**Status**: Expired (Feb 2024)

**17. CKA: Certified Kubernetes Administrator**
```json
{
  "@type": "EducationalOccupationalCredential",
  "name": "CKA: Certified Kubernetes Administrator",
  "credentialCategory": "Professional Certification",
  "issuedBy": {"@type": "Organization", "name": "The Linux Foundation"},
  "dateIssued": "2021-01",
  "dateExpires": "2024-01",
  "credentialId": "LF-rg3vj38yvx",
  "skills": ["Software Development", "Kubernetes", "DevOps"]
}
```
**Status**: Expired (Jan 2024)

#### Agile Certification (1)

**18. Certified SAFe® 5 Agilist**
```json
{
  "@type": "EducationalOccupationalCredential",
  "name": "Certified SAFe® 5 Agilist",
  "credentialCategory": "Professional Certification",
  "issuedBy": {"@type": "Organization", "name": "SAFe by Scaled Agile, Inc."},
  "dateIssued": "2021-07",
  "dateExpires": "2022-07",
  "credentialId": "77243988-6382",
  "skills": ["Agile Methodologies", "Agile Project Management", "Scrum"]
}
```
**Status**: Expired (Jul 2022)

## Skills Association

### Purpose

Skills linked to credentials enable semantic understanding of expertise areas and support skill-based search queries.

### Skills Taxonomy

Current skills are associated with credentials as follows:

```
Cloud Architecture (5 credentials)
├── Azure Solutions Architect Expert
├── Azure DevOps Engineer Expert
├── Azure AI Engineer Associate
├── Digital Transformation
└── Cloud-Native Architecture (in knowsAbout)

AI/Machine Learning (7 credentials)
├── Azure AI Engineer Associate
├── Azure AI Fundamentals
├── Artificial Intelligence: Business Strategies
├── Machine Learning (multiple)
├── Certificate of Business Excellence
├── Business Analytics for Leaders
└── Blockchain and Cryptocurrencies

Leadership/Strategy (10 credentials)
├── Executive Leadership
├── Digital Transformation (2x)
├── Technology Strategy (5x)
├── Organizational Leadership (3x)
├── Product Management (5x)
├── Business Strategy (2x)
└── Enterprise Architecture (2x)

Development/Infrastructure (6 credentials)
├── Software Development (3x)
├── Kubernetes (2x)
├── DevOps (2x)
├── Azure DevOps (2x)
└── SDLC

Project Management (4 credentials)
├── Leading Complex Projects
├── Agile Methodologies
├── Agile Project Management
└── Scrum
```

### Adding Skills to New Credentials

When adding a new credential:

1. Choose 3-5 highly relevant skills
2. Use consistent skill naming (capitalize properly)
3. Prefer skills from existing taxonomy when possible
4. Map back to the "knowsAbout" array if it's a primary expertise area

Example:
```json
"skills": ["Artificial Intelligence (AI)", "Machine Learning", "Cloud-Native Architecture"]
```

## Validation

### Automated Validation Tools

#### 1. Google Structured Data Testing Tool
- **URL**: https://search.google.com/structured-data/testing-tool
- **Purpose**: Validates JSON-LD syntax and schema compliance
- **Process**:
  1. Paste full HTML or schema JSON
  2. Check for errors (red) and warnings (yellow)
  3. Verify all expected properties are recognized

#### 2. Schema.org Validator
- **URL**: https://validator.schema.org/
- **Purpose**: Validate schema.org compliance
- **Process**:
  1. Paste full page HTML
  2. Review detected items
  3. Check for missing recommended properties

#### 3. JSON Lint
- **URL**: https://jsonlint.com/
- **Purpose**: Validate JSON syntax
- **Process**:
  1. Paste JSON-LD code
  2. Verify no syntax errors
  3. Check proper nesting and quoting

### Manual Validation Checklist

- [ ] All required fields present (@context, @type, name)
- [ ] All URLs are absolute (not relative)
- [ ] All dates are YYYY-MM format
- [ ] Credential IDs are unique per credential
- [ ] Skills are properly capitalized
- [ ] No duplicate skills within single credential
- [ ] Organization names match official names
- [ ] issuedBy organizations have proper @type

### Production Validation

Before deploying:

```bash
# Run tests
npm run test:all

# Manual verification
1. Check rendered HTML for valid JSON-LD script tag
2. Use Google Structured Data Testing Tool
3. Verify no console errors
4. Check page render performance (no slowdown)
```

## Update Guidelines

### When to Update Schema

**Add Credentials When**:
- New certification is earned
- Executive education program is completed
- Professional designation changes
- Industry certifications are renewed

**Update Existing Credentials When**:
- Credential expires (update or remove `dateExpires`)
- Skills associated with credential change
- Organization name changes
- Credential ID changes

**Update KnowsAbout When**:
- New primary expertise area is established
- Business focus shifts
- Service offerings expand

### How to Update Schema

#### Step 1: Edit SEO Component
Location: `src/components/SEO.astro`

```javascript
// For new credential, add to hasCredential array:
{
  "@type": "EducationalOccupationalCredential",
  "name": "New Certification Name",
  // ... complete object
}

// For new expertise, add to knowsAbout:
"knowsAbout": [
  "Existing Expertise",
  "New Expertise Area"
]
```

#### Step 2: Validate
1. Run schema validator
2. Use Google Structured Data Testing Tool
3. Check for console errors

#### Step 3: Test
```bash
npm run test:all
```

#### Step 4: Commit & Deploy
```bash
git add src/components/SEO.astro
git commit -m "Add new credential: [credential name]"
git push
```

### Deprecating Credentials

For expired certifications, you have two options:

**Option 1: Keep with expiration date**
```json
{
  "name": "Certified Kubernetes Administrator",
  "dateExpires": "2024-01",
  // This transparently shows it has expired
}
```

**Option 2: Remove entirely**
- Delete the object from `hasCredential` array
- Update `CREDENTIALS_REFERENCE.md`

Recommendation: Keep important credentials even if expired (shows comprehensive training).

---

**Last Updated**: February 4, 2026
**Schema Version**: 1.0
**Validation Status**: ✓ Compliant
