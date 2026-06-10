# HealthAccess: A GIS-Based Healthcare Accessibility Analysis and Facility Recommendation System

## Overview

HealthAccess is a web-based Geographic Information System (GIS) that analyzes healthcare accessibility across communities and identifies underserved areas. The system combines spatial analysis, data science, and interactive mapping to help visualize healthcare coverage and recommend optimal locations for future healthcare facilities.

By integrating healthcare facility locations, population data, and geographic boundaries, HealthAccess provides insights into healthcare accessibility and supports data-driven decision-making for urban planning and public health initiatives.

---

## Problem Statement

Access to healthcare remains uneven across many communities. While some areas have multiple healthcare facilities within close proximity, others require residents to travel long distances to access basic medical services.

HealthAccess aims to answer the following questions:

- Which barangays have poor access to healthcare facilities?
- How accessible are hospitals, clinics, and health centers to residents?
- Which areas are underserved based on population and facility availability?
- Where should new healthcare facilities be established to maximize community impact?

---

## Objectives

### General Objective

Develop a GIS-based healthcare accessibility analysis system that visualizes healthcare coverage and identifies areas requiring additional healthcare services.

### Specific Objectives

- Visualize healthcare facilities using interactive maps.
- Analyze healthcare accessibility at the barangay level.
- Calculate accessibility scores based on population and facility distribution.
- Identify underserved communities through spatial analysis.
- Generate recommendations for future healthcare facility locations.
- Provide decision-support tools for planners and researchers.

---

## Key Features

### Interactive Healthcare Map

- Displays hospitals, clinics, and health centers.
- Interactive Mapbox-based interface.
- Facility information popups.
- Search and navigation capabilities.

### Accessibility Dashboard

- Healthcare facilities per barangay.
- Population statistics.
- Accessibility scores.
- Community coverage metrics.

### Accessibility Heatmap

Visual representation of healthcare accessibility.

| Color | Accessibility Level |
|---------|---------|
| 🟢 Green | High Access |
| 🟡 Yellow | Moderate Access |
| 🔴 Red | Poor Access |

### Nearest Facility Analysis

- Find the nearest healthcare facility from any selected location.
- Calculate approximate distance to services.
- Display travel metrics.

### Healthcare Gap Analysis

- Identify underserved communities.
- Rank barangays according to healthcare accessibility.
- Highlight priority intervention areas.

### Facility Recommendation Engine

Suggest potential locations for future healthcare facilities based on:

- Population density
- Distance to existing facilities
- Accessibility scores
- Service coverage gaps

---

## GIS Components

### Buffer Analysis

Generate healthcare service zones:

- 1 km radius
- 3 km radius
- 5 km radius

Purpose:

- Determine population coverage.
- Measure healthcare reach.
- Identify unserved areas.

### Spatial Join Analysis

Combine:

- Barangay boundaries
- Population data
- Healthcare facility locations

Outputs:

- Population served per facility
- Facilities per barangay
- Accessibility metrics

### Service Area Analysis

Evaluate healthcare coverage zones and identify:

- Well-served communities
- Moderately served communities
- Underserved communities

---

## Data Science Components

### Accessibility Score Calculation

Healthcare accessibility is measured using a composite score.

#### Example Formula

```text
Accessibility Score =
(0.40 × Distance Score)
+ (0.30 × Facility Availability Score)
+ (0.30 × Population Coverage Score)
```

Score Range:

| Score | Category |
|---------|---------|
| 90–100 | Excellent |
| 70–89 | Good |
| 50–69 | Moderate |
| Below 50 | Poor |

### Barangay Clustering

Apply K-Means Clustering using:

- Population
- Number of facilities
- Accessibility score

Clusters:

| Cluster | Description |
|----------|-------------|
| A | High Accessibility |
| B | Moderate Accessibility |
| C | Underserved Areas |

### Healthcare Gap Detection

Identify areas with:

- High population
- Low accessibility
- Few healthcare facilities

### Facility Recommendation Model

Generate recommended locations for future facilities by analyzing:

- Population density
- Existing healthcare distribution
- Accessibility scores
- Service coverage gaps

---

## System Architecture

```text
┌───────────────────────┐
│ React + Mapbox Frontend │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Node.js + Express API │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ PostgreSQL + PostGIS  │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ GIS & Analytics Layer │
└───────────────────────┘
```

---

## Technology Stack

### Frontend

- React
- Mapbox GL JS
- Tailwind CSS
- Recharts

### Backend

- Node.js
- Express.js

### Database

- PostgreSQL
- PostGIS

### GIS Tools

- QGIS
- GeoJSON

### Data Science

- Python
- Pandas
- GeoPandas
- NumPy
- Scikit-learn

---

## Database Schema

### Facilities Table

| Column | Type |
|----------|---------|
| id | Integer |
| name | Varchar |
| type | Varchar |
| latitude | Decimal |
| longitude | Decimal |
| barangay | Varchar |

### Barangays Table

| Column | Type |
|----------|---------|
| id | Integer |
| name | Varchar |
| population | Integer |
| geometry | Polygon |

### Accessibility Scores Table

| Column | Type |
|----------|---------|
| barangay_id | Integer |
| score | Float |
| cluster | Varchar |

---

## Project Scope

### Minimum Viable Product (MVP)

- Interactive healthcare facility map
- Barangay accessibility dashboard
- Accessibility heatmap
- Nearest facility analysis
- Accessibility scoring
- Healthcare gap identification

### Future Enhancements

- Road-network travel time analysis
- Real-time healthcare data integration
- Population growth forecasting
- Predictive healthcare demand analysis
- Scenario planning and simulation tools
- Mobile application support

---

## Data Sources

### Healthcare Facilities

- Department of Health (DOH)
- Local Government Units (LGUs)

### Population Data

- Philippine Statistics Authority (PSA)

### Geographic Data

- OpenStreetMap (OSM)
- PhilGIS
- QGIS-generated datasets

---

## Development Roadmap

### Phase 1 – Data Collection

- Gather healthcare facility locations
- Obtain barangay boundaries
- Collect population statistics

### Phase 2 – GIS Data Preparation

- Clean and validate datasets
- Generate GeoJSON files
- Prepare spatial layers

### Phase 3 – Backend Development

- Configure PostgreSQL and PostGIS
- Develop REST API endpoints
- Implement spatial queries

### Phase 4 – Frontend Development

- Build Mapbox interface
- Implement dashboards
- Create analytics views

### Phase 5 – Data Science Integration

- Accessibility scoring
- Clustering analysis
- Healthcare gap detection

### Phase 6 – Recommendation Engine

- Generate healthcare facility recommendations
- Visualize proposed locations

---

## Expected Outcomes

The system will:

- Visualize healthcare accessibility across communities.
- Identify underserved barangays.
- Quantify healthcare coverage using accessibility metrics.
- Support evidence-based healthcare planning.
- Recommend optimal locations for future healthcare facilities.

