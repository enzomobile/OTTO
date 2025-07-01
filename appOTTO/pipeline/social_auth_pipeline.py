from appOTTO.models import Usuario

def associar_campos_personalizados(strategy, details, backend, user=None, *args, **kwargs):
    if user:
        return {'user': user}

    if backend.name == 'google-oauth2':
        email = details.get('email')
        nome = details.get('first_name', '') + ' ' + details.get('last_name', '')

        if email:
            usuario = Usuario.objects.filter(email_usuario=email).first()
            if not usuario:
                usuario = Usuario.objects.create_user(
                    email_usuario=email,
                    nome_usuario=nome or 'Usuário Google'
                )
            return {'user': usuario}