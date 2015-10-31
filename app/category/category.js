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
        $scope.showMe = function (value) {
            //
            fileDialog.openFile(function (e) {
                //
                var files = e.target.files;
                var reader = new FileReader();
                // var name = files[0].name;
                reader.onload = function (e) {

                    var wb = XLSX.read(e.target.result, {type: 'binary'});
                    var result = {};
                    var sheetNames = [];
                    wb.SheetNames.forEach(function (sheetName) {
                        var roa = XLSX.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);
                        if (roa.length > 0) {
                            result[sheetName] = roa;
                            sheetNames.push(sheetName);
                        }
                    });
                    sheetNames.forEach(function (element, i, r) {
                        result[element].forEach(function (e3, i3, r3) {
                            e3.comments = [];
                            e3.doctor = null;
                            e3.random = [Math.random(), Math.random()];
                        });
                        $scope.myPromise = $http.post(SERVER.URL + "/questions", result[element]).success(function (data) {
                            //
                            getTatalPage();
                            getPage();
                            //
                        }).error(function (data) {
                            //

                            //
                        }).finally(function () {

                        });
                    })

                }
                reader.readAsBinaryString(files[0]);
                //
            });
        }
        $scope.gridOptions1 = {
            showColumnFooter: true,
            enableRowSelection: true,
            enableCellEditOnFocus: true,
            enableRowHeaderSelection: false,
            multiSelect: false,
            columnDefs: [
                {name:'选择',cellTemplate: '<input type="checkbox" ng-model="row.entity.selected" ng-click="grid.appScope.selectCategory(row.entity)">',width: '8%'},
                {name: '类别', field: 'category'},
                //{
                //    name: '导入数据',
                //    cellTemplate: '<a ng-if="row.entity.$$treeLevel != 0" class="btn" ng-click="$event.stopPropagation();grid.appScope.showMe(row.entity)">导入数据</a>'
                //},
                {
                    name: '己认领',aggregationType: uiGridConstants.aggregationTypes.sum,
                    field: 'acceptCount'
                },
                {
                    name: '未认领',aggregationType: uiGridConstants.aggregationTypes.sum,
                    field: 'unacceptCount'
                }
            ]
        };
        $scope.gridOptions1.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;


        }

        $scope.categorys =[];

        var loadCategory = function () {
            $scope.myPromise = $http.get(SERVER.URL+'/category/admin').success(function (result) {
                var data = [];
                result.forEach(function (e, i, a) {
                    //
                    data.push({selected:false,category: e.name, $$treeLevel: 0});
                    e.count.forEach(function (e1, i1, a1) {
                        //
                        data.push({selected:false,category: e1.category,acceptCount:e1.acceptCount,unacceptCount:e1.unacceptCount});
                        //
                    });
                    //
                });
                $scope.gridOptions1.data = data;
                //

                //
                //
            }).error(function (data) {

            }).finally(function () {

            });
        }
        loadCategory();
        //
    })