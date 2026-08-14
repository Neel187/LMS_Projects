from django.db import models

class Contact(models.Model):
    phone = models.CharField(max_length=30, db_index=True, blank=True, null=True)
    email = models.EmailField(db_index=True, blank=True, null=True)
    first_name = models.CharField(max_length=150, blank=True, default='')
    last_name = models.CharField(max_length=150, blank=True, default='')
    primary_lead_source = models.CharField(max_length=100, default='Manual')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        name = f"{self.first_name} {self.last_name}".strip()
        return name or self.phone or self.email or f"Contact #{self.id}"

    @classmethod
    def get_or_create_deduplicated(cls, phone=None, email=None, first_name='', last_name='', lead_source='Manual'):
        """
        Deduplication logic: Matches existing contact by phone (primary) or email (secondary).
        Updates contact details if existing contact is found.
        """
        contact = None
        if phone:
            contact = cls.objects.filter(phone=phone).first()
        if not contact and email:
            contact = cls.objects.filter(email=email).first()

        if contact:
            updated = False
            if first_name and not contact.first_name:
                contact.first_name = first_name
                updated = True
            if last_name and not contact.last_name:
                contact.last_name = last_name
                updated = True
            if email and not contact.email:
                contact.email = email
                updated = True
            if phone and not contact.phone:
                contact.phone = phone
                updated = True
            if updated:
                contact.save()
            return contact, False
        else:
            contact = cls.objects.create(
                phone=phone,
                email=email,
                first_name=first_name,
                last_name=last_name,
                primary_lead_source=lead_source
            )
            return contact, True
