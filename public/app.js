var app = angular.module("myApp", ['ui.bootstrap']);

app.controller("TreeDemoCtrl", function($scope, $http) {
  $scope.treeUrl = "/files";
  $scope.pathIds = "/pathIds";
  $scope.selectedTreeNode = {};
  $scope.selectHomeFolder = function() {
    $http.get('/homeFolder').then(function(data) {
      $scope.selectedTreeNode.path = data.data;
    });
  }
});

