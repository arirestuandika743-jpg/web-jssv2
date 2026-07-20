# Changelog

All notable changes to the **JSS (Jasa Suruh Kalirejo)** project will be documented in this file.

## [1.0.0] - 2026-07-21

### Added
- Initial Production Release of Jasa Suruh Kalirejo (JSS) Web Application.
- 8 Core Delivery & Transport Services (Ojek, Shopping, Food, Medicine, Documents, Packages, Large Cargo, Carter).
- Ojek Round Trip (PP 2x Tarif) pricing logic and breakdown.
- OpenStreetMap + Leaflet + OSRM Routing Engine integration with Haversine distance fallback.
- OpenStreetMap Nominatim address geocoding with 300ms input debouncing and Lampung priority scoring.
- Dual-Mode Architecture (Supabase Cloud PostgreSQL + LocalStorage Mock fallback).
- OWASP Top 10 Security Suite (Helmet Headers, Sliding-Window Rate Limiter, Anti-XSS, Anti-SQLi, SSRF fix).
- 4-Tier Role-Based Access Control (Customer, Runner, Admin, Super Admin).
- PWA installable web app support with Service Worker offline fallback.
- SEO > 95 Optimization (Schema.org JSON-LD Structured Data, Dynamic Sitemap & Robots.txt).
- Vercel Deployment Configuration (`vercel.json`).
