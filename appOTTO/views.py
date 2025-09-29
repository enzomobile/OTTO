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
from django.urls import reverse
from django.utils.crypto import get_random_string
from django.utils import timezone


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

        request.session['nome_usuario'] = nome_usuario
        request.session['nome_completo'] = nome_completo
        request.session['email_usuario'] = email
        request.session['senha'] = senha

        # Cria um token, ele é passado para o link de verificação então só dá para autenticar se você acessar o link enviado no e-mail.
        token = get_random_string(length=32)
        verification_link = request.build_absolute_uri(reverse('verificar_email', args=[token]))

        # Salva o token na session para comparar depois
        request.session['token'] = token

        send_mail(
            'Verifique seu Cadastro',
            f'Clique no link para autenticar seu E-mail: {verification_link}',
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )

        messages.success(request, "Verifique sua caixa de E-mail!")
        return redirect('cadastro')

    return render(request, 'appOTTO/cadastro.html')

def verificar_email(request, token):
    session_token = request.session.get('token')

    if session_token and session_token == token:
        email_usuario = request.session.get('email_usuario')
        nome_usuario = request.session.get('nome_usuario')
        nome_completo = request.session.get('nome_completo')
        senha = request.session.get('senha')

        Usuario.objects.create_user(
            nome_usuario=nome_usuario,
            nome_completo=nome_completo,
            email_usuario=email_usuario,
            senha=senha
        )

        request.session.flush()

        messages.success(request, "Usuário autenticado com sucesso!")
        return redirect('login')

    messages.error(request, "Ocorreu um Erro.")
    return redirect('cadastro')

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
            return redirect('config')  # Continua na página de config

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

@login_required
def logout(request):
    auth_logout(request)
    return redirect('home')

@login_required
def config(request):
    return render(request, 'appOTTO/configuracoes.html')

@login_required
def dashboard(request):
    return render(request, 'appOTTO/dashboard.html')

@login_required
def redefinir_senha(request):
    if request.method == 'POST':
        usuario = request.user
        senha = request.POST.get('senha')
        confirmar_senha = request.POST.get('confirmarSenha')

        if not senha or not confirmar_senha:
            messages.error(request, "Todos os campos são obrigatórios.")
            return redirect('config')

        if senha != confirmar_senha:
            messages.error(request, "As senhas não coincidem.")
            return redirect('config')

        usuario.set_password(senha)
        usuario.save()

        messages.success(request, "Senha redefinida com sucesso! Faça login novamente.")
        auth_logout(request)
        return redirect('login')

    messages.error(request, "Você só pode redefinir a senha enviando o form.")
    return redirect('config')

@login_required
def fases(request):
    usuario = request.user
    progresso = int(usuario.progresso_usuario)  # garante inteiro

    contexto = {
        "progresso": progresso,
        "fases": range(1, 11)  # fases de 1 a 10
    }
    return render(request, "appOTTO/fases.html", contexto)


FASES = {
    1: {"fase": "Fase 1", "titulo": "Bom dia Otto", "descricao": "de bom dia para o Otto! use o botão de imprimir e junte-o com o de texto para aparecer a seguinte mensagem 'Bom dia Otto!' "},
    2: {"fase": "Fase 2", "titulo": "Fruta favorita", "descricao": "Ajude OTTO a escolher a fruta certa, sua fruta favorita é a Maçã! Crie a variavel fruta e coloque como seu valor de texto 'Maçã' e depois verifique se a fruta é mesma a maçã use o botão 'SE' e compare se fruta = Maçã e se for imprima 'Fruta certa!' e se não 'Fruta errada!'."},
    3: {"fase": "Fase 3", "titulo": "Média do OTTO", "descricao": "Ajude o OTTO a calcular sua média de matemática, ele tirou 7, 8 e 6 em suas notas nessa exata sequência! Crie a variavel 'nota1' como 7, 'nota2' como 8 e 'nota3' como 6, e média como a soma das notas 1, 2, 3, some as duas primeiras notas e depois some com a terceira e utilize a botão de operação de somar uma dentro de outra. Após isso, compare usando o 'SE' média >= a 7 e se for imprima 'Aprovado!' e se não imprima 'Reprovado!'."},
    4: {"fase": "Fase 4", "titulo": "Tentativa e Erro", "descricao": "Ajude o OTTO a acertar o número! comece criando as variaveis 'resposta' e 'tentativa' nessa sequência, defina a resposta como 'Número aleatório (1-4)' e a tentativa como número '1' clique em repetir e coloque para 4 vezes após isso adicione uma verificação 'SE' compare se 'tentativa' é igual a 'resposta' e se for imprimir 'Certo!'. Se não imprima 'Errado!' e logo após defina a variavel 'tentativa' para + 1 adicione o botão de 'Operação' e use a variavel 'tentativa' + 1."},
    5: {"fase": "Fase 5", "titulo": "OTTO e suas compras", "descricao": "OTTO quer comprar 3 óculos novos! crie a variavel 'carrinho' vazio e 'oculos' com valor 1, crie um laço que  se repita 3 vezes onde tenha a seguinte função: obetnha a valor do carinho onde seja o proprio valor do carrinho + o oculos. E logo após faça uma verificação, se carinho for >= a 3 imprima a mensagem 'Carrinho cheio!' e se não 'Ainda há espaço no carrinho!'"},
    6: {"fase": "Fase 6", "titulo": "Hora do banho", "descricao": "OTTO quer tomar seu banho e precisa de sua ajuda! o seu choveiro começa com a temperatura de '30' graus mas ele quer que o seu valor seja de '37' graus, enquanto o chuveiro for diferente do valor ideal faça com que se o chuveiro for maior que o valor ideal o chuveiro diminua 1 grau 'chuveiro = chuveiro - 1' e se o chuveiro for menos que o valor ideal dimua 1 grau 'chuveiro = chuveiro -1' após o chuveiro ser igual ao valor o laçõ para e imprima 'Temperatura ideal!'."},
    7: {"fase": "Fase 7", "titulo": "OTTO lanchando", "descricao": "OTTO foi em um restaurante almoçar! OTTO tinha 50 moedas em sua carteira e o lanche custa 15 moedas seu troco deveria ser de 35 meodas, crie uma variavel para a careira do OTTO, para o lanche, reposta e o troca que deverá ser o produto da carteira menos o custo do lanchee depois verificar se o troca for o mesmo valor da resposta imprima a mensagem 'O troco está certo!' e se não 'O troco está errado!'."},
    8: {"fase": "Fase 8", "titulo": "OTTO treinando", "descricao": "OTTO começou a malhar, ajude ele a contar susas repetições! comece inicializando o contador como 0 e depois para vereficar se o OTTO está treinando crie a variavel treino como verdadeiro. Agora vamos verificar o treino do OTTO, se treino for verdadeiro chamar a função 'treinar' para isso temos que criar ela, dentro da função treinar defina que o contador seja ele mesmo somado com 1 e logo apó imprima uma mensagem juntando o texto 'Exercícios feitos:' + a variavel contador."},
    9: {"fase": "Fase 9", "titulo": "Fase 9", "descricao": "Explicação da fase 9"},
    10: {"fase": "Fase 10", "titulo": "Fase 10", "descricao": "Explicação da fase 10"},
}

def pre_fase(request, numero):
    fase = FASES.get(numero)
    if not fase:
        raise Http404("Fase não encontrada")
    # Enviamos o dicionário 'fase' e o 'numero' para o template
    return render(request, "appOTTO/pre_fase.html", {"fase": fase, "numero": numero})

def fase(request, numero):
    if numero not in FASES:
        raise Http404("Fase não encontrada")
    
    request.session["inicio_fase"] = timezone.now().isoformat()

    # Abrimos diretamente o template individual da fase
    template_name = f"appOTTO/jogo/fase{numero}.html"
    return render(request, template_name)

@login_required
def concluir_fase(request, numero):
    usuario = request.user
    progresso = usuario.progresso_usuario  # <-- agora usa progresso_usuario

    # Recupera o horário salvo no início da fase
    inicio_str = request.session.get("inicio_fase")
    if inicio_str:
        inicio = timezone.datetime.fromisoformat(inicio_str)
        fim = timezone.now()
        tempo_total = fim - inicio
        minutos, segundos = divmod(tempo_total.seconds, 60)
        tempo_formatado = f"{minutos} min {segundos} s"
    else:
        tempo_formatado = "Não registrado"

    # Atualiza progresso apenas se o usuário ainda não tiver concluído essa fase
    if progresso < numero:
        usuario.progresso_usuario = numero
        usuario.save()

    contexto = {
        "usuario": usuario.nome_usuario,  # seu modelo usa nome_usuario
        "fase": numero,
        "tempo": tempo_formatado,
        "progresso": usuario.progresso_usuario,  # para exibir na tela
    }
    return render(request, "appOTTO/pos_fase.html", contexto)

@login_required
def pos_fase(request):
    return render(request, 'appOTTO/pos_fase.html')