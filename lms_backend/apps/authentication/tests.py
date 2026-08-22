from django.test import SimpleTestCase

from apps.authentication.views import build_google_mobile


class GoogleMobileGenerationTests(SimpleTestCase):
    def test_google_mobile_stays_within_db_limit(self):
        value = build_google_mobile("abcdefghijklmnopqrstuvwxyz")
        self.assertLessEqual(len(value), 15)
        self.assertTrue(value.startswith("g"))
