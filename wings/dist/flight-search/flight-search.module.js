"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightSearchModule = void 0;
const common_1 = require("@nestjs/common");
const flight_search_service_1 = require("./flight-search.service");
const axios_1 = require("@nestjs/axios");
const flight_search_controller_1 = require("./flight-search.controller");
const database_module_1 = require("../database/database.module");
let FlightSearchModule = class FlightSearchModule {
};
exports.FlightSearchModule = FlightSearchModule;
exports.FlightSearchModule = FlightSearchModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule, database_module_1.DatabaseModule],
        providers: [flight_search_service_1.FlightSearchService],
        exports: [flight_search_service_1.FlightSearchService],
        controllers: [flight_search_controller_1.FlightSearchController],
    })
], FlightSearchModule);
//# sourceMappingURL=flight-search.module.js.map