"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightSearchService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const web3_js_1 = require("@solana/web3.js");
const pay_1 = require("@solana/pay");
const bignumber_js_1 = require("bignumber.js");
const database_service_1 = require("../database/database.service");
const airports_1 = require("./airports");
let FlightSearchService = class FlightSearchService {
    constructor(httpService, databaseService) {
        this.httpService = httpService;
        this.databaseService = databaseService;
        this.connection = 'https://api.mainnet-beta.solana.com';
        this.searchAirport = async (query) => {
            try {
                const airports = await (0, airports_1.airportsData)();
                if (airports) {
                    function searchByLocation(data, location) {
                        const lowerCaseLocation = location.toLowerCase();
                        return data.filter((airport) => airport.location.toLowerCase().includes(lowerCaseLocation));
                    }
                    const matchedCityAirports = searchByLocation(airports.data, query);
                    console.log(matchedCityAirports);
                    return matchedCityAirports;
                }
                return;
            }
            catch (error) {
                console.error(error);
            }
        };
        this.searchAvailableOneWayFlight = async (query) => {
            function convertDateFormat(dateString) {
                const [day, month, year] = dateString.split('/');
                return `${year}-${month}-${day}`;
            }
            try {
                const availableFlights = await this.httpService.axiosRef.get(process.env.ONEWAY_URL, {
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
                });
                if (availableFlights) {
                    if (availableFlights.data['data'].context['status'] === 'incomplete') {
                        const completeFlights = await this.httpService.axiosRef.get(process.env.COMPLETE_FLIGHT_URL, {
                            headers: {
                                'Content-Type': 'application/json',
                                'X-RapidAPI-Key': process.env.RapidAPI_KEY,
                                'X-RapidAPI-Host': process.env.RapidAPI_HOST,
                            },
                            params: {
                                sessionId: availableFlights.data['data'].context['sessionId'],
                            },
                        });
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
            }
            catch (error) {
                console.error(error);
            }
        };
        this.searchAvailableReturnFlight = async (query) => {
            function convertDateFormat(dateString) {
                const [day, month, year] = dateString.split('/');
                return `${year}-${month}-${day}`;
            }
            try {
                const availableFlights = await this.httpService.axiosRef.get(process.env.RETURN_URL, {
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
                });
                if (availableFlights) {
                    if (availableFlights.data['data'].context['status'] === 'incomplete') {
                        const completeFlights = await this.httpService.axiosRef.get(process.env.COMPLETE_FLIGHT_URL, {
                            headers: {
                                'Content-Type': 'application/json',
                                'X-RapidAPI-Key': process.env.RapidAPI_KEY,
                                'X-RapidAPI-Host': process.env.RapidAPI_HOST,
                            },
                            params: {
                                sessionId: availableFlights.data['data'].context['sessionId'],
                            },
                        });
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
            }
            catch (error) {
                console.error(error);
            }
        };
        this.searchAvailableMulticityFlight = async (payload) => {
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
                const availableFlights = await this.httpService.axiosRef.post(process.env.MULTICITY_URL, data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-RapidAPI-Key': process.env.RapidAPI_KEY,
                        'X-RapidAPI-Host': process.env.RapidAPI_HOST,
                    },
                });
                if (availableFlights) {
                    if (availableFlights.data['data'].context['status'] === 'incomplete') {
                        const completeFlights = await this.httpService.axiosRef.get(process.env.COMPLETE_FLIGHT_URL, {
                            headers: {
                                'Content-Type': 'application/json',
                                'X-RapidAPI-Key': process.env.RapidAPI_KEY,
                                'X-RapidAPI-Host': process.env.RapidAPI_HOST,
                            },
                            params: {
                                sessionId: availableFlights.data['data'].context['sessionId'],
                            },
                        });
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
            }
            catch (error) {
                console.error(error);
            }
        };
        this.searchFlightDetails = async (session) => {
            try {
                const searchResult = await this.databaseService.searchResults.findFirst({
                    where: { id: Number(session.searchResultId) },
                });
                if (searchResult) {
                    const flightResult = JSON.parse(searchResult.searchResults);
                    console.log(flightResult);
                    const flightDetails = await this.httpService.axiosRef.get(`${process.env.FLIGHT_DETAIL_URL}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-RapidAPI-Key': process.env.RapidAPI_KEY,
                            'X-RapidAPI-Host': process.env.RapidAPI_HOST,
                        },
                        params: {
                            token: flightResult.token,
                            itineraryId: flightResult.id.trim(),
                        },
                    });
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
            }
            catch (error) {
                console.error(error);
            }
        };
        this.generateSolanaPayUrl = async (payload) => {
            console.log(payload);
            try {
                const rate = await this.httpService.axiosRef.get(`https://price.jup.ag/v6/price`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    params: {
                        ids: 'SOL',
                    },
                });
                if (rate.data) {
                    const serviceFee = Number(process.env.SERVICE_FEE);
                    console.log(serviceFee);
                    const myWallet = new web3_js_1.PublicKey(process.env.ADMIN_WALLET);
                    const price = (Number(payload.amount) + serviceFee) / rate.data.data['SOL'].price;
                    console.log(new bignumber_js_1.default(price.toFixed(9)));
                    const recipient = new web3_js_1.PublicKey(myWallet);
                    const amount = new bignumber_js_1.default(price.toFixed(9));
                    const label = 'Wings Flight Bot';
                    const memo = 'Flight Booking';
                    const reference = new web3_js_1.Keypair().publicKey;
                    const message = payload.message;
                    const url = (0, pay_1.encodeURL)({
                        recipient,
                        amount,
                        reference,
                        label,
                        message,
                        memo,
                    });
                    if (url) {
                        const ref = reference.toBase58();
                        await this.databaseService.bookingSession.updateMany({
                            where: {
                                chat_id: payload.chatId,
                            },
                            data: {
                                Solref: ref,
                                amount: amount.toString(),
                                recipient: recipient.toBase58(),
                                message,
                                Soldeeplink: url.toString(),
                            },
                        });
                        return { url: url.toString(), ref };
                    }
                }
                return;
            }
            catch (error) {
                console.error('this is error :', error);
            }
        };
        this.generateUSDCPayUrl = async (payload) => {
            console.log(payload);
            try {
                const serviceFee = Number(process.env.SERVICE_FEE);
                console.log(serviceFee);
                const myWallet = new web3_js_1.PublicKey(process.env.ADMIN_WALLET);
                const price = Number(payload.amount) + serviceFee;
                const recipient = new web3_js_1.PublicKey(myWallet);
                const amount = new bignumber_js_1.default(price.toFixed(6));
                const label = 'Wings Flight Bot';
                const memo = 'Flight Booking';
                const reference = new web3_js_1.Keypair().publicKey;
                const message = payload.message;
                const USDCMintAddr = new web3_js_1.PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
                const url = (0, pay_1.encodeURL)({
                    recipient,
                    amount,
                    splToken: USDCMintAddr,
                    reference,
                    label,
                    message,
                    memo,
                });
                if (url) {
                    const ref = reference.toBase58();
                    await this.databaseService.bookingSession.updateMany({
                        where: {
                            chat_id: payload.chatId,
                        },
                        data: {
                            USDCref: ref,
                            amount: amount.toString(),
                            recipient: recipient.toBase58(),
                            message,
                            USDCdeeplink: url.toString(),
                        },
                    });
                    return { url: url.toString(), ref };
                }
                return;
            }
            catch (error) {
                console.error('this is error :', error);
            }
        };
        this.generateBonkPayUrl = async (payload) => {
            console.log(payload);
            try {
                const rate = await this.httpService.axiosRef.get(`https://price.jup.ag/v6/price`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    params: {
                        ids: 'Bonk',
                    },
                });
                if (rate.data) {
                    console.log(rate.data);
                    const serviceFee = Number(process.env.SERVICE_FEE);
                    console.log(serviceFee);
                    const myWallet = new web3_js_1.PublicKey(process.env.ADMIN_WALLET);
                    const price = (Number(payload.amount) + serviceFee) / rate.data.data['Bonk'].price;
                    const recipient = new web3_js_1.PublicKey(myWallet);
                    const amount = new bignumber_js_1.default(price.toFixed(5));
                    const label = 'Wings Flight Bot';
                    const memo = 'Flight Booking';
                    const reference = new web3_js_1.Keypair().publicKey;
                    const message = payload.message;
                    const bonkMintAddr = new web3_js_1.PublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263');
                    const url = (0, pay_1.encodeURL)({
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
                        await this.databaseService.bookingSession.updateMany({
                            where: {
                                chat_id: payload.chatId,
                            },
                            data: {
                                Bonkref: ref,
                                Bonkamount: amount.toString(),
                                recipient: recipient.toBase58(),
                                message,
                                Bonkdeeplink: url.toString(),
                            },
                        });
                        return { url: url.toString(), ref };
                    }
                }
                return;
            }
            catch (error) {
                console.error('this is error :', error);
            }
        };
        this.verifySOLTransaction = async (Id) => {
            try {
                const bookingSessions = await this.databaseService.bookingSession.findFirst({
                    where: {
                        id: Id,
                    },
                });
                if (!bookingSessions.Solref) {
                    return {
                        status: 'error',
                        message: 'Payment request not found',
                    };
                }
                const connection = new web3_js_1.Connection(this.connection, 'confirmed');
                console.log('recipient', bookingSessions.recipient);
                console.log('amount', bookingSessions.amount);
                console.log('reference', bookingSessions.Solref);
                console.log('message', bookingSessions.message);
                const found = await (0, pay_1.findReference)(connection, new web3_js_1.PublicKey(bookingSessions.Solref));
                const amount = Number(bookingSessions.Solamount).toFixed(9);
                const response = await (0, pay_1.validateTransfer)(connection, found.signature, {
                    recipient: new web3_js_1.PublicKey(bookingSessions.recipient),
                    amount: new bignumber_js_1.default(amount),
                    reference: new web3_js_1.PublicKey(bookingSessions.Solref),
                }, { commitment: 'confirmed' });
                console.log(response);
                return response;
            }
            catch (error) {
                console.log(error);
            }
        };
        this.verifyUSDCTransaction = async (Id) => {
            try {
                const bookingSessions = await this.databaseService.bookingSession.findFirst({
                    where: {
                        id: Id,
                    },
                });
                if (!bookingSessions.USDCref) {
                    return {
                        status: 'error',
                        message: 'Payment request not found',
                    };
                }
                const connection = new web3_js_1.Connection(this.connection, 'confirmed');
                console.log('recipient', bookingSessions.recipient);
                console.log('amount', bookingSessions.amount);
                console.log('reference', bookingSessions.USDCref);
                console.log('message', bookingSessions.message);
                const found = await (0, pay_1.findReference)(connection, new web3_js_1.PublicKey(bookingSessions.USDCref));
                const USDCMintAddr = new web3_js_1.PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
                const amount = Number(bookingSessions.USDCamount).toFixed(5);
                const response = await (0, pay_1.validateTransfer)(connection, found.signature, {
                    recipient: new web3_js_1.PublicKey(bookingSessions.recipient),
                    amount: new bignumber_js_1.default(amount),
                    splToken: USDCMintAddr,
                    reference: new web3_js_1.PublicKey(bookingSessions.USDCref),
                }, { commitment: 'confirmed' });
                console.log(response);
                return response;
            }
            catch (error) {
                console.log(error);
            }
        };
        this.verifyBonkTransaction = async (Id) => {
            try {
                const bookingSessions = await this.databaseService.bookingSession.findFirst({
                    where: {
                        id: Id,
                    },
                });
                if (!bookingSessions.Bonkref) {
                    return {
                        status: 'error',
                        message: 'Payment request not found',
                    };
                }
                const connection = new web3_js_1.Connection(this.connection, 'confirmed');
                console.log('recipient', bookingSessions.recipient);
                console.log('amount', bookingSessions.amount);
                console.log('reference', bookingSessions.Bonkref);
                console.log('message', bookingSessions.message);
                const found = await (0, pay_1.findReference)(connection, new web3_js_1.PublicKey(bookingSessions.Bonkref));
                const bonkMintAddr = new web3_js_1.PublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263');
                const amount = Number(bookingSessions.Bonkamount).toFixed(4);
                const response = await (0, pay_1.validateTransfer)(connection, found.signature, {
                    recipient: new web3_js_1.PublicKey(bookingSessions.recipient),
                    amount: new bignumber_js_1.default(amount),
                    splToken: bonkMintAddr,
                    reference: new web3_js_1.PublicKey(bookingSessions.Bonkref),
                }, { commitment: 'confirmed' });
                console.log(response);
                return response;
            }
            catch (error) {
                console.log(error);
            }
        };
    }
};
exports.FlightSearchService = FlightSearchService;
exports.FlightSearchService = FlightSearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        database_service_1.DatabaseService])
], FlightSearchService);
//# sourceMappingURL=flight-search.service.js.map