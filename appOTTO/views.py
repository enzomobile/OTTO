from django.shortcuts import render, redirect
from .models import Usuario
from django.contrib import messages
from django.contrib.auth.hashers import make_password, check_password

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
            messages.error(request, 'Usuário já cadastrado com este e-mail.')
            return redirect('cadastro')
        
        usuario = Usuario(
            nome_usuario=nome,
            email_usuario=email,
            senha_usuario=make_password(senha)
        )
        usuario.save()
        messages.success(request, 'Usuário cadastrado com sucesso!')
        return redirect('login')

    return render(request, 'appOTTO/cadastro.html')

def login(request):
    return render(request, 'appOTTO/login.html')
