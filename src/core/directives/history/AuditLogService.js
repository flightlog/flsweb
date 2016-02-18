export default class AuditLogService {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/auditlogs/:entityName/:recordId', null, {
            query: {
                method: 'GET',
                isArray: true
            }
        });
    }
}
