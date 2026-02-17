# UI Components

Reusable UI components for the African Fashion eCommerce platform.

## Components

### Button
Button component with multiple variants and sizes.

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'accent' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `isLoading`: boolean (default: false)

**Usage:**
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md">Click me</Button>
<Button variant="accent" size="lg" isLoading>Loading...</Button>
```

### Input
Text input with label, error state, and icon support.

**Props:**
- `label`: string
- `error`: string
- `icon`: React.ReactNode
- `helperText`: string

**Usage:**
```tsx
import { Input } from '@/components/ui';

<Input 
  label="Email" 
  placeholder="Enter your email"
  error="Invalid email"
  icon={<EmailIcon />}
/>
```

### Select
Dropdown select with label and error state.

**Props:**
- `label`: string
- `error`: string
- `options`: SelectOption[]
- `placeholder`: string
- `helperText`: string

**Usage:**
```tsx
import { Select } from '@/components/ui';

<Select
  label="Country"
  options={[
    { value: 'ng', label: 'Nigeria' },
    { value: 'gh', label: 'Ghana' },
  ]}
  placeholder="Select a country"
/>
```

### Badge
Badge component for status/tags with color variants.

**Props:**
- `variant`: 'default' | 'gold' | 'accent' | 'success' | 'warning' | 'info' (default: 'default')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')

**Usage:**
```tsx
import { Badge } from '@/components/ui';

<Badge variant="gold">New</Badge>
<Badge variant="success" size="sm">In Stock</Badge>
```

### Card
Container card component with optional sub-components.

**Props:**
- `hover`: boolean (default: false)
- `padding`: 'none' | 'sm' | 'md' | 'lg' (default: 'md')
- `onClick`: () => void

**Sub-components:**
- `CardHeader`
- `CardTitle`
- `CardDescription`
- `CardContent`
- `CardFooter`

**Usage:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

<Card hover>
  <CardHeader>
    <CardTitle>Product Name</CardTitle>
    <CardDescription>Product description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

### Modal
Modal dialog with overlay and close button.

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `showCloseButton`: boolean (default: true)

**Sub-components:**
- `ModalFooter`

**Usage:**
```tsx
import { Modal, ModalFooter, Button } from '@/components/ui';

<Modal isOpen={isOpen} onClose={handleClose} title="Confirm Action">
  <p>Are you sure you want to proceed?</p>
  <ModalFooter>
    <Button variant="outline" onClick={handleClose}>Cancel</Button>
    <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
  </ModalFooter>
</Modal>
```

### Spinner
Loading spinner component.

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `color`: 'gold' | 'dark' | 'accent' | 'white' (default: 'gold')

**Sub-components:**
- `SpinnerOverlay` - Full screen loading overlay

**Usage:**
```tsx
import { Spinner, SpinnerOverlay } from '@/components/ui';

<Spinner size="lg" color="gold" />
<SpinnerOverlay text="Loading products..." />
```

## Color Palette

The components use the African-inspired color palette defined in `globals.css`:

- **Gold**: `#D4AF37` - Primary brand color
- **Dark**: `#1a1a1a` - Text and backgrounds
- **Cream**: `#F5F1E8` - Light backgrounds
- **Accent**: `#C41E3A` - Call-to-action and highlights

## Development

All components are built with:
- TypeScript for type safety
- React functional components with hooks
- Tailwind CSS for styling
- Proper accessibility attributes
- Responsive design

## Import

Components can be imported individually or as a group:

```tsx
// Individual imports
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

// Group import
import { Button, Input, Card } from '@/components/ui';
```
