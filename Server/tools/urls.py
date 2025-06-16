from django.urls import path
from .views import ParsePromptView, UserToolView, UserToolDetailView

urlpatterns = [
    path('parse-prompt/', ParsePromptView.as_view(), name='parse-prompt'),
    path('user-tools/', UserToolView.as_view(), name='user-tools'),
    path('user-tools/<int:pk>/', UserToolDetailView.as_view(), name='user-tool-id'),  
]
