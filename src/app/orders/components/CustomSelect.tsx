'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function CustomSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = "Please select",
  required = false,
  disabled = false
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Get label of selected value
  const selectedOption = options.find(option => option.value === value);
  const selectedLabel = selectedOption ? selectedOption.label : placeholder;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          onChange(options[focusedIndex].value);
          setIsOpen(false);
          setFocusedIndex(-1);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex(prev => Math.min(prev + 1, options.length - 1));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => Math.max(prev - 1, 0));
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  // Select option
  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  // Calculate dropdown position
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  
  useEffect(() => {
    if (isOpen && selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Estimated dropdown height (option count * 40px + padding)
      const estimatedHeight = Math.min(options.length * 40 + 16, 200);
      
      if (spaceBelow >= estimatedHeight || spaceBelow >= spaceAbove) {
        // Display below
        setDropdownStyle({
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          zIndex: 1000
        });
      } else {
        // Display above
        setDropdownStyle({
          position: 'absolute',
          bottom: '100%',
          left: 0,
          right: 0,
          marginBottom: '4px',
          zIndex: 1000
        });
      }
    }
  }, [isOpen, options.length]);

  return (
    <div 
      ref={selectRef}
      style={{ position: 'relative', width: '100%' }}
    >
      {/* Select button */}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="dropdown-list"
        aria-required={required}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '8px 12px',
          border: `1px solid ${isOpen ? '#2563eb' : '#d1d5db'}`,
          borderRadius: '6px',
          fontSize: '14px',
          backgroundColor: disabled ? '#f9fafb' : 'white',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxSizing: 'border-box',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 3px rgba(37, 99, 235, 0.1)' : 'none',
          transition: 'all 0.2s ease-in-out'
        }}
        onMouseEnter={(e) => {
          if (!disabled && !isOpen) {
            e.currentTarget.style.borderColor = '#9ca3af';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isOpen) {
            e.currentTarget.style.borderColor = '#d1d5db';
          }
        }}
      >
        <span style={{
          color: selectedOption ? '#0f172a' : '#9ca3af',
          fontWeight: selectedOption ? '500' : '400',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {selectedLabel}
        </span>
        <ChevronDown 
          size={16} 
          style={{
            color: '#6b7280',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease-in-out',
            flexShrink: 0,
            marginLeft: '8px'
          }}
        />
      </div>

      {/* Dropdown list */}
      {isOpen && (
        <div
          ref={listRef}
          id="dropdown-list"
          role="listbox"
          style={{
            ...dropdownStyle,
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            maxHeight: '200px',
            overflowY: 'auto',
            padding: '8px 0'
          }}
        >
          {options.map((option, index) => (
            <div
              key={`option-${option.value}-${index}`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => handleOptionClick(option.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                fontSize: '14px',
                color: '#0f172a',
                cursor: 'pointer',
                backgroundColor: index === focusedIndex ? '#f3f4f6' : 'transparent',
                borderRadius: '4px',
                margin: '0 4px',
                transition: 'background-color 0.1s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                setFocusedIndex(index);
              }}
              onMouseLeave={(e) => {
                if (index !== focusedIndex) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{
                fontWeight: option.value === value ? '500' : '400'
              }}>
                {option.label}
              </span>
              {option.value === value && (
                <Check 
                  size={16} 
                  style={{
                    color: '#2563eb',
                    flexShrink: 0
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}