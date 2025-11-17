"""
URL configuration for FinPilot backend
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .navigation_view import navigation_index

urlpatterns = [
	path('admin/', admin.site.urls),
	path('', navigation_index, name='navigation-index'),  # Root navigation page
	path('api/auth/', include('app.users.urls')),
	path('api/orgs/<uuid:org_id>/', include('app.api.urls')),
	path('api/orgs/<uuid:org_id>/invoices/', include('app.invoices.urls')),
	path('api/orgs/<uuid:org_id>/planning/', include('app.planning.urls')),
	path('api/orgs/<uuid:org_id>/billpay/', include('app.billpay.urls')),
	path('api/orgs/<uuid:org_id>/profitability/', include('app.profitability.urls')),
	path('api/orgs/<uuid:org_id>/health/', include('app.health.urls')),
	path('api/orgs/<uuid:org_id>/reserves/', include('app.reserves.urls')),
	path('api/billing/', include('app.billing.urls')),
	path('api/connections/', include('app.connections.urls')),
	# Public invoice payment URLs
	path('api/invoices/', include('app.invoices.urls')),  # For public payment/webhook endpoints
]

if settings.DEBUG:
	urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

