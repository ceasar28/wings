export const displayFlights_en = (details, dbId) => {
  const cityFrom = details.legs[0].origin['city'] || '';
  const cityTo = details.legs[0].destination['city'] || '';

  const countryFrom = details.legs[0].origin['country'] || '';
  const countryTo = details.legs[0].destination['country'] || '';

  const cityFromCode = details.legs[0].origin['displayCode'];
  const cityToCode = details.legs[0].destination['displayCode'] || '';

  const cityFrom2 = details.legs[1]?.origin['city'] || '';
  const cityTO2 = details.legs[1]?.destination['city'] || '';

  const countryFrom2 = details.legs[1]?.origin['country'] || '';
  const countryTo2 = details.legs[1]?.destination['country'] || '';

  const cityFromCode2 = details.legs[1]?.origin['displayCode'];
  const cityToCode2 = details.legs[1]?.destination['displayCode'] || '';

  const routeDepartureTime = details.legs[0].departure || '';
  const routeArrivalTime = details.legs[0].arrival || '';

  const routeDepartureTime2 = details.legs[1]?.departure || '';
  const routeArrivalTime2 = details.legs[1]?.arrival || '';
  const Price = details.price['raw'] || '';

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
      oneWayMarkup: `📍 <b>${cityFrom} - ${cityTo}</b> \n\n<b>${cityFrom}, ${countryFrom}(${cityFromCode}) - ${cityTo}, ${countryTo}(${cityToCode})</b>\n🔄 Direct\n🕛 Depature: ${convertDateTime(routeDepartureTime)}\n🕛 Arrival: ${convertDateTime(routeArrivalTime)}\n\n💰 Price: $${Price}\n`,
      returnMarkup: `📍 <b>${cityFrom} - ${cityTo}</b> \n\n<b>${cityFrom}, ${countryFrom}(${cityFromCode}) - ${cityTo}, ${countryTo}(${cityToCode})</b>\n🔄 Direct\n🕛 Depature: ${convertDateTime(routeDepartureTime)}\n🕛 Arrival: ${convertDateTime(routeArrivalTime)}\n\n<b>${cityFrom2}, ${countryFrom2}(${cityFromCode2}) - ${cityTO2},${countryTo2}(${cityToCode2})</b>\n🔄 Direct\n🕛 Depature: ${convertDateTime(routeDepartureTime2)}\n🕛 Arrival: ${convertDateTime(routeArrivalTime2)}\n\n💰 Price: $${Price}\n`,
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
