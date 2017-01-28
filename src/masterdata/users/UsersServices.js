export class PagedUsers {
    constructor($http, GLOBALS, MessageManager) {
        this.$http = $http;
        this.GLOBALS = GLOBALS;
        this.MessageManager = MessageManager;
    }

    getUsers(filter, sorting, pageStart, pageSize) {
        return this.$http
            .post(`${this.GLOBALS.BASE_URL}/api/v1/users/page/${pageStart + 1}/${pageSize}`, {
                Sorting: sorting,
                SearchFilter: filter
            })
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'users list'));
    }
}

export class Users {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/users/overview/club', null, {
            getAllUsers: {
                method: 'GET',
                isArray: true,
                cache: false
            }
        });
    }
}

export class UserRoles {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/userroles', null, {
            getAllUserRoles: {
                method: 'GET',
                isArray: true,
                cache: false
            }
        });
    }
}

export class UserAccountStates {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/useraccountstates', null, {
            query: {
                method: 'GET',
                isArray: true,
                cache: false
            }
        });
    }
}

export class UserPersister {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/users/:id', null, {
            saveUser: {
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

export class UserService {
    constructor($q, UserPersister) {
        return {
            delete: function (user, users) {
                var deferred = $q.defer();
                if (window.confirm('Do you really want to remove this user from the database?')) {
                    UserPersister.delete({id: user.UserId}).$promise
                        .then(function () {
                            users = _.filter(users, function (d) {
                                return d.UserId !== user.UserId;
                            });
                            deferred.resolve(users);
                        })
                        .catch(function (reason) {
                            deferred.reject(reason);
                        });
                    return deferred.promise;
                }
                deferred.resolve(users);
                return deferred.promise;
            }
        };
    }
}

