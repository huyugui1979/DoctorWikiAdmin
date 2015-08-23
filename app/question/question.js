'use strict';

angular.module('myApp.question', ['NewfileDialog', 'cgBusy', 'angularModalService','ngRoute', 'ui.grid', 'ui.grid.treeView','ui.grid.edit', 'ui.grid.cellNav', 'ui.grid.selection', 'ui.grid.pagination'])

    .config(['$routeProvider', function ($routeProvider, $http) {
        $routeProvider.when('/question', {
            templateUrl: 'question/question.html',
            controller: 'QuestionCtrl'
        });
    }])
    //
    .controller('CommentModalCtrl', function ($scope, close,$http, entity) {
        $scope.gridOptions1 = {
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            multiSelect: false,
            columnDefs: [
                {name: '内容', field: 'content'},
                {name: '时间', field: 'commentTime'},
                {name: '医生', field: 'doctor.name'},
                {
                    name: '删除',
                    cellTemplate: '<a ng-if="row.entity.$$treeLevel != 0" class="btn" ng-click="$event.stopPropagation();grid.appScope.delete(row.entity)">删除</a>'
                }
            ]

        };
        $scope.delete=function(entity){
            //
            $scope.myPromise = $http.delete('http://huyugui.f3322.org:3000/comments',{params:entity}).success(function (data) {
                //
                loadComment();
                //
            }).error(function (data) {

            });
            //
        }

        $scope.closeModal = function(result) {
            close(result, 500);
        };
        var loadComment = function () {
            $http.get('http://huyugui.f3322.org:3000/comments/question',{params:{question:entity._id}}).success(function (result) {
                //
                $scope.gridOptions1.data = result;
                //
            }).error(function (data) {

            }).finally(function () {

            });
        }
        loadComment();
    })
    //
    .controller('QuestionCtrl', function ($scope,ModalService, $http, fileDialog) {
        //选中的类别
        $scope.selectTag = '';
        var paginationOptions = {
            pageNumber: 1,
            pageSize: 25,
            totalPage: 1
        };
        //
        $scope.editComment = function(entity){
            ModalService.showModal({
                templateUrl: "question/commentModal.html",
                controller: "CommentModalCtrl",
                inputs:{entity:entity}
            }).then(function (modal) {
                // The modal object has the element built, if this is a bootstrap modal
                // you can call 'modal' to show it, if it's a custom modal just show or hide
                // it as you need to.
                modal.element.modal();
                modal.close.then(function (result) {
                    if(result == "Yes"){
                        //
                        update(object);
                        //
                    }
                });
            });
        }
        $scope.delete = function(entity){
            $scope.myPromise = $http.delete('http://huyugui.f3322.org:3000/questions',{params:entity}).success(function (data) {
                //
                getTatalPage();
                getPage();
                //
            }).error(function (data) {

            });
        }
        $scope.update = function(entity){
            //

            //
        }

        //加载表格选项2
        $scope.gridOptions2 = {
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 25,
            enableCellEditOnFocus: true,
            useExternalPagination: true,
            columnDefs: [
                {name: '问题内容', field: 'question'},
                {name: '问题类别', field: 'tag'},
                {name: '问题答案', field: 'answer'},
                {name: '医生', field: 'doctor.name'},
                {
                    name: '评论',
                    cellTemplate: '<a  ng-click="$event.stopPropagation();grid.appScope.editComment(row.entity)">编辑</a>'
                },
                {
                    name: '删除',
                    cellTemplate: '<a ng-if="row.entity.$$treeLevel != 0" class="btn" ng-click="$event.stopPropagation();grid.appScope.delete(row.entity)">删除</a>'
                }
            ],
            onRegisterApi: function (gridApi) {

                gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                    rowEntity[colDef.field] = newValue;
                    $scope.update(rowEntity);
                });
                gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                    if (paginationOptions.pageSize != pageSize) {
                        paginationOptions.pageNumber = 1;
                        paginationOptions.pageSize = pageSize;
                    } else {
                        paginationOptions.pageNumber = newPage;
                    }
                    //

                    //
                    getPage();
                });
            }
        }
        //导入数据
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
                            e3.category = value.category;
                            e3.comments=[];
                            e3.doctor=null;
                        });
                        $scope.myPromise = $http.post("http://huyugui.f3322.org:3000/questions", result[element]).success(function (data) {
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
        //加载表格1
        $scope.gridOptions1 = {
            enableRowSelection: true,
            enableCellEditOnFocus: true,
            enableRowHeaderSelection: false,
            multiSelect: false,
            columnDefs: [
                {name: '类别', field: 'category'},
                {
                    name: '导入数据',
                    cellTemplate: '<a ng-if="row.entity.$$treeLevel != 0" class="btn" ng-click="$event.stopPropagation();grid.appScope.showMe(row.entity)">导入数据</a>'
                }
            ]

        };
        $scope.gridOptions1.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                //
                if (row.entity.$$treeLevel != 0) {
                    //
                    $scope.selectTag = row.entity.category;
                    //
                    getTatalPage();
                    getPage();
                    //
                }
                //
            });

        }


        var loadCategory = function () {
            $scope.myPromise = $http.get('http://huyugui.f3322.org:3000/category').success(function (result) {
                var data = [];
                result.forEach(function (e, i, a) {
                    //
                    data.push({category: e.name, $$treeLevel: 0});
                    e.child_depart.forEach(function (e1, i1, a1) {
                        //
                        data.push({category: e1});
                        //
                    });
                    //
                });
                $scope.gridOptions1.data = data;
                //
                $scope.selectTag = data[1].category;
                //
                getTatalPage();
                getPage();
                //
            }).error(function (data) {

            }).finally(function () {

            });
        }
        var getTatalPage = function () {
            $scope.myPromise = $http.get('http://huyugui.f3322.org:3000/questions/count', {params: {tag: $scope.selectTag}}).success(function (data) {
                $scope.gridOptions2.totalItems = data;
            }).error(function (data) {

            });
        }
        //加载
        var getPage = function () {
            //var url = "http://"
            $scope.myPromise = $http.get('http://huyugui.f3322.org:3000/questions', {
                params: {
                    pageNo: paginationOptions.pageNumber,
                    pageNumber: paginationOptions.pageSize,
                    category:$scope.selectTag
                }
            })
                .success(function (data) {

                    $scope.gridOptions2.data = data;
                }).error(function (data) {

                }).finally(function () {

                });
        };
        loadCategory();
    });
