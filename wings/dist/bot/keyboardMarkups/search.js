"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchType_en = void 0;
exports.searchType_en = {
    searchTypeMarkup: [
        [
            {
                text: '➡️ One way',
                callback_data: JSON.stringify({
                    command: '/oneway',
                    language: 'english',
                }),
            },
            {
                text: '⬅️➡️ Return',
                callback_data: JSON.stringify({
                    command: '/return',
                    language: 'english',
                }),
            },
        ],
        [
            {
                text: '🔄 Multi-city',
                callback_data: JSON.stringify({
                    command: '/multicity',
                    language: 'english',
                }),
            },
        ],
    ],
};
//# sourceMappingURL=search.js.map