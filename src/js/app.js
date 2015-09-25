'use strict';
(function() {

    var API_BASE = 'http://localhost';

    var app = angular.module('io.duergner.angular-dummy');

    /**
     * This is a simple CredentialStorage; it's needed as AngularJS cannot resolve circular dependencies and used as a
     * man in the middle for AuthenticationInterceptor and AuthenticationService
     *
     * @type {*|Object}
     */
    var credentialStorage = app.factory('CredentialStorage',[
        '$log',
        function($log) {
            return {
                _token: null,

                token: function(token) {
                    if (undefined !== token && null !== token) {
                        this._token = token;
                    }
                    return this._token;
                },

                hasToken: function() {
                    return undefined !== this._token && null !== this._token;
                }
            }
        }
    ]);

    /**
     * This is our basic service that can handle login / logout and alike
     *
     * @type {*|Object}
     */
    var authenticationService = app.factory('AuthenticationService',[
        '$q',
        '$http',
        'CredentialStorage',
        '$log',
        function($q,$http,credentialStorage,$log) {
            return {
                _credentialStorage: credentialStorage,

                /**
                 * This method can be called by the LoginController upon form submit
                 *
                 * @param email
                 * @param password
                 * @returns {*}
                 */
                loginWithEmail: function(email,password) {
                    var defer = $q.defer(),
                        self = this;

                    $http.post(API_BASE + '/login',{email: email, password: password}).then(function(response) {
                        if (200 === response.status) {
                            if (response.status.success) {
                                if (-1 < response.data.content.roles.indexOf('admin')) {
                                    self._credentialStorage.token(response.data.content.sessionId);
                                    defer.resolve();
                                }
                                else {
                                    defer.reject('You\'re not an admin!');
                                }
                            }
                            else {
                                defer.reject(response.data.errorMessage);
                            }
                        }
                        else {
                            defer.reject(response.statusText);
                        }
                    },function(response) {
                        defer.reject(response.statusText);
                    });

                    return defer.promise
                },
                logout: function() {
                    var defer = $q.defer();

                    this._credentialStorage.token(null);
                    defer.resolve();

                    return defer.promise;
                }
            }
        }
    ]);

    /**
     * This class will intercept all HTTP calls and add Authentication header on outgoing requests and will redirect to
     * login page upon 401 HTTP status codes
     *
     * @type {*|Object}
     */
    var httpAuthenticationInterceptor = app.factory('AuthenticationInterceptor',[
        '$q',
        'CredentialStorage',
        '$log',
        function($q,credentialStorage,$log) {
            return {
                _credentialStorage: credentialStorage,

                request: function(config) {
                    if (0 === config.url.indexOf(API_BASE) && this._credentialStorage.hasToken()) {
                        if (undefined === config.headers || null == config.headers) {
                            config.headers = {}
                        }
                        config.headers.Authorization = 'Bearer ' + this._credentialStorage.token();
                    }
                    return config;
                },
                response: function(response) {
                    return response;
                },
                responseError: function(rejection) {
                    // TODO Implement redirection to Login Page e.g.
                    return $q.reject(rejection);
                }
            }
        }
    ]);

    /**
     * This is a simple showcase business layer service which is responsible for handling inviations
     *
     * @type {*|Object}
     */
    var invitationService = app.factory('InvitationService',[
        '$http',
        '$q',
        '$log',
        function($http,$q,$log) {
            return {
                _INVITATION_TIMEOUT: 5 * 60 * 1000, // 5 minutes

                _invitations: [],
                _invitationLastFetched: 0,

                /**
                 * Get the invitations currently available; it will trigger refetching if necessary and the returned array will be updated accordingly
                 *
                 * @returns {Array} The list of invitations currently available
                 */
                list: function() {
                    this.listWithPromise();
                    return this._invitations;
                },

                /**
                 * Get a promise that only resolves if either the current list of invitations is still valid or if fetching was successful
                 *
                 * @returns {*} A promise on fetching invitations
                 */
                listWithPromise: function() {
                    var defer = $q.defer();

                    if (Date.now() - this._invitationLastFetched > this._INVITATION_TIMEOUT) {
                        var self = this;
                        $http.get(API_BASE,'/invitation').then(function(response) {
                            if (200 === response.status) {
                                if (!!response.data.success) {
                                    self._invitations.length = 0;
                                    self._invitations.push.apply(self._invitations,response.data.content);
                                    self._invitationLastFetched = Date.now();
                                }
                                else {
                                    $log.warn('Got unsuccessful response when fetching invitations: ',response.data.message);
                                    defer.reject(response.data.message);
                                }
                            }
                            else {
                                $log.warn('Got unexpected status code when fetching invitations: ',response.status);
                                defer.reject(response.statusText);
                            }
                        }, function(response) {
                            $log.error('Got error reponse when fetching invitations: ',response.status,' with message: ',response.statusText);
                            defer.reject(response.statusText);
                        })
                    }
                    else {
                        defer.resolve(this._invitations);
                    }

                    return defer.promise;
                },

                resend: function(invitation) {
                    var defer = $q.defer();

                    // TODO Implement API call
                    defer.reject('not yet implemented');

                    return defer.promise;
                }
            }
        }
    ]);

    /**
     * This is our very basic controller to handle the invitation list page
     *
     */
    var invitationController = app.controller('InvitationController',[
        '$scope',
        'InvitationService',
        '$log',
        function($scope,invitationService,$log) {
            $scope.invitations = invitationService.list();

            $scope.resend = function(invitation) {
                invitationService.resend().then(function() {
                    // TODO Show success message
                }, function() {
                    // TODO SHow error message
                })
            }
        }
    ]);

    /**
     * Add our custom HTTP interceptor
     */
    app.configure([
        '$httpProvider',
        function($httpProvider) {
            $httpProvider.interceptors.push('AuthenticationInterceptor');
        }
    ]);

})();