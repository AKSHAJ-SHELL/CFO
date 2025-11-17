# How to Test Your Invoice Management System

## 🎯 The Issue You Hit

You tried to visit:
```
http://localhost:8000/api/orgs/{YOUR-ORG-ID}/invoices/ar-aging/
```

`{YOUR-ORG-ID}` is a **placeholder** - you need a real UUID like:
```
http://localhost:8000/api/orgs/550e8400-e29b-41d4-a716-446655440000/invoices/ar-aging/
```

## ✅ Two Ways to Test

### Way 1: Django Admin (EASIEST!) ⭐

**I just opened it for you:** http://localhost:8000/admin/

**Steps:**
1. You'll see a login screen
2. **Problem**: You need a superuser account first

**To create a superuser**, you need to either:
- **Option A**: Use Docker (if Docker Desktop is running):
  ```bash
  docker-compose exec backend python manage.py createsuperuser
  ```

- **Option B**: If Django is running locally:
  ```bash
  # From your project root
  cd backend
  python manage.py createsuperuser
  ```

After creating superuser:
1. Login to http://localhost:8000/admin/
2. Click **"Organizations"** → See existing orgs or create one
3. Click **"Customers"** → Create test customers
4. Click **"Invoices"** → Create test invoices
5. Click **"AR aging"** → See reports!

### Way 2: Use the API (For Developers)

**I opened this for you:** http://localhost:8000/api/auth/

#### Step 1: Register a User

In the browser at http://localhost:8000/api/auth/:
- Click on the `POST /register/` endpoint
- Or use curl:

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "name": "Test User"
  }'
```

**Response will include:**
```json
{
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Step 2: Create an Organization

You need to check the existing user endpoints. Visit:
```
http://localhost:8000/api/auth/me/
```

This will show your user info and associated organizations.

#### Step 3: Get Your Organization ID

Once you have an organization, the ID will look like:
```
550e8400-e29b-41d4-a716-446655440000
```

#### Step 4: Use Real URLs

Now replace `{YOUR-ORG-ID}` with your actual org ID:

✅ **Correct:**
```
http://localhost:8000/api/orgs/550e8400-e29b-41d4-a716-446655440000/invoices/customers/
```

❌ **Wrong (what you tried):**
```
http://localhost:8000/api/orgs/{YOUR-ORG-ID}/invoices/customers/
```

## 🚀 Quick Test Script

Here's a complete test you can run:

```bash
# 1. Register
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@test.com","password":"Pass123!","name":"Demo User"}'

# Save the access token from response

# 2. Login (if needed)
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@test.com","password":"Pass123!"}'

# 3. Get your user info (to find org ID)
curl http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 4. List customers (replace {org_id} with real UUID)
curl http://localhost:8000/api/orgs/{org_id}/invoices/customers/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 5. Create a customer
curl -X POST http://localhost:8000/api/orgs/{org_id}/invoices/customers/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Acme Corp",
    "payment_terms_default": "Net 30"
  }'

# 6. Get AR Aging Report
curl http://localhost:8000/api/orgs/{org_id}/invoices/ar-aging/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 💡 Recommended: Start with Docker

The **easiest way** to test everything properly:

1. **Start Docker Desktop**

2. **Run:**
   ```bash
   docker-compose up
   ```

3. **Create superuser:**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

4. **Visit:**
   - Admin: http://localhost:8000/admin/
   - ML Service: http://localhost:8080/docs
   - Frontend: http://localhost:3000

5. **In Django Admin:**
   - Browse to "Organizations" to see/create orgs
   - Browse to "Customers" to create customers
   - Browse to "Invoices" to create invoices
   - All the data is visual and easy to manage!

## 🎨 Visual Workflow

```
Start
  ↓
Register User (or create superuser)
  ↓
Login (get access token)
  ↓
Get User Info → Find Organization ID
  ↓
Use Organization ID in URLs
  ↓
Create Customers
  ↓
Create Invoices
  ↓
View Reports!
```

## 📊 What You're Testing

**Feature 1: Invoice Management** includes:

1. ✅ **Customer Management**
   - Create/edit customers
   - Track payment behavior
   - View payment history

2. ✅ **Invoice Creation**
   - Create invoices with line items
   - Auto-calculate totals
   - Generate invoice numbers

3. ✅ **Payment Processing**
   - Stripe integration
   - Payment tracking
   - Refunds

4. ✅ **Automation**
   - Scheduled reminders
   - Status updates
   - Payment predictions

5. ✅ **Reports**
   - AR aging reports
   - Customer analytics
   - Payment predictions

## 🆘 Still Stuck?

**The absolute easiest way:**

1. Open Docker Desktop
2. Run `docker-compose up`
3. Run `docker-compose exec backend python manage.py createsuperuser`
4. Visit http://localhost:8000/admin/
5. Login
6. Click around - it's all visual!

**You can create and test everything** without needing to know any UUIDs or API syntax!

---

**Summary:**
- ❌ Don't use `{YOUR-ORG-ID}` literally
- ✅ Get a real UUID first (from registration or admin)
- 🎯 Or just use Django Admin - it's visual and easy!

The browser windows I opened for you are ready to use! 🎉

