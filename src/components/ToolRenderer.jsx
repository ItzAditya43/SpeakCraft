import React, { useState, useEffect } from 'react';
import { Check, Plus, Save, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// Tool saving utility
export function saveUserTool(toolConfig, userId) {
  try {
    const userToolsKey = `user_tools_${userId}`;
    const existingTools = JSON.parse(localStorage.getItem(userToolsKey) || '[]');
    
    // Add timestamp and unique ID if not present
    const toolWithMetadata = {
      ...toolConfig,
      id: toolConfig.id || Date.now().toString(),
      savedAt: new Date().toISOString(),
      userId: userId
    };
    
    // Check if tool already exists (update) or add new
    const existingIndex = existingTools.findIndex(tool => tool.id === toolWithMetadata.id);
    if (existingIndex >= 0) {
      existingTools[existingIndex] = toolWithMetadata;
    } else {
      existingTools.push(toolWithMetadata);
    }
    
    localStorage.setItem(userToolsKey, JSON.stringify(existingTools));
    return true;
  } catch (error) {
    console.error('Error saving tool:', error);
    return false;
  }
}

// Get user's saved tools
export function getUserTools(userId) {
  try {
    const userToolsKey = `user_tools_${userId}`;
    return JSON.parse(localStorage.getItem(userToolsKey) || '[]');
  } catch (error) {
    console.error('Error loading user tools:', error);
    return [];
  }
}

// Checklist component
function ChecklistTool({ config, onConfigChange }) {
  const [localConfig, setLocalConfig] = useState(config);
  const [newItemText, setNewItemText] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const toggleItem = (categoryIndex, itemIndex) => {
    const updatedConfig = { ...localConfig };
    updatedConfig.config.categories[categoryIndex].items[itemIndex].completed = 
      !updatedConfig.config.categories[categoryIndex].items[itemIndex].completed;
    
    setLocalConfig(updatedConfig);
    onConfigChange?.(updatedConfig);
  };

  const addCustomItem = (categoryIndex) => {
    if (!newItemText.trim()) return;
    
    const updatedConfig = { ...localConfig };
    const newItem = {
      id: `custom-${Date.now()}`,
      text: newItemText.trim(),
      completed: false,
      priority: 'medium'
    };
    
    updatedConfig.config.categories[categoryIndex].items.push(newItem);
    setLocalConfig(updatedConfig);
    onConfigChange?.(updatedConfig);
    setNewItemText('');
    setActiveCategory(null);
  };

  const removeItem = (categoryIndex, itemIndex) => {
    const updatedConfig = { ...localConfig };
    updatedConfig.config.categories[categoryIndex].items.splice(itemIndex, 1);
    setLocalConfig(updatedConfig);
    onConfigChange?.(updatedConfig);
  };

  const getProgress = () => {
    const allItems = localConfig.config.categories.flatMap(cat => cat.items);
    const completedItems = allItems.filter(item => item.completed);
    return {
      completed: completedItems.length,
      total: allItems.length,
      percentage: allItems.length > 0 ? Math.round((completedItems.length / allItems.length) * 100) : 0
    };
  };

  const progress = getProgress();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{localConfig.title}</h2>
            <p className="text-blue-100">{localConfig.description}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{progress.percentage}%</div>
            <div className="text-sm text-blue-100">Complete</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        {localConfig.config.showProgress && (
          <div className="mt-4">
            <div className="bg-white/20 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-500 ease-out"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-blue-100 mt-2">
              <span>{progress.completed} of {progress.total} completed</span>
              <span>{progress.total - progress.completed} remaining</span>
            </div>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="p-6 space-y-6">
        {localConfig.config.categories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-blue-500" />
                {category.name}
                <span className="ml-auto text-sm text-gray-500">
                  {category.items.filter(item => item.completed).length}/{category.items.length}
                </span>
              </h3>
            </div>
            
            <div className="p-4 space-y-3">
              {category.items.map((item, itemIndex) => (
                <div 
                  key={item.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                    item.completed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(categoryIndex, itemIndex)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      item.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {item.completed && <Check size={14} />}
                  </button>
                  
                  <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {item.text}
                  </span>
                  
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                  
                  {item.id.startsWith('custom-') && (
                    <button
                      onClick={() => removeItem(categoryIndex, itemIndex)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              
              {/* Add custom item */}
              {localConfig.config.allowCustomItems && (
                <div className="mt-4">
                  {activeCategory === categoryIndex ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        placeholder="Add new item..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && addCustomItem(categoryIndex)}
                        autoFocus
                      />
                      <button
                        onClick={() => addCustomItem(categoryIndex)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setActiveCategory(null);
                          setNewItemText('');
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveCategory(categoryIndex)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <Plus size={16} />
                      Add custom item
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main ToolRenderer component
export default function ToolRenderer({ toolConfig, onConfigChange, showSaveButton = true }) {
  const { user } = useAuth();
  const [saveStatus, setSaveStatus] = useState(null);

  const handleSaveTool = async () => {
    if (!user || !toolConfig) return;
    
    setSaveStatus('saving');
    
    try {
      const success = saveUserTool(toolConfig, user.id);
      if (success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const renderTool = () => {
    if (!toolConfig) {
      return (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Tool Configuration</h3>
          <p className="text-gray-500">Please provide a valid tool configuration to render.</p>
        </div>
      );
    }

    switch (toolConfig.type) {
      case 'checklist':
        return <ChecklistTool config={toolConfig} onConfigChange={onConfigChange} />;
      
      default:
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-yellow-600 mb-3" />
            <h3 className="text-lg font-medium text-yellow-800 mb-2">Unsupported Tool Type</h3>
            <p className="text-yellow-700">
              Tool type "{toolConfig.type}" is not yet supported.
            </p>
            <p className="text-sm text-yellow-600 mt-2">
              Supported types: checklist
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {renderTool()}
      
      {/* Save Button */}
      {showSaveButton && toolConfig && user && (
        <div className="flex justify-end">
          <button
            onClick={handleSaveTool}
            disabled={saveStatus === 'saving'}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
              ${saveStatus === 'success' 
                ? 'bg-green-500 text-white' 
                : saveStatus === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
              }
              ${saveStatus === 'saving' ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <Save size={18} />
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'success' && 'Saved!'}
            {saveStatus === 'error' && 'Save Failed'}
            {!saveStatus && 'Save Tool'}
          </button>
        </div>
      )}
    </div>
  );
}