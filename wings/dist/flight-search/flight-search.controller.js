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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightSearchController = void 0;
const common_1 = require("@nestjs/common");
const flight_search_service_1 = require("./flight-search.service");
const database_service_1 = require("../database/database.service");
let FlightSearchController = class FlightSearchController {
    constructor(flightSearchService, databaseService) {
        this.flightSearchService = flightSearchService;
        this.databaseService = databaseService;
    }
    async deeplink(id, token, res) {
        console.log('this query :', id);
        try {
            const session = await this.databaseService.bookingSession.findFirst({
                where: { id: +id },
            });
            if (token === 'sol') {
                console.log(session.Soldeeplink);
                return res.redirect(307, `${session.Soldeeplink}`);
            }
            else if (token === 'bonk') {
                return { url: `${session.Bonkdeeplink}` };
            }
            else if (token === 'usdc') {
                return { url: `${session.USDCdeeplink}` };
            }
            return {
                url: 'https://t.me/wingsTravel_bot',
            };
        }
        catch (error) {
            console.log(error);
        }
    }
};
exports.FlightSearchController = FlightSearchController;
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('token')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FlightSearchController.prototype, "deeplink", null);
exports.FlightSearchController = FlightSearchController = __decorate([
    (0, common_1.Controller)('flight-search'),
    __metadata("design:paramtypes", [flight_search_service_1.FlightSearchService,
        database_service_1.DatabaseService])
], FlightSearchController);
//# sourceMappingURL=flight-search.controller.js.map