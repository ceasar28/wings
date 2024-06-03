export const displayFlights_en = (details, dbId) => {
  const cityFrom = details.cityFrom || '';
  const cityTo = details.cityTo || '';
  const cityRouteFrom = details.route[0].cityFrom || '';
  const cityRouteTO = details.route[0].cityTo || '';
  const cityRouteFromCode = details.route[0].cityCodeFrom || '';
  const cityRouteToCode = details.route[0].cityCodeTo || '';
  const cityRouteFrom2 = details.route[1]?.cityFrom || '';
  const cityRouteTO2 = details.route[1]?.cityTo || '';
  const cityRouteFrom2Code = details.route[1]?.cityCodeFrom || '';
  const cityRouteTO2Code = details.route[1]?.cityCodeTo || '';
  const routeDepartureTime = details.route[0].utc_departure || '';
  const routeArrivalTime = details.route[0].utc_arrival;
  const routeDepartureTime2 = details.route[1]?.utc_departure || '';
  const routeArrivalTime2 = details.route[1]?.utc_arrival || '';
  const Price = details.price || '';

  function convertDateTime(inputDateTime) {
    // Parse the input datetime string
    const dt = new Date(inputDateTime);
    console.log(details);
    // Array of day names
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Array of month names
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    // Get the day of the week
    const dayOfWeek = days[dt.getUTCDay()];

    // Get the month name
    const monthName = months[dt.getUTCMonth()];

    // Get the day of the month
    const dayOfMonth = dt.getUTCDate();

    // Get the hour, minute, and AM/PM
    let hour = dt.getUTCHours();
    let minute: any = dt.getUTCMinutes();
    const ampm = hour >= 12 ? 'pm' : 'am';
    hour = hour % 12;
    hour = hour ? hour : 12; // Handle midnight
    minute = minute < 10 ? '0' + minute : minute;

    // Combine all parts to form the desired format
    const formattedDateTime = `${dayOfWeek}, ${monthName} ${dayOfMonth} - ${hour}:${minute}${ampm}`;

    return formattedDateTime;
  }

  return {
    message: {
      oneWayMarkup: `📍 <b>${cityFrom} - ${cityTo}</b> \n\n<b>${cityRouteFrom}(${cityRouteFromCode}) - ${cityRouteTO}(${cityRouteToCode})</b>\n🔄 Direct\n🕛 Depature: ${convertDateTime(routeDepartureTime)}\n🕛 Arrival: ${convertDateTime(routeArrivalTime)}\n\n💰 Price: $${Price}\n`,
      returnMarkup: `📍 <b>${cityFrom} - ${cityTo}</b> \n\n<b>${cityRouteFrom}(${cityRouteFromCode}) - ${cityRouteTO}(${cityRouteToCode})</b>\n🔄 Direct\n🕛 Depature: ${convertDateTime(routeDepartureTime)}\n🕛 Arrival: ${convertDateTime(routeArrivalTime)}\n\n<b>${cityRouteFrom2}(${cityRouteFrom2Code}) - ${cityRouteTO2}(${cityRouteTO2Code})</b>\n🔄 Direct\n🕛 Depature: ${convertDateTime(routeDepartureTime2)}\n🕛 Arrival: ${convertDateTime(routeArrivalTime2)}\n\n💰 Price: $${Price}\n`,
      multiCityMarkup: `${details['route']?.map((route) => {
        return `📍 <b>${route.cityFrom}(${route.cityCodeFrom}) -${route.cityTo}(${route.cityCodeTo}) </b>\n🔄 Direct\n🕛 Depature: ${convertDateTime(route.utc_departure)}\n🕛 Arrival: ${convertDateTime(route.local_arrival)}\n\n`;
      })}💰 Price: $${Price}\n`,
    },
    oneWayMarkup: [
      [
        {
          text: `🎟️ Buy Ticket`,
          callback_data: JSON.stringify({
            command: '/buyTicket',
            bookingDetailsDbId: dbId,
          }),
        },
        {
          text: '❌ Close',
          callback_data: JSON.stringify({
            command: '/closedelete',
            bookingDetailsDbId: dbId,
          }),
        },
      ],
    ],
    returnMarkup: [
      [
        {
          text: `🎟️ Buy Ticket`,
          callback_data: JSON.stringify({
            command: '/buyTicket',
            bookingDetailsDbId: dbId,
          }),
        },
        {
          text: '❌ Close',
          callback_data: JSON.stringify({
            command: '/closedelete',
            bookingDetailsDbId: dbId,
          }),
        },
      ],
    ],
    multiCityMarkup: [
      [
        {
          text: `🎟️ Buy Ticket`,
          callback_data: JSON.stringify({
            command: '/buyTicket',
            bookingDetailsDbId: dbId,
          }),
        },
        {
          text: '❌ Close',
          callback_data: JSON.stringify({
            command: '/closedelete',
            bookingDetailsDbId: dbId,
          }),
        },
      ],
    ],
  };
};
