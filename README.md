# The News - Newsletter Landing Page

A modern, responsive landing page for "The News" newsletter subscription. The page features a yellow theme with Portuguese content, an email signup form with validation, and authentication options through Clerk.

## Features

- Clean, modern design with a vibrant yellow theme
- Portuguese content matching the brand identity
- Mobile-responsive layout
- Two subscription options:
  - Direct email signup with advanced validation
  - Authentication through Clerk (sign in/sign up)
- Email validation including:
  - Standard email format validation
  - Common typo detection (like "gmial.com" instead of "gmail.com")
  - Helpful error messages
- Phone mockup showing a preview of the newsletter
- No-scroll design that fits in one viewport

## Authentication

The page uses Clerk for authentication with the following features:
- Email/password signup
- Social login options (depending on your Clerk configuration)
- Secure user management
- Session persistence

## How to Use

1. Simply open the `index.html` file in your web browser to view the landing page
2. To deploy, upload all files to your web server
3. Replace the placeholder coffee.png with an actual coffee cup icon
4. The Clerk authentication is already configured with your provided keys

## Files

- `index.html` - The main HTML structure
- `styles.css` - All styling for the page
- `script.js` - Form submission handling, email validation, and Clerk integration
- `coffee.png` - Placeholder for the coffee cup icon (needs to be replaced)

## Customization

You can easily customize this landing page by:
- Changing colors in the CSS file
- Updating the newsletter description and features
- Modifying the newsletter preview content on the phone mockup
- Adding server-side validation and form submission
- Configuring additional Clerk authentication options in your Clerk dashboard

## Browser Compatibility

This landing page works in all modern browsers including:
- Chrome
- Firefox 
- Safari
- Edge 