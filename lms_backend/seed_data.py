import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_backend.settings')
django.setup()

from django.contrib.auth.models import User
from apps.contacts.models import Contact
from apps.enquiries.models import Enquiry, EnquiryStatus, LeadSource, ActivityTimeline, ActivityType, SavedView
from apps.custom_fields.models import CustomFieldDefinition, CustomFieldType, EnquiryCustomFieldValue
from apps.meta_integration.models import MetaAccount, MetaLeadSyncLog

def seed_all():
    print("Seeding LMS database...")
     
    # 1. Create Admin & Sales Users
    admin_user, _ = User.objects.get_or_create(username='admin', defaults={'email': 'admin@pioneertech.com', 'is_staff': True, 'is_superuser': True})
    admin_user.set_password('admin123')
    admin_user.save()

    sales_user, _ = User.objects.get_or_create(username='john_sales', defaults={'email': 'john@pioneertech.com', 'first_name': 'John', 'last_name': 'Doe'})
    sales_user.set_password('sales123')
    sales_user.save()

    # 2. Create Contacts
    c1, _ = Contact.get_or_create_deduplicated(phone='+971501234567', email='alex.smith@example.com', first_name='Alex', last_name='Smith', lead_source='Meta Ads')
    c2, _ = Contact.get_or_create_deduplicated(phone='+971529876543', email='sarah.khan@example.com', first_name='Sarah', last_name='Khan', lead_source='Meta Ads')
    c3, _ = Contact.get_or_create_deduplicated(phone='+971553334444', email='michael.brown@example.com', first_name='Michael', last_name='Brown', lead_source='CSV Import')
    c4, _ = Contact.get_or_create_deduplicated(phone='+971508889999', email='emily.davis@example.com', first_name='Emily', last_name='Davis', lead_source='Manual')

    # 3. Create Enquiries with Meta Ads data & dynamic payloads
    e1 = Enquiry.objects.create(
        contact=c1,
        title="Dubai Luxury Apartments Enquiry",
        status=EnquiryStatus.NEW,
        source=LeadSource.META_ADS,
        primary_owner=sales_user,
        campaign_name="Dubai Property Expo 2026",
        ad_set_name="Luxury Buyers - UAE",
        ad_name="Penthouse Video Ad #1",
        instant_form_name="Dubai Investment Instant Form",
        meta_lead_id="meta_lead_1001",
        raw_form_data={
            "Investment Budget": "$500k - $1M",
            "Preferred Location": "Downtown Dubai",
            "Property Type": "2 BHK Apartment",
            "Investment Timeline": "Immediate (Under 30 Days)",
            "Nationality": "British"
        },
        notes_summary="Hot lead from Meta Ads instant form. Interested in 2 BHK downtown."
    )

    e2 = Enquiry.objects.create(
        contact=c2,
        title="Villa Investment Enquiry",
        status=EnquiryStatus.CONTACTED,
        source=LeadSource.META_ADS,
        primary_owner=sales_user,
        campaign_name="Dubai Property Expo 2026",
        ad_set_name="High Net Worth - GCC",
        ad_name="Palm Jumeirah Carousel Ad",
        instant_form_name="Dubai Investment Instant Form",
        meta_lead_id="meta_lead_1002",
        raw_form_data={
            "Investment Budget": "$1M - $3M",
            "Preferred Location": "Palm Jumeirah",
            "Property Type": "Sea View Villa",
            "Investment Timeline": "1-3 Months",
            "Nationality": "Emirati"
        },
        notes_summary="Called prospect on Aug 7. Requested brochures via WhatsApp."
    )

    e3 = Enquiry.objects.create(
        contact=c3,
        title="Bulk Import Commercial Space",
        status=EnquiryStatus.QUALIFIED,
        source=LeadSource.BULK_UPLOAD,
        primary_owner=admin_user,
        campaign_name="Q3 Bulk Direct Outreach",
        notes_summary="Verified business owner looking for office space in Business Bay."
    )

    e4 = Enquiry.objects.create(
        contact=c4,
        title="Manual Walk-in Enquiry",
        status=EnquiryStatus.CLOSED,
        source=LeadSource.MANUAL,
        primary_owner=sales_user,
        notes_summary="Signed agreement for Marina Studio apartment."
    )

    # 4. Create Activity Timelines
    ActivityTimeline.objects.create(
        enquiry=e1,
        activity_type=ActivityType.ENQUIRY_CREATED,
        title="Enquiry Ingested from Meta Instant Form",
        description="Lead captured automatically via Webhook from Meta Instant Form 'Dubai Investment Instant Form'",
        performed_by=admin_user
    )

    ActivityTimeline.objects.create(
        enquiry=e2,
        activity_type=ActivityType.CALL_LOGGED,
        title="Outbound Call Logged",
        description="Spoke with Sarah Khan. Interested in beachfront properties. Scheduled follow-up for tomorrow.",
        performed_by=sales_user
    )

    # 5. Create Custom Field Definitions
    cf1, _ = CustomFieldDefinition.objects.get_or_create(name="Investment Budget", field_key="investment_budget", field_type=CustomFieldType.DROPDOWN, options=["Under $500k", "$500k - $1M", "$1M - $3M", "$3M+"])
    cf2, _ = CustomFieldDefinition.objects.get_or_create(name="Preferred Location", field_key="preferred_location", field_type=CustomFieldType.TEXT)
    
    EnquiryCustomFieldValue.objects.create(enquiry=e1, field_definition=cf1, value_json={"value": "$500k - $1M"})
    EnquiryCustomFieldValue.objects.create(enquiry=e1, field_definition=cf2, value_json={"value": "Downtown Dubai"})

    # 6. Create Saved Views
    SavedView.objects.get_or_create(name="Meta Ads Hot Leads", user=admin_user, defaults={'filters_config': {'source': 'Meta Ads', 'status': 'New'}, 'is_pinned': True, 'is_shared': True})
    SavedView.objects.get_or_create(name="My Open Follow-ups", user=sales_user, defaults={'filters_config': {'status': 'Contacted'}, 'is_pinned': True, 'is_shared': False})

    # 7. Create Meta Account Demo Record
    MetaAccount.objects.create(
        user=admin_user,
        facebook_user_id="fb_user_10928374",
        access_token="EAABsb9382103981092830198230198",
        connected_pages=[
            {"id": "page_991823", "name": "Pioneer Real Estate Official"},
            {"id": "page_882910", "name": "Dubai Luxury Living Page"}
        ]
    )

    MetaLeadSyncLog.objects.create(page_id="page_991823", form_id="form_301928", leadgen_id="meta_lead_1001", status="SUCCESS")
    MetaLeadSyncLog.objects.create(page_id="page_991823", form_id="form_301928", leadgen_id="meta_lead_1002", status="SUCCESS")

    print("Database seeding completed successfully!")

if __name__ == '__main__':
    seed_all()
