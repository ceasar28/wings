"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuMarkup_en = void 0;
exports.menuMarkup_en = {
    markup: [
        [
            {
                text: '🔎 Search Flights',
                callback_data: JSON.stringify({
                    command: '/newSearch',
                    language: 'english',
                }),
            },
        ],
        [
            {
                text: '⚙️ Settings',
                callback_data: JSON.stringify({
                    command: '/settings',
                    language: 'english',
                }),
            },
            {
                text: '📢 Share',
                language: 'english',
                switch_inline_query: 'is a bot designed to search for cheap flights 🛩, track ticket prices, and book with Bonk and other SPL tokens.',
            },
        ],
    ],
};
//# sourceMappingURL=menu.js.map