export class CounterUnitTypes {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/counterunittypes', null, {
            query: {
                method: 'GET',
                isArray: true,
                cache: true
            }
        });
    }
}
