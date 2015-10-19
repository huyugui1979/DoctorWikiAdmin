/**
 * Created by yuguihu on 15/7/23.
 */
'use strict';
angular.module('myApp.doctor', ['NewfileDialog', 'datePicker', 'angularModalService', 'ngFileUpload', 'cgBusy', 'ngRoute', 'ui.grid', 'ui.grid.edit', 'ui.grid.cellNav', 'ui.grid.treeView', 'ui.grid.selection', 'ui.grid.pagination'])

    .config(['$routeProvider', function ($routeProvider, $http) {
        $routeProvider.when('/doctor', {
            templateUrl: 'doctor/doctor.html',
            controller: 'DoctorCtrl'
        });
    }])
    .controller('CheckCommentModalCtrl',function($scope,close,SERVER,$http,entity){
        $scope.gridOptions2 = {
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            multiSelect: false,
            columnDefs: [
                {name: '评论内容', field: 'content'},
                {name: '评论时间', field: 'commentTime'},

            ]
        };
        //
        $scope.beginTime=null;
        $scope.endTime=null;
        $scope.parent = {beginTime:'',endTime:'',count:0};

        var loadData=function( beginTime,endTime){
            $http.get(SERVER.URL+'/doctor/comment', {
                    params: {
                        beginTime: beginTime,
                        endTime: endTime,
                        doctor: entity._id
                    }
                }
            ).success(function (result) {
                    $scope.parent.count = result.length;
                });
        }
        loadData();
        $scope.clickSearch = function () {

            if($scope.parent.beginTime == null ||$scope.parent.endTime ==null )
            {
                alert('输入完整的时间');
            }else{
                loadData($scope.parent.beginTime,$scope.parent.endTime);
            }


        }
    })
    .controller('CheckAcceptModalCtrl', function ($scope, close, $http,SERVER, entity) {
        $scope.gridOptions2 = {
            enableRowSelection: true,
            showGridFooter: true,
            enableRowHeaderSelection: false,
            multiSelect: false,
            columnDefs: [
                {name: '问题', field: 'question'},
                {name: '答案', field: 'answer'},
                {name: '认领时间', field: 'answerTime'},

            ]
        };
        //
        $scope.beginTime=null;
        $scope.endTime=null;
        $scope.parent = {beginTime:'',endTime:'',count:0};

        var loadData=function( beginTime,endTime){
            $http.get(SERVER.URL+'/doctor/count', {
                    params: {
                        beginTime: beginTime,
                        endTime: endTime,
                        doctor: entity._id
                    }
                }
            ).success(function (result) {

                        //$scope.gridOptions2.data = result;
                        $scope.parent.count = result;


                    //
                });

        }
        loadData();
        $scope.clickSearch = function () {

            if($scope.parent.beginTime == null ||$scope.parent.endTime == null )
            {
                alert('输入完整的时间');
            }else{
                loadData($scope.parent.beginTime,$scope.parent.endTime);
            }


        }
        //

    }).controller('CategoryCtrl', function ($scope, close,SERVER, $http, entity) {
            $scope.gridOptions1 = {
                enableRowSelection: true,
                enableRowHeaderSelection: false,
                multiSelect: false,
                columnDefs: [
                    {name: '类别', field: 'category'},
                    , {
                        name: '选择',
                        field: 'selected',
                        cellTemplate: '<input type="checkbox"  ng-model="row.entity.selected" ng-click="grid.appScope.selected(row.entity)">'
                    }
                ]
            };
            $scope.selected = function (en) {
                //
                if (en.selected == true)
                    entity.selected.push(en.category);
                else {
                    var index = entity.selected.indexOf(en.category);
                    entity.selected.splice(index, 1);
                }
                //
            }
            $scope.closeModal = function (result) {
                close(result, 500);
            };
            var loadCategory = function () {
                $http.get(SERVER.URL+'/category').success(function (result) {
                    var data = [];
                    var count = 0;
                    result.forEach(function (e, i, a) {
                        //
                        data.push({category: e.name, $$treeLevel: 0});
                        count++;
                        e.child_depart.forEach(function (e1, i1, a1) {
                            //
                            data.push({category: e1, selected: false});
                            count++;
                            entity.selected.forEach(function (e2, i2, a2) {
                                if (e2 == e1)
                                    data[count - 1].selected = true;

                            });
                            //
                        });
                        //
                    });
                    $scope.gridOptions1.data = data;
                    //
                    $scope.selectTag = data[1].category;
                    //

                    //
                }).error(function (data) {

                }).finally(function () {

                });
            }
            loadCategory();
        })
        .controller('DoctorCtrl', function ($scope, Upload, SERVER,ModalService, $http, fileDialog) {
            var paginationOptions = {
                pageNumber: 1,
                pageSize: 25,
                totalPage: 1
            };
            var loadCategory = function () {
                $scope.myPromise = $http.get(SERVER.URL+'/category').success(function (result) {
                    //
                    $scope.categorys = result;
                    //
                }).error(function (data) {

                }).finally(function () {

                });
            }
            //

            //$scope.cellSelectEditableTemplate = '<select ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="id as name for (id, name) in statuses" ng-blur="updateEntity(row)" />';
            $scope.sexs = [{name: '男'}, {name: '女'}];
            var updateDoctor = function (entity) {
                //
                $scope.myPromise = $http.put(SERVER.URL+'/doctors', entity).success(function (data) {
                    //

                    //
                }).error(function (data) {

                });
                //
            }
            var addDoctor = function (entity) {
                $scope.myPromise = $http.post(SERVER.URL+'/doctors', entity).success(function (data) {
                    getTatalPage();
                    getPage();
                }).error(function (data) {

                });
            }
            $scope.delDoctor = function (entity) {
                //
                //
                $scope.myPromise = $http.delete(SERVER.URL+'/doctors', {params: entity}).success(function (data) {
                    //
                    getTatalPage();
                    getPage();
                    //
                }).error(function (data) {

                });
                //
            }
            $scope.editCategory = function (object) {

                // Just provide a template url, a controller and call 'showModal'.
                ModalService.showModal({
                    templateUrl: "doctor/my-modal.html",
                    controller: "CategoryCtrl",
                    inputs: {entity: object}
                }).then(function (modal) {
                    // The modal object has the element built, if this is a bootstrap modal
                    // you can call 'modal' to show it, if it's a custom modal just show or hide
                    // it as you need to.
                    modal.element.modal();
                    modal.close.then(function (result) {
                        if (result == "Yes") {
                            //
                            updateDoctor(object);
                            //
                        }
                    });
                });
            }
            $scope.changePortait = function (object) {
                //
                fileDialog.openFile(function (e) {
                    //
                    var files = e.target.files;

                    $scope.myPromise = Upload.upload({
                        url: SERVER.URL+'/portrait',
                        fields: {'postImg': 'default'},
                        file: files[0]
                    }).progress(function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                    }).success(function (data, status, headers, config) {
                        object.image = data.fileName;
                        updateDoctor(object);
                    }).error(function (data, status, headers, config) {
                        console.log('error status: ' + status);
                    })
                });
                //
            }
            $scope.checkAccept = function (object) {
                //
                ModalService.showModal({
                    templateUrl: "doctor/checkAcceptModal.html",
                    controller: "CheckAcceptModalCtrl",
                    inputs: {entity: object}
                }).then(function (modal) {
                    // The modal object has the element built, if this is a bootstrap modal
                    // you can call 'modal' to show it, if it's a custom modal just show or hide
                    // it as you need to.

                    modal.element.modal();
                    modal.close.then(function (result) {
                        if (result == "Yes") {
                            //
                            update(object);
                            //
                        }
                    });
                });
                //
            }
        $scope.checkComment = function (object) {
            //
            ModalService.showModal({
                templateUrl: "doctor/checkCommentModal.html",
                controller: "CheckCommentModalCtrl",
                inputs: {entity: object}
            }).then(function (modal) {
                // The modal object has the element built, if this is a bootstrap modal
                // you can call 'modal' to show it, if it's a custom modal just show or hide
                // it as you need to.
                modal.element.modal();
                modal.close.then(function (result) {

                });
            });
            //
        }
            $scope.add = function () {
                //
                var doc = {
                    name: '王二',
                    sex: '男',
                    age: '',
                    password: '123',
                    selected: [],
                    phone: '',
                    image: 'default.jpg'
                };
                addDoctor(doc);
                //
            }
            $scope.gridOptions = {
                paginationPageSizes: [25, 50, 75],
                paginationPageSize: 25,
                enableCellEditOnFocus: true,
                showColumnFooter: true,
                useExternalPagination: true,
                columnDefs: [
                    {
                        name: '姓名',
                        field: 'name',
                        footerCellTemplate: '<div class="ui-grid-cell-contents" ng-click="" ><a ng-click=" $event.stopPropagation();grid.appScope.add()">增加</a></div>'
                    },
                    {
                        name: '真实姓名',
                        field: 'trueName',
                        footerCellTemplate: '<div class="ui-grid-cell-contents" ng-click="" ><a ng-click=" $event.stopPropagation();grid.appScope.add()">增加</a></div>'
                    },
                    {name: '密码', field: 'password'},
                    {name: '手机', field: 'phone'},
                    {
                        name: '头像',
                        cellTemplate: '<a  ng-if="row.entity.$$treeLevel != 0" class="btn" ng-click="$event.stopPropagation();grid.appScope.changePortait(row.entity)"><img width="30" height="30" ng-src="http://113.31.89.204:3030/images/{{row.entity.image}}" ></a>'
                    },
                    {
                        name: '兴趣',
                        cellTemplate: '<a ng-if="row.entity.$$treeLevel != 0" class="btn" ng-click="$event.stopPropagation();grid.appScope.editCategory(row.entity)">编辑</a>'
                    },
                    {
                        name: '删除',
                        cellTemplate: '<a ng-if="row.entity.$$treeLevel != 0" class="btn" ng-click="$event.stopPropagation();grid.appScope.delDoctor(row.entity)">删除</a>'
                    },
                    {
                        name: '认领总数',
                        cellTemplate:'<div class="ui-grid-cell-contents" ng-click="" ><a ng-click=" $event.stopPropagation();grid.appScope.checkAccept(row.entity)">{{row.entity.acceptCount}}</a></div>'
                    },
                    {
                        name: '评论总数',
                        cellTemplate:'<div class="ui-grid-cell-contents" ng-click="" ><a ng-click=" $event.stopPropagation();grid.appScope.checkComment(row.entity)">{{row.entity.commentCount}}</a></div>'

                    }
                ],
                onRegisterApi: function (gridApi) {

                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        rowEntity[colDef.field] = newValue;
                        updateDoctor(rowEntity);
                    });
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        if (paginationOptions.pageSize != pageSize) {
                            paginationOptions.pageNumber = 1;
                            paginationOptions.pageSize = pageSize;
                        } else {
                            paginationOptions.pageNumber = newPage;
                        }
                        getPage();
                    });
                }
            }
            var getTatalPage = function () {
                $scope.myPromise = $http.get(SERVER.URL+'/doctors/count').success(function (data) {
                    $scope.gridOptions.totalItems = data;
                }).error(function (data) {

                });
            }
            //加载
            var getPage = function () {
                //var url = "http://"
                $scope.myPromise = $http.get(SERVER.URL+'/doctors', {
                    params: {
                        pageNo: paginationOptions.pageNumber,
                        pageNumber: paginationOptions.pageSize,
                        tag: $scope.selectTag
                    }
                }).success(function (data) {

                    $scope.gridOptions.data = data;
                }).error(function (data) {

                }).finally(function () {

                });
            };
            getTatalPage();
            getPage();
        });
