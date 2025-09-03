from django.shortcuts import render, redirect
from .models import Usuario, MensagemSuporte
from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from .models import MensagemSuporte
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import views as auth_views
from django.core.mail import send_mail
from django.conf import settings
from django.core.mail import EmailMultiAlternatives

# Classe para redirecionar o usuário para a tela login após completar o reset de senha.
class CustomPasswordResetCompleteView(auth_views.PasswordResetCompleteView):
    def get(self, request, *args, **kwargs):
        messages.success(request, "Senha alterada com sucesso! Faça login.")
        return redirect('login')

# Métodos Views.
def home(request):
    return render(request, 'appOTTO/home.html')

def cadastro(request):
    if request.method == 'POST':
        nome_completo = request.POST.get('nome_completo')
        nome_usuario = request.POST.get('nome_usuario')
        email = request.POST.get('email_usuario')
        senha = request.POST.get('senha')
        confirmar_senha = request.POST.get('confirmar_senha')

        if not nome_completo or not nome_usuario or not email or not senha or not confirmar_senha:
            messages.error(request, "Todos os campos são obrigatórios.")
            return redirect('cadastro')

        if senha != confirmar_senha:
            messages.error(request, "As senhas não coincidem.")
            return redirect('cadastro')

        if Usuario.objects.filter(email_usuario=email).exists():
            messages.error(request, "Usuário já cadastrado com este e-mail.")
            return redirect('cadastro')

        if Usuario.objects.filter(nome_usuario=nome_usuario).exists():
            messages.error(request, "Nome de usuário já está em uso.")
            return redirect('cadastro')

        Usuario.objects.create_user(
            email_usuario=email,
            nome_usuario=nome_usuario,
            nome_completo=nome_completo,
            senha=senha
        )

        messages.success(request, "Cadastro realizado com sucesso! Faça login.")
        return redirect('login')

    return render(request, 'appOTTO/cadastro.html')

def login(request):
    if request.method == 'POST':
        email = request.POST.get('email_usuario')
        senha = request.POST.get('senha_usuario')

        usuario = authenticate(request, username=email, password=senha)

        if usuario is not None:
            auth_login(request, usuario)
            return redirect('dashboard')
        else:
            messages.error(request, "Usuário ou senha inválidos.")
            return redirect('login')

    return render(request, 'appOTTO/login.html')

@login_required
def deletar_conta(request):
    user = request.user
    if request.method == 'POST':
        try:
            user.delete()
            messages.success(request, "Sua conta foi deletada com sucesso.")
            return redirect('home')  # Redireciona para 'home' após exclusão
        except:
            messages.error(request, "Não foi possível excluir a conta. Tente novamente.")
            return redirect('config')  # Continua na página de configurações

@login_required
def enviar_suporte(request):
    if request.method == 'POST':
        usuario = request.user
        assunto = request.POST.get('assunto')
        mensagem = request.POST.get('mensagem')

        MensagemSuporte.objects.create(
            usuario=request.user,
            nome_usuario=usuario.nome_usuario,
            email_usuario=usuario.email_usuario,
            assunto_usuario=assunto,
            mensagem_usuario=mensagem
        )

        corpo_email_admin_html = f"""
                                    <html>
                                        <body style="font-family: Arial, sans-serif; color: #333;">
                                            <h2 style="color: #2c3e50;">Nova mensagem de suporte recebida:</h2>
                                            <p><strong>Nome:</strong> {usuario.nome_usuario}</p>
                                            <p><strong>E-mail:</strong> {usuario.email_usuario}</p>
                                            <p><strong>Assunto:</strong> {assunto}</p>
                                            <p><strong>Mensagem:</strong><br>{mensagem}</p>
                                        </body>
                                    </html>
                                    """

        email_admin = EmailMultiAlternatives(
            subject=f"[SUPORTE] {assunto}",
            body="Nova mensagem de suporte recebida.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[settings.EMAIL_HOST_USER]
        )
        email_admin.attach_alternative(corpo_email_admin_html, "text/html")
        email_admin.send()

        corpo_email_usuario = f"""
                                    <html>
                                        <center>
                                        <body style="font-family: Arial, sans-serif; color: #333;">
                                            <h1 style="color: #2c3e50;">Olá, <strong>{usuario.nome_usuario}</strong>!</h1>
                                            <h2>Recebemos sua mensagem de suporte com o seguinte conteúdo:</h2>
                                            <p><strong>Assunto:</strong> {assunto}</p>
                                            <p><strong>Sua mensagem:</strong> {mensagem}</p><br>
                                            <p>Nossa equipe entrará em contato em breve.</p>
                                            <p>Atenciosamente, <strong>Suporte OTTO</strong></p>
                                        </body>
                                        </center>
                                    </html>
                                """
        email = EmailMultiAlternatives(
            subject="Confirmação de recebimento - Suporte OTTO",
            body="Recebemos sua mensagem de suporte. Nossa equipe entrará em contato em breve.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[usuario.email_usuario],
        )
        email.attach_alternative(corpo_email_usuario, "text/html")
        email.send()

        return redirect('config')
    else:
        messages.error(request, "Método inválido para enviar suporte.")
        return redirect('config')

def logout(request):
    auth_logout(request)
    return redirect('home')

@login_required
def config(request):
    return render(request, 'appOTTO/configuracoes.html')

@login_required
def dashboard(request):
    return render(request, 'appOTTO/dashboard.html')

def configurações(request):
    return render(request, 'appOTTO/configurações.html')

@login_required
def redefinir_senha(request):
    if request.method == 'POST':
        email = request.POST.get('email_usuario')
        confirmar_email = request.POST.get('confirmar_email_usuario')
        senha = request.POST.get('senha_usuario')
        confirmar_senha = request.POST.get('confirmar_senha_usuario')

        # Verifica se todos os campos estão preenchidos
        if not email or not confirmar_email or not senha or not confirmar_senha:
            messages.error(request, "Todos os campos são obrigatórios.")
            return redirect('configurações')

        # Confere se os emails e senhas coincidem
        if email != confirmar_email:
            messages.error(request, "Os emails não coincidem.")
            return redirect('configurações')

        if senha != confirmar_senha:
            messages.error(request, "As senhas não coincidem.")
            return redirect('configurações')

        # Verifica se o email pertence ao usuário logado
        usuario = request.user
        if usuario.email_usuario != email:
            messages.error(request, "O email informado não corresponde ao seu cadastro.")
            return redirect('configurações')

        # Atualiza a senha com segurança
        usuario.set_password(senha)
        usuario.save()

        messages.success(request, "Senha redefinida com sucesso! Faça login novamente.")
        return redirect('login')

    # Se não for POST, mantém na página de configurações
    return redirect('configurações')

@login_required
def deletar_conta(request):
    user = request.user
    if request.method == 'POST':
        try:
            user.delete()
            messages.success(request, "Sua conta foi deletada com sucesso.")
            return redirect('home')  # Redireciona para 'home' após exclusão
        except:
            messages.error(request, "Não foi possível excluir a conta. Tente novamente.")
            return redirect('configurações')  # Continua na página de configurações
    return redirect('configurações')


@login_required  # opcional, se só usuários logados podem enviar
def enviar_suporte(request):
    if request.method == 'POST':
        nome = request.POST.get('nome_usuario')
        email = request.POST.get('email_usuario')
        assunto = request.POST.get('assunto_usuario')
        mensagem = request.POST.get('mensagem_usuario')

        # 1. Salvar no banco
        MensagemSuporte.objects.create(
            usuario=request.user,
            nome_usuario=nome,
            email_usuario=email,
            assunto_usuario=assunto,
            mensagem_usuario=mensagem
        )

        # 2. Enviar email para o admin
        corpo_email_admin = f"""
        Nova mensagem de suporte recebida:

        Nome: {nome}
        E-mail: {email}
        Assunto: {assunto}
        Mensagem:
        {mensagem}
        """

        send_mail(
            subject=f"[SUPORTE] {assunto}",
            message=corpo_email_admin,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.EMAIL_HOST_USER],  # Admin recebe
            fail_silently=False,
        )

        # 3. Enviar cópia para o usuário
        corpo_email_usuario = f"""
        Olá {nome},

        Recebemos sua mensagem de suporte com o seguinte conteúdo:

        Assunto: {assunto}
        Mensagem:
        {mensagem}

        Nossa equipe entrará em contato em breve.

        Atenciosamente,
        Suporte OTTO
        """

        send_mail(
            subject="Confirmação de recebimento - Suporte OTTO",
            message=corpo_email_usuario,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],  # Envia para o usuário
            fail_silently=False,
        )

        # Redireciona para a página de configurações
        return redirect('configurações')

    return render(request, 'configurações.html')
@login_required
def fases(request):
    return render(request, 'appOTTO/fases.html')
