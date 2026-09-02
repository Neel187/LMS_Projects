from django.db import models
from django.conf import settings

class MetaAccount(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='meta_accounts')
    facebook_user_id = models.CharField(max_length=100)
    access_token = models.TextField()
    token_expires_at = models.DateTimeField(null=True, blank=True)
    connected_pages = models.JSONField(default=list, blank=True)
    selected_page_ids = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"MetaAccount ({self.facebook_user_id}) - {self.user.email}"

class MetaLeadSyncLog(models.Model):
    page_id = models.CharField(max_length=100, blank=True, default='')
    form_id = models.CharField(max_length=100, blank=True, default='')
    leadgen_id = models.CharField(max_length=100, db_index=True)
    status = models.CharField(max_length=50, default='SUCCESS')
    error_message = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"SyncLog leadgen #{self.leadgen_id} ({self.status})"
