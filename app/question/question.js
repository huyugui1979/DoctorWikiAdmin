'use strict';

angular.module('myApp.question', ['myApp','NewfileDialog', 'cgBusy', 'angularModalService', 'ngRoute', 'ui.grid', 'ui.grid.treeView', 'ui.grid.edit', 'ui.grid.cellNav', 'ui.grid.selection', 'ui.grid.pagination'])

    .config(['$routeProvider', function ($routeProvider, $http) {
        $routeProvider.when('/question', {
            templateUrl: 'question/question.html',
            controller: 'QuestionCtrl'
        });
    }])
    //
    .controller('EditModalCtrl',function ($scope, close, $http, object,SERVER){

        var ck;
        $scope.$watch('$viewContentLoaded', function(event) {
             ck=CKEDITOR.replace( 'editor1' ,
            {
                toolbar : 'basic',
                    uiColor : '# 9AB8F3',
                enterMode : CKEDITOR.ENTER_BR
            });
        });
        $scope.htmlVariable = object;
        $scope.closeModal = function (result) {
            if(result == 'Yes') {
                var data = ck.getData();
                close(data, 500);
            }
            else
                close(null,500);
        };
        //
    })

    .controller('CommentModalCtrl', function ($scope, close, $http, entity,SERVER) {
        $scope.gridOptions1 = {
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            multiSelect: false,
            columnDefs: [
                {name: '内容', field: 'content'},
                {name: '时间', field: 'commentTime'},
                {name: '医生', field: 'doctor.trueName'},
                {
                    name: '删除',
                    cellTemplate: '<a ng-if="row.entity.$$treeLevel != 0" class="btn" ng-click="$event.stopPropagation();grid.appScope.delete(row.entity)">删除</a>'
                }
            ]

        };
        $scope.delete = function (entity) {
            //
            $scope.myPromise = $http.delete(SERVER.URL+'/comments', {params: entity}).success(function (data) {
                //
                loadComment();
                //
            }).error(function (data) {

            });
            //
        }

        $scope.closeModal = function (result) {
            close(result, 500);
        };
        var loadComment = function () {
            $http.get(SERVER.URL+'/comments/question', {params: {question: entity._id}}).success(function (result) {
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
    .controller('QuestionCtrl', function ($scope, ModalService,SERVER,$templateCache, $http,$q, fileDialog) {
        //选中的类别
        $scope.selectTag = '';
        var paginationOptions = {
            pageNumber: 1,
            pageSize: 25,
            totalPage: 1
        };
        //
        $scope.editQuestion = function(entity){
            ModalService.showModal({
                templateUrl: "question/editModal.html",
                controller: "EditModalCtrl",
                inputs: {object:entity.question}
            }).then(function (modal) {

               modal.element.modal();
                modal.close.then(function (result) {
                    //

                    if(result != null) {

                        var obj = {_id:entity._id,question:result};

                        update(obj).then(function () {
                            entity.question=result;
                        });
                    }
                    //
                });
            });
        }
        $scope.editAnswer = function(entity){
            ModalService.showModal({
                templateUrl: "question/editModal.html",
                controller: "EditModalCtrl",
                inputs: {object:entity.answer}
            }).then(function (modal) {

                modal.element.modal();
                modal.close.then(function (result) {
                    if(result != null) {

                        var obj = {_id:entity._id,answer:result};

                        update(obj).then(function () {
                            entity.answer=result;
                        });
                    }
                });
            });
        }
        $scope.editComment = function (entity) {

            ModalService.showModal({
                templateUrl: "question/commentModal.html",
                controller: "CommentModalCtrl",
                inputs: {entity: entity}
            }).then(function (modal) {
                // The modal object has the element built, if this is a bootstrap modal
                // you can call 'modal' to show it, if it's a custom modal just show or hide
                // it as you need to.

                modal.element.modal();
                modal.close.then(function (result) {
                    if (result == "Yes") {
                        //
                        //update(object).success(function(){


                        //
                    }
                });
            });
        }
        $scope.delete = function (entity) {
            $scope.myPromise = $http.delete(SERVER.URL+'/questions', {params: entity}).success(function (data) {
                //
                getTatalPage();
                getPage();
                //
            }).error(function (data) {

            });
        }
        var update = function (entity) {
            //
            var deferred = $q.defer();
            $http.put(SERVER.URL+"/questions", entity).success(function (data) {
                //
                deferred.resolve();
                //
            }).error(function (data) {
                //
                deferred.reject();
                //
            }).finally(function () {

            });
            return   deferred.promise;
            //
        }

        //加载表格选项2
        $scope.gridOptions2 = {
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 25,

            useExternalPagination: true,
            columnDefs: [
                {name: '问题内容',     cellTemplate: '<a ng-if="row.entity.$$treeLevel != 0" class="btn" ng-click="$event.stopPropagation();grid.appScope.editQuestion(row.entity,row)">{{row.entity.question}}</a>'
                    },
                {name: '问题答案', cellTemplate: '<a ng-if="row.entity.$$treeLevel != 0" class="btn" ng-click="$event.stopPropagation();grid.appScope.editAnswer(row.entity,row)">{{row.entity.answer}}</a>'
                },

                {name: '医生', field: 'doctor.trueName'},
                {
                    name: '评论',
                    cellTemplate: '<a  ng-click="$event.stopPropagation();grid.appScope.editComment(row.entity)">{{row.entity.comments.length}}</a>'
                },
                {
                    name: '删除',
                    cellTemplate: '<a ng-if="row.entity.$$treeLevel != 0" class="btn" ng-click="$event.stopPropagation();grid.appScope.delete(row.entity)">删除</a>'
                }

            ],

            onRegisterApi: function (gridApi) {
                $scope.gridApi.core.on.filterChanged( $scope, function() {

                });
                gridApi.edit.on.beginCellEdit($scope, function(rowEntity, colDef) {
                    var j=2;
                    //
                    ModalService.showModal({
                        templateUrl: "question/editModal.html",
                        controller: "EditModalCtrl",
                        inputs: {entity: rowEntity}
                    }).then(function (modal) {

                        modal.element.modal();
                        modal.close.then(function (result) {
                            if (result == "Yes") {
                                //
                                //update(object);
                                //
                            }
                        });
                    });
                    //
                });
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
                            e3.comments = [];
                            e3.doctor = null;
                            e3.random = [Math.random(), Math.random()];
                        });
                        $scope.myPromise = $http.post(SERVER.URL+"/questions", result[element]).success(function (data) {
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
        $scope.selectCategory = function(object){
            //
            if( object.$$treeLevel  !=null)
            {
                //
                if(object.selected == true ) {
                    var index = $scope.gridOptions1.data.indexOf(object);
                    index = index + 1;
                    while ($scope.gridOptions1.data[index].$$treeLevel == null) {
                        $scope.gridOptions1.data[index].selected = true;
                        $scope.categorys.push($scope.gridOptions1.data[index].category);
                        index = index + 1;
                    }
                }else{

                    var index = $scope.gridOptions1.data.indexOf(object);
                    index = index + 1;
                    while ($scope.gridOptions1.data[index].$$treeLevel == null) {
                        $scope.gridOptions1.data[index].selected = false;
                        var j = $scope.categorys.indexOf( $scope.gridOptions1.data[index].category);
                        $scope.categorys.splice(j,1);
                        index = index + 1;
                    }
                }
            }//
            else {
                var index = $scope.gridOptions1.data.indexOf(object);
                if (object.selected == true) {
                    $scope.categorys.push(object.category);
                }else{
                    var j = $scope.categorys.indexOf( $scope.gridOptions1.data[index].category);
                    $scope.categorys.splice(j,1);
                }
            }
            getTatalPage();
            getPage();
            //
        }
        //加载表格1
        $scope.gridOptions1 = {
            enableRowSelection: true,
            enableCellEditOnFocus: true,
            enableRowHeaderSelection: false,
            multiSelect: false,
            columnDefs: [
                {name:'选取',cellTemplate: '<input type="checkbox" ng-model="row.entity.selected" ng-click="grid.appScope.selectCategory(row.entity)">'},
                {name: '类别', field: 'category'},
                {
                    name: '导入数据',
                    cellTemplate: '<a ng-if="row.entity.$$treeLevel != 0" class="btn" ng-click="$event.stopPropagation();grid.appScope.showMe(row.entity)">导入数据</a>'
                },
                {
                    name: '己认领',
                    field: 'acceptCount'
                },
                {
                    name: '未认领',
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
            $scope.myPromise = $http.get(SERVER.URL+'/questions/count', {params: {"categorys[]": $scope.categorys}}).success(function (data) {
                $scope.gridOptions2.totalItems = data;
            }).error(function (data) {

            });
        }
        //加载
        var getPage = function () {
            //var url = "http://"
            $scope.myPromise = $http.get(SERVER.URL+'/questions', {
                params: {
                    pageNo: paginationOptions.pageNumber,
                    pageNumber: paginationOptions.pageSize,
                    "categorys[]": $scope.categorys

                }
            })
                .success(function (data) {
                    data.forEach(function(e,i,a){
                       if(e.doctor == null){
                           e.doctor={name:'未认领'};
                       }
                    });
                    $scope.gridOptions2.data = data;
                }).error(function (data) {

                }).finally(function () {

                });
        };
        loadCategory();
    });
