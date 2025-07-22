# CRM Database Specification

## Overview
Database design for a CRM system specialized in revenue management. Focused on customer management and revenue management architecture.
Separates onetime and subscription orders for detailed revenue analysis and KPI management.

## Table Structure

### 1. customers (Customer Management)
Main table for managing customer information

| Column Name | Type | Constraints | Description |
|---------|-----|------|-----|
| customer_id | UUID | PRIMARY KEY | Customer ID |
| customer_name | VARCHAR(255) | NOT NULL | Customer company name |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Update timestamp |

### 2. orders (One-time Order Management)
Table managing only one-time payment orders

| Column Name | Type | Constraints | Description |
|---------|-----|------|-----|
| order_id | UUID | PRIMARY KEY | Order ID |
| customer_id | UUID | FOREIGN KEY | Customer ID (customers.customer_id) |
| amount | DECIMAL(15,2) | NOT NULL | Amount |
| sales_at | DATE | NOT NULL | Sales date |
| is_paid | BOOLEAN | DEFAULT FALSE | Payment completed flag |
| description | TEXT | | Description/Notes |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Update timestamp |

### 3. subscriptions (Subscription Management)
Table managing subscription contracts for recurring billing

| Column Name | Type | Constraints | Description |
|---------|-----|------|-----|
| subscription_id | UUID | PRIMARY KEY | Subscription ID |
| customer_id | UUID | FOREIGN KEY | Customer ID (customers.customer_id) |
| description | TEXT | | Description/Notes |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Update timestamp |

### 4. subscription_amounts (Subscription Pricing Management)
Table managing subscription pricing change history (tracking upsells, downsells, cancellations)

| Column Name | Type | Constraints | Description |
|---------|-----|------|-----|
| amount_id | UUID | PRIMARY KEY | Pricing configuration ID |
| subscription_id | UUID | FOREIGN KEY | Subscription ID (subscriptions.subscription_id) |
| amount | DECIMAL(15,2) | NOT NULL | Monthly fee |
| start_date | DATE | NOT NULL | Pricing application start date |
| end_date | DATE | | Pricing application end date (NULL = ongoing) |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Update timestamp |

### 5. subscription_paid (Subscription Payment Management)
Table managing monthly payment status for subscriptions

| Column Name | Type | Constraints | Description |
|---------|-----|------|-----|
| paid_id | UUID | PRIMARY KEY | Payment record ID |
| subscription_id | UUID | FOREIGN KEY | Subscription ID (subscriptions.subscription_id) |
| year | INTEGER | NOT NULL | Payment year |
| month | INTEGER | NOT NULL | Payment month (1-12) |
| amount | DECIMAL(15,2) | NOT NULL | Payment amount |
| is_paid | BOOLEAN | DEFAULT FALSE | Payment completed flag |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Update timestamp |

### 6. order_templates (Order Templates)
Table managing input templates for each payment_type and service_type combination (for input assistance)

| Column Name | Type | Constraints | Description |
|---------|-----|------|-----|
| template_id | UUID | PRIMARY KEY | Template ID |
| payment_type | ENUM | NOT NULL | Payment type (onetime, subscription) |
| template_name | VARCHAR(255) | NOT NULL | Template name |
| amount | DECIMAL(15,2) | NOT NULL | Default amount |
| description | TEXT | | Default description/notes |
| is_active | BOOLEAN | DEFAULT TRUE | Active flag |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Update timestamp |

## ENUM Definitions

### payment_type
- `onetime`: One-time payment
- `subscription`: Recurring billing

### service_type
- `product`: Product service
- `project`: Project case

## Index Design

### customers Table
- PRIMARY KEY: customer_id
- UNIQUE INDEX: email
- INDEX: customer_name (for partial match searches)

### orders Table (onetime orders only)
- PRIMARY KEY: order_id
- FOREIGN KEY INDEX: customer_id
- INDEX: sales_at (for sales date range searches)

### subscriptions Table (subscription contract management)
- PRIMARY KEY: subscription_id
- FOREIGN KEY INDEX: customer_id

### subscription_amounts Table (subscription amount history)
- PRIMARY KEY: amount_id
- FOREIGN KEY INDEX: subscription_id
- INDEX: start_date, end_date (for period searches)

### subscription_paid Table (subscription monthly payment management)
- PRIMARY KEY: paid_id
- FOREIGN KEY INDEX: subscription_id
- INDEX: year, month (for year-month searches)

### order_templates Table
- PRIMARY KEY: template_id
- UNIQUE INDEX: payment_type, template_name (prevent duplication under same conditions)
- INDEX: payment_type (for searches)
- INDEX: is_active (for active template extraction)

## Business Rules

### Revenue Management Rules

1. **One-time Payment (onetime)**
   - Managed in the `orders` table
   - Sales date managed by the `sales_at` column
   - Set `is_paid = TRUE` when payment is completed

2. **Recurring Billing (subscription)**
   - Contract information managed in the `subscriptions` table
   - Amount history managed in the `subscription_amounts` table with period represented by `start_date` ~ `end_date` (NULL = ongoing)
   - Monthly payment status managed in the `subscription_paid` table by `year`, `month`, `is_paid`
   - Create a `subscription_paid` record for each monthly payment, set `is_paid = TRUE` when payment is completed

3. **Amount Management**
   - All amounts managed as tax-inclusive prices
   - Currency defaults to JPY (Japanese Yen) but multi-currency support is possible

### Template Management Rules
1. **Template Design**
   - Multiple templates can be created for each payment_type and service_type combination
   - Duplication under same conditions (payment_type, service_type, template_name) is prohibited
   - Template activation/deactivation managed by is_active flag

2. **Input Assistance Features**
   - When payment_type and service_type are selected during order creation, corresponding templates are presented
   - When template is selected, amount and description are entered as default values
   - Users can freely modify template values

3. **Template Usage**
   - Templates and order data are managed independently (no relations)
   - Template deletion/modification does not affect existing order data

### Data Integrity
1. When customer is deleted, related order data is also logically deleted
2. Revenue data is prohibited from physical deletion in principle
3. Amount data is retained as audit logs
4. Template logical deletion is managed by is_active flag
