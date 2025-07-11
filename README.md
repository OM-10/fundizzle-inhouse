# GrantMatch Clone - Next.js Implementation

A complete clone of the GrantMatch website built with Next.js, TypeScript, Tailwind CSS, and modern React patterns.

## 🚀 Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **TypeScript**: Full type safety throughout the application
- **Component Architecture**: Modular, reusable components
- **Navigation**: Multi-level dropdown menus with mobile support
- **Interactive Elements**: Hover effects, animations, and smooth scrolling
- **SEO Optimized**: Meta tags, structured data, and semantic HTML
- **Performance**: Optimized images, code splitting, and lazy loading

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Main navigation with dropdowns
│   │   ├── Footer.tsx          # Footer with newsletter signup
│   │   └── Layout.tsx          # Page wrapper component
│   ├── sections/
│   │   ├── HeroSection.tsx     # Homepage hero section
│   │   ├── TechnologySection.tsx
│   │   ├── ClientSegments.tsx   # Three client types
│   │   ├── ProcessSection.tsx   # Start-to-finish support
│   │   ├── FundingCategories.tsx
│   │   ├── SuccessStories.tsx   # Client success metrics
│   │   ├── ClientLogos.tsx      # Social proof section
│   │   ├── PlatformPromotion.tsx
│   │   └── Testimonials.tsx     # Client testimonials
│   └── ui/
│       └── Button.tsx          # Reusable button component
├── contexts/
│   └── AppContext.tsx          # Global state management
├── hooks/
│   └── useNavigation.ts        # Navigation state hooks
├── pages/
│   ├── _app.tsx               # App wrapper with providers
│   ├── index.tsx              # Homepage
│   ├── solutions/
│   │   └── small-business.tsx # Example solution page
│   ├── success-stories.tsx    # Success stories page
│   └── about/
│       └── contact.tsx        # Contact page
└── styles/
    └── globals.css            # Global styles and Tailwind
```

## 🛠️ Technology Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: React Icons (Feather Icons)
- **Animations**: Framer Motion
- **State Management**: React Context API
- **Build Tool**: Next.js built-in bundler

## 🎨 Design System

### Colors
- **Primary**: Blue palette (#3b82f6 - #1e3a8a)
- **Success**: Green palette (#10b981 - #064e3b)
- **Gray**: Neutral palette (#f9fafb - #111827)

### Typography
- **Font**: Inter (Google Fonts)
- **Scale**: Tailwind default scale with custom line heights

### Components
- **Buttons**: Primary, secondary, outline variants
- **Cards**: Rounded corners with subtle shadows
- **Navigation**: Multi-level dropdowns with smooth animations

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd grantmatch-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Building for Production

```bash
npm run build
npm start
```

## 🎯 Key Features Implemented

### Navigation
- ✅ Multi-level dropdown menus
- ✅ Mobile hamburger menu
- ✅ Smooth hover interactions
- ✅ Keyboard navigation support

### Homepage Sections
- ✅ Hero section with dual CTAs
- ✅ Technology highlights
- ✅ Client segmentation (3 types)
- ✅ Process explanation
- ✅ Funding categories (4 types)
- ✅ Success stories with metrics
- ✅ Client logos showcase
- ✅ Platform promotion
- ✅ Customer testimonials

### Pages
- ✅ Homepage (complete)
- ✅ Small Business Solutions
- ✅ Success Stories
- ✅ Contact Us
- 🔄 Additional solution pages (planned)

### Interactive Behaviors
- ✅ Responsive design (mobile-first)
- ✅ Hover effects and animations
- ✅ Form validation
- ✅ Smooth scrolling
- ✅ Loading states
- ✅ Accessible components

## 🎨 Customization

### Adding New Sections
1. Create component in `src/components/sections/`
2. Import and add to desired page
3. Style with Tailwind CSS classes

### Modifying Navigation
Edit the `navigationItems` array in `src/components/layout/Header.tsx`

### Updating Content
- Success stories: `src/components/sections/SuccessStories.tsx`
- Testimonials: `src/components/sections/Testimonials.tsx`
- Client segments: `src/components/sections/ClientSegments.tsx`

### Styling Changes
- Global styles: `src/styles/globals.css`
- Theme colors: `tailwind.config.js`
- Component styles: Individual component files

## 📱 Responsive Design

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

All components are designed mobile-first with progressive enhancement for larger screens.

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for:
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### SEO Configuration
Update meta tags in `src/components/layout/Layout.tsx` for:
- Page titles
- Descriptions
- Keywords
- Open Graph tags

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically

### Other Platforms
- Netlify
- AWS Amplify
- Traditional hosting with `npm run build`

## 📈 Performance Optimizations

- ✅ Image optimization with Next.js Image component
- ✅ Code splitting with dynamic imports
- ✅ CSS optimization with Tailwind CSS purging
- ✅ Font optimization with Google Fonts
- ✅ Lazy loading for non-critical components

## 🧪 Testing

```bash
# Run ESLint
npm run lint

# Type checking
npm run type-check
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational/portfolio purposes. Please respect GrantMatch's actual trademark and branding.

## 📞 Support

For questions or issues:
- Create an issue in the repository
- Review the code documentation
- Check the component examples

## Environment Variables

- `EXTERNAL_GRANTS_API_URL`: (optional) The URL for the external grants API. Defaults to `http://127.0.0.1:5000/match-grants` if not set. Set this in your `.env.local` or deployment environment to point to your production API.

---

Built with ❤️ using Next.js and Tailwind CSS 