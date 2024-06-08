import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { encodeURL, findReference, validateTransfer } from '@solana/pay';
import BigNumber from 'bignumber.js';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class FlightSearchService {
  private quicknodeEndpoint =
    'https://nd-818-433-873.p2pify.com/9853f3a0477128226a6bd8e0ffb2ebfb'; // Replace with your QuickNode

  // INJECTING HTTPservice
  constructor(
    private readonly httpService: HttpService,
    private readonly databaseService: DatabaseService,
  ) {}
  //get all Carries
  // getAllCarrier = async (id: string) => {
  //   const allCarriers = await this.httpService.axiosRef.get(
  //     'https://tequila-api.kiwi.com/carriers',
  //   );
  //   let carrier: object;
  //   if (allCarriers) {
  //     allCarriers.data.map((data) => {
  //       if (data.id === id) {
  //         return (carrier = data);
  //       }
  //     });
  //   }

  //   return carrier;
  // };

  // get airports
  searchAirport = async (query: string) => {
    try {
      const airports = await this.httpService.axiosRef.get(
        `https://sky-scanner3.p.rapidapi.com/flights/airports`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': process.env.RapidAPI_KEY,
            'X-RapidAPI-Host': process.env.RapidAPI_HOST,
          },
        },
      );
      if (airports) {
        // function to filter search
        function searchByLocation(data, location) {
          return data.filter((airport) => airport.location.includes(location));
        }

        // Example Usage
        const matchedCityAirports = searchByLocation(
          airports.data['data'],
          query,
        );
        console.log(matchedCityAirports);
        return matchedCityAirports;
      }
      return;
    } catch (error) {
      console.error(error);
    }
  };

  // search available flights (bot mulitcity, oneway, and return)

  searchAvailableOneWayFlight = async (query: any) => {
    function convertDateFormat(dateString) {
      // Split the input date string into day, month, and year
      const [day, month, year] = dateString.split('/');

      // Return the date in the format yyyy-mm-dd
      return `${year}-${month}-${day}`;
    }
    try {
      const availableFlights = await this.httpService.axiosRef.get(
        `https://sky-scanner3.p.rapidapi.com/flights/search-one-way`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': process.env.RapidAPI_KEY,
            'X-RapidAPI-Host': process.env.RapidAPI_HOST,
          },
          params: {
            fromEntityId: query.from,
            toEntityId: query.to,
            departDate: convertDateFormat(query.date_from),
          },
        },
      );
      if (availableFlights) {
        if (availableFlights.data['data'].context['status'] === 'incomplete') {
          const completeFlights = await this.httpService.axiosRef.get(
            `https://sky-scanner3.p.rapidapi.com/flights/search-incomplete`,
            {
              headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': process.env.RapidAPI_KEY,
                'X-RapidAPI-Host': process.env.RapidAPI_HOST,
              },
              params: {
                sessionId: availableFlights.data['data'].context['sessionId'],
              },
            },
          );
          if (completeFlights) {
            console.log(completeFlights.data['data'].itineraries);
            return completeFlights.data['data'].itineraries;
          }
        }
        console.log(availableFlights.data);
        return availableFlights.data['data'].itineraries;
      }
      return;
    } catch (error) {
      console.error(error);
    }
  };

  searchAvailableReturnFlight = async (query: any) => {
    function convertDateFormat(dateString) {
      // Split the input date string into day, month, and year
      const [day, month, year] = dateString.split('/');

      // Return the date in the format yyyy-mm-dd
      return `${year}-${month}-${day}`;
    }
    try {
      const availableFlights = await this.httpService.axiosRef.get(
        `https://sky-scanner3.p.rapidapi.com/flights/search-roundtrip`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': process.env.RapidAPI_KEY,
            'X-RapidAPI-Host': process.env.RapidAPI_HOST,
          },
          params: {
            fromEntityId: query.from,
            toEntityId: query.to,
            departDate: convertDateFormat(query.date_from),
            returnDate: convertDateFormat(query.date_to),
          },
        },
      );
      if (availableFlights) {
        if (availableFlights.data['data'].context['status'] === 'incomplete') {
          const completeFlights = await this.httpService.axiosRef.get(
            `https://sky-scanner3.p.rapidapi.com/flights/search-incomplete`,
            {
              headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': process.env.RapidAPI_KEY,
                'X-RapidAPI-Host': process.env.RapidAPI_HOST,
              },
              params: {
                sessionId: availableFlights.data['data'].context['sessionId'],
              },
            },
          );
          if (completeFlights) {
            console.log(completeFlights.data['data'].itineraries);
            return completeFlights.data['data'].itineraries;
          }
        }
        console.log(availableFlights.data);
        return availableFlights.data['data'].itineraries;
      }
      return;
    } catch (error) {
      console.error(error);
    }
  };

  searchAvailableMulticityFlight = async (payload: any) => {
    const data = {
      market: 'US',
      locale: 'en-US',
      currency: 'USD',
      adults: 1,
      children: 0,
      infants: 0,
      cabinClass: 'economy',
      stops: ['direct', '1stop', '2stops'],
      flights: payload.flights,
    };
    try {
      const availableFlights = await this.httpService.axiosRef.post(
        `https://sky-scanner3.p.rapidapi.com/flights/search-multi-city`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': process.env.RapidAPI_KEY,
            'X-RapidAPI-Host': process.env.RapidAPI_HOST,
          },
        },
      );
      if (availableFlights) {
        if (availableFlights.data['data'].context['status'] === 'incomplete') {
          const completeFlights = await this.httpService.axiosRef.get(
            `https://sky-scanner3.p.rapidapi.com/flights/search-incomplete`,
            {
              headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': process.env.RapidAPI_KEY,
                'X-RapidAPI-Host': process.env.RapidAPI_HOST,
              },
              params: {
                sessionId: availableFlights.data['data'].context['sessionId'],
              },
            },
          );
          if (completeFlights) {
            console.log(completeFlights.data['data'].itineraries);
            return completeFlights.data['data'].itineraries;
          }
        }
        console.log(availableFlights.data);
        return availableFlights.data['data'].itineraries;
      }
      return;
    } catch (error) {
      console.error(error);
    }
  };

  saveBookingDetails = async (query: any) => {
    console.log(query);
  };

  // Payment Coingate
  generatePaymentUrl = async (payload: any) => {
    console.log('This is payload: ', payload);
    try {
      const payment = await this.httpService.axiosRef.post(
        `https://api-sandbox.coingate.com/v2/orders`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.COINGATE_TOKEN}`,
          },
          params: {
            order_id: payload.order_id,
            price_amount: payload.price,
            price_currency: 'USD',
            receive_currency: 'USD',
            title: payload.title,
            description: 'CheapFlight Bot booking',
            callback_url:
              'https://flightbookingairdropbot-3fu3.onrender.com/bot',
            cancel_url: 'https://t.me/CheapflightCrypto_bot',
            success_url: 'https://t.me/CheapflightCrypto_bot',
            purchaser_email: payload.email,
          },
        },
      );
      if (payment) {
        console.log(payment.data);
        return payment.data;
      }
      return;
    } catch (error) {
      console.error(error);
    }
  };

  // solana payment
  generateSolanaPayUrl = async (payload: any) => {
    console.log(payload);
    try {
      const myWallet = new PublicKey(
        '7eBmtW8CG1zJ6mEYbTpbLRtjD1BLHdQdU5Jc8Uip42eE',
      );
      const recipient = new PublicKey(myWallet);
      const amount = new BigNumber(payload.amount); // 0.0001 SOL
      const label = 'Wings Flight Bot';
      const memo = 'Flight Booking';
      const reference = new Keypair().publicKey;
      const message = payload.message;

      const url: URL = encodeURL({
        recipient,
        amount,
        reference,
        label,
        message,
        memo,
      });
      if (url) {
        const ref = reference.toBase58();
        // update user booking session
        await this.databaseService.bookingSession.updateMany({
          where: {
            chat_id: payload.chatId,
          },
          data: {
            ref,
            amount: amount.toString(),
            recipient: recipient.toBase58(),
            message,
            deeplink: url.toString(),
          },
        });
        return { url: url.toString(), ref };
      }
      return;
    } catch (error) {
      console.error('this is error :', error);
    }
  };

  generateBonkPayUrl = async (payload: any) => {
    console.log(payload);
    try {
      const myWallet = new PublicKey(
        '7eBmtW8CG1zJ6mEYbTpbLRtjD1BLHdQdU5Jc8Uip42eE',
      );
      const recipient = new PublicKey(myWallet);
      const amount = new BigNumber(payload.amount); // 0.0001 SOL
      const label = 'Wings Flight Bot';
      const memo = 'Flight Booking';
      const reference = new Keypair().publicKey;
      const message = payload.message;
      const bonkMintAddr = new PublicKey(
        'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      );

      const url: URL = encodeURL({
        recipient,
        amount,
        splToken: bonkMintAddr,
        reference,
        label,
        message,
        memo,
      });
      if (url) {
        const ref = reference.toBase58();
        // update user booking session
        await this.databaseService.bookingSession.updateMany({
          where: {
            chat_id: payload.chatId,
          },
          data: {
            ref,
            amount: amount.toString(),
            recipient: recipient.toBase58(),
            message,
            deeplink: url.toString(),
          },
        });
        return { url: url.toString(), ref };
      }
      return;
    } catch (error) {
      console.error('this is error :', error);
    }
  };

  verifyTransaction = async (Id: any) => {
    try {
      // check for the users booking sessions
      const bookingSessions =
        await this.databaseService.bookingSession.findFirst({
          where: {
            id: Id,
          },
        });
      if (!bookingSessions.ref) {
        return {
          status: 'error',
          message: 'Payment request not found',
        };
      }
      // 2 - Establish a Connection to the Solana Cluster
      const connection = new Connection(this.quicknodeEndpoint, 'confirmed');
      console.log('recipient', bookingSessions.recipient);
      console.log('amount', bookingSessions.amount);
      console.log('reference', bookingSessions.ref);
      console.log('message', bookingSessions.message);

      // 3 - Find the transaction reference
      const found = await findReference(
        connection,
        new PublicKey(bookingSessions.ref),
      );
      console.log(found.signature);

      // 4 - Validate the transaction
      const response = await validateTransfer(
        connection,
        found.signature,
        {
          recipient: new PublicKey(bookingSessions.recipient),
          amount: BigNumber(bookingSessions.amount),
          splToken: undefined,
          reference: new PublicKey(bookingSessions.ref),
          //memo
        },
        { commitment: 'confirmed' },
      );
      // 5 - Delete the payment request from local storage and return the response
      // if (response) {
      //   paymentRequests.delete(reference.toBase58());
      // }
      console.log(response);
      return response;
    } catch (error) {
      console.log(error);
    }
  };
}

//http://api.qrserver.com/v1/create-qr-code/?data=${createOrder.url}&size=700x700`
