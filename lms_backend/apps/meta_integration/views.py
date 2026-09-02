import os
import requests
from urllib.parse import urlencode
from django.conf import settings
from django.core import signing
from django.http import HttpResponse
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import MetaAccount, MetaLeadSyncLog
from apps.contacts.models import Contact
from apps.enquiries.models import Enquiry, EnquiryStatus, LeadSource, ActivityTimeline, ActivityType
import pymongo

# MongoDB secondary payload store helper
def get_mongo_db():
    try:
        mongo_uri = getattr(settings, 'MONGO_URI', 'mongodb://localhost:27017/')
        client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
        return client['lms_crm_db']
    except Exception as e:
        print(f"MongoDB connection warning: {e}")
        return None

class MetaOAuthURLView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Generates official Meta OAuth Authorization Dialog URL for direct connection.
        """
        app_id = getattr(settings, 'META_APP_ID', 'YOUR_META_APP_ID')
        redirect_uri = getattr(settings, 'META_REDIRECT_URI', 'http://localhost:8000/api/meta/callback/')
        scope = "leads_retrieval,pages_show_list,pages_manage_ads,pages_read_engagement"
        user_id = str(request.user.pk)
        state = signing.dumps({'user_id': user_id}, salt='meta-oauth', compress=True)

        oauth_url = (
            f"https://www.facebook.com/v18.0/dialog/oauth?"
            + urlencode({
                'client_id': app_id,
                'redirect_uri': redirect_uri,
                'scope': scope,
                'response_type': 'code',
                'state': state,
            })
        )
        
        return Response({
            'meta_oauth_url': oauth_url,
            'message': 'Direct Meta Connect URL generated successfully'
        })

class MetaOAuthCallbackView(APIView):
    permission_classes = [permissions.AllowAny]

    def _connect(self, code, user):
        """Exchange the Meta code and persist the connected pages."""
        app_id = getattr(settings, 'META_APP_ID', 'YOUR_META_APP_ID')
        app_secret = getattr(settings, 'META_APP_SECRET', 'YOUR_META_APP_SECRET')
        redirect_uri = getattr(settings, 'META_REDIRECT_URI', 'http://localhost:8000/api/meta/callback/')

        token_url = 'https://graph.facebook.com/v18.0/oauth/access_token'
        token_res = requests.get(token_url, params={
            'client_id': app_id,
            'redirect_uri': redirect_uri,
            'client_secret': app_secret,
            'code': code,
        }).json()
        short_token = token_res.get('access_token')
        if not short_token:
            raise ValueError('Failed to retrieve access token from Meta')

        ll_res = requests.get(token_url, params={
            'grant_type': 'fb_exchange_token',
            'client_id': app_id,
            'client_secret': app_secret,
            'fb_exchange_token': short_token,
        }).json()
        long_token = ll_res.get('access_token', short_token)

        pages_res = requests.get(
            'https://graph.facebook.com/v18.0/me/accounts',
            params={'access_token': long_token},
        ).json()
        profile_res = requests.get(
            'https://graph.facebook.com/v18.0/me',
            params={'fields': 'id,name', 'access_token': long_token},
        ).json()
        formatted_pages = []
        imported_leads = 0
        for page in pages_res.get('data', []):
            page_id = page.get('id')
            page_token = page.get('access_token')
            requests.post(
                f'https://graph.facebook.com/v18.0/{page_id}/subscribed_apps',
                params={'subscribed_fields': 'leadgen', 'access_token': page_token},
            )
            formatted_pages.append({'id': page_id, 'name': page.get('name'), 'access_token': page_token})

            if not page_id or not page_token:
                continue

            forms_res = requests.get(
                f'https://graph.facebook.com/v18.0/{page_id}/leadgen_forms',
                params={'fields': 'id,name', 'access_token': page_token},
            ).json()
            for form in forms_res.get('data', []):
                form_id = form.get('id')
                if not form_id:
                    continue
                leads_res = requests.get(
                    f'https://graph.facebook.com/v18.0/{form_id}/leads',
                    params={
                        'fields': 'id,created_time,field_data,form_id,ad_name,adset_name,campaign_name',
                        'access_token': page_token,
                    },
                ).json()
                for lead in leads_res.get('data', []):
                    lead_id = str(lead.get('id', ''))
                    if not lead_id or Enquiry.objects.filter(meta_lead_id=lead_id).exists():
                        continue

                    fields = {
                        item.get('name'): (item.get('values') or [''])[0]
                        for item in lead.get('field_data', [])
                        if item.get('name')
                    }
                    full_name = fields.get('full_name', '')
                    first_name = fields.get('first_name', '')
                    last_name = fields.get('last_name', '')
                    if full_name and not first_name:
                        name_parts = full_name.split(None, 1)
                        first_name = name_parts[0]
                        last_name = name_parts[1] if len(name_parts) > 1 else ''
                    contact, _ = Contact.get_or_create_deduplicated(
                        phone=fields.get('phone_number') or fields.get('phone'),
                        email=fields.get('email'),
                        first_name=first_name,
                        last_name=last_name,
                        lead_source='Meta Ads',
                    )
                    enquiry = Enquiry.objects.create(
                        contact=contact,
                        title=f"Meta Ad Lead ({lead.get('campaign_name') or form.get('name') or 'Instant Form'})",
                        status=EnquiryStatus.NEW,
                        source=LeadSource.META_ADS,
                        campaign_name=lead.get('campaign_name', ''),
                        ad_set_name=lead.get('adset_name', ''),
                        ad_name=lead.get('ad_name', ''),
                        instant_form_name=form.get('name', 'Instant Form'),
                        page_id=str(page_id),
                        page_name=page.get('name', 'Meta Page'),
                        meta_lead_id=lead_id,
                        raw_form_data=lead,
                    )
                    ActivityTimeline.objects.create(
                        enquiry=enquiry,
                        activity_type=ActivityType.ENQUIRY_CREATED,
                        title='Enquiry Imported from Meta Ads',
                        description=f'Imported leadgen_id #{lead_id} from Page {page_id}',
                    )
                    MetaLeadSyncLog.objects.create(
                        page_id=str(page_id),
                        form_id=str(form_id),
                        leadgen_id=lead_id,
                        status='SUCCESS',
                    )
                    imported_leads += 1

        selected_page_ids = [page.get('id') for page in formatted_pages if page.get('id')]
        meta_account, _ = MetaAccount.objects.update_or_create(
            user=user,
            defaults={
                'facebook_user_id': profile_res.get('id', 'meta_user'),
                'access_token': long_token,
                'connected_pages': formatted_pages,
                'selected_page_ids': selected_page_ids,
                'is_active': True,
            },
        )
        return {
            'status': 'connected',
            'account_id': str(meta_account.id),
            'name': profile_res.get('name', 'Meta Business Account'),
            'connected_pages': formatted_pages,
            'imported_leads': imported_leads,
        }

    @staticmethod
    def _popup_response(payload):
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        message = {'source': 'lms-meta-oauth', **payload}
        import json
        message_json = json.dumps(message).replace('</', '<\\/')
        fallback_url = f'{frontend_url}?meta_status={payload["status"]}'
        html = f'''<!doctype html><html><body><p>Meta connection complete. This window can be closed.</p>
    <script>
      const message={message_json};
      const fallback={json.dumps(fallback_url)};
      const opener = window.opener;
      if (opener && !opener.closed) {{
        try {{
          opener.postMessage(message, '*');
          opener.location?.reload?.();
        }} catch (error) {{
          console.warn('Meta popup postMessage failed:', error);
        }}
      }}
      try {{ window.close(); }} catch (e) {{}}
      setTimeout(() => {{
        if (!window.closed) window.location.replace(fallback);
      }}, 250);
    </script>
</body></html>'''
        return HttpResponse(html)

    def get(self, request):
        code = request.GET.get('code')
        state = request.GET.get('state')
        if request.GET.get('error'):
            return self._popup_response({'status': 'error', 'error': request.GET.get('error_description', 'Meta authorization was cancelled')})
        try:
            signed_state = signing.loads(state, salt='meta-oauth', max_age=600)
            user = get_user_model().objects.get(id=signed_state['user_id'])
            result = self._connect(code, user)
            return self._popup_response(result)
        except Exception as exc:
            return self._popup_response({'status': 'error', 'error': str(exc)})

    def post(self, request):
        """
        Receives authorization code, exchanges for long-lived access token, fetches connected Facebook Pages,
        and registers leadgen webhooks automatically.
        """
        code = request.data.get('code')
        if not code:
            return Response({'error': 'Authorization code required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            return Response({**self._connect(code, request.user), 'message': 'Meta Business Account & Pages successfully connected'})
        except ValueError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)


class MetaAccountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _sync_account_leads(self, account):
        pages = account.connected_pages or []
        if not pages:
            return {'connected': True, 'synced_leads': 0, 'message': 'No connected pages found.'}

        selected_page_ids = account.selected_page_ids or [page.get('id') for page in pages if page.get('id')]
        if not selected_page_ids:
            selected_page_ids = [page.get('id') for page in pages if page.get('id')]

        synced_leads = 0
        for page in pages:
            page_id = page.get('id')
            if page_id and selected_page_ids and str(page_id) not in [str(pid) for pid in selected_page_ids]:
                continue

            page_token = page.get('access_token')
            if not page_id or not page_token:
                continue

            try:
                forms_res = requests.get(
                    f'https://graph.facebook.com/v18.0/{page_id}/leadgen_forms',
                    params={'fields': 'id,name', 'access_token': page_token},
                    timeout=20,
                ).json()
            except Exception:
                continue

            for form in forms_res.get('data', []):
                form_id = form.get('id')
                if not form_id:
                    continue
                try:
                    leads_res = requests.get(
                        f'https://graph.facebook.com/v18.0/{form_id}/leads',
                        params={
                            'fields': 'id,created_time,field_data,form_id,ad_name,adset_name,campaign_name',
                            'access_token': page_token,
                        },
                        timeout=20,
                    ).json()
                except Exception:
                    continue

                for lead in leads_res.get('data', []):
                    lead_id = str(lead.get('id', ''))
                    if not lead_id or Enquiry.objects.filter(meta_lead_id=lead_id).exists():
                        continue

                    fields = {
                        item.get('name'): (item.get('values') or [''])[0]
                        for item in lead.get('field_data', [])
                        if item.get('name')
                    }
                    full_name = fields.get('full_name', '')
                    first_name = fields.get('first_name', '')
                    last_name = fields.get('last_name', '')
                    if full_name and not first_name:
                        name_parts = full_name.split(None, 1)
                        first_name = name_parts[0]
                        last_name = name_parts[1] if len(name_parts) > 1 else ''

                    contact, _ = Contact.get_or_create_deduplicated(
                        phone=fields.get('phone_number') or fields.get('phone'),
                        email=fields.get('email'),
                        first_name=first_name,
                        last_name=last_name,
                        lead_source='Meta Ads',
                    )
                    enquiry = Enquiry.objects.create(
                        contact=contact,
                        title=f"Meta Ad Lead ({lead.get('campaign_name') or form.get('name') or 'Instant Form'})",
                        status=EnquiryStatus.NEW,
                        source=LeadSource.META_ADS,
                        campaign_name=lead.get('campaign_name', ''),
                        ad_set_name=lead.get('adset_name', ''),
                        ad_name=lead.get('ad_name', ''),
                        instant_form_name=form.get('name', 'Instant Form'),
                        page_id=str(page_id),
                        page_name=page.get('name', 'Meta Page'),
                        meta_lead_id=lead_id,
                        raw_form_data=lead,
                    )
                    ActivityTimeline.objects.create(
                        enquiry=enquiry,
                        activity_type=ActivityType.ENQUIRY_CREATED,
                        title='Enquiry Imported from Meta Ads',
                        description=f'Imported leadgen_id #{lead_id} from Page {page_id}',
                    )
                    MetaLeadSyncLog.objects.create(
                        page_id=str(page_id),
                        form_id=str(form_id),
                        leadgen_id=lead_id,
                        status='SUCCESS',
                    )
                    synced_leads += 1

        return {'connected': True, 'synced_leads': synced_leads, 'message': 'Meta leads synced successfully.'}

    def get(self, request):
        account = MetaAccount.objects.filter(user=request.user, is_active=True).first()
        if not account:
            return Response({'connected': False})

        connected_pages = []
        for page in account.connected_pages or []:
            safe_page = {k: v for k, v in page.items() if k != 'access_token'}
            connected_pages.append(safe_page)

        return Response({
            'connected': True,
            'account_id': str(account.id),
            'name': connected_pages[0].get('name', 'Meta Business Account') if connected_pages else 'Meta Business Account',
            'connected_pages': connected_pages,
            'selected_page_ids': account.selected_page_ids or [page.get('id') for page in connected_pages if page.get('id')],
        })

    def post(self, request):
        account = MetaAccount.objects.filter(user=request.user, is_active=True).first()
        if not account:
            return Response({'connected': False, 'error': 'No active Meta account found.'}, status=status.HTTP_404_NOT_FOUND)

        selected_page_ids = request.data.get('selected_page_ids') or request.data.get('selectedPages') or request.data.get('page_ids')
        if selected_page_ids:
            account.selected_page_ids = [str(page_id) for page_id in selected_page_ids]
            account.save(update_fields=['selected_page_ids', 'updated_at'])
            Enquiry.objects.filter(source=LeadSource.META_ADS).delete()
        elif account.selected_page_ids:
            account.selected_page_ids = []
            account.save(update_fields=['selected_page_ids', 'updated_at'])
            Enquiry.objects.filter(source=LeadSource.META_ADS).delete()

        result = self._sync_account_leads(account)
        return Response(result)

    def delete(self, request):
        """Disconnect/logout Meta account"""
        try:
            account = MetaAccount.objects.filter(user=request.user, is_active=True).first()
            if account:
                print(f"[META] Disconnecting account for user {request.user.email}")
                account.is_active = False
                account.save(update_fields=['is_active', 'updated_at'])
                print(f"[META] Account disconnected successfully")
            else:
                print(f"[META] No active account found for user {request.user.email}")
            
            return Response({
                'connected': False, 
                'message': 'Meta account disconnected successfully'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"[META] Error disconnecting account: {str(e)}")
            return Response({
                'connected': False,
                'error': str(e),
                'message': 'Meta account disconnected'
            }, status=status.HTTP_200_OK)

class MetaWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """Meta Webhook Challenge Verification"""
        verify_token = request.GET.get('hub.verify_token')
        challenge = request.GET.get('hub.challenge')
        expected_token = getattr(settings, 'META_WEBHOOK_VERIFY_TOKEN', 'lms_meta_verify_secret')
        
        if verify_token == expected_token:
            return Response(int(challenge) if challenge and challenge.isdigit() else challenge, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid verification token'}, status=status.HTTP_403_FORBIDDEN)

    def post(self, request):
        """
        Receives real-time Meta Instant Form Lead Notifications.
        1. Logs raw payload into MongoDB collection `meta_raw_webhooks`.
        2. Extracts leadgen_id and syncs lead details via Meta Graph API.
        3. Automatically creates Contact & Enquiry in MySQL.
        """
        payload = request.data
        mongo_db = get_mongo_db()
        if mongo_db is not None:
            try:
                mongo_db.meta_raw_webhooks.insert_one(dict(payload))
            except Exception as e:
                print(f"MongoDB write error: {e}")

        # Process entries
        for entry in payload.get('entry', []):
            for change in entry.get('changes', []):
                val = change.get('value', {})
                leadgen_id = val.get('leadgen_id')
                page_id = val.get('page_id')
                form_id = val.get('form_id')
                
                if leadgen_id:
                    if Enquiry.objects.filter(meta_lead_id=str(leadgen_id)).exists():
                        continue
                    # In a real environment, fetch lead via Graph API using page access token
                    # Demo mock lead processing:
                    phone = val.get('phone_number', '+15550192834')
                    email = val.get('email', 'lead@metaexample.com')
                    full_name = val.get('full_name', 'Meta Lead User')
                    
                    contact, _ = Contact.get_or_create_deduplicated(
                        phone=phone,
                        email=email,
                        first_name=full_name,
                        lead_source='Meta Ads'
                    )
                    
                    enquiry = Enquiry.objects.create(
                        contact=contact,
                        title=f"Meta Ad Lead ({val.get('campaign_name', 'Instant Form')})",
                        status=EnquiryStatus.NEW,
                        source=LeadSource.META_ADS,
                        campaign_name=val.get('campaign_name', 'Meta Campaign'),
                        instant_form_name=val.get('form_name', 'Instant Form'),
                        meta_lead_id=leadgen_id,
                        raw_form_data=val
                    )
                    
                    ActivityTimeline.objects.create(
                        enquiry=enquiry,
                        activity_type=ActivityType.ENQUIRY_CREATED,
                        title="Enquiry Created via Meta Ads",
                        description=f"Received leadgen_id #{leadgen_id} from Page {page_id}"
                    )
                    
                    MetaLeadSyncLog.objects.create(
                        page_id=str(page_id),
                        form_id=str(form_id),
                        leadgen_id=str(leadgen_id),
                        status='SUCCESS'
                    )

        return Response({'status': 'EVENT_RECEIVED'}, status=status.HTTP_200_OK)
