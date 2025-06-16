from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import UserTool, ToolTemplate
from .serializers import UserToolSerializer
from langdetect import detect
from rest_framework import status
from rest_framework.generics import RetrieveUpdateDestroyAPIView

class ParsePromptView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        prompt = request.data.get("prompt")
        lang = detect(prompt)
        config = {
            "tool_type": "planner",
            "language": lang,
            "config_json": {"title": "My Planner"},
        }

        user = request.user
        if user.quota > 0:
            user.quota -= 1
            user.save()
            return Response(config)
        else:
            return Response({"error": "Quota exceeded"}, status=403)


class UserToolView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        tools = UserTool.objects.filter(user=request.user)
        return Response(UserToolSerializer(tools, many=True).data)

    def post(self, request):
        user = request.user
        active_tools_count = UserTool.objects.filter(user=user).count()

        if active_tools_count >= 5:
            return Response(
                {
                    "error": "Active tool limit reached (5). Please delete a tool to create a new one or upgrade to premium."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = UserToolSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, *args, **kwargs):
        tool_id = request.data.get("id")
        if not tool_id:
            return Response({"error": "Tool ID required."}, status=400)

        try:
            tool = UserTool.objects.get(id=tool_id, user=request.user)
        except UserTool.DoesNotExist:
            return Response({"error": "Tool not found."}, status=404)

        serializer = UserToolSerializer(tool, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    def delete(self, request, *args, **kwargs):
        tool_id = request.data.get("id")
        if not tool_id:
            return Response({"error": "Tool ID required."}, status=400)

        try:
            tool = UserTool.objects.get(id=tool_id, user=request.user)
            tool.delete()
            return Response({"message": "Tool deleted successfully."})
        except UserTool.DoesNotExist:
            return Response({"error": "Tool not found."}, status=404)
        
class UserToolDetailView(RetrieveUpdateDestroyAPIView):
    queryset = UserTool.objects.all()
    serializer_class = UserToolSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        # Ensure users can only modify their own tools
        return UserTool.objects.filter(user=self.request.user)
    
    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user:
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)
    
