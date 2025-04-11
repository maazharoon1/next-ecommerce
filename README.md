## changes 
I wrote product as name in product Schema 

search
 
```
CodeChange
```
 needed if you need another payement gateway except stripe  

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started



First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.




## how can i make this first I install nextJS 

```
npm i nextjs@latest 
```

then I install sanity it better to use sanity blog template it make easier to understand how sanityType 
define and how structure.ts structure  

then i setup sanity
by created Sanity environment variables in .env file
and gave a url endpoint

then i create type for categories order product and sales 
type are similar to mongoose schema

in categoryType 
I can create a variable categoryType and use defineType (prebuilt function in sanity to define Type of you schema ) I

```
export const categoryType = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: TagIcon, 
  feilds:[
    defineField({
      name: 'title',
      type: 'string',
    }),
  ],
    preview: {
        select: {
            title: 'title',
            Subtitle: 'description'
        }
    }
  })
```
like that i also use defineFeild()  another prebuilt sanity function and tagIcon from sanity Icons then i add preview which can show on my sanity dashboard 

productType,orderType and salesType are similar to categoryType

then I update sturucture.ts in sanity folder

then i set this script in package.json 

```
 "typegen": "npx sanity@latest schema extract && npx sanity@latest typegen generate"
 ```
 and run typegen 
 then it add this type in sanity backened

to be continued

## Project Structure and Implementation

After setting up Sanity types and schemas, I organized the project with the following structure:

### Key Directories:
- `app/`: Contains the Next.js application pages and routes
- `components/`: Reusable UI components
- `store/`: State management (likely using Redux or similar)
- `lib/`: Utility functions and shared code
- `sanity/`: Sanity CMS configuration and schemas
- `public/`: Static assets

### Important Configuration Files:
- `sanity.config.ts`: Main Sanity configuration
- `sanity.cli.ts`: Sanity CLI configuration
- `middleware.ts`: Next.js middleware for routing and authentication
- `next.config.ts`: Next.js configuration
- `.env.local`: Environment variables

### Implementation Details:

1. **Authentication Setup**
   - Implemented user authentication system
   - Protected routes using middleware

2. **State Management**
   - Set up store for managing application state
   - Implemented cart functionality

3. **Sanity Integration**
   - Connected Sanity Studio for content management
   - Created schemas for:
     - Products
     - Categories
     - Orders
     - Sales

4. **UI Components**
   - Built reusable components using modern practices
   - Implemented responsive design

5. **API Routes**
   - Created API endpoints for:
     - Product management
     - Order processing
     - User operations

To run the project locally:

1. Clone the repository
2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables in `.env.local`
4. Run the development server:
```bash
npm run dev
```

5. For Sanity Studio, run:
```bash
npm run sanity dev
```

The project will be available at http://localhost:3000 and Sanity Studio at http://localhost:3000/studio

## Sanity Integration Details

### Schema Setup

1. **Category Schema**
```typescript
export const categoryType = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: TagIcon, 
  feilds:[
    defineField({
      name: 'title',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      Subtitle: 'description'
    }
  }
})
```

### Schema Generation

1. Add the typegen script to package.json:
```json
{
  "scripts": {
    "typegen": "npx sanity@latest schema extract && npx sanity@latest typegen generate"
  }
}
```

2. Run the typegen command to generate TypeScript types:
```bash
npm run typegen
```

### Environment Setup

Create a `.env.local` file with necessary Sanity credentials:
```plaintext
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token
```

### Content Types
The project includes the following Sanity document types:
- Categories: For product categorization
- Products: Main product information
- Orders: Customer order details
- Sales: Sales and transaction records

Each type is defined using Sanity's `defineType` and `defineField` functions for type-safe schema definitions.

## Features and Implementation

### 1. Product Management

The product management system includes:
- Product creation and editing through Sanity Studio
- Image handling with automatic optimization
- Price and inventory management
- Category-based organization
- Product variants support

### 2. Shopping Cart Implementation

The cart functionality includes:
- Add/remove items
- Update quantities
- Save cart in local storage
- Price calculations
- Tax handling
- Shipping options

### 3. User Authentication Flow

The authentication system provides:
- User registration
- Secure login
- Password recovery
- Protected routes
- User profile management
- Order history

### 4. Checkout Process

The checkout implementation includes:
- Address collection
- Payment integration
- Order summary
- Email confirmations
- Order tracking

### 5. Admin Dashboard

The admin interface provides:
- Order management
- Inventory tracking
- Sales analytics
- User management
- Content management through Sanity

### API Structure

The API routes are organized as follows:

```plaintext
/api
  /products
    - GET /api/products - List all products
    - GET /api/products/[id] - Get single product
    - POST /api/products - Create product (protected)
    - PUT /api/products/[id] - Update product (protected)
  /orders
    - POST /api/orders - Create order
    - GET /api/orders/[id] - Get order details
  /users
    - POST /api/auth/register - User registration
    - POST /api/auth/login - User login
    - GET /api/users/me - Get current user
```

### Component Architecture

The UI components are structured as:

```plaintext
/components
  /layout
    - Header
    - Footer
    - Navigation
  /products
    - ProductCard
    - ProductList
    - ProductDetails
  /cart
    - CartItem
    - CartSummary
    - CheckoutForm
  /auth
    - LoginForm
    - RegisterForm
    - ProfileForm
  /common
    - Button
    - Input
    - Modal
```

### State Management

The application state is managed using:
- Global state for cart and user authentication
- Local state for UI components
- Server state for product data
- Persistent state for cart items

### Performance Optimizations

The project implements several optimizations:
1. Image optimization using Next.js Image component
2. Static page generation for product listings
3. Incremental Static Regeneration for dynamic content
4. Client-side data caching
5. Code splitting and lazy loading

### Development Workflow

To start development:

1. Clone and install dependencies:
```bash
git clone <repository-url>
cd next-e-commerce
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

3. Run development servers:
```bash
# Terminal 1 - Next.js
npm run dev

# Terminal 2 - Sanity Studio (if needed separately)
npm run sanity dev
```

4. Access the development environment:
- Frontend: http://localhost:3000
- Sanity Studio: http://localhost:3000/studio

## Common Issues and Solutions

### 1. Stripe Checkout Issues

```typescript
// Current Code
const Session = stripe.checkout.sessions.create({
  // ... other config
  line_items: items.map((item) => ({
    price_data: {
      currency: "usd",
      unit_amount: Math.round(item.product.price! * 100),
      product_data: {
        name: item.product.product || "Product",  // Note: using 'product' as name
        // ... other fields
      }
    }
  }))
})
```

**Issues and Fixes:**

1. **Product Name Field**
   - Issue: Using `item.product.product` for name (as mentioned in your note "I wrote product as name in product Schema")
   - Fix: Should be changed to `item.product.name` in your Sanity schema and code
   ```typescript
   name: item.product.name || "Product"
   ```

2. **Price Handling**
   - Issue: Using non-null assertion (`price!`) which could cause runtime errors
   - Fix: Add proper price validation
   ```typescript
   unit_amount: item.product.price ? Math.round(item.product.price * 100) : 0
   ```

3. **URL Handling**
   - Issue: Potential undefined URL in success/cancel URLs
   - Fix: Add fallback URL
   ```typescript
   success_url: `https://${process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL || 'localhost:3000'}/success`
   ```

4. **Image Handling**
   - Issue: Potential undefined check for images could be improved
   - Fix: Add proper image validation
   ```typescript
   images: item.product.image?.url ? [imageUrl(item.product.image).url()] : []
   ```

### 2. Payment Gateway Integration

If you need to add another payment gateway besides Stripe:

1. Create a payment gateway interface:
```typescript
interface PaymentGateway {
  createCheckoutSession(items: CartItem[]): Promise<string>;
  processPayment(amount: number): Promise<boolean>;
  handleWebhook(request: any): Promise<void>;
}
```

2. Implement for different providers:
```typescript
class StripeGateway implements PaymentGateway {
  // Current implementation
}

class PayPalGateway implements PaymentGateway {
  // PayPal specific implementation
}
```

3. Use factory pattern for gateway selection:
```typescript
const getPaymentGateway = (type: 'stripe' | 'paypal') => {
  switch(type) {
    case 'stripe':
      return new StripeGateway();
    case 'paypal':
      return new PayPalGateway();
    default:
      throw new Error('Unsupported payment gateway');
  }
};
```

### 3. Environment Variables Checklist

Make sure these environment variables are properly set:
```plaintext
STRIPE_SECRET_KEY=sk_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx
VERCEL_URL=your-domain.vercel.app
NEXT_PUBLIC_APP_URL=your-local-url
```

### 4. Error Handling Best Practices

Add proper error handling:
```typescript
try {
  const session = await stripe.checkout.sessions.create({
    // ... configuration
  });
  return session;
} catch (error) {
  console.error('Stripe session creation failed:', error);
  throw new Error('Payment session creation failed');
}
```

## Latest Changes (07-04-2024)

### Profile & Checkout Flow Implementation
1. Profile Page Structure
   - Added tabs for Profile Info, Addresses, and Orders
   - Implemented address management system
   - Added order history with payment details

2. Checkout Flow
   - Cart Page:
     - Added payment method selection (Cash/Card)
     - Integrated shipping address collection
   - Stripe Integration:
     - Set up Stripe checkout for card payments
     - Added webhook handling for payment status
   - Order Processing:
     - Created order schema in Sanity
     - Implemented order status tracking
     - Added shipping address validation

3. Backend Changes
   - Sanity Schema Updates:
     - Added Order schema
     - Added User schema with addresses
     - Added Payment schema
   - API Routes:
     - Created checkout API
     - Added order creation endpoint
     - Implemented address management endpoints

