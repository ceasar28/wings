import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class FlightSearchService {
  // INJECTING HTTPservice
  constructor(private readonly httpService: HttpService) {}
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

  // Payment
  //   generatePaymentUrl = async (payload: any) => {
  //     console.log('This is payload: ', payload);
  //     try {
  //       const payment = await this.httpService.axiosRef.post(
  //         `https://api-sandbox.coingate.com/v2/orders`,
  //         {},
  //         {
  //           headers: {
  //             'Content-Type': 'application/json',
  //             Authorization: `Bearer ${this.config.get('COINGATE_TOKEN')}`,
  //           },
  //           params: {
  //             order_id: payload.order_id,
  //             price_amount: payload.price,
  //             price_currency: 'USD',
  //             receive_currency: 'USD',
  //             title: payload.title,
  //             description: 'CheapFlight Bot booking',
  //             callback_url:
  //               'https://flightbookingairdropbot-3fu3.onrender.com/bot',
  //             cancel_url: 'https://t.me/CheapflightCrypto_bot',
  //             success_url: 'https://t.me/CheapflightCrypto_bot',
  //             purchaser_email: payload.email,
  //           },
  //         },
  //       );
  //       if (payment) {
  //         console.log(payment.data);
  //         return payment.data;
  //       }
  //       return;
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };
}
