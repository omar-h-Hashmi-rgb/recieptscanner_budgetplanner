import React, { useState, useRef, useEffect } from 'react';
import { X, Tag } from 'lucide-react';

const TagsInput = ({ tags = [], onChange, availableTags = [], placeholder = "Add tags..." }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputValue && isInputFocused) {
      const filteredSuggestions = availableTags
        .filter(tag => 
          tag.tag.toLowerCase().includes(inputValue.toLowerCase()) &&
          !tags.includes(tag.tag)
        )
        .slice(0, 5);
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, availableTags, tags, isInputFocused]);

  const addTag = (tagText) => {
    const newTag = tagText.trim();
    if (newTag && !tags.includes(newTag) && tags.length < 10) {
      onChange([...tags, newTag]);
      setInputValue('');
      setSuggestions([]);
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    addTag(suggestion.tag);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-text-light-primary dark:text-text-dark-primary mb-2">
        <Tag className="inline-block w-4 h-4 mr-1" />
        Tags {tags.length > 0 && `(${tags.length}/10)`}
      </label>
      
      <div className="min-h-[42px] p-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                      bg-white dark:bg-bg-dark-primary
                      focus-within:ring-2 focus-within:ring-primary-light focus-within:border-transparent
                      flex flex-wrap gap-2 items-center">
        
        {/* Existing Tags */}
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                       bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300
                       border border-primary-200 dark:border-primary-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 hover:text-primary-600 dark:hover:text-primary-400"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => {
            // Delay hiding suggestions to allow clicking
            setTimeout(() => setIsInputFocused(false), 200);
          }}
          placeholder={tags.length === 0 ? placeholder : ""}
          disabled={tags.length >= 10}
          className="flex-1 min-w-[100px] outline-none bg-transparent
                     text-text-light-primary dark:text-text-dark-primary
                     placeholder-gray-400 dark:placeholder-gray-500
                     disabled:opacity-50"
        />
      </div>

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && isInputFocused && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-bg-dark-secondary
                        border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg
                        max-h-48 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700
                         text-text-light-primary dark:text-text-dark-primary
                         flex justify-between items-center"
            >
              <span>{suggestion.tag}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {suggestion.count} use{suggestion.count !== 1 ? 's' : ''}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Press Enter or comma to add tags. Use tags to organize and filter transactions.
      </div>
    </div>
  );
};

export default TagsInput;