"""
Navigation index page - Show all available pages
"""
from django.http import HttpResponse
from django.urls import get_resolver

def navigation_index(request):
    """Show all available pages and API endpoints"""
    resolver = get_resolver()
    url_patterns = []
    
    def extract_urls(urlpatterns, prefix=''):
        for pattern in urlpatterns:
            if hasattr(pattern, 'url_patterns'):
                extract_urls(pattern.url_patterns, prefix + str(pattern.pattern))
            elif hasattr(pattern, 'pattern'):
                url_patterns.append({
                    'pattern': prefix + str(pattern.pattern),
                    'name': getattr(pattern, 'name', ''),
                })
    
    extract_urls(resolver.url_patterns)
    
    html = '''
<!DOCTYPE html>
<html>
<head>
    <title>FinPilot - Navigation Index</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 1400px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #5e81f4; margin-bottom: 10px; }
        .section {
            margin: 40px 0;
            padding: 30px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #5e81f4;
        }
        .section h2 {
            color: #333;
            margin-top: 0;
            margin-bottom: 20px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            transition: all 0.3s;
        }
        .card:hover {
            border-color: #5e81f4;
            box-shadow: 0 4px 12px rgba(94, 129, 244, 0.15);
            transform: translateY(-2px);
        }
        .card h3 {
            margin: 0 0 10px 0;
            color: #1e293b;
            font-size: 18px;
        }
        .card p {
            margin: 5px 0;
            color: #64748b;
            font-size: 14px;
        }
        .link {
            display: inline-block;
            margin-top: 10px;
            padding: 8px 16px;
            background: #5e81f4;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
        }
        .link:hover {
            background: #4c6fd8;
        }
        .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.85em;
            font-weight: 500;
            margin-left: 10px;
        }
        .status.live { background: #d1fae5; color: #065f46; }
        .status.demo { background: #dbeafe; color: #1e40af; }
        code {
            background: #1e293b;
            color: #e2e8f0;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.9em;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 FinPilot - Complete Navigation</h1>
        <p style="color: #64748b; font-size: 16px; margin-bottom: 30px;">
            Welcome to FinPilot AI CFO Platform! Navigate to any feature below.
        </p>
        
        <div class="section">
            <h2>📊 Dashboard Pages</h2>
            <div class="grid">
                <div class="card">
                    <h3>Demo Dashboard <span class="status demo">Demo</span></h3>
                    <p>Beautiful overview page with all features showcased</p>
                    <a href="/api/invoices/demo/" class="link">Visit Demo →</a>
                </div>
                <div class="card">
                    <h3>Django Admin <span class="status live">Live</span></h3>
                    <p>Full administrative interface for all data</p>
                    <a href="/admin/" class="link">Go to Admin →</a>
                </div>
                <div class="card">
                    <h3>API Root <span class="status live">Live</span></h3>
                    <p>Browsable API interface</p>
                    <a href="/api/" class="link">View APIs →</a>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>💼 Feature 1: Invoice Management</h2>
            <div class="grid">
                <div class="card">
                    <h3>Customers API</h3>
                    <p><code>GET /api/orgs/{org_id}/invoices/customers/</code></p>
                    <p>Manage customer records and payment analytics</p>
                </div>
                <div class="card">
                    <h3>Invoices API</h3>
                    <p><code>GET /api/orgs/{org_id}/invoices/invoices/</code></p>
                    <p>Create, view, and manage invoices</p>
                </div>
                <div class="card">
                    <h3>AR Aging Report</h3>
                    <p><code>GET /api/orgs/{org_id}/invoices/ar-aging/</code></p>
                    <p>Accounts receivable aging analysis</p>
                </div>
                <div class="card">
                    <h3>Reminder Schedules</h3>
                    <p><code>GET /api/orgs/{org_id}/invoices/reminder-schedule/</code></p>
                    <p>Configure automated invoice reminders</p>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>📈 Feature 3: Scenario Planning & Budgets</h2>
            <div class="grid">
                <div class="card">
                    <h3>Scenarios API</h3>
                    <p><code>GET /api/orgs/{org_id}/planning/scenarios/</code></p>
                    <p>Financial what-if scenario modeling</p>
                </div>
                <div class="card">
                    <h3>Budgets API</h3>
                    <p><code>GET /api/orgs/{org_id}/planning/budgets/</code></p>
                    <p>Budget management with variance tracking</p>
                </div>
                <div class="card">
                    <h3>Goals API</h3>
                    <p><code>GET /api/orgs/{org_id}/planning/goals/</code></p>
                    <p>Financial goal tracking and progress</p>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>💳 Feature 4: Bill Pay Automation</h2>
            <div class="grid">
                <div class="card">
                    <h3>Vendors API</h3>
                    <p><code>GET /api/orgs/{org_id}/billpay/vendors/</code></p>
                    <p>Vendor management and payment history</p>
                </div>
                <div class="card">
                    <h3>Bills API</h3>
                    <p><code>GET /api/orgs/{org_id}/billpay/bills/</code></p>
                    <p>Bill tracking with OCR and approvals</p>
                </div>
                <div class="card">
                    <h3>Approval Workflows</h3>
                    <p><code>GET /api/orgs/{org_id}/billpay/workflows/</code></p>
                    <p>Customizable approval routing</p>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>💰 Feature 5: Profitability Intelligence</h2>
            <div class="grid">
                <div class="card">
                    <h3>Customer Profitability</h3>
                    <p><code>GET /api/orgs/{org_id}/profitability/customer-profitability/</code></p>
                    <p>Customer-level profit analysis</p>
                </div>
                <div class="card">
                    <h3>Product Profitability</h3>
                    <p><code>GET /api/orgs/{org_id}/profitability/product-profitability/</code></p>
                    <p>Product margin tracking</p>
                </div>
                <div class="card">
                    <h3>Projects API</h3>
                    <p><code>GET /api/orgs/{org_id}/profitability/projects/</code></p>
                    <p>Project profitability tracking</p>
                </div>
                <div class="card">
                    <h3>Time Entries</h3>
                    <p><code>GET /api/orgs/{org_id}/profitability/time-entries/</code></p>
                    <p>Time tracking integration</p>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>🏥 Feature 6: Financial Health Score</h2>
            <div class="grid">
                <div class="card">
                    <h3>Health Scores</h3>
                    <p><code>GET /api/orgs/{org_id}/health/scores/</code></p>
                    <p>Composite financial health scoring</p>
                </div>
                <div class="card">
                    <h3>Benchmarks</h3>
                    <p><code>GET /api/orgs/{org_id}/health/benchmarks/</code></p>
                    <p>Industry benchmark comparisons</p>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>🏦 Feature 7: Cash Reserves</h2>
            <div class="grid">
                <div class="card">
                    <h3>Reserve Goals</h3>
                    <p><code>GET /api/orgs/{org_id}/reserves/goals/</code></p>
                    <p>Savings goal management</p>
                </div>
                <div class="card">
                    <h3>Savings Accounts</h3>
                    <p><code>GET /api/orgs/{org_id}/reserves/savings-accounts/</code></p>
                    <p>Linked savings account management</p>
                </div>
                <div class="card">
                    <h3>Auto Transfers</h3>
                    <p><code>GET /api/orgs/{org_id}/reserves/auto-transfers/</code></p>
                    <p>Automated savings transfers</p>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>🔐 Authentication</h2>
            <div class="grid">
                <div class="card">
                    <h3>Login</h3>
                    <p><code>POST /api/auth/login/</code></p>
                    <p>Get JWT authentication token</p>
                </div>
                <div class="card">
                    <h3>Register</h3>
                    <p><code>POST /api/auth/register/</code></p>
                    <p>Create new user account</p>
                </div>
            </div>
        </div>
        
        <div class="section" style="background: #fef3c7; border-color: #f59e0b;">
            <h2>📝 Quick Start Instructions</h2>
            <ol style="line-height: 2;">
                <li><strong>Create Demo Data:</strong> Run <code>python manage.py create_demo_invoices</code></li>
                <li><strong>Create Superuser:</strong> Run <code>python manage.py createsuperuser</code></li>
                <li><strong>Login to Admin:</strong> Visit <a href="/admin/">/admin/</a> with your credentials</li>
                <li><strong>View Demo:</strong> Visit <a href="/api/invoices/demo/">/api/invoices/demo/</a> for overview</li>
                <li><strong>Use APIs:</strong> All endpoints require JWT authentication (login first)</li>
            </ol>
        </div>
    </div>
</body>
</html>
    '''
    return HttpResponse(html)

