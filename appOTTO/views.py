from django.shortcuts import render, redirect
from .models import Usuario, MensagemSuporte
from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth import views as auth_views
from django.core.mail import send_mail
from django.conf import settings

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
            return redirect('configurações')  # Continua na página de configurações

@login_required
def enviar_suporte(request):
    if request.method == 'POST':
        usuario = request.user
        assunto = request.POST.get('assunto_usuario')
        mensagem = request.POST.get('mensagem_usuario')

        MensagemSuporte.objects.create(
            usuario=request.user,
            nome_usuario=usuario.nome_usuario,
            email_usuario=usuario.email_usuario,
            assunto_usuario=assunto,
            mensagem_usuario=mensagem
        )

        corpo_email_admin = f"""
        Nova mensagem de suporte recebida:
        Nome: {usuario.nome_usuario}
        E-mail: {usuario.email_usuario}
        Assunto: {assunto}
        Mensagem:
        {mensagem}
        """

        send_mail(
            subject=f"[SUPORTE] {assunto}",
            message=corpo_email_admin,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.EMAIL_HOST_USER],
            fail_silently=False,
        )

        corpo_email_usuario = f"""
        Olá {usuario.nome_usuario},
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
            recipient_list=[usuario.email_usuario],
            fail_silently=False,
        )

        return redirect('configurações')
    else:
        messages.error(request, "Método inválido para enviar suporte.")
        return redirect('configurações')

def logout(request):
    auth_logout(request)
    return redirect('home')

@login_required
def config(request):
    return render(request, 'appOTTO/configuracoes.html')

@login_required
def dashboard(request):
    return render(request, 'appOTTO/dashboard.html')
