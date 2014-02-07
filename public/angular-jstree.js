app.directive('jstree', function($timeout, $http) {
  return {
     restrict: 'A',
     require: '?ngModel',
     scope: {
       selectedNode: '=?',
       childrenUrl: '=',
       selectionChanged: '='
     },
     link: function(scope, element, attrs) {
       scope.selectedNode = scope.selectedNode || {};
       var treeElement = $(element);
       var tree = treeElement.jstree({
         'core': {
           'data': {
             'url': scope.childrenUrl,
             'data': function(n) {
               if(n && n.a_attr)
                 return { parentPath: n.a_attr.path };
             }
           }
         },
         'plugins': ['themes', 'json_data', 'ui']
       });
       tree.bind('select_node.jstree', function() {
         $timeout(function() {
           var n = treeElement.jstree('get_selected', true);
           if(n) {
             n = n[0];
             scope.selectedNode.id = n.id;
             scope.selectedNode.path = n.a_attr.path;
             scope.selectedNode.text = n.text;
             if(scope.selectionChanged) 
               $timeout(function() {
                 scope.selectionChanged(scope.selectedNode);
               });
           }
         });
       });
       function expandAndSelect(ids) {
         ids = ids.slice()
         var expandIds = function() {
           if(ids.length == 1) {
             treeElement.jstree('deselect_node', treeElement.jstree('get_selected'));
             treeElement.jstree('select_node', ids[0]);
           }
           else
             treeElement.jstree('open_node', ids[0], function() {
               ids.splice(0, 1);
               expandIds();
             });
         };
         expandIds();
       }      
       scope.$watch('selectedNode.id', function() {
         var selectedIds = treeElement.jstree('get_selected');
         if(selectedIds.length != 1 || selectedIds[0] != scope.selectedNode.id) {
           treeElement.jstree('deselect_node', treeElement.jstree('get_selected'));
           treeElement.jstree('select_node', scope.selectedNode.id);
         }
       });
       scope.$watch('selectedNode.path', function() {
         var selected = treeElement.jstree('get_selected', true);
         var prevPath = selected.length ? selected[0].a_attr.path : null;
         var newPath = scope.selectedNode.path
         if((selected.length != 1 || prevPath != newPath) && newPath)
           $http.get('/pathIds', { params: { path: newPath }}).then(function(data) {
             expandAndSelect(data.data);
           });
       });       
     }
  };
});
