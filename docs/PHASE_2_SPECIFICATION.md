# Phase 2 Specification Document

## 1. Google OAuth
### Overview
Implement Google OAuth to streamline user authentication and enhance security.

### Details
- Users can log in using their Google accounts.
- Permissions needed: email, profile.

### Benefits
- Faster onboarding.
- Eliminates the need for password management.

## 2. Designer/Fabric Seller Approval System
### Objective
Establish a workflow for approving new designers and fabric sellers.

### Process
1. **Application Submission:** Designers/Fabric sellers submit an application.
2. **Admin Review:** Admin reviews the application.
3. **Approval/Denial:** An email notification is sent regarding the decision.

## 3. Order System with Splitting Logic
### Overview
Implement an order system to manage purchases effectively, allowing for order splitting.

### Logic
- Orders can be split based on product type or vendor.
- Each split order can have its own tracking information and payment processing.

## 4. Abandoned Cart Tracking
### Description
Track and manage abandoned carts to recover potential sales.

### Implementation
- Identify when a user adds items to the cart but doesn't finalize the purchase.
- Send reminder emails to reduce abandonment rates.

## 5. Email Notifications
### Purpose
Notify users of important events regarding their orders and accounts.

### Types of Notifications
- Order confirmations
- Shipping updates
- Account approval

## 6. Database Schema
### Overview
Define the structure of the database to support new features.

### Key Entities
- Users (with OAuth details)
- Products
- Orders
- Carts

### Relationships
- Users can have multiple Orders.
- Orders can contain multiple Products.

## 7. API Endpoints
### Overview
Define required endpoints for new features.

### Endpoints
- `POST /api/auth/google`: Authenticate users via Google OAuth.
- `POST /api/designers/apply`: Submit application for approval.
- `POST /api/orders`: Create a new order (supports splitting).
- `GET /api/carts/abandoned`: Retrieve abandoned carts.

## 8. Implementation Timeline
### Phases
1. **Week 1-2:** Set up Google OAuth integration.
2. **Week 3:** Implement Designer/Fabric Seller approval system.
3. **Week 4-5:** Develop Order system with splitting logic.
4. **Week 6:** Implement Abandoned cart tracking.
5. **Week 7:** Develop Email notification system.
6. **Week 8:** Final testing and deployment.

## Conclusion
This Phase 2 specification outlines key enhancements for the African Fashion Ecommerce platform. Implementing these features will improve user experience and operational efficiency.