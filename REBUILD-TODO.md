# Trade Tracker Rebuild TODO List

## Core Features to Rebuild

### 1. Trading Chart Analysis Page (`/dashboard/capture`)

- [ ] Screen capture component
  - [ ] Window selection functionality
  - [ ] Screenshot capture and preview
  - [ ] Error handling and toast notifications
- [ ] Analysis form
  - [ ] Text input field for analysis prompt
  - [ ] Analysis trigger button
  - [ ] Loading states
- [ ] Analysis display
  - [ ] Markdown rendering of AI response
  - [ ] Proper styling and formatting
- [ ] Integration with Gemini AI
  - [ ] Image and text processing
  - [ ] API route for analysis
  - [ ] Error handling

### 2. Credits System

- [ ] Credits management pages
  - [ ] Credit balance display
  - [ ] Purchase credits interface
  - [ ] Credit history table
- [x] Credit pricing
  - [x] Base price: 0.38€ per credit
  - [x] Minimum purchase: 6€ (~15 credits)
  - [x] Maximum purchase: 1000€ (~2632 credits)
  - [x] 20% discount for subscribers
- [ ] Credit transaction handling
  - [ ] Purchase flow
  - [ ] Usage tracking
  - [ ] Transaction history

### 3. Billing and Subscription

- [x] Subscription plans
  - [x] Free tier (6 credits/month)
  - [x] Pro tier (100 credits/month)
- [ ] Billing page
  - [ ] Current plan display
  - [ ] Upgrade/downgrade options
  - [ ] Payment history
- [ ] Stripe integration
  - [ ] Payment processing
  - [ ] Webhook handling
  - [ ] Subscription management

### 4. Contact Page

- [x] Contact form
  - [x] Name, email, message fields
  - [x] Form validation
  - [x] Email submission
- [x] Contact information display
  - [x] Support email
  - [x] Social media links
- [x] Success/error notifications

### 5. Pricing Page

- [x] Plan comparison
  - [x] Feature comparison table
  - [x] Pricing details
  - [x] Subscription benefits
- [x] Pricing cards
  - [x] Monthly/yearly toggle
  - [x] Subscription discount display
  - [x] Call-to-action buttons
- [x] FAQ section

## Components to Rebuild

### UI Components

- [ ] Markdown renderer
  - [ ] Custom styling for different elements
  - [ ] Code block formatting
  - [ ] List styling
- [ ] Screen capture tool
  - [ ] Window selection UI
  - [ ] Preview component
- [ ] Credit purchase slider
  - [ ] Amount selection
  - [ ] Credit calculation
  - [ ] Price display
- [ ] Transaction history table
  - [ ] Status indicators
  - [ ] Date formatting
  - [ ] Type icons

### Layout Components

- [ ] Dashboard layout
  - [ ] Sidebar navigation
  - [ ] Header
  - [ ] Content area
- [ ] Marketing layout
  - [ ] Navigation bar
  - [ ] Footer
  - [ ] Page containers

## API Routes to Implement

### Analysis

- [ ] `/api/analyze`
  - [ ] Image processing
  - [ ] Gemini AI integration
  - [ ] Credit deduction

### Credits

- [ ] `/api/credits/purchase`
  - [ ] Stripe integration
  - [ ] Credit allocation
- [ ] `/api/credits/history`
  - [ ] Transaction listing
  - [ ] Filtering options

### Billing

- [ ] `/api/billing/subscribe`
  - [ ] Plan management
  - [ ] Payment processing
- [ ] `/api/webhooks/stripe`
  - [ ] Payment confirmation
  - [ ] Subscription updates

## Database Schema Updates

- [ ] User credits table
- [ ] Transaction history
- [ ] Subscription details
- [ ] Analysis history

## Testing

- [ ] Credit system tests
- [ ] Payment processing tests
- [ ] Analysis functionality tests
- [ ] Component unit tests

## Documentation

- [ ] API documentation
- [ ] Component documentation
- [ ] Setup instructions
- [ ] Environment variables list

## Design System

### Color Palette

- Primary Colors:
  - Blue: `bg-blue-500` (Brand color, used for primary actions and highlights)
  - Background: `bg-background` (System theme aware)
  - Muted: `bg-muted` (Secondary backgrounds)
  - Foreground: `text-foreground` (Primary text)
  - Muted Foreground: `text-muted-foreground` (Secondary text)

### Typography

- Font Families:
  - Primary: "Inter" (Body text)
  - Urban: "Urban" (Headings and brand text)
- Font Sizes:
  - Headings:
    - h1: `text-3xl md:text-4xl lg:text-[40px]`
    - h2: `text-2xl font-bold`
    - h3: `text-xl font-bold`
  - Body: `text-sm` or `text-base`
  - Small text: `text-xs`

### Component Styling

- Cards:
  - Primary: `rounded-lg border bg-card p-6 shadow-sm`
  - Gradient: `from-blue-50 to-blue-100 bg-gradient-to-br dark:from-blue-900/10 dark:to-blue-900/20`
- Buttons:
  - Primary: `bg-blue-500 hover:bg-blue-600 text-white`
  - Secondary: `bg-secondary hover:bg-secondary/80`
  - Ghost: `hover:bg-muted`
  - Rounded variants: `rounded-full` or `rounded-lg`
- Forms:
  - Inputs: `rounded-md border bg-background px-3 py-2`
  - Labels: `text-sm font-medium text-foreground`
  - Error messages: `text-sm text-red-600`

### Layout Spacing

- Container max widths:
  - Default: `max-w-6xl`
  - Narrow: `max-w-4xl`
- Spacing:
  - Section gaps: `space-y-6` or `space-y-8`
  - Component padding: `p-4` or `p-6`
  - Grid gaps: `gap-4` or `gap-6`

### UI Elements

- Icons:
  - Size: `size-4` (small) or `size-5` (medium)
  - Colors: Inherit from text color or specific brand colors
- Shadows:
  - Cards: `shadow-sm`
  - Dropdowns: `shadow-md`
- Borders:
  - Default: `border border-border`
  - Focus: `ring-2 ring-ring ring-offset-2`

### Interactive States

- Hover effects:
  - Links: `hover:text-foreground/80`
  - Buttons: `hover:bg-primary/90`
  - Cards: `hover:bg-muted/50`
- Active/Selected:
  - Navigation: `bg-muted`
  - Buttons: `active:scale-95`
- Disabled:
  - Opacity: `opacity-50`
  - Cursor: `cursor-not-allowed`

### Responsive Design

- Breakpoints:
  - Mobile first approach
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
- Layout changes:
  - Stack to grid: `grid md:grid-cols-2`
  - Hide/show: `hidden md:block`
  - Font sizes: `text-sm md:text-base`

### Animation

- Transitions:
  - Default: `transition-all duration-200`
  - Smooth hover: `transition-colors duration-200`
- Loading states:
  - Spinner: `animate-spin`
  - Pulse: `animate-pulse`
  - Fade: `animate-in fade-in`

### Dark Mode Support

- Background adaptation:
  - Light: `bg-white dark:bg-slate-950`
  - Card: `bg-card dark:bg-card-dark`
- Text adaptation:
  - Primary: `text-slate-900 dark:text-slate-50`
  - Secondary: `text-slate-500 dark:text-slate-400`
- Border adaptation:
  - Default: `border-slate-200 dark:border-slate-800`
