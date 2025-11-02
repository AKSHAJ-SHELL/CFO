"""
URL configuration for FinPilot backend
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
	path('admin/', admin.site.urls),
	path('api/auth/', include('app.users.urls')),
	path('api/orgs/<uuid:org_id>/', include('app.api.urls')),
	path('api/billing/', include('app.billing.urls')),
	path('api/connections/', include('app.connections.urls')),
]

if settings.DEBUG:
	urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

