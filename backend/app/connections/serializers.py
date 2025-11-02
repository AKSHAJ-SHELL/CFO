"""
Serializers for connections app
"""
from rest_framework import serializers
from .models import AccountConnection


class AccountConnectionSerializer(serializers.ModelSerializer):
	"""Account connection serializer"""
	class Meta:
		model = AccountConnection
		fields = (
			'id', 'org', 'provider', 'name', 'provider_account_id',
			'status', 'last_synced_at', 'metadata', 'created_at', 'updated_at'
		)
		read_only_fields = ('id', 'created_at', 'updated_at')

