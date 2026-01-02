# Double-Entry Accounting Ledger System

A full-stack web application that implements double-entry bookkeeping principles for managing financial transactions and generating comprehensive financial reports.

## 🌐 Live Demo

**Live Application**: [https://accountingledger.vercel.app/](https://accountingledger.vercel.app/)

## 🎯 Overview

This application provides a complete accounting solution with:
- **Transaction Management**: Create, edit, and delete financial transactions following double-entry bookkeeping rules
- **Chart of Accounts**: Manage accounts across five categories (Assets, Liabilities, Equity, Revenue, Expenses)
- **Financial Reports**: Generate Journal entries, Balance Sheet, and Income Statement with date filtering
- **Real-time Validation**: Ensures debits always equal credits before saving transactions

## 🛠️ Technology Stack

### Frontend
- **Next.js 16.1.1** - React framework with App Router
- **React 19.2.3** - UI library
- **Tailwind CSS 4** - Utility-first CSS framework
- **DaisyUI 5.5.14** - Component library for Tailwind
- **Lucide React** - Icon library
- **SweetAlert2** - Beautiful alert modals

### Backend
- **Node.js** - Runtime environment
- **Next.js API Routes** - Serverless API endpoints
- **PostgreSQL** - Relational database

### Database
- **PostgreSQL 8.16.3** - Primary database
- **pg (node-postgres)** - PostgreSQL client for Node.js

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager
- **pgAdmin** (recommended for database management)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/TusharChow20/project_double_entry_accounting_ledger_system.git
cd double_entry_accounting_ledger_system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Option A: Using pgAdmin (Recommended)

1. Open pgAdmin and connect to your PostgreSQL server
2. Right-click on "Databases" → "Create" → "Database"
3. Name it: `accounting_ledger`
4. Click on the new database → "Tools" → "Query Tool"
5. Copy and paste the following SQL schema:

```sql
-- Create accounts table
CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  account_name VARCHAR(100) NOT NULL UNIQUE,
  account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transaction_lines table
CREATE TABLE transaction_lines (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES accounts(id),
  debit_amount DECIMAL(15, 2) DEFAULT 0.00,
  credit_amount DECIMAL(15, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_debit_or_credit CHECK (
    (debit_amount > 0 AND credit_amount = 0) OR 
    (credit_amount > 0 AND debit_amount = 0)
  )
);

-- Create indexes for performance
CREATE INDEX idx_transaction_lines_transaction_id ON transaction_lines(transaction_id);
CREATE INDEX idx_transaction_lines_account_id ON transaction_lines(account_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);

-- Insert default accounts
INSERT INTO accounts (account_name, account_type, description) VALUES
('Cash', 'Asset', 'Cash on hand and in bank'),
('Accounts Receivable', 'Asset', 'Money owed by customers'),
('Inventory', 'Asset', 'Goods for sale'),
('Accounts Payable', 'Liability', 'Money owed to suppliers'),
('Loans Payable', 'Liability', 'Bank loans and other debts'),
('Owner Equity', 'Equity', 'Owner investment'),
('Retained Earnings', 'Equity', 'Accumulated profits'),
('Sales Revenue', 'Revenue', 'Income from sales'),
('Service Revenue', 'Revenue', 'Income from services'),
('Cost of Goods Sold', 'Expense', 'Cost of inventory sold'),
('Rent Expense', 'Expense', 'Office/store rent'),
('Utilities Expense', 'Expense', 'Electricity, water, internet'),
('Salaries Expense', 'Expense', 'Employee wages');
```

6. Press F5 or click the Execute button

### 4. Environment Configuration

Create a `.env.local` file in the root directory:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/accounting_ledger
```

**Replace `YOUR_PASSWORD`** with your PostgreSQL password.

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

## 📁 Project Architecture

```
double_entry_accounting_ledger_system/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.js                   # Home page
│   │   ├── layout.js                 # Root layout with metadata
│   │   ├── globals.css               # Global styles
│   │   ├── accounts/
│   │   │   ├── layout.jsx
│   │   │   └── page.jsx             # Account management page
│   │   ├── transactions/
│   │   │   ├── layout.jsx
│   │   │   ├── page.jsx             # Transaction management page
│   │   │   └── TransactionsUI.jsx   # Transaction UI component
│   │   ├── reports/
│   │   │   ├── page.jsx             # Reports dashboard
│   │   │   ├── journal/
│   │   │   │   └── page.jsx         # Journal report
│   │   │   ├── balance-sheet/
│   │   │   │   └── page.jsx         # Balance sheet
│   │   │   └── income-statement/
│   │   │       └── page.jsx         # Income statement
│   │   └── api/                      # API routes (backend)
│   │       ├── accounts/
│   │       │   └── route.js         # CRUD operations for accounts
│   │       ├── transactions/
│   │       │   └── route.js         # CRUD operations for transactions
│   │       └── reports/
│   │           └── route.js         # Report generation logic
│   └── lib/
│       └── db.js                     # Database connection pool
├── public/                           # Static assets
│   └── favicon.ico
├── .env.local                        # Environment variables (not in git)
├── .gitignore
├── package.json                      # Dependencies and scripts
├── package-lock.json
├── postcss.config.mjs
├── tailwind.config.mjs               # Tailwind configuration
├── jsconfig.json
├── next.config.mjs
└── README.md                         # This file
```

## 🏗️ Architecture Overview

### Database Layer
- **PostgreSQL** stores all financial data with referential integrity
- Three main tables: `accounts`, `transactions`, `transaction_lines`
- Cascading deletes ensure data consistency
- Indexes on foreign keys for optimal query performance

### Backend Layer (API Routes)
- **RESTful API** design using Next.js API routes
- **Transaction Management**: Atomic database operations using PostgreSQL transactions
- **Data Validation**: Server-side validation ensures accounting rules (debits = credits)
- **Error Handling**: Comprehensive error responses with rollback mechanisms

### Frontend Layer
- **Server Components**: Used for static pages (home page) - faster initial load
- **Client Components**: Used for interactive pages (forms, reports) - dynamic functionality
- **React Hooks**: useState and useEffect for state management
- **Real-time Updates**: Reports refresh automatically after creating transactions

## 🔑 Key Features

### 1. Transaction Management
- ✅ Create transactions with multiple account lines
- ✅ Edit existing transactions while maintaining balance
- ✅ Delete transactions (cascades to all lines)
- ✅ Real-time validation: Debits must equal Credits
- ✅ Date selection for backdating entries
- ✅ Search and pagination for large datasets

### 2. Account Management
- ✅ Create custom accounts across 5 categories
- ✅ Edit account names and descriptions
- ✅ Delete unused accounts (protected if transactions exist)
- ✅ Search and filter by account type

### 3. Financial Reports

#### Journal Report
- Chronological list of all transactions
- Shows: Date, Description, Account, Debit, Credit
- Date range filtering
- Grouped by transaction for clarity

#### Balance Sheet
- Financial position snapshot at any date
- Formula: Assets = Liabilities + Equity
- Real-time calculation from transaction data
- Only shows accounts with non-zero balances

#### Income Statement
- Profit & Loss for any date range
- Shows: Revenue, Expenses, Net Income
- Color-coded (green for profit, red for loss)
- Period comparison capability

## 🎨 Design Features

### Responsive Design
- **Mobile-first**: Optimized for screens 375px and up
- **Tablet support**: Responsive grid layouts
- **Desktop**: Multi-column layouts with optimal spacing

### UI/UX
- **Dark theme**: Professional appearance with gray-900 base
- **Color coding**: 
  - Cyan for Accounts
  - Indigo for Transactions
  - Purple for Reports
  - Green for success states
  - Red for errors
- **Icons**: Lucide React icons for visual clarity
- **Smooth transitions**: Hover effects and animations
- **SweetAlert2**: Beautiful confirmation dialogs

## 🧪 Testing the Application

### Test Scenario 1: Cash Sale
1. Go to **Transactions**
2. Create new transaction:
   - Date: Today
   - Description: "Cash sale of goods"
   - Line 1: Cash (Debit) - $1,000
   - Line 2: Sales Revenue (Credit) - $1,000
3. Verify: Success message appears
4. Check **Journal Report**: Transaction appears
5. Check **Balance Sheet**: Cash increases by $1,000
6. Check **Income Statement**: Revenue shows $1,000

### Test Scenario 2: Purchase on Credit
1. Create transaction:
   - Description: "Purchased inventory on credit"
   - Line 1: Inventory (Debit) - $500
   - Line 2: Accounts Payable (Credit) - $500
2. Verify in **Balance Sheet**: Both accounts updated

### Test Scenario 3: Invalid Transaction
1. Try to create:
   - Line 1: Cash (Debit) - $1,000
   - Line 2: Sales Revenue (Credit) - $800
2. Expected: Error message "Debits must equal Credits"

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variable:
   - Key: `DATABASE_URL`
   - Value: Your PostgreSQL connection string
5. Deploy

**Note**: For production, use a hosted PostgreSQL service like:
- [Neon](https://neon.tech) (Free tier available)
- [Supabase](https://supabase.com)
- [Railway](https://railway.app)

### Build for Production

```bash
npm run build
npm start
```

## 📝 Code Quality Features

### Best Practices Implemented
- ✅ Functional components throughout
- ✅ React Hooks (useState, useEffect)
- ✅ Server vs Client component separation
- ✅ RESTful API design
- ✅ SQL injection prevention (parameterized queries)
- ✅ Database connection pooling
- ✅ Error boundaries and error handling
- ✅ Consistent code formatting
- ✅ Descriptive variable and function names

### Performance Optimizations
- Database indexes on frequently queried columns
- Connection pooling for efficient database access
- Pagination for large datasets
- Minimal re-renders using proper React patterns
- Server Components for static content
- Efficient SQL queries with proper JOINs

## 🐛 Troubleshooting

### Database Connection Errors
```
Error: password authentication failed
```
**Solution**: Check your password in `.env.local`

### Port Already in Use
```
Error: Port 3000 is already in use
```
**Solution**: Kill the process or use different port:
```bash
npm run dev -- -p 3001
```

### Tables Not Found
**Solution**: Run the SQL schema in pgAdmin Query Tool

## 👨‍💻 Author

**Tushar Chowdhury**

## 📄 License

This project is created for educational purposes as part of a technical assessment.

## 🙏 Acknowledgments

- Built with Next.js and PostgreSQL
- UI components from Tailwind CSS and DaisyUI
- Icons from Lucide React