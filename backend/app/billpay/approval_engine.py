"""
Approval workflow engine for bills
"""
from .models import ApprovalRequest, ApprovalWorkflow, ApprovalRule
from decimal import Decimal


class ApprovalEngine:
    """Route bills through approval workflows"""
    
    def __init__(self, bill):
        self.bill = bill
        self.workflow = self._determine_workflow()
    
    def _determine_workflow(self):
        """Determine which workflow applies to this bill"""
        # Check if bill has specific workflow assigned
        if self.bill.approval_workflow:
            return self.bill.approval_workflow
        
        # Use default workflow for organization
        default_workflow = ApprovalWorkflow.objects.filter(
            organization=self.bill.organization,
            is_default=True,
            is_active=True
        ).first()
        
        if default_workflow:
            return default_workflow
        
        return None
    
    def create_approval_requests(self):
        """Create approval requests based on workflow rules"""
        if not self.workflow:
            # No approval required
            self.bill.status = 'approved'
            self.bill.save()
            return []
        
        # Get applicable rules
        rules = self._get_applicable_rules()
        
        if not rules:
            # No rules match, auto-approve
            self.bill.status = 'approved'
            self.bill.save()
            return []
        
        # Create approval requests
        approval_requests = []
        sequence = 1
        
        for rule in rules:
            for approver in rule.approvers.all():
                approval_request = ApprovalRequest.objects.create(
                    bill=self.bill,
                    workflow=self.workflow,
                    approver=approver,
                    sequence=sequence,
                    status='pending'
                )
                approval_requests.append(approval_request)
                
                if rule.approval_type == 'sequential':
                    sequence += 1
            
            if rule.approval_type == 'parallel':
                sequence += 1
        
        return approval_requests
    
    def _get_applicable_rules(self):
        """Get rules that apply to this bill"""
        if not self.workflow:
            return []
        
        applicable_rules = []
        
        for rule in self.workflow.rules.all():
            if self._rule_matches(rule):
                applicable_rules.append(rule)
        
        # Sort by priority
        applicable_rules.sort(key=lambda r: r.priority)
        
        return applicable_rules
    
    def _rule_matches(self, rule):
        """Check if a rule matches the bill"""
        condition_type = rule.condition_type
        condition_value = rule.condition_value
        
        if condition_type == 'amount_gt':
            return self.bill.total_amount > Decimal(condition_value)
        
        elif condition_type == 'amount_lt':
            return self.bill.total_amount < Decimal(condition_value)
        
        elif condition_type == 'category':
            return self.bill.category == condition_value
        
        elif condition_type == 'vendor':
            return str(self.bill.vendor.id) == condition_value
        
        elif condition_type == 'department':
            return self.bill.department == condition_value
        
        return False

