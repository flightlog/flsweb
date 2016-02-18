export class Logs {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/systemlogs/:dest', null, {
            query: {
                method: 'GET',
                isArray: true,
                cache: false,
                params: {
                    dest: 'overview'
                }
            }
        });
    }
}
