'use strict';

angular.module('angularAffix', [])
  .directive(
    'affix',
    ['$window', '$timeout', '$parse', function($window, $timeout, $parse) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var paramsDefault = {
            offsetTop: 0,
            offsetBottom: 0,
            useParentHeight: true
          };
          var params = _.clone(paramsDefault);

          // do not call reposition() for each parameter
          var init = true;

          // watch parameters
          scope.$watch(attrs.affixOffsetTop, function(offsetTop) {
            params.offsetTop = offsetTop !== undefined ? offsetTop :
              paramsDefault.offsetTop;
            if (!init) {reposition();}
          });
          scope.$watch(attrs.affixOffsetBottom, function(offsetBottom) {
            params.offsetBottom = offsetBottom !== undefined ? offsetBottom :
              paramsDefault.offsetBottom;
            if (!init) {reposition();}
          });
          scope.$watch(attrs.affixUseParentHeight, function(useParentHeight) {
            params.useParentHeight = useParentHeight !== undefined ?
              useParentHeight : paramsDefault.useParentHeight;
            if (!init) {reposition();}
          });

          function reposition() {
            // set height of element such that it fits the viewport
            // note: the 1px prevents scroll bars in certain situations
            var height = _.min([
              $($window).innerHeight() - params.offsetTop -
                params.offsetBottom - 1,
              element[0].scrollHeight
            ]);
            /* TODO: revisit
            element.css({height: height + 'px'});
            */

            // get position of parent
            var offsetParent = element[0].offsetParent;
            if (!offsetParent) {return;}
            var parentRect = offsetParent.getBoundingClientRect();

            // positioned normally
            var top = 0;
            var affixed = false;
            if (parentRect.top <= params.offsetTop) {
              affixed = true;
              if (params.useParentHeight &&
                  -parentRect.top + params.offsetTop + height >
                  parentRect.height) {
                // positioned at bottom of parent element
                top = parentRect.height - height;
              } else {
                // positioned at top
                top = -parentRect.top + params.offsetTop;
              }
            }

            element.css({top: top + 'px'});

            var affixedSetter = $parse(attrs.affixed);
            if (affixedSetter && affixedSetter.assign) {
              affixedSetter.assign(scope, affixed);
              scope.$apply();
            }
          }

          $timeout(function() {
            // register handler
            $($window).on('resize scroll', reposition);
            element.resize(reposition);

            // unregister handlers
            // $destroy seems to be emitted multiple times, so we only
            // clean up once
            var destroyed = false;
            element.on('$destroy', function() {
              $($window).off('resize scroll', reposition);
              if (!destroyed) {element.removeResize(reposition);}
              destroyed = true;
            });

            // run once
            init = false;
            reposition();
          });
        }
      };
    }]
  );

};

