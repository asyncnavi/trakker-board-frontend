# MultiSelectInput Component

A flexible and reusable multi-select input component for adding labels, tags, or any other multi-value selections to your forms.

## Features

- ✅ Multiple selection variants (default, badge, inline)
- ✅ Predefined options with custom colors
- ✅ Custom label creation
- ✅ Maximum items limit
- ✅ Keyboard navigation (Enter to add, Backspace to remove)
- ✅ Popover for predefined options
- ✅ Fully accessible (ARIA labels)
- ✅ TypeScript support
- ✅ Controlled component pattern

## Installation

The component is already available in your project at:
```
src/components/ui/multi-select-input.tsx
```

## Basic Usage

```tsx
import { MultiSelectInput } from "@/components/ui/multi-select-input";

function MyForm() {
  const [labels, setLabels] = useState<string[]>([]);

  return (
    <MultiSelectInput
      value={labels}
      onChange={setLabels}
      placeholder="Add labels..."
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string[]` | `[]` | Current selected values |
| `onChange` | `(value: string[]) => void` | - | Callback when values change |
| `placeholder` | `string` | `"Add labels..."` | Input placeholder text |
| `maxItems` | `number` | `undefined` | Maximum number of items allowed |
| `allowCustom` | `boolean` | `true` | Allow creating custom labels |
| `predefinedOptions` | `LabelOption[]` | `[]` | Predefined label options |
| `variant` | `"default" \| "badge" \| "inline"` | `"default"` | Display variant |
| `className` | `string` | - | Additional CSS classes |
| `disabled` | `boolean` | `false` | Disable input |
| `onBlur` | `() => void` | - | Blur event handler |

## Variants

### Default Variant

Shows selected items above the input with an "Add" button.

```tsx
<MultiSelectInput
  value={labels}
  onChange={setLabels}
  variant="default"
  placeholder="Add labels..."
/>
```

### Badge Variant (Recommended for Forms)

Displays selected items as badges with a clean input below.

```tsx
<MultiSelectInput
  value={labels}
  onChange={setLabels}
  variant="badge"
  placeholder="Add labels..."
  predefinedOptions={PREDEFINED_LABELS}
/>
```

### Inline Variant

All items and input in a single bordered container (like multi-select input).

```tsx
<MultiSelectInput
  value={labels}
  onChange={setLabels}
  variant="inline"
  placeholder="Add labels..."
/>
```

## Predefined Options

You can provide predefined options with custom colors:

```tsx
import type { LabelOption } from "@/components/ui/multi-select-input";

const LABEL_OPTIONS: LabelOption[] = [
  { value: "bug", label: "Bug", color: "red" },
  { value: "feature", label: "Feature", color: "blue" },
  { value: "enhancement", label: "Enhancement", color: "green" },
  { value: "urgent", label: "Urgent", color: "orange" },
];

<MultiSelectInput
  value={labels}
  onChange={setLabels}
  predefinedOptions={LABEL_OPTIONS}
  variant="badge"
/>
```

### Available Colors

- `red`
- `orange`
- `yellow`
- `green`
- `blue`
- `indigo`
- `purple`
- `pink`
- `gray`

## Advanced Examples

### With React Hook Form

```tsx
import { Controller } from "react-hook-form";

<Controller
  name="labels"
  control={control}
  render={({ field }) => (
    <MultiSelectInput
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      placeholder="Add labels..."
      predefinedOptions={PREDEFINED_LABELS}
      variant="badge"
    />
  )}
/>
```

### With Maximum Items Limit

```tsx
<MultiSelectInput
  value={labels}
  onChange={setLabels}
  maxItems={5}
  placeholder="Add up to 5 labels..."
/>
```

### Custom Only (No Predefined Options)

```tsx
<MultiSelectInput
  value={tags}
  onChange={setTags}
  allowCustom={true}
  placeholder="Type and press Enter to add..."
  variant="inline"
/>
```

### Predefined Only (No Custom Labels)

```tsx
<MultiSelectInput
  value={labels}
  onChange={setLabels}
  allowCustom={false}
  predefinedOptions={PREDEFINED_LABELS}
  variant="badge"
/>
```

## Keyboard Shortcuts

- **Enter**: Add current input as a new label (when `allowCustom` is true)
- **Backspace**: Remove last label when input is empty
- **Click**: Select from predefined options

## Real-World Usage

### Card Labels in Board App

```tsx
import { CARD_LABELS } from "@/pages/boards/constants";

<Field>
  <FieldLabel htmlFor="labels">Labels</FieldLabel>
  <Controller
    name="labels"
    control={control}
    render={({ field }) => (
      <MultiSelectInput
        value={Array.isArray(field.value) ? field.value : []}
        onChange={field.onChange}
        placeholder="Add labels..."
        allowCustom={true}
        predefinedOptions={CARD_LABELS}
        variant="badge"
        maxItems={10}
      />
    )}
  />
</Field>
```

## Styling

The component uses Tailwind CSS and respects your design system's color tokens:

- `bg-*-100` and `text-*-800` for colored badges
- `border-input` for input borders
- `ring-ring` for focus states
- `text-muted-foreground` for placeholders

## Accessibility

- All buttons have `aria-label` attributes
- Keyboard navigation supported
- Focus management handled automatically
- Screen reader friendly

## Type Definitions

```typescript
interface LabelOption {
  value: string;
  label: string;
  color?: string;
}

interface MultiSelectInputProps {
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
```

## Tips

1. **Use the badge variant** for clean, modern forms
2. **Provide predefined options** for consistent labeling
3. **Set maxItems** to prevent cluttered UIs
4. **Allow custom labels** for flexibility
5. **Use colors wisely** - they convey meaning

## Related Components

- `Input` - Base input component
- `Badge` - Badge component for displaying labels
- `Popover` - Popover component for predefined options
- `Button` - Button component for actions

## Future Enhancements

- [ ] Drag and drop reordering
- [ ] Label search/filter
- [ ] Label categories/groups
- [ ] Label autocomplete
- [ ] Label validation
- [ ] Async loading of predefined options

---

**Questions or Issues?** Check the implementation at `src/components/ui/multi-select-input.tsx`
