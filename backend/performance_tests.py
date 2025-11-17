"""
Performance and Load Testing for FinPilot
Run with: locust -f performance_tests.py
"""
from locust import HttpUser, task, between
import random

class FinPilotUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        """Login before testing"""
        response = self.client.post("/api/auth/login/", json={
            "email": "test@example.com",
            "password": "testpass123"
        })
        if response.status_code == 200:
            self.token = response.json().get("access")
            self.org_id = "test-org-id"  # Replace with actual org ID
    
    @task(3)
    def view_invoices(self):
        """Test invoice listing performance"""
        self.client.get(
            f"/api/orgs/{self.org_id}/invoices/invoices/",
            headers={"Authorization": f"Bearer {self.token}"}
        )
    
    @task(2)
    def view_dashboard(self):
        """Test dashboard metrics"""
        self.client.get(
            f"/api/orgs/{self.org_id}/",
            headers={"Authorization": f"Bearer {self.token}"}
        )
    
    @task(1)
    def create_invoice(self):
        """Test invoice creation"""
        self.client.post(
            f"/api/orgs/{self.org_id}/invoices/invoices/",
            json={
                "customer": "test-customer-id",
                "invoice_number": f"INV-{random.randint(1000, 9999)}",
                "issue_date": "2024-01-01",
                "due_date": "2024-01-31",
                "subtotal": random.randint(100, 10000),
                "total_amount": random.randint(100, 10000),
            },
            headers={"Authorization": f"Bearer {self.token}"}
        )
    
    @task(2)
    def view_scenarios(self):
        """Test scenario planning"""
        self.client.get(
            f"/api/orgs/{self.org_id}/planning/scenarios/",
            headers={"Authorization": f"Bearer {self.token}"}
        )
    
    @task(1)
    def view_health_score(self):
        """Test health score calculation"""
        self.client.get(
            f"/api/orgs/{self.org_id}/health/scores/",
            headers={"Authorization": f"Bearer {self.token}"}
        )

"""
Performance Benchmarks:
- Response time < 200ms for list views
- Response time < 500ms for complex calculations
- Support 100 concurrent users
- 95th percentile < 1s
- 99th percentile < 2s

Run tests:
locust -f performance_tests.py --host=http://localhost:8000 --users=100 --spawn-rate=10
"""

