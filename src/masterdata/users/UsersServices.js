 export class PagedUsers {
    constructor($http, GLOBALS, MessageManager, AuthService) {
        this.$http = $http;
        this.GLOBALS = GLOBALS;
        this.MessageManager = MessageManager;
        this.AuthService = AuthService;
    }

    getUsers(filter, sorting, pageStart, pageSize) {
        return this.$http
            .post(`${this.GLOBALS.BASE_URL}/api/v1/users/page/${pageStart}/${pageSize}`, {
                Sorting: sorting,
                SearchFilter: filter
            })
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'users list'));
    }

    resendEmailToken(user) {
        return this.$http
            .post(`${this.GLOBALS.BASE_URL}/api/v1/users/resendemailtoken`, {
                UserId: user.UserId,
                UserName: user.UserName,
                EmailConfirmationLink: this.AuthService.confirmationLink()
            })
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'users list'));
    }
}

 function invalidate(GLOBALS, $cacheFactory, result) {
     let $httpDefaultCache = $cacheFactory.get('$http');

     $httpDefaultCache.remove(GLOBALS.BASE_URL + '/api/v1/users/overview/club');

     return Promise.resolve(result && result.data);
 }

export class Users {
    constructor($resource, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/users/overview/club', null, {
            getAllUsers: {
                method: 'GET',
                isArray: true,
                cache: true
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
                cache: true
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
                cache: true
            }
        });
    }
}

export class UserPersister {
    constructor($resource, $cacheFactory, GLOBALS) {
        return $resource(GLOBALS.BASE_URL + '/api/v1/users/:id', null, {
            saveUser: {
                method: 'POST',
                headers: {
                    'X-HTTP-Method-Override': 'PUT'
                },
                interceptor: {
                    response: () => invalidate(GLOBALS, $cacheFactory)
                }
            },
            save: {
                method: 'POST',
                interceptor: {
                    response: (result) => invalidate(GLOBALS, $cacheFactory, result)
                }
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
                },
                interceptor: {
                    response: () => invalidate(GLOBALS, $cacheFactory)
                }
            }
        });
    }
}

export class UserService {
    constructor($q, UserPersister) {
        return {
            delete: function (user, users) {
                let deferred = $q.defer();
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

