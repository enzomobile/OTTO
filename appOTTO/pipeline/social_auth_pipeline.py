from appOTTO.models import Usuario
from django.utils.text import slugify

def associar_campos_personalizados(strategy, details, backend, user=None, *args, **kwargs):
    if user:
        return {'user': user}

    if backend.name == 'google-oauth2':
        email = details.get('email')
        nome = (details.get('first_name', '') + ' ' + details.get('last_name', '')).strip() or 'Usuário Google'

        if email:
            usuario = Usuario.objects.filter(email_usuario=email).first()

            # Cria um nome de usuário único
            base_username = slugify(nome) or email.split('@')[0]
            nome_usuario = base_username
            contador = 1
            while Usuario.objects.filter(nome_usuario=nome_usuario).exists():
                nome_usuario = f"{base_username}{contador}"
                contador += 1

            if not usuario:
                usuario = Usuario.objects.create_user(
                    email_usuario=email,
                    nome_completo=nome,
                    nome_usuario=nome_usuario
                )
            return {'user': usuario}