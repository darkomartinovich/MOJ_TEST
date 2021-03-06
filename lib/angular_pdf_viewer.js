function delegateService(e) {
    return ["$log", function (t) {
        function n(e) {
            this.handle = e
        }
        var a = this,
            o = this._instances = [];
        this._registerInstance = function (e, t) {
            return e.$$delegateHandle = t, o.push(e),
                function () {
                    var t = o.indexOf(e); - 1 !== t && o.splice(t, 1)
                }
        }, this.$getByHandle = function (e) {
            return e ? new n(e) : a
        }, e.forEach(function (e) {
            n.prototype[e] = function () {
                var n, a, r = this.handle,
                    l = arguments,
                    u = 0;
                return o.forEach(function (t) {
                    t.$$delegateHandle === r && (u++, a = t[e].apply(t, l), 1 === u && (n = a))
                }), u ? n : t.warn('Delegate for handle "' + this.handle + '" could not find a corresponding element with delegate-handle="' + this.handle + '"! ' + e + "() was not called!\nPossible cause: If you are calling " + e + '() immediately, and your element with delegate-handle="' + this.handle + '" is a child of your controller, then your element may not be compiled yet. Put a $timeout around your call to ' + e + "() and try again.")
            }, a[e] = function () {
                var t, n, a = arguments;
                return o.forEach(function (o, r) {
                    n = o[e].apply(o, a), 0 === r && (t = n)
                }), t
            }
        })
    }]
}
angular.module("pdf", []).service("pdfDelegate", delegateService(["prev", "next", "zoomIn", "zoomOut", "rotate", "getPageCount", "getCurrentPage", "goToPage", "load"])), angular.module("pdf").controller("PdfCtrl", ["$scope", "$element", "$attrs", "pdfDelegate", "$log", function (e, t, n, a, o) {
    var r = a._registerInstance(this, n.delegateHandle);
    e.$on("$destroy", r);
    var l, u = this,
        i = e.$eval(n.url),
        c = e.$eval(n.headers);
    e.pageCount = 0;
    var d = 1,
        g = 0,
        s = n.scale ? n.scale : 1,
        f = t.find("canvas")[0],
        p = f.getContext("2d"),
        h = function (e) {
            angular.isNumber(e) || (e = parseInt(e)), l.getPage(e).then(function (e) {
                var t = e.getViewport(s);
                f.height = t.height, f.width = t.width;
                var n = {
                    canvasContext: p,
                    viewport: t
                };
                e.render(n)
            })
        },
        m = function () {
            f.style.webkitTransform = "rotate(" + g + "deg)", f.style.MozTransform = "rotate(" + g + "deg)", f.style.msTransform = "rotate(" + g + "deg)", f.style.OTransform = "rotate(" + g + "deg)", f.style.transform = "rotate(" + g + "deg)"
        };
    u.prev = function () {
        1 >= d || (d = parseInt(d, 10) - 1, h(d))
    }, u.next = function () {
        d >= l.numPages || (d = parseInt(d, 10) + 1, h(d))
    }, u.zoomIn = function () {
        return s = parseFloat(s) + .2, h(d), s
    }, u.zoomOut = function () {
        return s = parseFloat(s) - .2, h(d), s
    }, u.rotate = function () {
        g = 0 === g ? 90 : 90 === g ? 180 : 180 === g ? 270 : 0, m()
    }, u.getPageCount = function () {
        return e.pageCount
    }, u.getCurrentPage = function () {
        return d
    }, u.goToPage = function (e) {
        null !== l && (d = e, h(e))
    }, u.load = function (t) {
        t && (i = t);
        var n = {};
        c ? (n.url = i, n.httpHeaders = c) : n.url = i, PDFJS.getDocument(n).then(function (t) {
            l = t, h(1), e.$apply(function () {
                e.pageCount = t.numPages
            })
        }, o.error)
    }, u.load()
}]), angular.module("pdf").directive("pdfViewerToolbar", ["pdfDelegate", function (e) {
    return {
        restrict: "E",
        template: ' <div class="clearfix mb2 white bg-blue"> <div class="left pdf_nav_bar"> <div class="row"> <div class="col  pdf_nav_bar_button"> <div href="" ng-click="prev()" class=" py2 m0 ">Back</div> </div> <div class="col  pdf_nav_bar_button" > <div href="" ng-click="next()" class=" py2 m0 ">Next</div> </div> <div class="col col-33 "> Page <input type="text" class="field-dark pdf_nav_bar_input" min=1 ng-model="currentPage" ng-change="goToPage()" > / {{pageCount}} </div> <div class="col  pdf_nav_bar_button"> <div href="" ng-click="zoomIn()" class=" py2 m0 ">Zoom In</div> </div> <div class="col  pdf_nav_bar_button"> <div href="" ng-click="zoomOut()" class=" py2 m0 ">Zoom Out</div> </div> <div class="col  pdf_nav_bar_button"> <div href="" ng-click="rotate()" class=" py2 m0 ">Rotate</div> </div> </div> </div> </div>',
        scope: {
            pageCount: "="
        },
        link: function (t, n, a) {
            var o = a.delegateHandle;
            t.currentPage = 1, t.prev = function () {
                e.$getByHandle(o).prev(), r()
            }, t.next = function () {
                e.$getByHandle(o).next(), r()
            }, t.zoomIn = function () {
                e.$getByHandle(o).zoomIn()
            }, t.zoomOut = function () {
                e.$getByHandle(o).zoomOut()
            }, t.rotate = function () {
                e.$getByHandle(o).rotate()
            }, t.goToPage = function () {
                e.$getByHandle(o).goToPage(t.currentPage)
            };
            var r = function () {
                t.currentPage = e.$getByHandle(o).getCurrentPage()
            }
        }
    }
}]), angular.module("pdf").directive("pdfViewer", ["$window", "$log", "pdfDelegate", function () {
    return {
        restrict: "E",
        template: '<pdf-viewer-toolbar ng-if="showToolbar" delegate-handle="{{id}}" page-count="pageCount"></pdf-viewer-toolbar><canvas></canvas>',
        scope: !0,
        controller: "PdfCtrl",
        link: function (e, t, n) {
            e.id = n.delegateHandle, e.showToolbar = e.$eval(n.showToolbar) || !1
        }
    }
}]);