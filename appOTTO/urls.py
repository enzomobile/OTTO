from django.urls import path
from . import views
from django.contrib.auth import views as auth_views
from django.contrib.auth import views as auth_views
from .passwordResetForm import customPasswordResetForm
from .views import CustomPasswordResetCompleteView

urlpatterns = [
    path('', views.home, name='home'),
    path('cadastro/', views.cadastro, name='cadastro'),
    path('verificar_email/<str:token>/', views.verificar_email, name='verificar_email'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('config/', views.config, name='config'),
    path('deletar_conta/', views.deletar_conta, name='deletar_conta'),
    path('suporte/', views.enviar_suporte, name='suporte'),
    path('fases/', views.fases, name='fases'),

    # Django urls para trocar senha com 2 fatores.
    path(
        "recuperar-senha/",
        auth_views.PasswordResetView.as_view(
            template_name="auth/password_reset.html",
            email_template_name="auth/password_reset_email.html",
            subject_template_name="auth/password_reset_subject.txt",
            success_url="/recuperar-senha/feito/",
            form_class=customPasswordResetForm,
        ),
        name="password_reset",
    ),

    # Passo 2: Confirmação que email foi enviado
    path('recuperar-senha/feito/', 
        auth_views.PasswordResetDoneView.as_view(
            template_name='auth/password_reset_done.html'
        ), 
        name='password_reset_done'
    ),

    # Passo 3: Link do email → Form para redefinir senha
    path('reset/<uidb64>/<token>/',
        auth_views.PasswordResetConfirmView.as_view(
            template_name='auth/password_reset_confirm.html',
            success_url='/reset/feito/'
        ), 
        name='password_reset_confirm'
    ),

    # Passo 4: Senha alterada com sucesso
    path('reset/feito/',
        CustomPasswordResetCompleteView.as_view(), 
        name='password_reset_complete'
    ),
]