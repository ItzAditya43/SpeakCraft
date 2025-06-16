import { useState, useCallback } from 'react';

// Mock API endpoint configuration
const API_CONFIG = {
  baseUrl: 'http://localhost:3001/api',
  endpoints: {
    generateTool: '/generate-tool'
  },
  timeout: 10000 // 10 seconds
};

// Mock response generator for development
function generateMockToolConfig(prompt) {
  const toolTypes = ['checklist', 'form', 'calculator', 'tracker'];
  const randomType = toolTypes[Math.floor(Math.random() * toolTypes.length)];
  
  // For now, always return checklist since it's the only implemented type
  if (prompt.toLowerCase().includes('checklist') || prompt.toLowerCase().includes('todo') || prompt.toLowerCase().includes('task')) {
    return {
      type: 'checklist',
      title: extractTitleFromPrompt(prompt) || 'Generated Checklist',
      description: `A checklist generated from your prompt: "${prompt.slice(0, 100)}${prompt.length > 100 ? '...' : ''}"`,
      config: {
        allowCustomItems: true,
        showProgress: true,
        categories: generateChecklistCategories(prompt)
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0',
        author: 'AI Assistant',
        prompt: prompt
      }
    };
  }
  
  // Default fallback
  return {
    type: 'checklist',
    title: 'Custom Checklist',
    description: 'A checklist based on your requirements',
    config: {
      allowCustomItems: true,
      showProgress: true,
      categories: [
        {
          name: 'Generated Tasks',
          items: [
            {
              id: 'gen-1',
              text: 'Review and customize this checklist',
              completed: false,
              priority: 'high'
            },
            {
              id: 'gen-2',
              text: 'Add your specific requirements',
              completed: false,
              priority: 'medium'
            }
          ]
        }
      ]
    },
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0',
      author: 'AI Assistant',
      prompt: prompt
    }
  };
}

function extractTitleFromPrompt(prompt) {
  // Simple title extraction logic
  const words = prompt.split(' ');
  if (words.length <= 5) {
    return prompt;
  }
  return words.slice(0, 5).join(' ') + '...';
}

function generateChecklistCategories(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Work-related checklist
  if (lowerPrompt.includes('work') || lowerPrompt.includes('project') || lowerPrompt.includes('office')) {
    return [
      {
        name: 'Planning',
        items: [
          { id: 'work-1', text: 'Define project objectives', completed: false, priority: 'high' },
          { id: 'work-2', text: 'Create timeline and milestones', completed: false, priority: 'high' },
          { id: 'work-3', text: 'Identify required resources', completed: false, priority: 'medium' }
        ]
      },
      {
        name: 'Execution',
        items: [
          { id: 'work-4', text: 'Begin primary tasks', completed: false, priority: 'high' },
          { id: 'work-5', text: 'Monitor progress regularly', completed: false, priority: 'medium' },
          { id: 'work-6', text: 'Communicate with stakeholders', completed: false, priority: 'medium' }
        ]
      }
    ];
  }
  
  // Travel checklist
  if (lowerPrompt.includes('travel') || lowerPrompt.includes('trip') || lowerPrompt.includes('vacation')) {
    return [
      {
        name: 'Before Travel',
        items: [
          { id: 'travel-1', text: 'Check passport and visa requirements', completed: false, priority: 'high' },
          { id: 'travel-2', text: 'Book accommodation', completed: false, priority: 'high' },
          { id: 'travel-3', text: 'Pack essentials', completed: false, priority: 'medium' }
        ]
      },
      {
        name: 'During Travel',
        items: [
          { id: 'travel-4', text: 'Keep important documents safe', completed: false, priority: 'high' },
          { id: 'travel-5', text: 'Stay hydrated', completed: false, priority: 'medium' },
          { id: 'travel-6', text: 'Take photos and enjoy', completed: false, priority: 'low' }
        ]
      }
    ];
  }
  
  // Health/fitness checklist
  if (lowerPrompt.includes('health') || lowerPrompt.includes('fitness') || lowerPrompt.includes('exercise')) {
    return [
      {
        name: 'Daily Health',
        items: [
          { id: 'health-1', text: 'Drink 8 glasses of water', completed: false, priority: 'high' },
          { id: 'health-2', text: 'Exercise for 30 minutes', completed: false, priority: 'high' },
          { id: 'health-3', text: 'Eat balanced meals', completed: false, priority: 'medium' }
        ]
      },
      {
        name: 'Weekly Goals',
        items: [
          { id: 'health-4', text: 'Meal prep for the week', completed: false, priority: 'medium' },
          { id: 'health-5', text: 'Schedule medical checkups', completed: false, priority: 'low' },
          { id: 'health-6', text: 'Practice mindfulness/meditation', completed: false, priority: 'medium' }
        ]
      }
    ];
  }
  
  // Default generic checklist
  return [
    {
      name: 'Main Tasks',
      items: [
        { id: 'default-1', text: 'Review requirements', completed: false, priority: 'high' },
        { id: 'default-2', text: 'Plan approach', completed: false, priority: 'medium' },
        { id: 'default-3', text: 'Execute plan', completed: false, priority: 'high' }
      ]
    },
    {
      name: 'Follow-up',
      items: [
        { id: 'default-4', text: 'Review results', completed: false, priority: 'medium' },
        { id: 'default-5', text: 'Document learnings', completed: false, priority: 'low' }
      ]
    }
  ];
}

// Main hook
export function usePromptAPI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toolConfig, setToolConfig] = useState(null);

  const generateTool = useCallback(async (prompt) => {
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      setError('Please provide a valid prompt');
      return null;
    }

    setIsLoading(true);
    setError(null);
    setToolConfig(null);

    try {
      // Try to call the real API first
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.generateTool}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
        signal: AbortSignal.timeout(API_CONFIG.timeout)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data || !data.toolConfig) {
        throw new Error('Invalid response format from API');
      }

      setToolConfig(data.toolConfig);
      return data.toolConfig;

    } catch (apiError) {
      console.warn('API call failed, using mock data:', apiError.message);
      
      // Fallback to mock data with a realistic delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      try {
        const mockConfig = generateMockToolConfig(prompt.trim());
        setToolConfig(mockConfig);
        return mockConfig;
      } catch (mockError) {
        console.error('Mock generation failed:', mockError);
        setError('Failed to generate tool configuration');
        return null;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearToolConfig = useCallback(() => {
    setToolConfig(null);
  }, []);

  return {
    generateTool,
    isLoading,
    error,
    toolConfig,
    clearError,
    clearToolConfig
  };
}

// Utility function to validate tool config
export function validateToolConfig(config) {
  if (!config || typeof config !== 'object') {
    return { isValid: false, errors: ['Tool configuration must be an object'] };
  }

  const errors = [];

  if (!config.type || typeof config.type !== 'string') {
    errors.push('Tool type is required and must be a string');
  }

  if (!config.title || typeof config.title !== 'string') {
    errors.push('Tool title is required and must be a string');
  }

  if (!config.config || typeof config.config !== 'object') {
    errors.push('Tool config object is required');
  }

  // Type-specific validation
  if (config.type === 'checklist') {
    if (!config.config.categories || !Array.isArray(config.config.categories)) {
      errors.push('Checklist must have categories array');
    } else {
      config.config.categories.forEach((category, index) => {
        if (!category.name || typeof category.name !== 'string') {
          errors.push(`Category ${index + 1} must have a name`);
        }
        if (!category.items || !Array.isArray(category.items)) {
          errors.push(`Category ${index + 1} must have items array`);
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}