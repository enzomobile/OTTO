from django.shortcuts import render, redirect
from .models import Usuario
from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required


# Métodos Views.
def home(request):
    return render(request, 'appOTTO/home.html')

def cadastro(request):
    if request.method == 'POST':
        nome = request.POST.get('nome_usuario')
        email = request.POST.get('email_usuario')
        senha = request.POST.get('senha_usuario')

        if not nome or not email or not senha:
            messages.error(request, "Todos os campos são obrigatórios.")
            return redirect('cadastro')
        
        if Usuario.objects.filter(email_usuario=email).exists():
            messages.error(request, "Usuário já cadastrado com este e-mail.")
            return redirect('cadastro')
        
        Usuario.objects.create_user(
            nome_usuario=nome,
            email_usuario=email,
            senha=senha
        )

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
