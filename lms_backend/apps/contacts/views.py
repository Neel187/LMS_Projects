from rest_framework import viewsets, permissions, filters
from apps.contacts.models import Contact
from apps.enquiries.serializers import ContactSerializer

class ContactViewSet(viewsets.ReadOnlyModelViewSet):
    """
    1. Contact (Read-Only Module)
    Acts as master repository of unique contacts.
    """
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'phone', 'email']
