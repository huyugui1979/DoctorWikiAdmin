/**
 * Created by yuguihu on 15/7/23.
 */
angular.module('myApp.category', ['ngRoute', 'ui.grid', 'ui.grid.treeView', 'ui.grid.selection', 'ui.grid.pagination'])

    .config(['$routeProvider', function ($routeProvider, $http) {
        $routeProvider.when('/category', {
            templateUrl: 'category/category.html',
            controller: 'CategoryCtrl'
        });
    }])
    .controller('CategoryCtrl', function ($scope, $http) {
        //

        //
    })