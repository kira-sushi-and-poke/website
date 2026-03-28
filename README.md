# Kira sushi and poke website

Welcome to the Kira Sushi and Poke web app! This application is designed to showcase a restaurant's offerings, including an "About Us" section and a detailed menu page.

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd website
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the development server:**
   ```
   npm run dev
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

## Deployment

When deploying to production (Vercel, AWS, etc.), ensure the following:

### Environment Variables
- Copy all variables from `.env.example` to your deployment platform
- **CRITICAL:** Set `TZ=UTC` in your deployment environment variables
  - This ensures consistent date/time handling for pickup time validation
  - Prevents timezone-related issues between client and server
  - Required for accurate "20 minutes from now" calculations

### Vercel Deployment
```bash
# In Vercel dashboard, add environment variable:
TZ=UTC
```

### Other Platforms
Ensure your server runs in UTC timezone. This is critical for:
- Pickup time validation (must be 20+ minutes from current time)
- Square API timestamp handling
- Consistent behavior regardless of server location

## Usage

- The home page features an "About Us" section that provides information about the restaurant.
- The menu page retrieves data from a JSON file and displays a list of menu items, including their names, prices, images, and descriptions.

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements for the project. 

## License

This project is licensed under the MIT License.