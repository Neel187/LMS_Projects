from django.db import models
from django.conf import settings
from apps.contacts.models import Contact

class EnquiryStatus(models.TextChoices):
    NEW = 'New', 'New'
    CONTACTED = 'Contacted', 'Contacted'
    QUALIFIED = 'Qualified', 'Qualified'
    CLOSED = 'Closed', 'Closed'
    LOST = 'Lost', 'Lost'

class LeadSource(models.TextChoices):
    META_ADS = 'Meta Ads', 'Meta Ads'
    MANUAL = 'Manual', 'Manual'
    BULK_UPLOAD = 'Bulk Upload', 'Bulk Upload'
    WEBSITE = 'Website', 'Website'

class Enquiry(models.Model):
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='enquiries')
    title = models.CharField(max_length=255, default='New Enquiry')
    status = models.CharField(max_length=50, choices=EnquiryStatus.choices, default=EnquiryStatus.NEW, db_index=True)
    source = models.CharField(max_length=50, choices=LeadSource.choices, default=LeadSource.MANUAL, db_index=True)
    
    primary_owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='primary_enquiries')
    secondary_owners = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name='secondary_enquiries')
    
    # Meta Ads Details
    campaign_name = models.CharField(max_length=255, blank=True, default='', db_index=True)
    ad_set_name = models.CharField(max_length=255, blank=True, default='')
    ad_name = models.CharField(max_length=255, blank=True, default='')
    instant_form_name = models.CharField(max_length=255, blank=True, default='', db_index=True)
    meta_lead_id = models.CharField(max_length=100, blank=True, default='', db_index=True)
    
    # Raw Meta Form responses stored as JSON
    raw_form_data = models.JSONField(default=dict, blank=True)
    
    notes_summary = models.TextField(blank=True, default='')
    follow_up_date = models.DateTimeField(null=True, blank=True, db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Enquiry #{self.id} - {self.contact} ({self.status})"

class ActivityType(models.TextChoices):
    ENQUIRY_CREATED = 'ENQUIRY_CREATED', 'Enquiry Created'
    ASSIGNMENT_CHANGED = 'ASSIGNMENT_CHANGED', 'Assignment Changed'
    STATUS_UPDATED = 'STATUS_UPDATED', 'Status Updated'
    CALL_LOGGED = 'CALL_LOGGED', 'Call Logged'
    NOTE_ADDED = 'NOTE_ADDED', 'Note Added'
    FOLLOWUP_SCHEDULED = 'FOLLOWUP_SCHEDULED', 'Follow-up Scheduled'
    FOLLOWUP_COMPLETED = 'FOLLOWUP_COMPLETED', 'Follow-up Completed'
    ATTACHMENT_UPLOADED = 'ATTACHMENT_UPLOADED', 'Attachment Uploaded'
    CONTACT_UPDATED = 'CONTACT_UPDATED', 'Contact Information Updated'

class ActivityTimeline(models.Model):
    enquiry = models.ForeignKey(Enquiry, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=50, choices=ActivityType.choices)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.activity_type} on {self.enquiry}"

class SavedView(models.Model):
    name = models.CharField(max_length=150)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_views')
    filters_config = models.JSONField(default=dict)
    is_pinned = models.BooleanField(default=False)
    is_shared = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_pinned', 'name']

    def __str__(self):
        return f"SavedView: {self.name} ({self.user.username})"
