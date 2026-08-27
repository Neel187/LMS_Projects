import uuid
from urllib.parse import parse_qs, urlparse

from django.core import signing
from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from apps.authentication.models import User
from apps.meta_integration.views import MetaOAuthURLView


class MetaOAuthURLViewTests(TestCase):
    def test_oauth_state_uses_string_user_id_for_uuid_serialization(self):
        user = User(
            id=uuid.uuid4(),
            first_name='Meta',
            last_name='Tester',
            email='meta-tester@example.com',
            mobile='9999999999',
            role=User.Role.EMPLOYEE,
        )

        factory = APIRequestFactory()
        request = factory.get('/api/meta/oauth-url/')
        force_authenticate(request, user=user)

        response = MetaOAuthURLView.as_view()(request)

        self.assertEqual(response.status_code, 200)
        oauth_url = response.data['meta_oauth_url']
        query_params = parse_qs(urlparse(oauth_url).query)
        state = query_params['state'][0]

        payload = signing.loads(state, salt='meta-oauth', max_age=600)
        self.assertEqual(payload['user_id'], str(user.id))
        self.assertIsInstance(payload['user_id'], str)
