# Wings

## Overview

This is a Telegram bot that allows users to book flights using Bonk crypto as payment. The bot utilizes Solana Pay as the payment gateway, ensuring fast and secure transactions.

a completed transaction hash on the bot: https://solscan.io/tx/436JMZ2iGyhkY9GTaMCDSCYBK2qpnUfMypL3CQFWykGYC7jA8Cd47ouBExZ9tWiYZdqFecHw3MRuh8d63uM6EK3o

## Features

- Search for flights based on departure and arrival cities, dates, and other preferences.
- View flight details and prices.
- Book flights directly through the bot.
- Pay for bookings using Bonk crypto via Solana Pay.
- Receive booking confirmations and e-tickets.

## Technologies Used

- **Telegram Bot API**: For creating and managing the bot on Telegram.
- **Solana Pay**: As the payment gateway for handling Bonk crypto transactions.
- **Node.js**: For the backend server.
- **Nest.js**: For handling HTTP requests.

## Usage

1. **Start the Bot:**

   - Open Telegram and search for your bot by its username.
   - Start a chat with the bot.

2. **Search for Flights:**

   - Use commands like `/search` to find flights. For example:
     ```plaintext
     /search
     From: New York
     To: Los Angeles
     Departure Date: 2024-07-01
     Return Date: 2024-07-10
     ```

3. **View Flight Details:**

   - The bot will respond with a list of available flights. Select a flight to view more details.

4. **Book a Flight:**

   - Choose the flight you want to book and follow the prompts to enter passenger details.

5. **Make Payment:**

   - The bot will generate a payment request using Solana Pay. Scan the QR code or follow the link to complete the payment using Bonk crypto.

6. **Receive Confirmation:**
   - Once the payment is confirmed, the bot will send a booking confirmation and e-ticket to your chat.
