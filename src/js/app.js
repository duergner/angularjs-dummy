'use strict';
(function() {

    var API_BASE = 'http://localhost';

    var app = angular.module('io.duergner.angular-dummy');

    var authenticationService = app.factory('AuthenticationService',[
        '$q',
        '$log',
        function($q,$log) {
            return {
                _token: null,

                request: function(config) {
                    if (0 === config.url.indexOf(API_BASE) && null !== token) {
                        if (undefined === config.headers || null == config.headers) {
                            config.headers = {}
                        }
                        config.headers.Authorization = 'Bearer ' + this._token;
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

    app.configure([
        '$httpProvider',
        function($httpProvider) {
            $httpProvider.interceptors.push('AuthenticationService');
        }
    ]);

})();