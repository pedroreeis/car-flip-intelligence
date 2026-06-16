'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './Autocomplete.module.css';
import { ChevronDown, Search } from 'lucide-react';

interface Option {
  code: string;
  name: string;
}

interface AutocompleteProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function Autocomplete({ options, value, onChange, placeholder, disabled }: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Set initial search term based on value (if a code is provided, show its name)
  useEffect(() => {
    if (value) {
      const selectedOption = options.find(o => o.code === value);
      if (selectedOption) {
        setSearchTerm(selectedOption.name);
      }
    } else {
      setSearchTerm('');
    }
  }, [value, options]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset search term if not selected
        const selectedOption = options.find(o => o.code === value);
        if (selectedOption) {
          setSearchTerm(selectedOption.name);
        } else {
          setSearchTerm('');
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef, options, value]);

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (optionCode: string, optionName: string) => {
    setSearchTerm(optionName);
    setIsOpen(false);
    onChange(optionCode);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    // Se apagar tudo, reseta o valor pai
    if (e.target.value === '') {
      onChange('');
    }
  };

  return (
    <div className={styles.autocompleteWrapper} ref={wrapperRef}>
      <div className={`${styles.inputContainer} ${disabled ? styles.disabled : ''}`}>
        <Search size={16} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.input}
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => !disabled && setIsOpen(true)}
          disabled={disabled}
        />
        <ChevronDown size={16} className={styles.chevronIcon} />
      </div>

      {isOpen && !disabled && (
        <ul className={styles.dropdown}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li
                key={option.code}
                className={styles.dropdownItem}
                onClick={() => handleSelect(option.code, option.name)}
              >
                {option.name}
              </li>
            ))
          ) : (
            <li className={styles.noResults}>Nenhum resultado encontrado</li>
          )}
        </ul>
      )}
    </div>
  );
}
