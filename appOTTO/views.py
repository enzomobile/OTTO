from django.shortcuts import render, redirect
from .models import Usuario
from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth import views as auth_views

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

def logout(request):
    auth_logout(request)
    return redirect('home')

@login_required
def dashboard(request):
    return render(request, 'appOTTO/dashboard.html')
