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
from django.http import Http404


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
            return redirect('home')
        except:
            messages.error(request, "Não foi possível excluir a conta. Tente novamente.")
            return redirect('config')

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

NIVEL = {
    1: {"nivel": "Nivel 1 - Iniciante"},
    2: {"nivel": "Nivel 2 - Bronze"},
    3: {"nivel": "Nivel 3 - Ametista"},
    4: {"nivel": "Nivel 4 - Rubi"},
    5: {"nivel": "Nivel 5 - Diamante"},
    6: {"nivel": "Nivel 6 - Otto"},
}

@login_required
def dashboard(request):
    nivel = NIVEL.get(request.user.nivel_usuario)
    progresso = request.user.progresso_usuario
    fase = FASES.get(progresso + 1)
    progresso = request.user.progresso_usuario * 10
    if not nivel:
        raise Http404("Nivel de usuário inválido.")

    return render(request, 'appOTTO/dashboard.html', {"nivel": nivel, "progresso": progresso, "fase": fase})

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
    progresso = int(usuario.progresso_usuario)

    contexto = {
        "progresso": progresso,
        "fases": range(1, 11)
    }
    return render(request, "appOTTO/fases.html", contexto)

FASES = {
1: {"fase": "1", "titulo": "Bom dia, Otto", "img": "appOTTO/img/cenarios/lv1.png", "descricao": "Dê bom dia para o Otto! Use o botão de imprimir e junte-o com o de texto para aparecer a seguinte mensagem: 'Bom dia, Otto' "},
2: {"fase": "2", "titulo": "Fruta favorita", "img": "appOTTO/img/cenarios/lv2.png", "descricao": "Ajude OTTO a escolher a fruta certa, sua fruta favorita é a Maçã! Crie a variável fruta e coloque como seu valor de texto 'Maçã' e depois verifique se a fruta é mesmo a maçã. Use o botão 'SE' e compare se fruta = Maçã e, se for, imprima 'Fruta certa' e se não 'Fruta errada'."},
3: {"fase": "3", "titulo": "Média do OTTO", "img": "appOTTO/img/cenarios/lv3.png", "descricao": "Ajude o OTTO a calcular sua média de matemática, ele tirou 7, 8 e 6 em suas notas nessa exata sequência! Crie a variável 'nota1' como 7, 'nota2' como 8 e 'nota3' como 6, e média como a soma das notas 1, 2, 3. Some as duas primeiras notas e depois some com a terceira e utilize o botão de operação de somar uma dentro de outra. Após isso, compare usando o 'SE' média >= a 7 e, se for, imprima 'Aprovado' e se não imprima 'Reprovado'."},
4: {"fase": "4", "titulo": "Tentativa e Erro", "img": "appOTTO/img/cenarios/lv4.png", "descricao": "Ajude o OTTO a acertar o número! Comece criando as variáveis 'resposta' e 'tentativa' nessa sequência, defina a resposta como 'Número aleatório (1-4)' e a tentativa como número '1'. Clique em repetir e coloque para 4 vezes. Após isso, adicione uma verificação 'SE', compare se 'tentativa' é igual a 'resposta' e, se for, imprima 'Certo'. Se não, imprima 'Errado' e logo após defina a variável 'tentativa' para + 1. Adicione o botão de 'Operação' e use a variável 'tentativa' + 1."},
5: {"fase": "5", "titulo": "OTTO e suas compras", "img": "appOTTO/img/cenarios/lv5.png", "descricao": "OTTO quer comprar 3 óculos novos! Crie a variável 'carrinho' vazio e 'oculos' com valor 1, crie um laço que se repita 3 vezes onde tenha a seguinte função: obtenha o valor do carrinho onde seja o próprio valor do carrinho + o óculos. E logo após faça uma verificação, se carrinho for >= a 3 imprima a mensagem 'Carrinho cheio' e se não 'Ainda há espaço no carrinho'"},
6: {"fase": "6", "titulo": "Hora do banho", "img": "appOTTO/img/cenarios/lv6.png", "descricao": "OTTO quer tomar seu banho e precisa de sua ajuda! O seu chuveiro começa com a temperatura de '30' graus, mas ele quer que o seu valor seja de '37' graus. Enquanto o chuveiro for diferente do valor ideal, faça com que se o chuveiro for maior que o valor ideal, o chuveiro diminua 1 grau 'chuveiro = chuveiro - 1' e se o chuveiro for menor que o valor ideal aumente 1 grau 'chuveiro = chuveiro + 1'. Após o chuveiro ser igual ao valor, o laço para e imprima 'Temperatura ideal'."},
7: {"fase": "7", "titulo": "OTTO lanchando", "img": "appOTTO/img/cenarios/lv7.png", "descricao": "OTTO foi em um restaurante almoçar! OTTO tinha 50 moedas em sua carteira e o lanche custa 15 moedas. Seu troco deveria ser de 35 moedas. Crie uma variável para a carteira do OTTO, para o lanche, resposta e o troco que deverá ser o produto da carteira menos o custo do lanche. Depois verifique se o troco for o mesmo valor da resposta, imprima a mensagem 'O troco está certo' e se não 'O troco está errado'."},
8: {"fase": "8", "titulo": "OTTO treinando", "img": "appOTTO/img/cenarios/lv8.png", "descricao": "OTTO começou a malhar, ajude ele a contar suas repetições! Comece inicializando o contador como 0 e depois, para verificar se o OTTO está treinando, crie a variável treino como verdadeiro. Agora vamos verificar o treino do OTTO: se treino for verdadeiro, chamar a função 'treinar'. Para isso temos que criá-la. Dentro da função treinar, defina que o contador seja ele mesmo somado com 1 e logo após imprima uma mensagem juntando o texto 'Exercícios feitos:' + a variável contador."},
9: {"fase": "9", "titulo": "Passeio do OTTO", "img": "appOTTO/img/cenarios/lv9.png", "descricao": "OTTO foi passear e anotou em uma lista seus gastos, ajude ele a anotar e analisar os custos! Primeiro OTTO criou uma lista vazia e colocou em uma variável chamada 'contas' e depois ele adicionou todos os seus gastos. Começando pelo sorvete que custou '5' moedas, seu segundo gasto foi comprando uma bola que custou '20' moedas e o terceiro e último foi um lanche por '15' moedas. Agora imprima a variável contas mostrando sua lista de gastos."},
10: {"fase": "10", "titulo": "Apresentação Final", "img": "appOTTO/img/cenarios/lv10.png", "descricao": "OTTO vai fazer sua apresentação! Para que a sua apresentação aconteça, é necessário luzes, música e plateia. Defina elas como variáveis verdadeiras. Logo quando a apresentação começar, o ritmo inicia em 1, e se as luzes E música E plateia existirem, faça com que se repita enquanto o ritmo for menor ou igual a 3. Imprima a mensagem: 'Tocando ritmo ' + a variável plateia. Após isso, some a variável ritmo + 1 e, após o ritmo chegar ao ideal, mostre a mensagem 'Show completo, Todos aplaudam'. Se as condições não estiverem corretas, aparecerá a mensagem 'Algo deu errado, O show não pode começar'."},
}

@login_required
def pre_fase(request, numero):
    usuario = request.user
    progresso = usuario.progresso_usuario
    diferenca = numero - progresso
    fase = FASES.get(numero)
    if not fase:
        raise Http404("Fase não encontrada")
    
    return render(request, "appOTTO/pre_fase.html", {"fase": fase, "numero": numero, "progresso": progresso, "diferenca": diferenca})

@login_required
def fase(request, numero):
    if numero not in FASES:
        raise Http404("Fase não encontrada")
    
    progresso = request.user.progresso_usuario

    if not progresso >= numero - 1:
        messages.error(request, "Você não tem progresso suficiente para acessar esta fase.")
        return redirect('fases')
    
    request.session["inicio_fase"] = timezone.now().isoformat()

    fase = FASES[numero]
    template_name = f"appOTTO/jogo/fase{numero}.html"
    return render(request, template_name, {"fase": fase, "numero": numero})

@login_required
def concluir_fase(request, numero):
    referer = request.META.get('HTTP_REFERER')
    if not referer:
        return render(request, 'appOTTO/home.html')
    
    usuario = request.user
    progresso = usuario.progresso_usuario

    inicio_str = request.session.get("inicio_fase")
    if inicio_str:
        inicio = timezone.datetime.fromisoformat(inicio_str)
        fim = timezone.now()
        tempo_total = fim - inicio
        minutos, segundos = divmod(tempo_total.seconds, 60)
        tempo_formatado = f"{minutos} min {segundos} s"
    else:
        tempo_formatado = "Não registrado"

    if progresso < numero:
        usuario.progresso_usuario = usuario.progresso_usuario + 1
        resto = usuario.progresso_usuario % 2

        if resto == 0:
            usuario.nivel_usuario = usuario.nivel_usuario + 1

        usuario.save()

    contexto = {
        "usuario": usuario.nome_usuario,
        "fase": numero,
        "tempo": tempo_formatado,
        "progresso": usuario.progresso_usuario,
    }
    return render(request, "appOTTO/pos_fase.html", contexto)