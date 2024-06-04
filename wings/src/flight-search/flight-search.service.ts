import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class FlightSearchService {
  // INJECTING HTTPservice
  constructor(private readonly httpService: HttpService) {}
  //get all Carries
  getAllCarrier = async (id: string) => {
    const allCarriers = await this.httpService.axiosRef.get(
      'https://tequila-api.kiwi.com/carriers',
    );
    let carrier: object;
    if (allCarriers) {
      allCarriers.data.map((data) => {
        if (data.id === id) {
          return (carrier = data);
        }
      });
    }

    return carrier;
  };

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
            departDate: query.date_from,
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
        }
        console.log(availableFlights.data);
        return availableFlights.data;
      }
      return;
    } catch (error) {
      console.error(error);
    }
  };

  //   searchAvailableReturnFlight = async (query: any) => {
  //     try {
  //       const availableFlights = await this.httpService.axiosRef.get(
  //         `https://api.tequila.kiwi.com/v2/search`,
  //         {
  //           headers: {
  //             'Content-Type': 'application/json',
  //             apiKey: this.config.get('KIWI_API_KEY'),
  //           },
  //           params: {
  //             fly_from: query.from,
  //             fly_to: query.to,
  //             date_from: query.date_from,
  //             return_from: query.return_from,
  //             return_to: query.return_to,
  //             max_fly_duration: 24,
  //             ret_from_diff_city: false,
  //             ret_to_diff_city: false,
  //             adults: 1,
  //             selected_cabins: 'M',
  //             adult_hold_bag: 1,
  //             adult_hand_bag: 1,
  //             only_working_days: false,
  //             only_weekends: false,
  //             curr: query.currency,
  //             max_stopovers: 0,
  //             max_sector_stopovers: 0,
  //             vehicle_type: 'aircraft',
  //             enable_vi: true,
  //             sort: 'price',
  //             limit: 4,
  //           },
  //         },
  //       );
  //       if (availableFlights) {
  //         console.log(availableFlights.data);
  //         return availableFlights.data;
  //       }
  //       return;
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   searchAvailableMulticityFlight = async (payload: any) => {
  //     console.log('This is payload: ', payload);
  //     try {
  //       const availableFlights = await this.httpService.axiosRef.post(
  //         `https://api.tequila.kiwi.com/v2/flights_multi`,
  //         payload,
  //         {
  //           headers: {
  //             'Content-Type': 'application/json',
  //             apiKey: this.config.get('KIWI_MULTI_CITY_KEY'),
  //           },
  //           params: {
  //             max_fly_duration: 24,
  //             ret_from_diff_city: false,
  //             ret_to_diff_city: false,
  //             adults: 1,
  //             selected_cabins: 'M',
  //             adult_hold_bag: 1,
  //             adult_hand_bag: 1,
  //             only_working_days: false,
  //             only_weekends: false,
  //             curr: 'USD',
  //             max_stopovers: 0,
  //             max_sector_stopovers: 0,
  //             vehicle_type: 'aircraft',
  //             enable_vi: true,
  //             sort: 'price',
  //             limit: 5,
  //           },
  //         },
  //       );
  //       if (availableFlights) {
  //         console.log(availableFlights.data);
  //         return availableFlights.data;
  //       }
  //       return;
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  // save booking details

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
