/**
 * Created by yuguihu on 15/7/23.
 */
'use strict';
angular.module('myApp.doctor', ['NewfileDialog', 'angularModalService','ngFileUpload', 'cgBusy', 'ngRoute', 'ui.grid', 'ui.grid.edit', 'ui.grid.cellNav', 'ui.grid.treeView', 'ui.grid.selection', 'ui.grid.pagination'])

    .config(['$routeProvider', function ($routeProvider, $http) {
        $routeProvider.when('/doctor', {
            templateUrl: 'doctor/doctor.html',
            controller: 'DoctorCtrl'
        });
    }])
    .controller('CategoryCtrl', function ($scope, close,$http, entity) {
        $scope.gridOptions1 = {
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            multiSelect: false,
            columnDefs: [
                {name: '类别', field: 'category'},
                ,{ name: '选择', field: 'selected',cellTemplate: '<input type="checkbox"  ng-model="row.entity.selected" ng-click="grid.appScope.selected(row.entity)">'}
            ]


        };
        $scope.selected=function(en){
            //
            if(en.selected == true)
                entity.selected.push(en.category);
            else {
                var index = entity.selected.indexOf(en.category);
                entity.selected.splice(index,1);
            }
            //
        }
        $scope.closeModal = function(result) {
            close(result, 500);
        };
        var loadCategory = function () {
            $http.get('http://huyugui.f3322.org:3000/category').success(function (result) {
                var data = [];
                var count=0;
                result.forEach(function (e, i, a) {
                    //
                    data.push({category: e.name, $$treeLevel: 0});
                    count++;
                    e.child_depart.forEach(function (e1, i1, a1) {
                        //
                        data.push({category: e1,selected:false});
                        count++;
                        entity.selected.forEach(function(e2,i2,a2){
                            if(e2 == e1)
                                data[count-1].selected=true;

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
    .controller('DoctorCtrl', function ($scope,Upload,ModalService, $http, fileDialog) {
        var paginationOptions = {
            pageNumber: 1,
            pageSize: 25,
            totalPage: 1
        };
        var loadCategory = function () {
            $scope.myPromise = $http.get('http://huyugui.f3322.org:3000/category').success(function (result) {
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
        var updateDoctor = function(entity){
            //
            $scope.myPromise = $http.put('http://huyugui.f3322.org:3000/doctors', entity).success(function (data) {
                //

                //
            }).error(function (data) {

            });
            //
        }
        var addDoctor=function(entity){
            $scope.myPromise = $http.post('http://huyugui.f3322.org:3000/doctors', entity).success(function (data) {
                getTatalPage();
                getPage();
            }).error(function (data) {

            });
        }
        $scope.delDoctor = function(entity){
            //
            //
            $scope.myPromise = $http.delete('http://huyugui.f3322.org:3000/doctors',{params:entity}).success(function (data) {
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
                inputs:{entity:object}
            }).then(function (modal) {
                // The modal object has the element built, if this is a bootstrap modal
                // you can call 'modal' to show it, if it's a custom modal just show or hide
                // it as you need to.
                modal.element.modal();
                modal.close.then(function (result) {
                   if(result == "Yes"){
                       //
                       updateDoctor(object);
                       //
                   }
                });
            });
        }
        $scope.changePortait = function(object){
            //
            fileDialog.openFile(function (e) {
                //
                var files = e.target.files;

                $scope.myPromise=Upload.upload({
                    url: 'http://huyugui.f3322.org:3000/portrait',
                    fields: {'postImg': 'default'},
                    file: files[0]
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                }).success(function (data, status, headers, config) {
                    object.image=data.fileName;
                    updateDoctor(object);
                }).error(function (data, status, headers, config) {
                    console.log('error status: ' + status);
                })
            });
            //
        }
        $scope.add = function()
        {
            //
            var doc = {name:'王二',sex:'男',age:'',password:'123',selected:[],phone:'',image:'default.jpg'};
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
                {name: '姓名', field: 'name',footerCellTemplate: '<div class="ui-grid-cell-contents" ng-click="" ><a ng-click=" $event.stopPropagation();grid.appScope.add()">增加</a></div>'},
                {
                    name: '性别', field: 'sex',
                    enableCellEdit: true,
                    editType: 'dropdown',
                    editDropdownOptionsArray: $scope.sexs,
                    editableCellTemplate: 'ui-grid/dropdownEditor',
                    editDropdownIdLabel: 'name',
                    editDropdownValueLabel: 'name'
                },
                {name: '密码', field: 'password'},
                {name: '年纪', field: 'age'},
                {name: '手机', field: 'phone'},
                {
                    name: '头像',
                    cellTemplate: '<a  ng-if="row.entity.$$treeLevel != 0" class="btn" ng-click="$event.stopPropagation();grid.appScope.changePortait(row.entity)"><img width="30" height="30" ng-src="http://huyugui.f3322.org:3000/images/{{row.entity.image}}" ></a>'
                },
                {
                    name: '兴趣',
                    cellTemplate: '<a ng-if="row.entity.$$treeLevel != 0" class="btn" ng-click="$event.stopPropagation();grid.appScope.editCategory(row.entity)">编辑</a>'
                },
                {
                    name: '删除',
                    cellTemplate: '<a ng-if="row.entity.$$treeLevel != 0" class="btn" ng-click="$event.stopPropagation();grid.appScope.delDoctor(row.entity)">删除</a>'
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
            $scope.myPromise = $http.get('http://huyugui.f3322.org:3000/doctors/count').success(function (data) {
                $scope.gridOptions.totalItems = data;
            }).error(function (data) {

            });
        }
        //加载
        var getPage = function () {
            //var url = "http://"
            $scope.myPromise = $http.get('http://huyugui.f3322.org:3000/doctors', {
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