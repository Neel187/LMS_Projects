from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from apps.contacts.models import Contact
from .models import Enquiry, ActivityTimeline, SavedView, EnquiryStatus, ActivityType
from .serializers import ContactSerializer, EnquirySerializer, ActivityTimelineSerializer, SavedViewSerializer

class ContactViewSet(viewsets.ReadOnlyModelViewSet):
    """
    1. Contact (Read-Only Module)
    Acts as the master repository of unique contacts.
    """
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [permissions.AllowAny] # demo mode
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'phone', 'email']

class EnquiryViewSet(viewsets.ModelViewSet):
    """
    2. Enquiries (Primary Working Module)
    Main operational workspace for leads, follow-ups, filters, and smart views.
    """
    queryset = Enquiry.objects.all()
    serializer_class = EnquirySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Enquiry.objects.select_related('contact', 'primary_owner').prefetch_related('secondary_owners').all()
        
        # Smart Views & Multi-condition Filters
        status_param = self.request.query_params.get('status')
        source_param = self.request.query_params.get('source')
        campaign_param = self.request.query_params.get('campaign')
        form_param = self.request.query_params.get('instant_form')
        search_query = self.request.query_params.get('search')
        followup_due = self.request.query_params.get('followup_due') # today, overdue, upcoming

        if status_param:
            qs = qs.filter(status=status_param)
        if source_param:
            qs = qs.filter(source=source_param)
        if campaign_param:
            qs = qs.filter(campaign_name__icontains=campaign_param)
        if form_param:
            qs = qs.filter(instant_form_name__icontains=form_param)
        if search_query:
            qs = qs.filter(
                Q(title__icontains=search_query) |
                Q(contact__first_name__icontains=search_query) |
                Q(contact__last_name__icontains=search_query) |
                Q(contact__phone__icontains=search_query) |
                Q(contact__email__icontains=search_query) |
                Q(campaign_name__icontains=search_query)
            )

        return qs

    def perform_create(self, serializer):
        # Auto deduplicate contact if phone/email supplied
        phone = self.request.data.get('phone')
        email = self.request.data.get('email')
        first_name = self.request.data.get('first_name', '')
        last_name = self.request.data.get('last_name', '')
        
        contact, _ = Contact.get_or_create_deduplicated(
            phone=phone, email=email, first_name=first_name, last_name=last_name, lead_source='Manual'
        )
        enquiry = serializer.save(contact=contact)
        
        # Log Timeline
        ActivityTimeline.objects.create(
            enquiry=enquiry,
            activity_type=ActivityType.ENQUIRY_CREATED,
            title="Enquiry Created",
            description=f"Created enquiry for {contact}"
        )

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        enquiry = self.get_object()
        new_status = request.data.get('status')
        if new_status in EnquiryStatus.values:
            old_status = enquiry.status
            enquiry.status = new_status
            enquiry.save()
            
            ActivityTimeline.objects.create(
                enquiry=enquiry,
                activity_type=ActivityType.STATUS_UPDATED,
                title=f"Status changed to {new_status}",
                description=f"Status updated from {old_status} to {new_status}"
            )
            return Response(EnquirySerializer(enquiry).data)
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        enquiry = self.get_object()
        note = request.data.get('note', '')
        if note:
            enquiry.notes_summary = f"{enquiry.notes_summary}\n\n- {note}".strip()
            enquiry.save()
            
            ActivityTimeline.objects.create(
                enquiry=enquiry,
                activity_type=ActivityType.NOTE_ADDED,
                title="Note Added",
                description=note
            )
            return Response(EnquirySerializer(enquiry).data)
        return Response({'error': 'Note text required'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def schedule_followup(self, request, pk=None):
        enquiry = self.get_object()
        follow_up_date = request.data.get('follow_up_date')
        if follow_up_date:
            enquiry.follow_up_date = follow_up_date
            enquiry.save()
            
            ActivityTimeline.objects.create(
                enquiry=enquiry,
                activity_type=ActivityType.FOLLOWUP_SCHEDULED,
                title="Follow-up Scheduled",
                description=f"Scheduled for {follow_up_date}"
            )
            return Response(EnquirySerializer(enquiry).data)
        return Response({'error': 'Follow-up date required'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def todays_actions(self, request):
        """
        Returns enquiries with follow-ups due today and recent activity.
        Supports user_id query param for role-based filtering.
        """
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)

        # Get the user filter
        user_id = request.query_params.get('user_id')

        # Follow-ups due today
        followup_qs = Enquiry.objects.select_related('contact', 'primary_owner').filter(
            follow_up_date__gte=today_start,
            follow_up_date__lt=today_end
        )

        # Notes/activity from today
        activity_qs = ActivityTimeline.objects.select_related('enquiry', 'enquiry__contact').filter(
            created_at__gte=today_start,
            created_at__lt=today_end
        )

        # Filter by owner if user_id provided
        if user_id:
            followup_qs = followup_qs.filter(primary_owner_id=user_id)
            activity_qs = activity_qs.filter(enquiry__primary_owner_id=user_id)

        return Response({
            'followups': EnquirySerializer(followup_qs, many=True).data,
            'activities': ActivityTimelineSerializer(activity_qs, many=True).data,
            'followup_count': followup_qs.count(),
            'activity_count': activity_qs.count(),
        })

class SavedViewViewSet(viewsets.ModelViewSet):
    queryset = SavedView.objects.all()
    serializer_class = SavedViewSerializer
    permission_classes = [permissions.AllowAny]

