from django.contrib.auth.forms import PasswordResetForm
from .models import Usuario

class customPasswordResetForm(PasswordResetForm):
    def get_users(self, email):
        active_users = Usuario.objects.filter(email_usuario=email, is_active=True)
        return (u for u in active_users if u.has_usable_password())
