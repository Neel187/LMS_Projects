from rest_framework import serializers
from django.contrib.auth.models import User
from apps.contacts.models import Contact
from .models import Enquiry, ActivityTimeline, SavedView
from apps.custom_fields.models import EnquiryCustomFieldValue, CustomFieldDefinition

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'phone', 'email', 'first_name', 'last_name', 'primary_lead_source', 'created_at', 'updated_at']

class ActivityTimelineSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.ReadOnlyField(source='performed_by.username')

    class Meta:
        model = ActivityTimeline
        fields = ['id', 'enquiry', 'activity_type', 'title', 'description', 'performed_by', 'performed_by_name', 'created_at']

class EnquirySerializer(serializers.ModelSerializer):
    contact_details = ContactSerializer(source='contact', read_only=True)
    primary_owner_details = UserSerializer(source='primary_owner', read_only=True)
    secondary_owner_details = UserSerializer(source='secondary_owners', many=True, read_only=True)

    class Meta:
        model = Enquiry
        fields = [
            'id', 'contact', 'contact_details', 'title', 'status', 'source',
            'primary_owner', 'primary_owner_details', 'secondary_owners', 'secondary_owner_details',
            'campaign_name', 'ad_set_name', 'ad_name', 'instant_form_name', 'meta_lead_id',
            'raw_form_data', 'notes_summary', 'follow_up_date', 'created_at', 'updated_at'
        ]

class SavedViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedView
        fields = ['id', 'name', 'user', 'filters_config', 'is_pinned', 'is_shared', 'created_at']
