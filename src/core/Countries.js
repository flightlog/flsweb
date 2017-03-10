export default class Countries {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/countries', null, {
            query: {
                method: 'GET',
                isArray: true,
                cache: true
            }
        });
    }
}