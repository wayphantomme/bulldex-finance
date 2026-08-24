# Bulldex Finance - Brand Guidelines

**"Trade Like a Bull. Earn Like a Beast."**

---

## 1. Brand Overview

**Bulldex Finance** is a decentralized trading protocol for bullish traders and yield farmers. The brand represents strength, reliability, and aggressive growth in the DeFi space.

### Brand Pillars
1. **Powerful** - Advanced DeFi features
2. **Reliable** - Security and transparency first
3. **Bullish** - Optimistic market sentiment
4. **Accessible** - Simple, intuitive UI for all

---

## 2. Visual Identity

### Logo

**Primary Logo** (Use most of the time)
- Bull head symbol
- Purple + amber colors
- Clean, modern design
- Scalable from 16px to 1000px+

**Logo Variations**
- Icon only (bull head)
- Horizontal (icon + text)
- Vertical (icon stacked on text)
- Monochrome (for special uses)

**Logo Don'ts**
- ❌ Never rotate logo
- ❌ Never distort/stretch proportions
- ❌ Never remove the bull symbol
- ❌ Never use different colors than brand palette
- ❌ Never add drop shadows or effects

### Color Palette

#### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Bulldex Purple** | #7C3AED | 124, 58, 237 | Primary brand color, buttons, links |
| **Bulldex Amber** | #F59E0B | 245, 158, 11 | Accent, bull strength, highlights |
| **Deep Navy** | #0F172A | 15, 23, 42 | Background, dark surfaces |

#### Secondary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Card Surface** | #1E293B | 30, 41, 59 | Card backgrounds, elevated surfaces |
| **Success Green** | #10B981 | 16, 185, 129 | Positive actions, gains |
| **Error Red** | #EF4444 | 239, 68, 68 | Errors, losses, dangers |
| **Warning Amber** | #FBBF24 | 251, 191, 36 | Warnings, alerts |
| **Muted Gray** | #64748B | 100, 116, 139 | Disabled text, secondary info |

#### Color Combinations

```
Primary Actions:
  Background: #7C3AED (Bulldex Purple)
  Text: #FFFFFF (White)
  Hover: #6D28D9 (Darker Purple)

Secondary Actions:
  Background: #F59E0B (Bulldex Amber)
  Text: #0F172A (Deep Navy)
  Hover: #D97706 (Darker Amber)

Success State:
  Background: #10B981 (Green)
  Text: #FFFFFF (White)

Error State:
  Background: #EF4444 (Red)
  Text: #FFFFFF (White)
```

### Typography

#### Font Stack
```css
/* Headings */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", 
             "Helvetica Neue", sans-serif;
font-weight: 600-700;

/* Body */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", 
             "Helvetica Neue", sans-serif;
font-weight: 400-500;
line-height: 1.6;

/* Code/Mono */
font-family: "Courier New", monospace;
```

#### Font Sizes

| Usage | Size | Weight | Line Height |
|-------|------|--------|-------------|
| **Hero/H1** | 32-48px | 700 | 1.2 |
| **Page Title/H2** | 24-32px | 600 | 1.3 |
| **Section/H3** | 18-24px | 600 | 1.4 |
| **Subsection/H4** | 16-18px | 600 | 1.4 |
| **Body** | 14-16px | 400 | 1.6 |
| **Small/Caption** | 12-14px | 400 | 1.5 |
| **Mono/Code** | 12-13px | 400 | 1.5 |

#### Font Usage

```
Hero Text:
"Trade Like a Bull. Earn Like a Beast."
32px, 700 weight, Bulldex Purple

Page Titles:
"Swap Tokens"
28px, 600 weight, Bulldex Purple

Body Copy:
"Connect your wallet to start trading"
14px, 400 weight, Gray

Interactive Elements:
Buttons, Links use 500 weight for emphasis
```

---

## 3. UI Components

### Buttons

**Primary Button** (Main CTA)
```
Background: #7C3AED (Purple)
Text: White
Padding: 12px 24px
Border-radius: 8px
Font-size: 14px
Font-weight: 500
Transition: 0.2s ease

Hover: #6D28D9 (Darker)
Disabled: #94A3B8 (Gray)
```

**Secondary Button** (Alternative CTA)
```
Background: #F59E0B (Amber)
Text: #0F172A (Navy)
Padding: 12px 24px
Border-radius: 8px
Font-size: 14px
Font-weight: 500
Transition: 0.2s ease

Hover: #D97706 (Darker Amber)
Disabled: #CBD5E1 (Gray)
```

**Tertiary Button** (Link style)
```
Background: Transparent
Text: #7C3AED (Purple)
Padding: 8px 16px
Border: 1px solid #E2E8F0 (Border)
Border-radius: 8px
Font-size: 14px

Hover: Background #F3F4F6 (Light gray)
```

### Cards

**Standard Card**
```
Background: #1E293B (Card Surface)
Border: 1px solid #334155 (Border)
Border-radius: 12px
Padding: 24px
Box-shadow: None (flat design)
Transition: Box-shadow 0.2s ease

Hover: Box-shadow 0 4px 6px rgba(0,0,0,0.1)
```

**Elevated Card**
```
Background: #1E293B
Border: None
Border-radius: 12px
Padding: 24px
Box-shadow: 0 4px 12px rgba(0,0,0,0.15)

On Hover: Box-shadow 0 8px 16px rgba(0,0,0,0.2)
```

### Input Fields

```
Background: #0F172A (Dark)
Border: 1px solid #334155
Border-radius: 8px
Padding: 12px 16px
Font-size: 14px
Color: White

Focus: Border #7C3AED (Purple highlight)
Error: Border #EF4444 (Red)
Disabled: Background #1E293B, Opacity 0.5
```

### Badge/Pill

```
Background: #7C3AED (Purple)
Text: White
Padding: 4px 12px
Border-radius: 16px (fully rounded)
Font-size: 12px
Font-weight: 500

Variants:
  - Success: Green background
  - Error: Red background
  - Warning: Amber background
```

---

## 4. Layout & Spacing

### Spacing Scale
```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
3xl: 64px
```

### Grid System
```
Base: 12-column grid
Gutter: 24px (md)
Max-width: 1280px (2xl)
Padding: 16px-32px (responsive)
```

### Card Spacing
```
Horizontal gap between cards: 24px
Vertical gap between cards: 24px
Padding inside cards: 24px
```

---

## 5. Dark Mode Only

Bulldex Finance is **dark mode only** - no light theme.

```
Background (Page): #0F172A
Surface (Cards): #1E293B
Text (Primary): #FFFFFF
Text (Secondary): #CBD5E1
Border: #334155
```

**Why dark mode only?**
- Bullish, modern aesthetic
- Better for crypto/trading apps
- Less clutter, better focus
- Aligns with Jupiter/Uniswap inspiration

---

## 6. Icons

**Icon Library:** Tabler Icons (outline only)
- Consistent, clean style
- 200+ icons available
- Scalable to any size
- Free and open-source

**Icon Sizing**
```
Inline (in text): 16px
Button icons: 20px
Large icons: 24px
Hero section: 48px+
```

**Icon Colors**
```
Primary: #7C3AED (Purple)
Secondary: #F59E0B (Amber)
Success: #10B981 (Green)
Error: #EF4444 (Red)
Muted: #64748B (Gray)
White: #FFFFFF
```

**Icon Usage**
```
✓ Use outline icons only
✓ Pair with text labels when unclear
✓ Use consistent size throughout
✗ Don't use filled icons
✗ Don't change proportions
✗ Don't apply filters/effects
```

---

## 7. Photography & Imagery

**Style:** Minimalist, abstract, geometric

**Subject Matter**
- ✓ Abstract bull/market imagery
- ✓ Charts, graphs, financial visuals
- ✓ Digital/crypto aesthetics
- ✗ Real people's faces
- ✗ Generic stock photography
- ✗ Photorealistic images

**Color Treatment**
- Use brand colors (purple, amber)
- Keep dark background
- Overlay with gradient if needed

---

## 8. Writing Style (Tone of Voice)

### Brand Voice

**Bullish** - Optimistic, confident, empowering
- "Trade with power"
- "Maximize your gains"

**Accessible** - Clear, jargon-free, helpful
- Explain concepts simply
- Guide users step-by-step

**Playful** - Fun, witty, memorable
- "Trade Like a Bull. Earn Like a Beast."
- Use bull/market metaphors

**Professional** - Trustworthy, reliable, secure
- Clear error messages
- Transparent pricing/fees

### Copy Guidelines

```
✓ Active voice: "Swap tokens now"
✓ Action-oriented: "Claim rewards"
✓ Short sentences
✓ Call-to-action buttons in caps: "SWAP", "STAKE"

✗ Passive: "Tokens can be swapped"
✗ Vague: "Do something"
✗ Long paragraphs
✗ Marketing fluff
```

### Example Copy

| Component | Copy | Tone |
|-----------|------|------|
| Hero | "Trade Like a Bull. Earn Like a Beast." | Bullish, catchy |
| CTA Button | "START TRADING" | Action, bold |
| Error | "Insufficient balance. Get more funds to continue." | Clear, helpful |
| Success | "Swap complete! Check Etherscan →" | Positive, linked |
| Empty State | "No transactions yet. Make your first swap!" | Encouraging |

---

## 9. Application Examples

### Homepage Hero Section
```
Background: Gradient from #0F172A to #1E293B
Heading: 48px, 700 weight, Purple
Subheading: 24px, 400 weight, Gray
Button: Primary (Purple) + Secondary (Amber)
Icon: Large bull icon, 64px
```

### Swap Card
```
Title: "Swap", 20px, 600 weight
Input 1: Dark input field, "You sell"
Swap Icon: 24px, centered
Input 2: Dark input field, "You receive"
Info Row: Gas cost, slippage (small gray text)
Button: Primary "SWAP" button
```

### Transaction Pending
```
Background: Card surface #1E293B
Spinner: Animated purple circle
Text: "Swapping...", gray secondary text
Hash: Monospace address (truncated)
Link: "View on Etherscan" (amber link)
```

### Success State
```
Background: Card with green accent
Icon: Checkmark (green), 48px
Heading: "Transaction Complete", green text
Hash: "0x1234..." with copy button
Link: "View on Etherscan" (amber)
Button: "Done" or "Back to Dashboard"
```

---

## 10. Social Media & Marketing

### Social Media Assets

**Twitter/X**
- Header: 1500x500px
- Avatar: 400x400px (bull icon)
- Post images: 1200x675px
- Colors: Use full brand palette
- Tone: Bullish, playful, informative

**Discord** (Future)
- Server icon: Bull head, 1024x1024px
- Banner: 960x540px
- Roles: Purple/amber colors

### Hashtags
```
Primary:
#BulldexFinance #BullDeFi #DeFi

Community:
#BuildInPublic #DeFiBuilder #Sepolia
```

### Brand Mentions
```
"Bulldex Finance - Decentralized Trading Protocol"
"Trade Like a Bull. Earn Like a Beast."
@wayphantomme
```

---

## 11. Usage Examples

### ✅ DO's

✅ Use bull imagery and metaphors  
✅ Maintain purple + amber color scheme  
✅ Keep dark background consistent  
✅ Use outline icons from Tabler  
✅ Write in active, bullish voice  
✅ Keep spacing consistent (4px grid)  
✅ Use only specified fonts  
✅ Apply hover/active states to interactive elements  

### ❌ DON'Ts

❌ Use light theme/light backgrounds  
❌ Apply gradient effects to logo  
❌ Mix other color schemes  
❌ Use filled/solid icons  
❌ Use serif fonts  
❌ Add shadows or heavy effects  
❌ Distort logo proportions  
❌ Use marketing fluff or jargon  

---

## 12. Resources

### Design Files
- Figma: (To be created)
- Logo SVG: `/brand/logo.svg`
- Colors: `/brand/colors.css`
- Fonts: Google Fonts (Inter, Geist Sans)

### Tools Used
- **UI Framework:** Tailwind CSS
- **Icons:** Tabler Icons (outline)
- **Design Tool:** Figma (when available)
- **Fonts:** System fonts + Google Fonts

---

## 13. Checklist for New Designs

Before shipping any UI:

- [ ] Uses brand colors (purple/amber)
- [ ] Dark background only
- [ ] Consistent typography scale
- [ ] Proper spacing (4px grid)
- [ ] Tabler outline icons only
- [ ] Hover/active states defined
- [ ] 8px border-radius (12px for cards)
- [ ] Responsive layout tested
- [ ] Accessibility checked (contrast ratios)
- [ ] Copy is bullish and clear
- [ ] No drop shadows or effects
- [ ] Brand voice consistent

---

## 14. Brand Evolution

**Version 1.0** (Current)
- Bull logo
- Purple + Amber colors
- Dark mode only
- Tabler icons
- Sans-serif typography

**Future Considerations**
- Bull mascot character (v2)
- Animated bull logo (v2)
- Light mode option (v3)
- Additional asset types (v3)

---

**Last Updated:** 2026-08-24  
**Maintained by:** Phantom  
**Questions?** Check PRD.md or TRD.md for context

---

**Trade Like a Bull. Earn Like a Beast. 💪📈**
