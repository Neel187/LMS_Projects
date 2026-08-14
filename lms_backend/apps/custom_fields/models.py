from django.db import models
from apps.enquiries.models import Enquiry

class CustomFieldType(models.TextChoices):
    TEXT = 'Text', 'Text'
    NUMBER = 'Number', 'Number'
    EMAIL = 'Email', 'Email'
    PHONE = 'Phone', 'Phone'
    DROPDOWN = 'Dropdown', 'Dropdown'
    MULTI_SELECT = 'Multi Select', 'Multi Select'
    CHECKBOX = 'Checkbox', 'Checkbox'
    DATE = 'Date', 'Date'
    DATETIME = 'Date & Time', 'Date & Time'
    CURRENCY = 'Currency', 'Currency'
    URL = 'URL', 'URL'
    LONG_TEXT = 'Long Text', 'Long Text'

class CustomFieldDefinition(models.Model):
    name = models.CharField(max_length=100, unique=True)
    field_key = models.SlugField(max_length=100, unique=True)
    field_type = models.CharField(max_length=30, choices=CustomFieldType.choices, default=CustomFieldType.TEXT)
    options = models.JSONField(default=list, blank=True, help_text="List of string options for Dropdown / Multi Select")
    is_required = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.field_type})"

class EnquiryCustomFieldValue(models.Model):
    enquiry = models.ForeignKey(Enquiry, on_delete=models.CASCADE, related_name='custom_field_values')
    field_definition = models.ForeignKey(CustomFieldDefinition, on_delete=models.CASCADE)
    value_json = models.JSONField(default=dict, blank=True)

    class Meta:
        unique_together = ('enquiry', 'field_definition')

    def __str__(self):
        return f"{self.field_definition.name} for Enquiry #{self.enquiry.id}"
