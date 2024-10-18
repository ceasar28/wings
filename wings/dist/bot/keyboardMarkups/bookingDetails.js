"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingDetails_en = void 0;
const bookingDetails_en = (dbId, first_Name, last_Name, email) => {
    const firstName = first_Name || '';
    const lastName = last_Name || '';
    const bookingEmail = email || '';
    return {
        message: `Please tap buttons below to fill in your booking details  📝`,
        keyBoardMarkup: [
            [
                {
                    text: `First Name? : ${firstName}`,
                    callback_data: JSON.stringify({
                        command: '/firstName',
                        language: 'english',
                    }),
                },
            ],
            [
                {
                    text: `Last Name? : ${lastName}`,
                    callback_data: JSON.stringify({
                        command: '/lastName',
                        language: 'english',
                    }),
                },
            ],
            [
                {
                    text: `Email  : ${bookingEmail}`,
                    callback_data: JSON.stringify({
                        command: '/bookingEmail',
                        language: 'english',
                    }),
                },
            ],
            [
                {
                    text: `Pay with SOL`,
                    callback_data: JSON.stringify({
                        command: '/GenerateSOLPayment',
                        bookingDetailsDbId: Number(dbId),
                    }),
                },
            ],
            [
                {
                    text: `Pay with USDC`,
                    callback_data: JSON.stringify({
                        command: '/GenerateUSDCPayment',
                        bookingDetailsDbId: Number(dbId),
                    }),
                },
            ],
            [
                {
                    text: `Pay with Bonk`,
                    callback_data: JSON.stringify({
                        command: '/GenerateBonkPayment',
                        bookingDetailsDbId: Number(dbId),
                    }),
                },
            ],
            [
                {
                    text: '❌ Close',
                    callback_data: JSON.stringify({
                        command: '/closedelete',
                        bookingDetailsDbId: Number(dbId),
                    }),
                },
            ],
        ],
    };
};
exports.bookingDetails_en = bookingDetails_en;
//# sourceMappingURL=bookingDetails.js.map