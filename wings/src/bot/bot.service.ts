import { Injectable, Logger } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import {
  welcomeMessageMarkup,
  Countries_en,
  menuMarkup_en,
  searchType_en,
  premiumDeal_en,
  booking_en,
  displayFlights_en,
  bookingDetails_en,
} from './keyboardMarkups/index';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';
import { FlightSearchService } from 'src/flight-search/flight-search.service';

@Injectable()
export class BotService {
  private readonly wingBot: TelegramBot;
  private logger = new Logger(BotService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly flightSearchService: FlightSearchService,
  ) {
    //initializing Telegram bot
    this.wingBot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
      polling: true,
    });
    // Register event listerner for incomming button commands
    this.wingBot.on('callback_query', this.handleButtonCommand);
    // Register event listerner for incoming messages
    this.wingBot.on('message', this.onReceiveMessage);
  }

  // Event handler for incoming message
  onReceiveMessage = async (msg: any) => {
    this.logger.debug(msg); // log the message

    await this.wingBot.sendChatAction(msg.chat.id, 'typing');
    // setup the keyboard markup
    const searchReplyMarkup = {
      inline_keyboard: searchType_en.searchTypeMarkup,
    };
    // condition to differntiate between users booking inputs
    const session = await this.databaseService.session.findFirst({
      where: { chat_id: msg.chat.id },
    });
    console.log('session  ', session);
    if (msg.text !== '/start' && session) {
      this.handleUserTextInputs(msg, session);
    } else {
      // parse incoming message and handle commands
      try {
        //const state = this.userStates[msg.chat.id];
        // check for messages that are not text
        if (!msg.text) {
          this.wingBot.sendMessage(
            msg.chat.id,
            'Please select the type of search 👇',
            {
              reply_markup: searchReplyMarkup,
            },
          );
        } else {
          const command = msg.text.toLowerCase().trim();
          console.log('Command :', command);
          if (command === '/start') {
            // delete existing user session
            if (session)
              await this.databaseService.session.deleteMany({
                where: {
                  chat_id: msg.chat.id,
                },
              });
            // send welcome menu
            return await this.welcomeMessageLayout(
              msg.chat.id,
              msg.from.first_name,
            );
            // keeping in context, to reply when a user selects a language
          } else {
            console.log('here');
          }
          // handle other commands
          // this.handleCommands(msg);
        }
      } catch (error) {
        console.log('first');
        console.error(error);
        return await this.wingBot.sendMessage(
          msg.chat.id,
          `Processing command failed, please try again`,
        );
      }
    }
  };

  //Event handler for users inputs
  handleUserTextInputs = async (msg: any, session: any) => {
    function convertDateFormat(dateString) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month}-${day}`;
    }
    try {
      // check if there is a booking detail session
      const bookingDetailSession =
        await this.databaseService.bookingSession.findFirst({
          where: {
            chat_id: msg.chat.id,
          },
        });
      console.log('userInput ', msg);
      // check if it is booking details
      if (bookingDetailSession) {
        if (
          JSON.parse(bookingDetailSession.userAnswerId)['messageId'].length !==
          0
        ) {
          const answerIds = JSON.parse(bookingDetailSession.userAnswerId)[
            'messageId'
          ];
          console.log('answerIds ', answerIds);
          console.log('IDS  ', bookingDetailSession);
          await this.updateBookingSession(msg.chat.id, {
            userAnswerId: JSON.stringify({
              messageId: [...answerIds, msg.message_id],
            }),
          });
        } else {
          await this.updateBookingSession(msg.chat.id, {
            userAnswerId: JSON.stringify({
              messageId: [
                ...JSON.parse(session.userAnswerId)['messageId'],
                msg.message_id,
              ],
            }),
          });
        }
        try {
          const latestBookingDetailSession =
            await this.databaseService.bookingSession.findFirst({
              where: { chat_id: msg.chat.id },
            });

          if (
            !latestBookingDetailSession.firstName &&
            JSON.parse(latestBookingDetailSession.firstNamePromptId)[
              'messageId'
            ].length > 0
          ) {
            const updateDetail = await this.updateBookingSession(msg.chat.id, {
              firstName: msg.text.trim(),
              firstNamePromptId: JSON.stringify({ messageId: [] }),
              userAnswerId: JSON.stringify({ messageId: [] }),
            });
            if (updateDetail) {
              const promises = [];
              // loop through departure prompt to delete them
              for (
                let i = 0;
                i <
                JSON.parse(latestBookingDetailSession.firstNamePromptId)[
                  'messageId'
                ].length;
                i++
              ) {
                promises.push(
                  await this.wingBot.deleteMessage(
                    msg.chat.id,
                    JSON.parse(latestBookingDetailSession.firstNamePromptId)[
                      'messageId'
                    ][i],
                  ),
                );
              }
              // loop through to delet all userReply
              for (
                let i = 0;
                i <
                JSON.parse(latestBookingDetailSession.userAnswerId)['messageId']
                  .length;
                i++
              ) {
                promises.push(
                  await this.wingBot.deleteMessage(
                    msg.chat.id,
                    JSON.parse(latestBookingDetailSession.userAnswerId)[
                      'messageId'
                    ][i],
                  ),
                );
              }

              console.log(msg.text.trim());
              const markup = bookingDetails_en(
                latestBookingDetailSession.searchResultId,
                msg.text.trim(),
                latestBookingDetailSession.LastName,
                latestBookingDetailSession.email,
              );
              if (markup) {
                await this.wingBot.editMessageReplyMarkup(
                  { inline_keyboard: markup.keyBoardMarkup },
                  {
                    chat_id: msg.chat.id,
                    message_id: Number(
                      latestBookingDetailSession.bookingDetailMarkdownId,
                    ),
                  },
                );
              }
              await Promise.all(promises);
            }
          } else if (
            !latestBookingDetailSession.LastName &&
            JSON.parse(latestBookingDetailSession.lastNamePromptId)['messageId']
              .length > 0
          ) {
            const updateDetail = await this.updateBookingSession(msg.chat.id, {
              LastName: msg.text.trim(),
              lastNamePromptId: JSON.stringify({ messageId: [] }),
              userAnswerId: JSON.stringify({ messageId: [] }),
            });
            if (updateDetail) {
              const promises = [];
              // loop through departure prompt to delete them
              for (
                let i = 0;
                i <
                JSON.parse(latestBookingDetailSession.lastNamePromptId)[
                  'messageId'
                ].length;
                i++
              ) {
                promises.push(
                  await this.wingBot.deleteMessage(
                    msg.chat.id,
                    JSON.parse(latestBookingDetailSession.lastNamePromptId)[
                      'messageId'
                    ][i],
                  ),
                );
              }
              // loop through to delet all userReply
              for (
                let i = 0;
                i <
                JSON.parse(latestBookingDetailSession.userAnswerId)['messageId']
                  .length;
                i++
              ) {
                promises.push(
                  await this.wingBot.deleteMessage(
                    msg.chat.id,
                    JSON.parse(latestBookingDetailSession.userAnswerId)[
                      'messageId'
                    ][i],
                  ),
                );
              }

              const markup = bookingDetails_en(
                latestBookingDetailSession.searchResultId,
                latestBookingDetailSession.firstName,
                msg.text.trim(),
                latestBookingDetailSession.email,
              );
              if (markup) {
                await this.wingBot.editMessageReplyMarkup(
                  { inline_keyboard: markup.keyBoardMarkup },
                  {
                    chat_id: msg.chat.id,
                    message_id: Number(
                      latestBookingDetailSession.bookingDetailMarkdownId,
                    ),
                  },
                );
              }

              await Promise.all(promises);
            }
          } else if (
            !latestBookingDetailSession.email &&
            JSON.parse(latestBookingDetailSession.emailPromptId)['messageId']
              .length > 0
          ) {
            const updateDetail = await this.updateBookingSession(msg.chat.id, {
              email: msg.text.trim(),
              emailPromptId: JSON.stringify({ messageId: [] }),
              userAnswerId: JSON.stringify({ messageId: [] }),
            });
            if (updateDetail) {
              const promises = [];
              // loop through departure prompt to delete them
              for (
                let i = 0;
                i <
                JSON.parse(latestBookingDetailSession.emailPromptId)[
                  'messageId'
                ].length;
                i++
              ) {
                promises.push(
                  await this.wingBot.deleteMessage(
                    msg.chat.id,
                    JSON.parse(latestBookingDetailSession.emailPromptId)[
                      'messageId'
                    ][i],
                  ),
                );
              }
              // loop through to delet all userReply
              for (
                let i = 0;
                i <
                JSON.parse(latestBookingDetailSession.userAnswerId)['messageId']
                  .length;
                i++
              ) {
                promises.push(
                  await this.wingBot.deleteMessage(
                    msg.chat.id,
                    JSON.parse(latestBookingDetailSession.userAnswerId)[
                      'messageId'
                    ][i],
                  ),
                );
              }

              const markup = bookingDetails_en(
                latestBookingDetailSession.searchResultId,
                latestBookingDetailSession.firstName,
                latestBookingDetailSession.LastName,
                msg.text.trim(),
              );
              await this.wingBot.editMessageReplyMarkup(
                { inline_keyboard: markup.keyBoardMarkup },
                {
                  chat_id: msg.chat.id,
                  message_id: Number(
                    latestBookingDetailSession.bookingDetailMarkdownId,
                  ),
                },
              );
              await Promise.all(promises);
            }
          }
        } catch (error) {
          console.log(error);
        }

        return;
      }

      // from here handles flight search details

      if (JSON.parse(session.userAnswerId)['messageId'].length !== 0) {
        const answerIds = JSON.parse(session.userAnswerId)['messageId'];
        console.log('answerIds ', answerIds);
        console.log('IDS  ', session);
        await this.updateUserSession(msg.chat.id, {
          userAnswerId: JSON.stringify({
            messageId: [...answerIds, msg.message_id],
          }),
        });
      } else {
        await this.updateUserSession(msg.chat.id, {
          userAnswerId: JSON.stringify({
            messageId: [
              ...JSON.parse(session.userAnswerId)['messageId'],
              msg.message_id,
            ],
          }),
        });
      }
      // Regular expression pattern to match the format DD/MM/YYYY
      const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
      // Check if the date string matches the pattern
      if (datePattern.test(msg.text.trim())) {
        const latestSession = await this.databaseService.session.findFirst({
          where: { chat_id: msg.chat.id },
        });
        if (
          JSON.parse(latestSession.departureDatePromptId)['messageId']
            .length !== 0 &&
          !latestSession.departureDate
        ) {
          const update = await this.updateUserSession(msg.chat.id, {
            departureDate: msg.text.trim(),
            departureDatePromptId: JSON.stringify({ messageId: [] }),
            userAnswerId: JSON.stringify({ messageId: [] }),
          });
          if (update) {
            if (latestSession.one_way_search_state) {
              const markup = booking_en(
                latestSession.departureCity,
                latestSession.destinationCity,
                msg.text.trim(),
              );
              await this.wingBot.editMessageReplyMarkup(
                { inline_keyboard: markup.oneWayMarkup },
                {
                  chat_id: msg.chat.id,
                  message_id: Number(latestSession.bookingMarkdownId),
                },
              );
            } else if (latestSession.return_search_state) {
              const markup = booking_en(
                latestSession.departureCity,
                latestSession.destinationCity,
                msg.text.trim(),
                latestSession.returnDate,
              );
              await this.wingBot.editMessageReplyMarkup(
                { inline_keyboard: markup.returnMarkup },
                {
                  chat_id: msg.chat.id,
                  message_id: Number(latestSession.bookingMarkdownId),
                },
              );
            } else if (latestSession.multi_city_search_state) {
              await this.updateUserSession(msg.chat.id, {
                multicitySearchData: JSON.stringify({
                  flights: [
                    ...JSON.parse(latestSession.multicitySearchData)['flights'],
                    {
                      fromEntityId: latestSession.destinationCityCode,
                      toEntityId: latestSession.departureCityCode,
                      departDate: convertDateFormat(msg.text.trim()),
                    },
                  ],
                }),
              });
              const multicityData =
                await this.databaseService.session.findFirst({
                  where: {
                    chat_id: msg.chat.id,
                  },
                });
              if (multicityData) {
                console.log('MUlti data', multicityData);
                const markup = booking_en(
                  '',
                  '',
                  '',
                  '',
                  JSON.parse(multicityData.multicitySearchData)['flights'],
                );
                //TODO: change markup to multicity
                await this.wingBot.editMessageText(
                  markup.message.multiCityMarkup,
                  {
                    chat_id: msg.chat.id,
                    message_id: Number(latestSession.bookingMarkdownId),
                    reply_markup: { inline_keyboard: markup.multiCityMarkup },
                  },
                );
              }
            }
          }
          // loop through departuredate prompt to delete them
          for (
            let i = 0;
            i <
            JSON.parse(latestSession.departureDatePromptId)['messageId'].length;
            i++
          ) {
            await this.wingBot.deleteMessage(
              msg.chat.id,
              JSON.parse(latestSession.departureDatePromptId)['messageId'][i],
            );
          }
          // loop through to delet all userReply
          for (
            let i = 0;
            i < JSON.parse(latestSession.userAnswerId)['messageId'].length;
            i++
          ) {
            await this.wingBot.deleteMessage(
              msg.chat.id,
              JSON.parse(latestSession.userAnswerId)['messageId'][i],
            );
          }
        } else if (
          // this will handle return flight
          JSON.parse(session.returnDatePromptId)['messageId'].length !== 0 &&
          !session.returnDate
        ) {
          const update = await this.updateUserSession(msg.chat.id, {
            returnDate: msg.text.trim(),
            returnDatePromptId: JSON.stringify({ messageId: [] }),
            userAnswerId: JSON.stringify({ messageId: [] }),
          });

          if (update) {
            if (latestSession.one_way_search_state) {
              const markup = booking_en(
                latestSession.departureCity,
                latestSession.destinationCity,
                msg.text.trim(),
              );
              await this.wingBot.editMessageReplyMarkup(
                { inline_keyboard: markup.oneWayMarkup },
                {
                  chat_id: msg.chat.id,
                  message_id: Number(latestSession.bookingMarkdownId),
                },
              );
            } else if (latestSession.return_search_state) {
              const markup = booking_en(
                latestSession.departureCity,
                latestSession.destinationCity,
                latestSession.departureDate,
                msg.text.trim(),
              );
              await this.wingBot.editMessageReplyMarkup(
                { inline_keyboard: markup.returnMarkup },
                {
                  chat_id: msg.chat.id,
                  message_id: Number(latestSession.bookingMarkdownId),
                },
              );

              // loop through departuredate prompt to delete them
              for (
                let i = 0;
                i <
                JSON.parse(latestSession.returnDatePromptId)['messageId']
                  .length;
                i++
              ) {
                await this.wingBot.deleteMessage(
                  msg.chat.id,
                  JSON.parse(latestSession.returnDatePromptId)['messageId'][i],
                );
              }
              // loop through to delet all userReply
              for (
                let i = 0;
                i < JSON.parse(latestSession.userAnswerId)['messageId'].length;
                i++
              ) {
                await this.wingBot.deleteMessage(
                  msg.chat.id,
                  JSON.parse(latestSession.userAnswerId)['messageId'][i],
                );
              }
            } else if (latestSession.multi_city_search_state) {
              const markup = booking_en(
                msg.text.trim(),
                latestSession.destinationCity,
                latestSession.departureDate,
              );
              //TODO: change markup to multicity
              await this.wingBot.editMessageReplyMarkup(
                { inline_keyboard: markup.returnMarkup },
                {
                  chat_id: msg.chat.id,
                  message_id: Number(latestSession.bookingMarkdownId),
                },
              );
            }
          }
        }
      } else {
        console.log('Not a date');
      }

      // this extracts the airport code, when a user presses the inline button
      function extractStringInBracket(sentence) {
        const start = sentence.indexOf('(') + 1;
        const end = sentence.indexOf(')', start);
        return sentence.substring(start, end);
      }

      // if (JSON.parse(session.userAnswerId)['messageId'].length !== 0) {
      //   const answerIds = JSON.parse(session.userAnswerId)['messageId'];
      //   console.log('answerIds ', answerIds);
      //   console.log('IDS  ', session);
      //   await this.updateUserSession(msg.chat.id, {
      //     userAnswerId: JSON.stringify({
      //       messageId: [...answerIds, msg.message_id],
      //     }),
      //   });
      // } else {
      //   await this.updateUserSession(msg.chat.id, {
      //     userAnswerId: JSON.stringify({
      //       messageId: [
      //         ...JSON.parse(session.userAnswerId)['messageId'],
      //         msg.message_id,
      //       ],
      //     }),
      //   });
      // }

      // handle airport selected by a user
      const airportCode = extractStringInBracket(msg.text.trim());

      // save this to a db
      if (airportCode !== undefined && airportCode !== '') {
        const latestSession = await this.databaseService.session.findFirst({
          where: { chat_id: msg.chat.id },
        });
        if (!latestSession.departureCityCode) {
          console.log('code ', airportCode);
          const update = await this.updateUserSession(msg.chat.id, {
            departureCityCode: airportCode,
            departureCity: msg.text.trim(),
            departureCityPromptId: JSON.stringify({ messageId: [] }),
            userAnswerId: JSON.stringify({ messageId: [] }),
          });
          if (update) {
            const promises = [];
            // loop through departure prompt to delete them
            for (
              let i = 0;
              i <
              JSON.parse(latestSession.departureCityPromptId)['messageId']
                .length;
              i++
            ) {
              promises.push(
                await this.wingBot.deleteMessage(
                  msg.chat.id,
                  JSON.parse(latestSession.departureCityPromptId)['messageId'][
                    i
                  ],
                ),
              );
            }
            // loop through to delet all userReply
            for (
              let i = 0;
              i < JSON.parse(latestSession.userAnswerId)['messageId'].length;
              i++
            ) {
              promises.push(
                await this.wingBot.deleteMessage(
                  msg.chat.id,
                  JSON.parse(latestSession.userAnswerId)['messageId'][i],
                ),
              );
            }

            if (latestSession.one_way_search_state) {
              const markup = booking_en(
                msg.text.trim(),
                latestSession.destinationCity,
                latestSession.departureDate,
              );
              await this.wingBot.editMessageReplyMarkup(
                { inline_keyboard: markup.oneWayMarkup },
                {
                  chat_id: msg.chat.id,
                  message_id: Number(latestSession.bookingMarkdownId),
                },
              );
            } else if (latestSession.return_search_state) {
              const markup = booking_en(
                msg.text.trim(),
                latestSession.destinationCity,
                latestSession.departureDate,
                latestSession.returnDate,
              );
              await this.wingBot.editMessageReplyMarkup(
                { inline_keyboard: markup.returnMarkup },
                {
                  chat_id: msg.chat.id,
                  message_id: Number(latestSession.bookingMarkdownId),
                },
              );
            } else if (latestSession.multi_city_search_state) {
              const deletedAllResponse = await Promise.all(promises);
              if (deletedAllResponse) {
                await this.destinationCitySelection(latestSession.chat_id);
              }
            }
          }
        } else if (!latestSession.destinationCityCode) {
          const update = await this.updateUserSession(msg.chat.id, {
            destinationCityCode: airportCode,
            destinationCity: msg.text.trim(),
            destinationCityPromptId: JSON.stringify({ messageId: [] }),
            userAnswerId: JSON.stringify({ messageId: [] }),
          });
          if (update) {
            if (latestSession.one_way_search_state) {
              const markup = booking_en(
                latestSession.departureCity,
                msg.text.trim(),
                latestSession.departureDate,
              );
              await this.wingBot.editMessageReplyMarkup(
                { inline_keyboard: markup.oneWayMarkup },
                {
                  chat_id: msg.chat.id,
                  message_id: Number(latestSession.bookingMarkdownId),
                },
              );
            } else if (latestSession.return_search_state) {
              const markup = booking_en(
                latestSession.departureCity,
                msg.text.trim(),
                latestSession.departureDate,
                latestSession.returnDate,
              );
              await this.wingBot.editMessageReplyMarkup(
                { inline_keyboard: markup.returnMarkup },
                {
                  chat_id: msg.chat.id,
                  message_id: Number(latestSession.bookingMarkdownId),
                },
              );
            } else if (latestSession.multi_city_search_state) {
              await this.departureDateSelection(latestSession.chat_id);
            }
          }
          // loop through departure prompt to delete them
          for (
            let i = 0;
            i <
            JSON.parse(latestSession.destinationCityPromptId)['messageId']
              .length;
            i++
          ) {
            await this.wingBot.deleteMessage(
              msg.chat.id,
              JSON.parse(latestSession.destinationCityPromptId)['messageId'][i],
            );
          }
          // loop through to delet all userReply
          for (
            let i = 0;
            i < JSON.parse(latestSession.userAnswerId)['messageId'].length;
            i++
          ) {
            await this.wingBot.deleteMessage(
              msg.chat.id,
              JSON.parse(latestSession.userAnswerId)['messageId'][i],
            );
          }
        } else {
          //TODO: handle multicity
          // this.multicityCode[msg.chat.id] = airportCode;
          // this.thirdCity[msg.chat.id] = (msg.text).trim();
        }
      } else {
        console.log('code is empty');
      }
      // parse incoming message and handle commands
      try {
        const latestSession = await this.databaseService.session.findFirst({
          where: { chat_id: msg.chat.id },
        });
        if (
          !latestSession.departureCityCode ||
          !latestSession.destinationCityCode ||
          latestSession.multi_city_search_state
        ) {
          const matchedCity = await this.flightSearchService.searchAirport(
            msg.text.trim(),
          );
          if (matchedCity) {
            // Define your keyboard layout
            const cities = matchedCity.map((city) => {
              return [`${city['name']}, ${city['location']} (${city.iata})`];
            });
            //the markup from yhr returned cities
            const keyboard = cities;

            // Create a reply keyboard markup
            const SelectCityMarkup = {
              keyboard: keyboard,
              one_time_keyboard: true,
              remove_keyboard: true,
            };
            switch (latestSession.language) {
              case 'english':
                //TODO: SEND reply button along
                if (!latestSession.departureCityCode) {
                  const selectCityPrompt = await this.wingBot.sendMessage(
                    msg.chat.id,
                    `Please choose the city from the list 👇`,
                    { reply_markup: SelectCityMarkup },
                  );
                  if (selectCityPrompt) {
                    await this.updateUserSession(msg.chat.id, {
                      departureCityPromptId: JSON.stringify({
                        messageId: [
                          ...JSON.parse(session.departureCityPromptId)[
                            'messageId'
                          ],
                          selectCityPrompt.message_id,
                        ],
                      }),
                    });
                    return;
                  }
                } else if (
                  JSON.parse(latestSession.destinationCityPromptId)['messageId']
                    .length !== 0 &&
                  !latestSession.destinationCityCode
                ) {
                  const selectCityPrompt = await this.wingBot.sendMessage(
                    msg.chat.id,
                    `Please choose the city from the list 👇`,
                    { reply_markup: SelectCityMarkup },
                  );
                  if (selectCityPrompt) {
                    await this.updateUserSession(msg.chat.id, {
                      destinationCityPromptId: JSON.stringify({
                        messageId: [
                          ...JSON.parse(latestSession.destinationCityPromptId)[
                            'messageId'
                          ],
                          selectCityPrompt.message_id,
                        ],
                      }),
                    });
                    return;
                  }
                } else if (
                  JSON.parse(latestSession.destinationCityPromptId)['messageId']
                    .length !== 0 &&
                  latestSession.destinationCityCode &&
                  !latestSession.departureDatePromptId
                ) {
                  // loop through destination prompt to delete them
                  for (
                    let i = 0;
                    i <
                    JSON.parse(latestSession.destinationCityPromptId)[
                      'messageId'
                    ].length;
                    i++
                  ) {
                    await this.wingBot.deleteMessage(
                      msg.chat.id,
                      JSON.parse(latestSession.destinationCityPromptId)[
                        'messageId'
                      ][i],
                    );
                  }
                  // loop through to delete all userReply
                  for (
                    let i = 0;
                    i <
                    JSON.parse(latestSession.userAnswerId)['messageId'].length;
                    i++
                  ) {
                    await this.wingBot.deleteMessage(
                      msg.chat.id,
                      JSON.parse(latestSession.userAnswerId)['messageId'][i],
                    );
                  }
                  //TODO:delete userAnswerId
                  // delete this.userAnswerId[msg.chat.id];

                  const markup = booking_en(
                    latestSession.departureCity[msg.chat.id],
                    latestSession.destinationCity[msg.chat.id],
                    latestSession.departureDate[msg.chat.id],
                  );
                  const setDestinationCity =
                    await this.wingBot.editMessageReplyMarkup(
                      { inline_keyboard: markup.oneWayMarkup },
                      {
                        chat_id: msg.chat.id,
                        message_id: session.bookingMarkdownId,
                      },
                    );
                  if (setDestinationCity) {
                    return;
                  }
                  return;
                } else if (
                  JSON.parse(latestSession.departureDatePromptId)['messageId']
                    .length !== 0 &&
                  latestSession.departureDate
                ) {
                  const markup = booking_en(
                    latestSession.departureCity,
                    latestSession.destinationCity,
                    latestSession.departureDate,
                  );
                  const setDepartureDate =
                    await this.wingBot.editMessageReplyMarkup(
                      {
                        inline_keyboard: markup.oneWayMarkup,
                      },
                      {
                        chat_id: msg.chat.id,
                        message_id: Number(latestSession.bookingMarkdownId),
                      },
                    );
                  if (setDepartureDate) {
                    // loop through destination prompt to delete them

                    for (
                      let i = 0;
                      JSON.parse(latestSession.departureDatePromptId)[
                        'messageId'
                      ].length;
                      i++
                    ) {
                      await this.wingBot.deleteMessage(
                        msg.chat.id,
                        JSON.parse(latestSession.departureDatePromptId)[
                          'messageId'
                        ][i],
                      );
                    }
                    // loop through to delete all userReply
                    for (
                      let i = 0;
                      i <
                      JSON.parse(latestSession.userAnswerId)['messageId']
                        .length;
                      i++
                    ) {
                      await this.wingBot.deleteMessage(
                        msg.chat.id,
                        JSON.parse(latestSession.userAnswerId)['messageId'][i],
                      );
                    }
                    // delete this.userAnswerId[msg.chat.id];
                    return;
                  }
                }
                return;

              default:
                const searchReplyMarkup = {
                  inline_keyboard: searchType_en.searchTypeMarkup,
                };
                this.wingBot.sendMessage(
                  msg.chat.id,
                  'Please select the type of search 👇',
                  {
                    reply_markup: searchReplyMarkup,
                  },
                );
            }
          }
        }
      } catch (error) {
        console.log('second');
        console.error(error);

        return await this.wingBot.sendMessage(
          msg.chat.id,
          `Processing command failed, please try again`,
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  //handlebuttoncommands;
  handleButtonCommand = async (query: any) => {
    this.logger.debug(query);
    let command: string;
    let action: string;
    let country: string;
    // let currency: string;
    let bookingDetailsDbId: string;

    const first_name = query.from.first_name;
    const last_name = query.from.last_name;
    // const user_Id = query.from.id;
    const username = `${first_name} ${last_name}`;
    // let searchLanguage: string;

    // function to check if query.data is a json type
    function isJSON(str) {
      try {
        JSON.parse(str);
        return true;
      } catch (e) {
        return false;
      }
    }

    // function to split country from language
    function splitword(word) {
      return word.split('_');
    }

    if (isJSON(query.data)) {
      command = JSON.parse(query.data).command;
      action = JSON.parse(query.data).action;
      country = JSON.parse(query.data).country;
      // currency = JSON.parse(query.data).currency;
      // searchLanguage = JSON.parse(query.data).language;
      bookingDetailsDbId = JSON.parse(query.data).bookingDetailsDbId;
    } else {
      command = query.data;
    }

    // console.log(query.message.chat.id);
    const chatId = query.message.chat.id;

    const userId = query.from.id;
    console.log(command);

    console.log(userId, chatId);
    try {
      switch (command) {
        case '/welcome':
          await this.wingBot.sendChatAction(query.message.chat.id, 'typing');
          // save the language preference
          this.sendAllCountries(query.message.chat.id);
          return;

        case '/nextCountryPage':
          await this.wingBot.sendChatAction(query.message.chat.id, 'typing');
          if (action) {
            const [btnPage] = splitword(action);
            console.log('action :', action);
            console.log('message id :', query.message.message_id);

            const changeDisplay = {
              buttonPage: btnPage,
              messageId: query.message.message_id,
            };

            this.sendAllCountries(query.message.chat.id, changeDisplay);
            return;
          } else {
            return;
          }

        case '/prevCountryPage':
          await this.wingBot.sendChatAction(query.message.chat.id, 'typing');
          if (action) {
            console.log('action :', action);
            console.log('message id :', query.message.message_id);

            const [btnPage] = splitword(action);
            console.log('action :', action);
            console.log('message id :', query.message.message_id);

            const changeDisplay = {
              buttonPage: btnPage,
              messageId: query.message.message_id,
            };

            this.sendAllCountries(query.message.chat.id, changeDisplay);
            return;
          }
          return;

        case '/countrySelected':
          await this.wingBot.sendChatAction(query.message.chat.id, 'typing');
          if (country) {
            const [countryName, language] = splitword(country);
            console.log('selected country :', countryName);
            // save users country
            await this.saveToDB({
              username,
              chat_id: chatId,
              language,
              country: countryName,
            });
            await this.defaultMenuLyout(chatId);
            return;
          }

          return;

        case '/newSearch':
          await this.wingBot.sendChatAction(query.message.chat.id, 'typing');
          return await this.searchFlightLayout(query.message.chat.id);

        case '/premiumDeals':
          await this.wingBot.sendChatAction(query.message.chat.id, 'typing');
          return await this.sendPremiumDealLayout(query.message.chat.id);

        case '/menu':
          await this.wingBot.sendChatAction(query.message.chat.id, 'typing');
          return await this.defaultMenuLyout(query.message.chat.id);

        case '/settings':
          await this.wingBot.sendChatAction(query.message.chat.id, 'typing');
          return await this.sendAllCountries(query.message.chat.id);

        // search flight
        case '/oneway':
          await this.wingBot.sendChatAction(query.message.chat.id, 'typing');
          const sessionExist1 = await this.databaseService.session.findMany({
            where: {
              chat_id: query.message.chat.id,
            },
          });
          if (sessionExist1) {
            // delete session first
            await this.databaseService.session.deleteMany({
              where: {
                chat_id: query.message.chat.id,
              },
            });
            // then create new one
            await this.createSearchSession(query.message.chat.id, {
              one_way_search_state: true,
              return_search_state: false,
              multi_city_search_state: false,
              user: {
                connect: { chat_id: query.message.chat.id },
              },
              departureCityPromptId: JSON.stringify({
                messageId: [],
              }),
              destinationCityPromptId: JSON.stringify({
                messageId: [],
              }),
              userAnswerId: JSON.stringify({ messageId: [] }),
              departureDatePromptId: JSON.stringify({
                messageId: [],
              }),
              returnDatePromptId: JSON.stringify({
                messageId: [],
              }),
            });
          } else {
            await this.createSearchSession(query.message.chat.id, {
              one_way_search_state: true,
              return_search_state: false,
              multi_city_search_state: false,
              user: { connect: { chat_id: query.message.chat.id } },
              departureCityPromptId: JSON.stringify({
                messageId: [],
              }),
              destinationCityPromptId: JSON.stringify({
                messageId: [],
              }),
              userAnswerId: JSON.stringify({ messageId: [] }),
              departureDatePromptId: JSON.stringify({
                messageId: [],
              }),
              returnDatePromptId: JSON.stringify({ messageId: [] }),
            });
          }
          return await this.searchFlight(query.message.chat.id, 'oneWayMarkup');

          return;
        // search flight
        case '/return':
          await this.wingBot.sendChatAction(query.message.chat.id, 'typing');
          const sessionExist2 = await this.databaseService.session.findMany({
            where: {
              chat_id: query.message.chat.id,
            },
          });
          if (sessionExist2) {
            // delete session first
            await this.databaseService.session.deleteMany({
              where: {
                chat_id: query.message.chat.id,
              },
            });
            // then create new one
            await this.createSearchSession(query.message.chat.id, {
              one_way_search_state: false,
              return_search_state: true,
              multi_city_search_state: false,
              user: { connect: { chat_id: query.message.chat.id } },
              departureCityPromptId: JSON.stringify({ messageId: [] }),
              destinationCityPromptId: JSON.stringify({ messageId: [] }),
              userAnswerId: JSON.stringify({ messageId: [] }),
              departureDatePromptId: JSON.stringify({ messageId: [] }),
              returnDatePromptId: JSON.stringify({ messageId: [] }),
            });
          } else {
            await this.createSearchSession(query.message.chat.id, {
              one_way_search_state: false,
              return_search_state: true,
              multi_city_search_state: false,
              user: { connect: { chat_id: query.message.chat.id } },
              departureCityPromptId: JSON.stringify({ messageId: [] }),
              destinationCityPromptId: JSON.stringify({ messageId: [] }),
              userAnswerId: JSON.stringify({ messageId: [] }),
              departureDatePromptId: JSON.stringify({ messageId: [] }),
              returnDatePromptId: JSON.stringify({ messageId: [] }),
            });
          }

          return await this.searchFlight(
            query.message.chat.id,

            'returnMarkup',
          );

          return;

        // search flight
        case '/multicity':
          await this.wingBot.sendChatAction(query.message.chat.id, 'typing');

          const sessionExist3 = await this.databaseService.session.findMany({
            where: {
              chat_id: query.message.chat.id,
            },
          });
          if (sessionExist3) {
            // delete session first
            await this.databaseService.session.deleteMany({
              where: {
                chat_id: query.message.chat.id,
              },
            });
            // then create new one
            await this.createSearchSession(query.message.chat.id, {
              one_way_search_state: false,
              return_search_state: false,
              multi_city_search_state: true,
              user: { connect: { chat_id: query.message.chat.id } },
              departureCityPromptId: JSON.stringify({ messageId: [] }),
              destinationCityPromptId: JSON.stringify({ messageId: [] }),
              userAnswerId: JSON.stringify({ messageId: [] }),
              departureDatePromptId: JSON.stringify({ messageId: [] }),
              returnDatePromptId: JSON.stringify({ messageId: [] }),
              multicitySearchData: JSON.stringify({ flights: [] }),
            });
          } else {
            await this.createSearchSession(query.message.chat.id, {
              one_way_search_state: false,
              return_search_state: false,
              multi_city_search_state: true,
              user: { connect: { chat_id: query.message.chat.id } },
              departureCityPromptId: JSON.stringify({ messageId: [] }),
              destinationCityPromptId: JSON.stringify({ messageId: [] }),
              userAnswerId: JSON.stringify({ messageId: [] }),
              departureDatePromptId: JSON.stringify({ messageId: [] }),
              returnDatePromptId: JSON.stringify({ messageId: [] }),
              multicitySearchData: JSON.stringify({ flights: [] }),
            });
          }
          return await this.searchFlight(
            query.message.chat.id,
            'multiCityMarkup',
          );

          return;

        // close opened markup
        case '/close':
          await this.wingBot.sendChatAction(query.message.chat.id, 'typing');
          await this.databaseService.session.deleteMany({
            where: {
              chat_id: query.message.chat.id,
            },
          });
          return await this.wingBot.deleteMessage(
            query.message.chat.id,
            query.message.message_id,
          );

          return;

        // close opened markup and delete result
        case '/closedelete':
          await this.wingBot.sendChatAction(query.message.chat.id, 'typing');
          await this.databaseService.searchResults.deleteMany({
            where: { id: Number(bookingDetailsDbId) },
          });
          await this.databaseService.bookingSession.deleteMany({
            where: { chat_id: query.message.chat.id },
          });
          //Number(bookingDetailsDbId)
          return await this.wingBot.deleteMessage(
            query.message.chat.id,
            query.message.message_id,
          );

        case '/departureCity':
          await this.wingBot.sendChatAction(query.message.chat.id, 'typing');
          return await this.departureCitySelection(query.message.chat.id);

        case '/destinationCity':
          return await this.destinationCitySelection(query.message.chat.id);

        case '/dateOfDeparture':
          return await this.departureDateSelection(query.message.chat.id);

        case '/dateOfReturn':
          return await this.returnDateSelection(query.message.chat.id);

        // for multi-city
        case '/addflights':
          await this.updateUserSession(query.message.chat.id, {
            departureCityPromptId: JSON.stringify({ messageId: [] }),
            destinationCityPromptId: JSON.stringify({ messageId: [] }),
            userAnswerId: JSON.stringify({ messageId: [] }),
            departureDatePromptId: JSON.stringify({ messageId: [] }),
            departureCity: '',
            destinationCity: '',
            departureCityCode: '',
            destinationCityCode: '',
            departureDate: '',
          });
          return await this.departureCitySelection(query.message.chat.id);

        case '/searchOneWayFlight':
          const sessionOneWay = await this.databaseService.session.findFirst({
            where: { chat_id: query.message.chat.id },
          });
          if (sessionOneWay) {
            const availableFlights =
              await this.flightSearchService.searchAvailableOneWayFlight({
                from: sessionOneWay.departureCityCode,
                to: sessionOneWay.destinationCityCode,
                date_from: sessionOneWay.departureDate,
                currency: 'USD',
              });
            if (availableFlights) {
              console.log(availableFlights);
              return await this.displayFlights(
                query.message.chat.id,
                sessionOneWay.language,
                'oneWayMarkup',
                availableFlights,
              );
            }
          }
          return;

        case '/searchReturnFlight':
          const sessionReturn = await this.databaseService.session.findFirst({
            where: { chat_id: query.message.chat.id },
          });
          if (sessionReturn) {
            const availableFlights =
              await this.flightSearchService.searchAvailableReturnFlight({
                from: sessionReturn.departureCityCode,
                to: sessionReturn.destinationCityCode,
                date_from: sessionReturn.departureDate,
                date_to: sessionReturn.returnDate,
                currency: 'USD',
              });
            if (availableFlights) {
              return await this.displayFlights(
                query.message.chat.id,
                sessionReturn.language,
                'returnMarkup',
                availableFlights,
              );
            }
          }
          return;

        case '/searchMultiCityFlight':
          const sessionMultiCity = await this.databaseService.session.findFirst(
            {
              where: { chat_id: query.message.chat.id },
            },
          );
          if (sessionMultiCity) {
            const availableFlights =
              await this.flightSearchService.searchAvailableMulticityFlight(
                JSON.parse(sessionMultiCity.multicitySearchData),
              );
            if (availableFlights) {
              console.log(availableFlights);
              return await this.displayFlights(
                query.message.chat.id,
                sessionMultiCity.language,
                'multiCityMarkup',
                availableFlights,
              );
            }
          }
          return;

        // proceed to buy ticket, this triggers the details markup
        case '/buyTicket':
          await this.wingBot.sendChatAction(query.message.chat.id, 'typing');
          const sessionExist =
            await this.databaseService.bookingSession.findMany({
              where: {
                chat_id: query.message.chat.id,
              },
            });
          if (sessionExist) {
            // delete session first
            await this.databaseService.bookingSession.deleteMany({
              where: {
                chat_id: query.message.chat.id,
              },
            });

            // then create new one
            await this.createBookingSession(query.message.chat.id, {
              user: {
                connect: { chat_id: query.message.chat.id },
              },
              firstNamePromptId: JSON.stringify({ messageId: [] }),
              lastNamePromptId: JSON.stringify({ messageId: [] }),
              emailPromptId: JSON.stringify({ messageId: [] }),
              userAnswerId: JSON.stringify({ messageId: [] }),
              searchResultId: bookingDetailsDbId.toString(),
            });
          } else {
            await this.createBookingSession(query.message.chat.id, {
              firstNamePromptId: JSON.stringify({ messageId: [] }),
              lastNamePromptId: JSON.stringify({ messageId: [] }),
              emailPromptId: JSON.stringify({ messageId: [] }),
              userAnswerId: JSON.stringify({ messageId: [] }),
              user: {
                connect: { chat_id: query.message.chat.id },
              },
            });
          }
          const user = await this.databaseService.user.findFirst({
            where: { chat_id: query.message.chat.id },
          });
          //Number(bookingDetailsDbId)
          return await this.displayBookingDetails(
            query.message.chat.id,
            user.language,
            bookingDetailsDbId,
          );

          return;

        case '/firstName':
          await this.wingBot.sendChatAction(query.message.chat.id, 'typing');
          return await this.bookingDetailsFirstNameSelection(
            query.message.chat.id,
          );

        case '/lastName':
          await this.wingBot.sendChatAction(query.message.chat.id, 'typing');
          return await this.bookingDetailsLastNameSelection(
            query.message.chat.id,
          );

        case '/bookingEmail':
          await this.wingBot.sendChatAction(query.message.chat.id, 'typing');
          return await this.bookingDetailsEmailSelection(query.message.chat.id);

        case '/GeneratePayment':
          await this.wingBot.sendChatAction(query.message.chat.id, 'typing');
          if (bookingDetailsDbId) {
            const flight = await this.databaseService.searchResults.findFirst({
              where: { id: Number(bookingDetailsDbId) },
            });
            const bookingDetail =
              await this.databaseService.bookingSession.findFirst({
                where: { chat_id: query.message.chat.id },
              });
            if (flight && bookingDetail) {
              const payload = {
                amount: JSON.parse(flight.searchResults).amount,
                message: JSON.parse(flight.searchResults).summary,
                chatId: query.message.chat.id,
              };
              const createOrder =
                await this.flightSearchService.generateSolanaPayUrl(payload);
              if (createOrder) {
                console.log(createOrder.url);
                const webApp = 'https://wings-kappa.vercel.app/';
                return this.wingBot.sendMessage(
                  query.message.chat.id,
                  `Passenger Details :\n\nPassenger's Name : ${bookingDetail.firstName} ${bookingDetail.LastName}\nemail: ${bookingDetail.email}`,
                  {
                    reply_markup: {
                      inline_keyboard: [
                        [
                          {
                            text: 'deeplink',
                            url: `https://dc3v8d3l-3000.eun1.devtunnels.ms/flight-search/${bookingDetail.id}`,
                          },
                          {
                            text: '✅ Verify',
                            callback_data: JSON.stringify({
                              command: '/verifyPayment',
                              bookingDetailsDbId: Number(bookingDetail.id),
                            }),
                          },
                        ],
                        [
                          {
                            text: 'Scan to pay',
                            web_app: { url: `${webApp}` },
                          },
                          {
                            text: '❌ Cancel',
                            callback_data: JSON.stringify({
                              command: '/closedelete',
                              bookingDetailsDbId: Number(
                                bookingDetail.searchResultId,
                              ),
                            }),
                          },
                        ],
                      ],
                    },
                  },
                );
              }
              // make the http call to fetch payment url
              // users details, send it to the user
            }
          }
          return;

        case '/GenerateBonkPayment':
          await this.wingBot.sendChatAction(query.message.chat.id, 'typing');
          if (bookingDetailsDbId) {
            const flight = await this.databaseService.searchResults.findFirst({
              where: { id: Number(bookingDetailsDbId) },
            });
            const bookingDetail =
              await this.databaseService.bookingSession.findFirst({
                where: { chat_id: query.message.chat.id },
              });
            if (flight && bookingDetail) {
              const payload = {
                amount: JSON.parse(flight.searchResults).amount,
                message: JSON.parse(flight.searchResults).summary,
                chatId: query.message.chat.id,
              };
              const createOrder =
                await this.flightSearchService.generateBonkPayUrl(payload);
              if (createOrder) {
                console.log(createOrder.url);
                const webApp = 'https://wings-kappa.vercel.app/';
                return this.wingBot.sendMessage(
                  query.message.chat.id,
                  `Passenger Details :\n\nPassenger's Name : ${bookingDetail.firstName} ${bookingDetail.LastName}\nemail: ${bookingDetail.email}`,
                  {
                    reply_markup: {
                      inline_keyboard: [
                        [
                          {
                            text: 'deeplink',
                            url: `https://dc3v8d3l-3000.eun1.devtunnels.ms/flight-search/${bookingDetail.id}`,
                          },
                          {
                            text: '✅ Verify',
                            callback_data: JSON.stringify({
                              command: '/verifyPayment',
                              bookingDetailsDbId: Number(bookingDetail.id),
                            }),
                          },
                        ],
                        [
                          {
                            text: 'Scan to pay',
                            web_app: { url: `${webApp}` },
                          },
                          {
                            text: '❌ Cancel',
                            callback_data: JSON.stringify({
                              command: '/closedelete',
                              bookingDetailsDbId: Number(
                                bookingDetail.searchResultId,
                              ),
                            }),
                          },
                        ],
                      ],
                    },
                  },
                );
              }
              // make the http call to fetch payment url
              // users details, send it to the user
            }
          }
          return;

        case '/verifyPayment':
          await this.wingBot.sendChatAction(query.message.chat.id, 'typing');
          try {
            const session = await this.databaseService.bookingSession.findFirst(
              { where: { id: Number(bookingDetailsDbId) } },
            );
            if (!session) {
              return;
            }
            // fetch the search Result
            const verify = await this.flightSearchService.verifyTransaction(
              session.id,
            );
            if (verify) {
              await this.wingBot.editMessageReplyMarkup(
                {
                  inline_keyboard: [
                    [
                      // {
                      //   text: 'deeplink',
                      //   url: `https://dc3v8d3l-3000.eun1.devtunnels.ms/flight-search/${bookingDetail.id}`,
                      // },
                      {
                        text: 'Payment Verified ✅',
                        callback_data: JSON.stringify({
                          command: '/newSearch',
                          language: 'english',
                        }),
                      },
                    ],
                    // [
                    //   {
                    //     text: 'Scan to pay',
                    //     web_app: { url: `${webApp}` },
                    //   },
                    //   {
                    //     text: '❌ Cancel',
                    //     callback_data: JSON.stringify({
                    //       command: '/closedelete',
                    //       bookingDetailsDbId: Number(
                    //         bookingDetail.searchResultId,
                    //       ),
                    //     }),
                    //   },
                    // ],
                  ],
                },

                {
                  chat_id: query.message.chat.id,
                  message_id: query.message.message_id,
                },
              );
              // fetch flight details
              const flightDetails =
                await this.flightSearchService.searchFlightDetails(session);

              if (flightDetails) {
                await this.wingBot.sendMessage(
                  session.chat_id.toString(),
                  `Status: Paid\n\nName: ${flightDetails.firstName} ${flightDetails.lastName}\nEmail: ${flightDetails.email}\n\nSummary: ${flightDetails.summary}\n\nPrice: ${flightDetails.price}\n\nDeeplinks : ${Array.from(
                    flightDetails.flightDeeplinks,
                  ).map((link: any) => {
                    return `Agent name: ${link.agentName}\nlink: ${link.url}\nPrice: ${link.price}`;
                  })}`,
                );
              }
            }
            return await this.wingBot.sendMessage(
              session.chat_id.toString(),
              'Payment Not verified',
            );
          } catch (error) {
            console.log(error);
            return;
          }

        default:
          console.log('default');
          return await this.wingBot.sendMessage(
            query.message.chat.id,
            `Processing command failed, please try again`,
          );
      }
    } catch (error) {
      console.log('third');
      console.error(error);

      return await this.wingBot.sendMessage(
        query.message.chat.id,
        `Processing command failed, please try again`,
      );
    }
  };

  welcomeMessageLayout = async (chat_id, userName) => {
    // const welcomeMessageMarkup = {
    //   inline_keyboard: welcomeMessageMarkup.selectLanguageKeyboard,
    //   force_reply: true,
    // };
    const welcomeMessage = await welcomeMessageMarkup(userName);
    try {
      const markup = {
        inline_keyboard: welcomeMessage.markup,
        force_reply: true,
      };
      await this.wingBot.sendMessage(chat_id, welcomeMessage.message, {
        reply_markup: markup,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // send all country options
  sendAllCountries = async (chat_id, changeDisplay?) => {
    let display; // the particular button page to be displayed
    let messageId;
    if (!changeDisplay) {
      display = 'firstDisplay';
    } else {
      display = changeDisplay.buttonPage;
      messageId = changeDisplay.messageId;
      console.log('displayaction :', display);
    }
    try {
      const selectCountry = Countries_en[display];
      // setup the keyboard markup
      const selectCountryMarkup = {
        inline_keyboard: selectCountry,
      };
      if (!messageId) {
        await this.wingBot.sendMessage(
          chat_id,
          `Please, Select your country 🌐`,
          {
            reply_markup: selectCountryMarkup,
          },
        );

        return;
      } else {
        console.log('message needs to be edited');
        await this.wingBot.editMessageReplyMarkup(selectCountryMarkup, {
          chat_id,
          message_id: messageId,
        });
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  async saveToDB(saveUserDto: Prisma.UserCreateInput) {
    try {
      const isSaved = await this.databaseService.user.findFirst({
        where: { chat_id: saveUserDto.chat_id },
      });
      if (!isSaved) {
        return this.databaseService.user.create({ data: saveUserDto });
      }
      return;
    } catch (error) {
      console.error(error);
    }
  }

  defaultMenuLyout = async (chat_id) => {
    try {
      const menuMarkup = { inline_keyboard: menuMarkup_en.markup };
      await this.wingBot.sendMessage(
        chat_id,
        `To begin your seamless travel booking experience, please select one of the options below: 👇`,
        { reply_markup: menuMarkup },
      );
      return;
    } catch (error) {
      console.log(error);
    }
  };

  searchFlightLayout = async (chatId) => {
    try {
      const searchFlight = searchType_en.searchTypeMarkup;

      const selectFlightMarkup = {
        inline_keyboard: searchFlight,
      };
      return await this.wingBot.sendMessage(
        chatId,
        `Please select the type of search 👇`,
        { reply_markup: selectFlightMarkup },
      );
    } catch (error) {
      console.log(error);
    }
  };

  sendPremiumDealLayout = async (chatId) => {
    try {
      const premiumDeals = premiumDeal_en.premiumDealMarkup;

      const premiumMarkup = {
        inline_keyboard: premiumDeals,
      };
      return await this.wingBot.sendMessage(
        chatId,
        `Upgrade to Wings-booking Premium and enjoy access to all the benefits at an incredibly affordable price.\n\nToday Only: 90% OFF! $120 $12/year\n\n🛩 Choose a specific flight to track.\n\n⚡️ Enjoy more frequent updates on ticket prices.\n\n🤘 Be the first to receive flight alerts.\n\n🎫 Use the Flight Deals feature to find flights across a wide range of dates and track prices for all flights at once.\n\n💬 Receive premium support.\n\n💸 Support an independent business that respects your data privacy.\n\n💳 30-day money-back guarantee if you're not satisfied.`,
        { reply_markup: premiumMarkup },
      );
    } catch (error) {
      console.log(error);
    }
  };

  async createSearchSession(
    chat_id: number,
    saveSessionDto: Prisma.SessionCreateInput,
  ) {
    try {
      const exist = await this.databaseService.session.findFirst({
        where: { chat_id },
      });
      if (!exist) {
        return this.databaseService.session.create({
          data: saveSessionDto,
        });
      } else {
        return this.updateUserSession(chat_id, saveSessionDto);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async updateUserSession(
    chat_id: number,
    updateUserSessionDto: Prisma.SessionUpdateInput,
  ) {
    try {
      return await this.databaseService.session.updateMany({
        where: { chat_id },
        data: updateUserSessionDto,
      });
    } catch (error) {
      console.log(error);
    }
  }

  // search flight
  searchFlight = async (chatId, type) => {
    try {
      const markup = booking_en('', '', '', '');
      const bookingDetailMarkup = { inline_keyboard: markup[type] };
      const searchDetails = await this.wingBot.sendMessage(
        chatId,
        markup.message[type],
        { reply_markup: bookingDetailMarkup },
      );
      await this.updateUserSession(chatId, {
        bookingMarkdownId: searchDetails.message_id,
      });
      return searchDetails;
    } catch (error) {
      console.log(error);
    }
  };

  departureCitySelection = async (chatId) => {
    try {
      const departureCityPrompt = await this.wingBot.sendMessage(
        chatId,
        "🏠 What's your departure city? For example, Milan.",
        {
          reply_markup: {
            force_reply: true,
          },
        },
      );
      const session = await this.databaseService.session.findFirst({
        where: { chat_id: chatId },
      });
      if (session) {
        const promptIds = JSON.parse(session.departureCityPromptId);
        console.log('prompts :', promptIds['messageId']);
        await this.updateUserSession(chatId, {
          departureCityPromptId: JSON.stringify({
            messageId: [
              ...JSON.parse(session.departureCityPromptId)['messageId'],
              departureCityPrompt.message_id,
            ],
          }),
        });
        return;
      }
      return;
    } catch (error) {
      console.log(error);
    }
  };

  destinationCitySelection = async (chatId) => {
    try {
      const destinationCityPrompt = await this.wingBot.sendMessage(
        chatId,
        "🛫 What's your destination? For example, Cologne.",
        {
          reply_markup: {
            force_reply: true,
          },
        },
      );
      const session = await this.databaseService.session.findFirst({
        where: { chat_id: chatId },
      });
      if (session) {
        await this.updateUserSession(chatId, {
          destinationCityPromptId: JSON.stringify({
            messageId: [
              ...JSON.parse(session.destinationCityPromptId)['messageId'],
              destinationCityPrompt.message_id,
            ],
          }),
        });
        return;
      }
      return;
    } catch (error) {
      console.log(error);
    }
  };

  departureDateSelection = async (chatId) => {
    try {
      const departureDatePromptId = await this.wingBot.sendMessage(
        chatId,
        '📅 Specify the date of departure- "DD/MM/YYYY" (e.g: 20/06/2024).',
        {
          reply_markup: {
            force_reply: true,
          },
        },
      );
      const session = await this.databaseService.session.findFirst({
        where: { chat_id: chatId },
      });
      if (session) {
        await this.databaseService.session.updateMany({
          where: { chat_id: chatId },
          data: {
            departureDatePromptId: JSON.stringify({
              messageId: [
                ...JSON.parse(session.departureDatePromptId)['messageId'],
                departureDatePromptId.message_id,
              ],
            }),
          },
        });
        return;
      }
      return;
    } catch (error) {
      console.log(error);
    }
  };

  returnDateSelection = async (chatId) => {
    try {
      const returnDatePromptId = await this.wingBot.sendMessage(
        chatId,
        '📅 Specify the date of return- "DD/MM/YYYY" (e.g: 20/06/2024).',
        {
          reply_markup: {
            force_reply: true,
          },
        },
      );
      const session = await this.databaseService.session.findFirst({
        where: { chat_id: chatId },
      });
      if (session) {
        await this.databaseService.session.updateMany({
          where: { chat_id: chatId },
          data: {
            returnDatePromptId: JSON.stringify({
              messageId: [
                ...JSON.parse(session.returnDatePromptId)['messageId'],
                returnDatePromptId.message_id,
              ],
            }),
          },
        });
        return;
      }
      return;
    } catch (error) {
      console.log(error);
    }
  };

  async createBookingSession(
    chat_id: number,
    BookingSessionDto: Prisma.BookingSessionCreateInput,
  ) {
    try {
      const exist = await this.databaseService.bookingSession.findFirst({
        where: { chat_id },
      });
      if (!exist) {
        return this.databaseService.bookingSession.create({
          data: BookingSessionDto,
        });
      } else {
        return this.updateBookingSession(chat_id, BookingSessionDto);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async updateBookingSession(
    chat_id: number,
    updateBookingSessionDto: Prisma.BookingSessionUpdateInput,
  ) {
    try {
      return await this.databaseService.bookingSession.updateMany({
        where: { chat_id },
        data: updateBookingSessionDto,
      });
    } catch (error) {
      console.log(error);
    }
  }

  displayFlights = async (chatId, language, type, flights) => {
    try {
      switch (language) {
        case 'english':
          try {
            console.log(flights);
            if (flights['completeFlights'].length === 0) {
              const newSearchMarkup = [
                [
                  {
                    text: '🔎 New Search',
                    callback_data: JSON.stringify({
                      command: '/newSearch',
                      language: 'english',
                    }),
                  },
                ],
              ];
              return await this.wingBot.sendMessage(
                chatId,
                "Unfortunately, I couldn't find any flights for these dates.",
                {
                  reply_markup: { inline_keyboard: newSearchMarkup },
                },
              );
            } else {
              flights['completeFlights'].map(async (flight) => {
                console.log(flight);
                try {
                  if (type === 'oneWayMarkup') {
                    const BookingDetails = JSON.stringify({
                      token: `${flights.token}`,
                      id: `${flight.id}`,
                      amount: `${flight.price['raw']}`,
                      summary: `One-way booking: ${flight.legs[0].origin['city'] || ''} - ${flight.legs[0].destination['city'] || ''}`,
                      airline: `${flight.legs[0]?.carriers.marketing[0]?.name}`,
                    });

                    const saveResultToDb =
                      await this.databaseService.searchResults.create({
                        data: {
                          searchResults: BookingDetails,
                          chat_id: chatId,
                        },
                      });
                    if (saveResultToDb) {
                      const markup = await displayFlights_en(
                        flight,
                        saveResultToDb.id,
                      );
                      return this.wingBot.sendMessage(
                        chatId,
                        markup.message[type],
                        {
                          reply_markup: { inline_keyboard: markup[type] },
                          parse_mode: 'HTML',
                        },
                      );
                    }
                  } else if (type === 'returnMarkup') {
                    const BookingDetails = JSON.stringify({
                      token: `${flights.token}`,
                      id: `${flight.id}`,
                      amount: `${flight.price['raw']}`,
                      summary: `Return Flight Booking: ${flight.legs[0].origin['city'] || ''} - ${flight.legs[0].destination['city'] || ''}`,
                      airline: `${flight.legs[0]?.carriers.marketing[0]?.name}`,
                    });
                    const saveResultToDb =
                      await this.databaseService.searchResults.create({
                        data: {
                          searchResults: BookingDetails,
                          chat_id: chatId,
                        },
                      });
                    if (saveResultToDb) {
                      const markup = await displayFlights_en(
                        flight,
                        saveResultToDb.id,
                      );
                      return this.wingBot.sendMessage(
                        chatId,
                        markup.message[type],
                        {
                          reply_markup: { inline_keyboard: markup[type] },
                          parse_mode: 'HTML',
                        },
                      );
                    }
                  } else {
                    const BookingDetails = JSON.stringify({
                      token: `${flights.token}`,
                      id: `${flight.id}`,
                      amount: `${flight.price['raw']}`,
                      summary: ` Multicity Flight booking: ${flight.legs?.map(
                        (route) => {
                          return `${route.origin['city']} - ${route.destination['city']}`;
                        },
                      )}`,
                      airline: `${flight.legs?.map((route) => {
                        return `${route.carriers.marketing[0]?.name}`;
                      })}`,
                    });
                    const saveResultToDb =
                      await this.databaseService.searchResults.create({
                        data: {
                          searchResults: BookingDetails,
                          chat_id: chatId,
                        },
                      });
                    if (saveResultToDb) {
                      const markup = await displayFlights_en(
                        flight,
                        saveResultToDb.id,
                      );
                      return this.wingBot.sendMessage(
                        chatId,
                        markup.message[type],
                        {
                          reply_markup: { inline_keyboard: markup[type] },
                          parse_mode: 'HTML',
                        },
                      );
                    }
                  }
                } catch (error) {
                  console.log(error);
                }
              });
            }
          } catch (error) {
            console.log(error);
          }

          return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  displayBookingDetails = async (chatId, language, bookingDetailsDbId) => {
    try {
      switch (language) {
        case 'english':
          try {
            const bookingMarkup = bookingDetails_en(
              bookingDetailsDbId,
              '',
              '',
              '',
            );
            const bookingDetails = await this.wingBot.sendMessage(
              chatId,
              bookingMarkup.message,
              {
                reply_markup: {
                  inline_keyboard: bookingMarkup.keyBoardMarkup,
                },
              },
            );
            await this.updateBookingSession(chatId, {
              bookingDetailMarkdownId: bookingDetails.message_id.toString(),
            });
            return bookingDetails;
          } catch (error) {
            console.log(error);
          }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // booking user details first name selection
  bookingDetailsFirstNameSelection = async (chatId) => {
    try {
      const firstNamePrompt = await this.wingBot.sendMessage(
        chatId,
        "Passenger's First Name",
        {
          reply_markup: {
            force_reply: true,
          },
        },
      );
      const bookingDetailsession =
        await this.databaseService.bookingSession.findFirst({
          where: { chat_id: chatId },
        });
      if (bookingDetailsession) {
        const promptIds = JSON.parse(bookingDetailsession.firstNamePromptId);
        console.log('prompts :', promptIds['messageId']);
        await this.updateBookingSession(chatId, {
          firstNamePromptId: JSON.stringify({
            messageId: [
              ...JSON.parse(bookingDetailsession.firstNamePromptId)[
                'messageId'
              ],
              firstNamePrompt.message_id,
            ],
          }),
        });
        return;
      }
      return;
    } catch (error) {
      console.log(error);
    }
  };

  // booking user details last name selection
  bookingDetailsLastNameSelection = async (chatId) => {
    try {
      const lastNamePrompt = await this.wingBot.sendMessage(
        chatId,
        "Passenger's Last Name",
        {
          reply_markup: {
            force_reply: true,
          },
        },
      );
      const bookingDetailsession =
        await this.databaseService.bookingSession.findFirst({
          where: { chat_id: chatId },
        });
      if (bookingDetailsession) {
        const promptIds = JSON.parse(bookingDetailsession.lastNamePromptId);
        console.log('prompts :', promptIds['messageId']);
        await this.updateBookingSession(chatId, {
          lastNamePromptId: JSON.stringify({
            messageId: [
              ...JSON.parse(bookingDetailsession.lastNamePromptId)['messageId'],
              lastNamePrompt.message_id,
            ],
          }),
        });
        return;
      }
      return;
    } catch (error) {
      console.log(error);
    }
  };

  // booking user details email selection
  bookingDetailsEmailSelection = async (chatId) => {
    try {
      const emailPrompt = await this.wingBot.sendMessage(
        chatId,
        "Passenger's Email",
        {
          reply_markup: {
            force_reply: true,
          },
        },
      );
      const bookingDetailsession =
        await this.databaseService.bookingSession.findFirst({
          where: { chat_id: chatId },
        });
      if (bookingDetailsession) {
        const promptIds = JSON.parse(bookingDetailsession.emailPromptId);
        console.log('prompts :', promptIds['messageId']);
        await this.updateBookingSession(chatId, {
          emailPromptId: JSON.stringify({
            messageId: [
              ...JSON.parse(bookingDetailsession.emailPromptId)['messageId'],
              emailPrompt.message_id,
            ],
          }),
        });
        return;
      }
      return;
    } catch (error) {
      console.log(error);
    }
  };
}
