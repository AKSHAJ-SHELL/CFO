"""Reserve calculator"""
from decimal import Decimal

class ReserveCalculator:
    """Calculate recommended reserve amounts"""
    
    @staticmethod
    def calculate_emergency_fund(monthly_expenses):
        """Recommend 3-6 months of expenses"""
        return monthly_expenses * 4  # 4 months as middle ground
    
    @staticmethod
    def calculate_tax_reserve(annual_revenue, tax_rate=Decimal('0.25')):
        """Calculate quarterly tax reserve"""
        return (annual_revenue / 4) * tax_rate
    
    @staticmethod
    def calculate_seasonal_buffer(revenue_variance):
        """Calculate buffer for seasonal businesses"""
        return revenue_variance * Decimal('1.5')

