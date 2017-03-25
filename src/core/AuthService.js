import * as $ from 'jquery';

export default class AuthService {
    constructor($http, $location, $window, GLOBALS, $sessionStorage) {
        let storage = $sessionStorage.$default({loginResult: {}});

        function confirmationLink() {
            return $window.location.origin + $window.location.pathname + "#/confirm?userid={userid}&code={code}";
        }

        let srv = {
            _showNavBar: true,
            setShowNavBar: (show) => {
                srv._showNavBar = show;
            },
            showNavBar: () => {
                return srv._showNavBar;
            },
            isClubAdmin: function () {
                return srv.hasRole("ClubAdministrator");
            },
            isSystemAdmin: function () {
                return srv.hasRole("SystemAdministrator");
            },
            getEnabledFeatures: function () {
                return {
                    planning: true,
                    reservations: true,
                    flights: true,
                    masterdata: {
                        persons: true,
                        clubs: true,
                        aircrafts: true,
                        locations: true,
                        users: srv.isClubAdmin(),
                        flightTypes: srv.isClubAdmin(),
                        memberStates: srv.isClubAdmin(),
                        accountingRuleFilters: srv.isClubAdmin()
                    },
                    system: srv.isSystemAdmin()
                }
            },
            promptLogin: function (requestedRoute) {
                srv.loginformvisible = true;
                srv.requestedRoute = requestedRoute;
            },
            hideLogin: function () {
                srv.loginformvisible = false;
            },
            isLoginFormVisible: function () {
                return srv.loginformvisible;
            },
            login: function (username, password) {
                return $http({
                    method: 'POST',
                    url: GLOBALS.BASE_URL + '/Token',
                    data: $.param({'username': username, 'Password': password, 'grant_type': 'password'}),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                })
                    .then((loginResponse) => {
                        storage.loginResult = loginResponse.data;
                    })
                    .then(setAuthorisationHeader)
                    .then(() => {
                        return $http({
                            method: 'GET',
                            url: GLOBALS.BASE_URL + '/api/v1/users/my'
                        });
                    })
                    .then((userResponse) => {
                        storage.user = userResponse.data;
                    })
                    .then(() => {
                        return $http({
                            method: 'GET',
                            url: GLOBALS.BASE_URL + '/api/v1/userroles',
                            array: true
                        });
                    })
                    .then((userRolesResponse) => {
                        storage.userRoles = userRolesResponse.data;
                    })
                    .then(() => {
                        if (srv.requestedRoute) {
                            $location.path(srv.requestedRoute);
                        }
                    });
            },
            logout: function () {
                delete $sessionStorage.loginResult;
                delete $sessionStorage.user;
                delete $sessionStorage.userRoles;
                $location.path('/main');
            },
            getToken: function () {
                let loginResult = storage.loginResult;
                /* jshint camelcase: false */
                return loginResult && loginResult['access_token'];
            },
            getUser: function () {
                return storage.user;
            },
            hasRole: function (roleApplicationKeyStringToCheck) {
                if (!storage.user) {
                    return false;
                }
                for (let assignedRoleIdIdx in storage.user['UserRoleIds']) {
                    let assignedRoleId = storage.user['UserRoleIds'][assignedRoleIdIdx];
                    for (let roleIdx in storage.userRoles) {
                        let role = storage.userRoles[roleIdx];
                        if (role['RoleId'] === assignedRoleId) {
                            if (role['RoleApplicationKeyString'] === roleApplicationKeyStringToCheck) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            },
            requiresClubAdmin: function(path) {
                return path.indexOf("users") > 0
                    || path.indexOf("flightTypes") > 0;
            },
            requiresSystemAdmin: function(path) {
                return path.indexOf("system/") > 0;
            },
            userAuth: function ($location) {
                if (!srv.getToken()
                    || (srv.requiresClubAdmin($location.path()) && !srv.isClubAdmin())
                    || (srv.requiresSystemAdmin($location.path()) && !srv.isSystemAdmin())) {
                    srv.promptLogin($location.path());
                    $location.path('/main');
                } else {
                    return srv.getUser();
                }
            },
            lostPassword: (usernameOrNotificationEmail) => {
                return $http({
                    method: 'POST',
                    url: GLOBALS.BASE_URL + '/api/v1/users/lostpassword',
                    data: {
                        UsernameOrNotificationEmailAddress: usernameOrNotificationEmail,
                        SearchForUsernameOnly: false,
                        PasswordResetLink: confirmationLink() + '&emailconfirmed=true'
                    }
                });
            },
            confirmationLink: confirmationLink,
            confirmEmail: (userId, code) => {
                return $http({
                    method: 'GET',
                    url: `${GLOBALS.BASE_URL}/api/v1/users/ConfirmEmail?userid=${userId}&code=${code}`
                });
            },
            resetPassword: (userId, passwordResetCode, newPassword) => {
                return $http({
                    method: 'POST',
                    url: GLOBALS.BASE_URL + '/api/v1/users/resetpassword',
                    data: {
                        UserId: userId,
                        PasswordResetCode: passwordResetCode,
                        NewPassword: newPassword
                    }
                });
            }
        };

        function setAuthorisationHeader() {
            $http.defaults.headers.common.Authorization = 'Bearer ' + srv.getToken();
        }

        setAuthorisationHeader();

        return srv;
    }
}

export function userAuth(AuthService, $location) {
    return AuthService.userAuth($location);
}
