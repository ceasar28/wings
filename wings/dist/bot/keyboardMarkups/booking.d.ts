export declare const booking_en: (from?: any, to?: any, date1?: any, date2?: any, multicityData?: any) => {
    message: {
        oneWayMarkup: string;
        returnMarkup: string;
        multiCityMarkup: string;
    };
    oneWayMarkup: {
        text: string;
        callback_data: string;
    }[][];
    returnMarkup: {
        text: string;
        callback_data: string;
    }[][];
    multiCityMarkup: {
        text: string;
        callback_data: string;
    }[][];
};
