import React from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { IconType } from 'react-icons';
import { FaSearch, FaTimes } from 'react-icons/fa';

type FilterBarProps = {
  children: React.ReactNode;
  className?: string;
};

type FilterFieldProps = {
  label?: string;
  children: React.ReactNode;
  className?: string;
  grow?: boolean;
};

type SearchFilterProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  icon?: IconType;
};

type FilterChipOption = {
  value: string;
  label: string;
  icon?: IconType;
};

type FilterChipGroupProps = {
  label: string;
  options: FilterChipOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  className?: string;
};

type ClearFiltersButtonProps = {
  label: string;
  onClick: () => void;
  visible?: boolean;
  reserveSpace?: boolean;
  className?: string;
};

export const FilterBar: React.FC<FilterBarProps> = ({ children, className = '' }) => (
  <div className={`filter-bar unified-filter-bar ${className}`.trim()}>
    {children}
  </div>
);

export const FilterField: React.FC<FilterFieldProps> = ({
  label,
  children,
  className = '',
  grow = false,
}) => (
  <div className={`filter-group unified-filter-field ${grow ? 'is-grow' : ''} ${className}`.trim()}>
    {label && <label className="filter-label">{label}</label>}
    {children}
  </div>
);

export const SearchFilter: React.FC<SearchFilterProps> = ({
  label,
  value,
  onChange,
  placeholder,
  ariaLabel,
  className = '',
  icon: Icon = FaSearch,
}) => (
  <FilterField label={label} className={`search-filter ${className}`.trim()} grow>
    <InputGroup className="filter-input-group">
      <InputGroup.Text>
        <Icon className="text-secondary" />
      </InputGroup.Text>
      <Form.Control
        type="search"
        placeholder={placeholder}
        aria-label={ariaLabel || label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="form-control filter-control"
      />
    </InputGroup>
  </FilterField>
);

export const FilterChipGroup: React.FC<FilterChipGroupProps> = ({
  label,
  options,
  value,
  onChange,
  ariaLabel,
  className = '',
}) => (
  <FilterField label={label} className={`chip-filter ${className}`.trim()}>
    <div className="filter-chip-row" role="group" aria-label={ariaLabel || label}>
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            className={`filter-chip ${value === option.value ? 'is-active' : ''}`}
            onClick={() => onChange(option.value)}
          >
            {Icon && <Icon className="me-1" />}
            {option.label}
          </button>
        );
      })}
    </div>
  </FilterField>
);

export const ClearFiltersButton: React.FC<ClearFiltersButtonProps> = ({
  label,
  onClick,
  visible = true,
  reserveSpace = true,
  className = '',
}) => (
  <Button
    variant="outline-secondary"
    size="sm"
    onClick={onClick}
    className={`filter-clear-button ms-auto ${reserveSpace && !visible ? 'is-hidden' : ''} ${className}`.trim()}
    disabled={!visible}
    aria-hidden={!visible}
  >
    <FaTimes className="me-2" />
    {label}
  </Button>
);
