export class MemberStates {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/memberstates/:dest', null, {
            query: {
                method: 'GET',
                isArray: true,
                cache: false,
                params: {
                    dest: 'overview'
                }
            },
            queryMemberStatesFor: {
                method: 'GET',
                isArray: true,
                cache: false
            }
        });
    }
}


export class MemberState {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/memberstates/:id', null, {
            get: {
                method: 'GET',
                isArray: false
            },
            saveMemberState: {
                method: 'POST',
                headers: {
                    'X-HTTP-Method-Override': 'PUT'
                }
            },
            $save: {
                method: 'POST'
            },
            delete: {
                method: 'POST',
                params: {
                    id: '@id'
                },
                headers: {
                    'X-HTTP-Method-Override': 'DELETE'
                }
            }
        });
    }
}

export class MemberStateService {
    constructor($q, MemberState) {
        return {
            delete: function (memberState, memberStates) {
                var deferred = $q.defer();
                if (window.confirm('Do you really want to remove this member state from the database?')) {
                    MemberState.delete({id: memberState.MemberStateId}).$promise
                        .then(function () {
                            memberStates = _.filter(memberStates, function (d) {
                                return d.MemberStateId !== memberState.MemberStateId;
                            });
                            deferred.resolve(memberStates);
                        })
                        .catch(function (reason) {
                            deferred.reject(reason);
                        });
                    return deferred.promise;
                }
                deferred.resolve(memberStates);
                return deferred.promise;
            }
        };
    }
}