export class PagedClubs {
    constructor($http, GLOBALS, MessageManager) {
        this.$http = $http;
        this.GLOBALS = GLOBALS;
        this.MessageManager = MessageManager;
    }

    getClubs(filter, sorting, pageStart, pageSize) {
        return this.$http
            .post(`${this.GLOBALS.BASE_URL}/api/v1/clubs/page/${pageStart + 1}/${pageSize}`, {
                Sorting: sorting,
                SearchFilter: filter
            })
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'clubs list'));
    }
}

export class Clubs {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/clubs/:dest', null, {
            getMyClub: {
                method: 'GET',
                isArray: false,
                params: {
                    dest: 'my'
                }
            }
        });
    }
}


export class ClubPersister {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/clubs/:id', null, {
            saveClub: {
                method: 'POST',
                headers: {
                    'X-HTTP-Method-Override': 'PUT'
                }
            },
            $save: {
                method: 'POST'
            },
            get: {
                method: 'GET'
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

export class ClubService {
    constructor($q, $window, ClubPersister) {
        return {
            delete: function (club, clubs) {
                var deferred = $q.defer();
                if ($window.confirm('Do you really want to remove this club from the database?')) {
                    ClubPersister.delete({id: club.ClubId}).$promise
                        .then(function () {
                            clubs = _.filter(clubs, function (d) {
                                return d.ClubId !== club.ClubId;
                            });
                            deferred.resolve(clubs);
                        })
                        .catch(function (reason) {
                            deferred.reject(reason);
                        });
                    return deferred.promise;
                }
                deferred.resolve(clubs);
                return deferred.promise;
            }
        };
    }
}
