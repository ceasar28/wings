import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { encodeURL, findReference, validateTransfer } from '@solana/pay';
import BigNumber from 'bignumber.js';
import { DatabaseService } from 'src/database/database.service';
import { airportsData } from './airports';

@Injectable()
export class FlightSearchService {
  private connection = 'https://api.mainnet-beta.solana.com';

  // INJECTING HTTPservice
  constructor(
    private readonly httpService: HttpService,
    private readonly databaseService: DatabaseService,
  ) {}

  // get airports
  searchAirport = async (query: string) => {
    try {
      const airports = await airportsData();
      if (airports) {
        // function to filter search
        function searchByLocation(data, location) {
          const lowerCaseLocation = location.toLowerCase();
          return data.filter((airport) =>
            airport.location.toLowerCase().includes(lowerCaseLocation),
          );
        }

        // Example Usage
        const matchedCityAirports = searchByLocation(airports.data, query);
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
        process.env.ONEWAY_URL,
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
            process.env.COMPLETE_FLIGHT_URL,
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
            console.log(availableFlights.data.data['token']);
            return {
              token: availableFlights.data.data['token'],
              completeFlights: completeFlights.data['data'].itineraries,
            };
          }
        }
        console.log(availableFlights.data);

        return {
          token: availableFlights.data.data['token'],
          completeFlights: availableFlights.data['data'].itineraries,
        };
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
        process.env.RETURN_URL,
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
            process.env.COMPLETE_FLIGHT_URL,
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

            return {
              token: availableFlights.data.data['token'],
              completeFlights: completeFlights.data['data'].itineraries,
            };
          }
        }
        console.log(availableFlights.data);

        return {
          token: availableFlights.data.data['token'],
          completeFlights: availableFlights.data['data'].itineraries,
        };
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
        process.env.MULTICITY_URL,
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
            process.env.COMPLETE_FLIGHT_URL,
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
            return {
              token: availableFlights.data.data['token'],
              completeFlights: completeFlights.data['data'].itineraries,
            };
          }
        }
        console.log(availableFlights.data);
        return {
          token: availableFlights.data.data['token'],
          completeFlights: availableFlights.data['data'].itineraries,
        };
      }
      return;
    } catch (error) {
      console.error(error);
    }
  };

  searchFlightDetails = async (session: any) => {
    try {
      // fetch searchResult
      const searchResult = await this.databaseService.searchResults.findFirst({
        where: { id: Number(session.searchResultId) },
      });
      if (searchResult) {
        const flightResult = JSON.parse(searchResult.searchResults);
        console.log(flightResult);
        const flightDetails = await this.httpService.axiosRef.get(
          `${process.env.FLIGHT_DETAIL_URL}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-RapidAPI-Key': process.env.RapidAPI_KEY,
              'X-RapidAPI-Host': process.env.RapidAPI_HOST,
            },
            params: {
              token: flightResult.token,
              itineraryId: flightResult.id.trim(),
            },
          },
        );
        if (flightDetails) {
          const deepLink = [];
          flightDetails.data.data.itinerary.pricingOptions.map((agent) => {
            if (agent.agents[0].price == flightResult.amount) {
              deepLink.push({
                agentName: agent.agents[0].name,
                url: agent.agents[0].url,
                price: agent.agents[0].price,
              });
            }
            return;
          });

          return {
            firstName: session.firstName,
            lastName: session.LastName,
            email: session.email,
            summary: flightResult.summary,
            airline: flightResult.airline,
            price: flightResult.amount,
            flightDeeplinks: deepLink,
          };
        }
        return;
      }
      return;
    } catch (error) {
      console.error(error);
    }
  };

  // solana payment URL
  generateSolanaPayUrl = async (payload: any) => {
    console.log(payload);
    try {
      // fetch Solana-usdc pric
      const rate = await this.httpService.axiosRef.get(
        `https://price.jup.ag/v6/price`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            ids: 'SOL',
          },
        },
      );
      if (rate.data) {
        const serviceFee = Number(process.env.SERVICE_FEE); // our charge
        console.log(serviceFee);
        const myWallet = new PublicKey(process.env.ADMIN_WALLET);
        const price =
          (Number(payload.amount) + serviceFee) / rate.data.data['SOL'].price;
        console.log(new BigNumber(price.toFixed(9)));
        const recipient = new PublicKey(myWallet);
        const amount = new BigNumber(price.toFixed(9));
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
      }

      return;
    } catch (error) {
      console.error('this is error :', error);
    }
  };

  generateBonkPayUrl = async (payload: any) => {
    console.log(payload);
    try {
      // fetch Bonk-usdc pric
      const rate = await this.httpService.axiosRef.get(
        `https://price.jup.ag/v6/price`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            ids: 'Bonk',
          },
        },
      );

      if (rate.data) {
        console.log(rate.data);
        const serviceFee = Number(process.env.SERVICE_FEE); // our charge
        console.log(serviceFee);
        const myWallet = new PublicKey(process.env.ADMIN_WALLET);
        const price =
          (Number(payload.amount) + serviceFee) / rate.data.data['Bonk'].price;
        const recipient = new PublicKey(myWallet);
        const amount = new BigNumber(price.toFixed(5));
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
      const connection = new Connection(this.connection, 'confirmed');
      console.log('recipient', bookingSessions.recipient);
      console.log('amount', bookingSessions.amount);
      console.log('reference', bookingSessions.ref);
      console.log('message', bookingSessions.message);

      // 3 - Find the transaction reference
      const found = await findReference(
        connection,
        new PublicKey(bookingSessions.ref),
      );
      const bonkMintAddr = new PublicKey(
        'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      );
      const amount = Number(bookingSessions.amount).toFixed(4);
      // 4 - Validate the transaction
      const response = await validateTransfer(
        connection,
        found.signature,
        {
          recipient: new PublicKey(bookingSessions.recipient),
          amount: new BigNumber(amount),
          splToken: bonkMintAddr,
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
