# shadcn-ui Setup Guide

## Current Configuration

This webapp is configured with shadcn-ui using the following setup:

### Configuration (`components.json`)

- **Style**: new-york
- **RSC**: Enabled (React Server Components)
- **TypeScript**: Enabled
- **Base Color**: neutral
- **CSS Variables**: Enabled
- **Icon Library**: lucide-react
- **Tailwind CSS**: v4.0.15 (latest)

### Path Aliases

- `~/components` - Components directory
- `~/lib/utils` - Utilities (includes `cn()` helper)
- `~/components/ui` - UI components from shadcn
- `~/lib` - Library code
- `~/hooks` - React hooks

### Installed Dependencies

```json
{
  "@radix-ui/react-slot": "^1.2.3",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "lucide-react": "^0.544.0",
  "tailwind-merge": "^3.3.1",
  "tw-animate-css": "^1.4.0"
}
```

### Installed Components

- ✅ Button (`src/components/ui/button.tsx`)

## Installing New Components

### Method 1: Using shadcn CLI (Recommended)

```bash
cd apps/webapp
npx shadcn@latest add [component-name]
```

**Examples:**

```bash
# Install single component
npx shadcn@latest add dialog

# Install multiple components
npx shadcn@latest add card alert badge

# Install all components (not recommended)
npx shadcn@latest add --all
```

### Method 2: Manual Installation

If the CLI doesn't work, manually copy components from https://ui.shadcn.com/docs/components

1. Copy the component code from the shadcn docs
2. Create the file in `src/components/ui/[component-name].tsx`
3. Install any required peer dependencies

## Common Components to Install

### Form Components

```bash
npx shadcn@latest add form input label textarea checkbox radio-group select switch
```

### Feedback Components

```bash
npx shadcn@latest add alert toast dialog alert-dialog
```

### Layout Components

```bash
npx shadcn@latest add card separator tabs accordion
```

### Navigation Components

```bash
npx shadcn@latest add dropdown-menu navigation-menu menubar
```

### Data Display

```bash
npx shadcn@latest add table badge avatar skeleton
```

## Usage Example

```tsx
import { Button } from '~/components/ui/button'

export default function MyComponent() {
  return (
    <div>
      <Button variant="default">Click me</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Delete</Button>
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
    </div>
  )
}
```

## Utilities

### `cn()` Helper

Located in `src/lib/utils.ts`, this utility combines `clsx` and `tailwind-merge` for conditional className merging:

```tsx
import { cn } from '~/lib/utils'

;<div
  className={cn('base-class', condition && 'conditional-class', className)}
/>
```

## Theming

Theme variables are defined in `src/styles/globals.css` using CSS custom properties with both light and dark mode support.

### Customizing Colors

Edit the CSS variables in `globals.css`:

```css
:root {
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  /* ... other variables */
}
```

### Using Theme Colors

```tsx
<div className="bg-primary text-primary-foreground">Themed content</div>
```

## Best Practices

1. **Always use the CLI**: Let shadcn manage component installation to ensure consistency
2. **Path aliases**: Use `~/` prefix for imports (configured in `tsconfig.json`)
3. **Customize variants**: Extend component variants in the component file, not globally
4. **Theme colors**: Use CSS variables instead of hardcoded colors
5. **Icons**: Use `lucide-react` for icons (already included)

## Troubleshooting

### CLI Not Finding Components

Make sure you're in the webapp directory:

```bash
cd apps/webapp
npx shadcn@latest add [component]
```

### Import Errors

Check that path aliases are working:

- `~/components/ui/button` should resolve to `src/components/ui/button.tsx`
- Verify `tsconfig.json` has the correct `paths` configuration

### Styling Issues

- Ensure Tailwind CSS is properly configured
- Check that `globals.css` is imported in your root layout
- Verify CSS variables are defined for both light and dark modes

## Resources

- [shadcn-ui Documentation](https://ui.shadcn.com)
- [shadcn-ui Components](https://ui.shadcn.com/docs/components)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives/overview/introduction)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
