from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from apps.enquiries.models import Enquiry, EnquiryStatus, LeadSource, ActivityTimeline

class DashboardStatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        today = timezone.now().date()
        start_of_week = today - timedelta(days=today.weekday())
        start_of_month = today.replace(day=1)

        total_enquiries = Enquiry.objects.count()
        today_count = Enquiry.objects.filter(created_at__date=today).count()
        this_week_count = Enquiry.objects.filter(created_at__date__gte=start_of_week).count()
        this_month_count = Enquiry.objects.filter(created_at__date__gte=start_of_month).count()

        status_breakdown = list(Enquiry.objects.values('status').annotate(count=Count('id')))
        source_breakdown = list(Enquiry.objects.values('source').annotate(count=Count('id')))
        campaign_breakdown = list(Enquiry.objects.values('campaign_name').annotate(count=Count('id')).order_by('-count')[:5])
        
        recent_activities = list(ActivityTimeline.objects.values('id', 'activity_type', 'title', 'description', 'created_at')[:10])

        return Response({
            'overview': {
                'total_enquiries': total_enquiries,
                'today_enquiries': today_count,
                'this_week_enquiries': this_week_count,
                'this_month_enquiries': this_month_count,
            },
            'status_breakdown': status_breakdown,
            'source_breakdown': source_breakdown,
            'campaign_performance': campaign_breakdown,
            'recent_activities': recent_activities
        })
