from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('cadastro/', views.cadastro, name='cadastro'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('configurações/', views.configurações, name='configurações'),
    path('configuracoes/redefinir_senha/', views.redefinir_senha, name='redefinir_senha'),
    path('configuracoes/deletar-conta/', views.deletar_conta, name='deletar_conta'),
    path('enviar-suporte/', views.enviar_suporte, name='enviar_suporte'),
]