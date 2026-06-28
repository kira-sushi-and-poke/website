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

==== 

## Checkout Payment via Square

There are potential CORS issues in the background that I can't figure out. So as an alternative, we could just send them to Square to pay.

- Quick pay could be a solution - but we might lose some data like tips or notes
- Checkout Payment link - ensure we add orders
   - We need to check if tips, and notes are added
   - Submission will create a new order but we might just need to either update current order or keep the new order and delete the old one - to be explored
      - Delete previous - we'll need to ensure the session is also cleared?
      - How can we return or redirect to the new order properly?
   - Current flow might need sorting
      - the pickup time and instructions are saved in the processPayment
      - we might need to make the button add them too by potentially making a helper to add fulfilment to an order - this involves pickup time and notes
         - maybe add the button as "Save and pay via Square"
      - might also be complication with customer creation - might be one that Square could handle?
      - UNDERSTAND THE FLOW BETTER
         - Pay for order page
         - Sees the order summary
         - Sets the pickup time - what we need
         - Adds or ignores tips or special instructions - what we need
         - On processing
            - gets the order again?
            - creates a user based on the card details - not sure if needed, CHECK
            - processes the payment

TODO:
- Might just need to move some code from processPayment to checkout - maybe add a helper or function for things like validating pickup and adding the notes? (DONE)
- Need to figure out how to expire or update the current order
  - Old order remains on draft mode
  - Might need to update what's in the local storage
  - Maybe return the order ID and Square's checkout URL from checkout action
    - This way, we can just update the local storage with the new one
    - After updating the local storage with the new order ID, we can redirect
    - If user goes back and forth from checkout and payment, it shouldn't break?? - TO TEST
      - This is only 
    - Maybe not - because order ID is in the query param
      - Unless we update the query param before redirecting

