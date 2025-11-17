# Generated migration for invoices app
# This would normally be created by running: python manage.py makemigrations

from django.db import migrations, models
import django.db.models.deletion
import django.core.validators
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Customer',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('email', models.EmailField(max_length=254, validators=[django.core.validators.EmailValidator()])),
                ('phone', models.CharField(blank=True, max_length=50, null=True)),
                ('company', models.CharField(blank=True, max_length=255, null=True)),
                ('billing_address', models.JSONField(blank=True, default=dict)),
                ('payment_terms_default', models.CharField(default='Net 30', max_length=50)),
                ('preferred_payment_method', models.CharField(choices=[('card', 'Credit/Debit Card'), ('ach', 'ACH Transfer'), ('paypal', 'PayPal'), ('other', 'Other')], default='card', max_length=20)),
                ('payment_reliability_score', models.DecimalField(decimal_places=2, default=0.0, max_digits=5, validators=[django.core.validators.MinValueValidator(0.0)])),
                ('average_days_to_pay', models.IntegerField(default=0)),
                ('total_invoiced', models.DecimalField(decimal_places=2, default=0.0, max_digits=12)),
                ('total_paid', models.DecimalField(decimal_places=2, default=0.0, max_digits=12)),
                ('notes', models.TextField(blank=True)),
                ('tags', models.JSONField(blank=True, default=list)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('organization', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='customers', to='users.organization')),
            ],
            options={
                'db_table': 'customers',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Invoice',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('invoice_number', models.CharField(max_length=50)),
                ('issue_date', models.DateField()),
                ('due_date', models.DateField()),
                ('subtotal', models.DecimalField(decimal_places=2, max_digits=12, validators=[django.core.validators.MinValueValidator(0.0)])),
                ('tax_rate', models.DecimalField(decimal_places=2, default=0.0, max_digits=5, validators=[django.core.validators.MinValueValidator(0.0)])),
                ('tax_amount', models.DecimalField(decimal_places=2, default=0.0, max_digits=12)),
                ('discount_amount', models.DecimalField(decimal_places=2, default=0.0, max_digits=12)),
                ('total_amount', models.DecimalField(decimal_places=2, max_digits=12, validators=[django.core.validators.MinValueValidator(0.0)])),
                ('amount_paid', models.DecimalField(decimal_places=2, default=0.0, max_digits=12)),
                ('status', models.CharField(choices=[('draft', 'Draft'), ('sent', 'Sent'), ('viewed', 'Viewed'), ('partial', 'Partially Paid'), ('paid', 'Paid'), ('overdue', 'Overdue'), ('cancelled', 'Cancelled')], default='draft', max_length=20)),
                ('payment_terms', models.CharField(default='Net 30', max_length=100)),
                ('notes', models.TextField(blank=True)),
                ('footer_text', models.TextField(blank=True)),
                ('template_id', models.CharField(default='default', max_length=50)),
                ('sent_at', models.DateTimeField(blank=True, null=True)),
                ('viewed_at', models.DateTimeField(blank=True, null=True)),
                ('paid_at', models.DateTimeField(blank=True, null=True)),
                ('payment_link_token', models.CharField(blank=True, max_length=100, null=True, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='invoices_created', to='users.user')),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='invoices', to='invoices.customer')),
                ('organization', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invoices', to='users.organization')),
            ],
            options={
                'db_table': 'invoices',
                'ordering': ['-issue_date', '-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ReminderSchedule',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('send_before_due_days', models.IntegerField(default=3)),
                ('send_on_due_date', models.BooleanField(default=True)),
                ('send_after_due_days', models.JSONField(default=list)),
                ('use_email', models.BooleanField(default=True)),
                ('use_sms', models.BooleanField(default=False)),
                ('tone', models.CharField(choices=[('friendly', 'Friendly'), ('professional', 'Professional'), ('firm', 'Firm')], default='professional', max_length=20)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('organization', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='reminder_schedule', to='users.organization')),
            ],
            options={
                'db_table': 'reminder_schedules',
            },
        ),
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12, validators=[django.core.validators.MinValueValidator(0.01)])),
                ('payment_method', models.CharField(choices=[('card', 'Credit/Debit Card'), ('ach', 'ACH Transfer'), ('paypal', 'PayPal'), ('check', 'Check'), ('cash', 'Cash'), ('other', 'Other')], max_length=20)),
                ('payment_date', models.DateTimeField()),
                ('stripe_payment_intent_id', models.CharField(blank=True, max_length=255, null=True, unique=True)),
                ('stripe_charge_id', models.CharField(blank=True, max_length=255, null=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('processing', 'Processing'), ('succeeded', 'Succeeded'), ('failed', 'Failed'), ('refunded', 'Refunded'), ('cancelled', 'Cancelled')], default='pending', max_length=20)),
                ('transaction_reference', models.CharField(blank=True, max_length=255)),
                ('notes', models.TextField(blank=True)),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('invoice', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payments', to='invoices.invoice')),
            ],
            options={
                'db_table': 'payments',
                'ordering': ['-payment_date'],
            },
        ),
        migrations.CreateModel(
            name='InvoiceLineItem',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('description', models.TextField()),
                ('quantity', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0.01)])),
                ('unit_price', models.DecimalField(decimal_places=2, max_digits=12, validators=[django.core.validators.MinValueValidator(0.0)])),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12, validators=[django.core.validators.MinValueValidator(0.0)])),
                ('sort_order', models.IntegerField(default=0)),
                ('invoice', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='line_items', to='invoices.invoice')),
            ],
            options={
                'db_table': 'invoice_line_items',
                'ordering': ['sort_order', 'id'],
            },
        ),
        migrations.CreateModel(
            name='InvoiceCommunication',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('communication_type', models.CharField(choices=[('sent', 'Invoice Sent'), ('reminder', 'Payment Reminder'), ('follow_up', 'Follow-up'), ('thank_you', 'Thank You'), ('overdue', 'Overdue Notice'), ('custom', 'Custom Message')], max_length=20)),
                ('channel', models.CharField(choices=[('email', 'Email'), ('sms', 'SMS'), ('in_app', 'In-App Notification')], default='email', max_length=20)),
                ('subject', models.CharField(blank=True, max_length=255)),
                ('message_body', models.TextField()),
                ('sent_at', models.DateTimeField()),
                ('opened_at', models.DateTimeField(blank=True, null=True)),
                ('clicked_at', models.DateTimeField(blank=True, null=True)),
                ('responded_at', models.DateTimeField(blank=True, null=True)),
                ('is_ai_generated', models.BooleanField(default=False)),
                ('external_message_id', models.CharField(blank=True, max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('invoice', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='communications', to='invoices.invoice')),
            ],
            options={
                'db_table': 'invoice_communications',
                'ordering': ['-sent_at'],
            },
        ),
        migrations.CreateModel(
            name='PaymentPrediction',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('predicted_payment_date', models.DateField()),
                ('confidence_score', models.DecimalField(decimal_places=2, max_digits=5, validators=[django.core.validators.MinValueValidator(0.0)])),
                ('risk_level', models.CharField(choices=[('low', 'Low Risk'), ('medium', 'Medium Risk'), ('high', 'High Risk')], max_length=10)),
                ('model_version', models.CharField(default='1.0', max_length=50)),
                ('factors', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('invoice', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='predictions', to='invoices.invoice')),
            ],
            options={
                'db_table': 'payment_predictions',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='customer',
            index=models.Index(fields=['organization', 'email'], name='customers_organiz_idx'),
        ),
        migrations.AddIndex(
            model_name='customer',
            index=models.Index(fields=['organization', 'name'], name='customers_organiz_name_idx'),
        ),
        migrations.AddConstraint(
            model_name='customer',
            constraint=models.UniqueConstraint(fields=('organization', 'email'), name='unique_customer_email_per_org'),
        ),
        migrations.AddIndex(
            model_name='invoice',
            index=models.Index(fields=['organization', 'status'], name='invoices_organiz_status_idx'),
        ),
        migrations.AddIndex(
            model_name='invoice',
            index=models.Index(fields=['organization', 'customer'], name='invoices_organiz_customer_idx'),
        ),
        migrations.AddIndex(
            model_name='invoice',
            index=models.Index(fields=['organization', 'due_date'], name='invoices_organiz_due_date_idx'),
        ),
        migrations.AddIndex(
            model_name='invoice',
            index=models.Index(fields=['payment_link_token'], name='invoices_payment_link_idx'),
        ),
        migrations.AddConstraint(
            model_name='invoice',
            constraint=models.UniqueConstraint(fields=('organization', 'invoice_number'), name='unique_invoice_number_per_org'),
        ),
        migrations.AddIndex(
            model_name='payment',
            index=models.Index(fields=['invoice', 'status'], name='payments_invoice_status_idx'),
        ),
        migrations.AddIndex(
            model_name='payment',
            index=models.Index(fields=['stripe_payment_intent_id'], name='payments_stripe_intent_idx'),
        ),
        migrations.AddIndex(
            model_name='invoicecommunication',
            index=models.Index(fields=['invoice', 'communication_type'], name='invoice_comm_invoice_type_idx'),
        ),
        migrations.AddIndex(
            model_name='invoicecommunication',
            index=models.Index(fields=['external_message_id'], name='invoice_comm_ext_msg_idx'),
        ),
        migrations.AddIndex(
            model_name='paymentprediction',
            index=models.Index(fields=['invoice'], name='payment_pred_invoice_idx'),
        ),
    ]

