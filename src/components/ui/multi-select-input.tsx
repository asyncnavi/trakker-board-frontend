import * as React from "react";
import { X, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Badge } from "./badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./button";

// =============================================================================
// Types
// =============================================================================

export interface LabelOption {
  value: string;
  label: string;
  color?: string;
}

export interface MultiSelectInputProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  maxItems?: number;
  allowCustom?: boolean;
  predefinedOptions?: LabelOption[];
  variant?: "default" | "badge" | "inline";
  className?: string;
  disabled?: boolean;
  onBlur?: () => void;
}

// =============================================================================
// Helper Functions
// =============================================================================

const getColorClasses = (color?: string): string => {
  const colorMap: Record<string, string> = {
    red: "bg-red-100 text-red-800 hover:bg-red-200",
    orange: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    yellow: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    green: "bg-green-100 text-green-800 hover:bg-green-200",
    blue: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    indigo: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
    purple: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    pink: "bg-pink-100 text-pink-800 hover:bg-pink-200",
    gray: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  };

  return color && colorMap[color]
    ? colorMap[color]
    : "bg-blue-100 text-blue-800 hover:bg-blue-200";
};

// =============================================================================
// Component
// =============================================================================

const MultiSelectInput = React.forwardRef<
  HTMLDivElement,
  MultiSelectInputProps
>(
  (
    {
      value = [],
      onChange,
      placeholder = "Add labels...",
      maxItems,
      allowCustom = true,
      predefinedOptions = [],
      variant = "default",
      className,
      disabled = false,
      onBlur,
    },
    ref,
  ) => {
    // ---------------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------------

    const [inputValue, setInputValue] = React.useState("");
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // ---------------------------------------------------------------------------
    // Computed Values
    // ---------------------------------------------------------------------------

    const isMaxReached = maxItems ? value.length >= maxItems : false;

    const availableOptions = predefinedOptions.filter(
      (option) => !value.includes(option.value),
    );

    const filteredOptions = availableOptions.filter((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase()),
    );

    // ---------------------------------------------------------------------------
    // Handlers
    // ---------------------------------------------------------------------------

    const handleAddLabel = React.useCallback(
      (labelValue: string) => {
        const trimmedValue = labelValue.trim();

        if (!trimmedValue) return;
        if (value.includes(trimmedValue)) return;
        if (isMaxReached) return;

        onChange?.([...value, trimmedValue]);
        setInputValue("");
        setIsPopoverOpen(false);
      },
      [value, onChange, isMaxReached],
    );

    const handleRemoveLabel = React.useCallback(
      (labelValue: string) => {
        onChange?.(value.filter((v) => v !== labelValue));
      },
      [value, onChange],
    );

    const handleInputChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (predefinedOptions.length > 0) {
          setIsPopoverOpen(true);
        }
      },
      [predefinedOptions.length],
    );

    const handleInputKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && allowCustom) {
          e.preventDefault();
          handleAddLabel(inputValue);
        } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
          e.preventDefault();
          handleRemoveLabel(value[value.length - 1]);
        }
      },
      [inputValue, value, allowCustom, handleAddLabel, handleRemoveLabel],
    );

    const handleSelectOption = React.useCallback(
      (option: LabelOption) => {
        handleAddLabel(option.value);
      },
      [handleAddLabel],
    );

    // ---------------------------------------------------------------------------
    // Render: Badge Variant
    // ---------------------------------------------------------------------------

    if (variant === "badge") {
      return (
        <div ref={ref} className={cn("space-y-2", className)}>
          {/* Selected Labels */}
          {value.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {value.map((item) => {
                const option = predefinedOptions.find((o) => o.value === item);
                return (
                  <Badge
                    key={item}
                    variant="secondary"
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors",
                      option?.color && getColorClasses(option.color),
                    )}
                  >
                    {option?.label || item}
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLabel(item)}
                        className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                        aria-label={`Remove ${option?.label || item}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Input with Popover */}
          {!disabled && !isMaxReached && (
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                  />
                  {allowCustom && inputValue && (
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                      onClick={() => handleAddLabel(inputValue)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </PopoverTrigger>

              {predefinedOptions.length > 0 && filteredOptions.length > 0 && (
                <PopoverContent className="w-64 p-2" align="start">
                  <div className="space-y-1">
                    {filteredOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelectOption(option)}
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors hover:bg-accent",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        )}
                      >
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            getColorClasses(option.color),
                          )}
                        >
                          {option.label}
                        </span>
                        {value.includes(option.value) && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              )}
            </Popover>
          )}

          {isMaxReached && (
            <p className="text-xs text-muted-foreground">
              Maximum {maxItems} labels reached
            </p>
          )}
        </div>
      );
    }

    // ---------------------------------------------------------------------------
    // Render: Inline Variant
    // ---------------------------------------------------------------------------

    if (variant === "inline") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex flex-wrap items-center gap-2 min-h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs",
            "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
        >
          {/* Selected Labels */}
          {value.map((item) => {
            const option = predefinedOptions.find((o) => o.value === item);
            return (
              <span
                key={item}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  option?.color
                    ? getColorClasses(option.color)
                    : "bg-blue-100 text-blue-800",
                )}
              >
                {option?.label || item}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLabel(item)}
                    className="hover:bg-black/10 rounded-full p-0.5"
                    aria-label={`Remove ${option?.label || item}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            );
          })}

          {/* Input */}
          {!disabled && !isMaxReached && (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onBlur={onBlur}
              placeholder={value.length === 0 ? placeholder : ""}
              disabled={disabled}
              className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground"
            />
          )}
        </div>
      );
    }

    // ---------------------------------------------------------------------------
    // Render: Default Variant
    // ---------------------------------------------------------------------------

    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        {/* Selected Labels */}
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {value.map((item) => {
              const option = predefinedOptions.find((o) => o.value === item);
              return (
                <span
                  key={item}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium border",
                    option?.color
                      ? getColorClasses(option.color)
                      : "bg-secondary text-secondary-foreground border-secondary",
                  )}
                >
                  {option?.label || item}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLabel(item)}
                      className="hover:bg-black/10 rounded-full p-0.5"
                      aria-label={`Remove ${option?.label || item}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        )}

        {/* Input with Add Button */}
        {!disabled && !isMaxReached && (
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onBlur={onBlur}
              placeholder={placeholder}
              disabled={disabled}
              className="flex-1"
            />
            {allowCustom && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleAddLabel(inputValue)}
                disabled={!inputValue.trim()}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            )}
          </div>
        )}

        {/* Predefined Options */}
        {predefinedOptions.length > 0 && !isMaxReached && (
          <div className="flex flex-wrap gap-2">
            {availableOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelectOption(option)}
                disabled={disabled}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-colors",
                  "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  option.color
                    ? getColorClasses(option.color)
                    : "bg-background border-input hover:bg-accent",
                )}
              >
                <Plus className="w-3 h-3" />
                {option.label}
              </button>
            ))}
          </div>
        )}

        {isMaxReached && (
          <p className="text-xs text-muted-foreground">
            Maximum {maxItems} labels reached
          </p>
        )}
      </div>
    );
  },
);

MultiSelectInput.displayName = "MultiSelectInput";

export { MultiSelectInput };
