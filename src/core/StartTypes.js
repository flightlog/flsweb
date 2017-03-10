export class StartTypes {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/starttypes', null, {
            query: {
                method: 'GET',
                isArray: true,
                cache: true
            }
        });
    }
}

export class SpecificStartTypes {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/starttypes/:kind', null, {
            queryStartTypesFor: {
                method: 'GET',
                isArray: true,
                cache: true
            }
        });
    }
}

