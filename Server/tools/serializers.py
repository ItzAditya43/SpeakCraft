from rest_framework import serializers
from .models import User, ToolTemplate, UserTool
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username']

class ToolTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ToolTemplate
        fields = '__all__'

class UserToolSerializer(serializers.ModelSerializer):
    template_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = UserTool
        fields = ['id', 'template_id', 'template', 'config_json', 'created_at']
        read_only_fields = ['id', 'created_at', 'user', 'template']

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        template_id = validated_data.pop('template_id')
        language = request.data.get('language', 'en')

        try:
            base_template = ToolTemplate.objects.get(id=template_id)
        except ToolTemplate.DoesNotExist:
            raise serializers.ValidationError("Template not found.")

        config = base_template.config_json.copy()
        config['language'] = language  # Save selected language

        # If the template has multilingual content, extract language-specific text
        content_translations = config.get('content', {})
        if isinstance(content_translations, dict) and language in content_translations:
            # Replace multilingual 'content' dict with just selected language block
            config['content'] = content_translations[language]
        elif isinstance(content_translations, dict) and 'en' in content_translations:
            config['content'] = content_translations['en']  # fallback to English
        else:
            # If no translation available, leave as-is or empty
            config['content'] = {}

        return UserTool.objects.create(
            user=user,
            template=base_template,
            config_json=config
        )

