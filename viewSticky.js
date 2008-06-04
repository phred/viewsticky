/**
 * viewSticky -- Create a "sticky" notification from the first element in this
 *  set.  The notification floats along the top edge of the viewport, which
 *  slides downward when the page scrolls, and sticks to the top edge when the
 *  page scrolls up.
 *
 *  How to use:
 *     $("#sticky").viewSticky() -- float the element "#sticky" along the top of the screen.
 *
 *  @param options  --  options
 *  options.interval     --  Time, in milliseconds, between each poll for scrolling.  Default: 25ms.
 *  options.downVelocity --  Float, scales animation speed when the note moves downward (+y).  Default: 0.2
 *  options.upVelocity   --  Float, scales animation speed when the note moves upward (-y).  Default: 1.1
 *  options.selector     --  The selector to find the link to use for the "dismiss" link.  Default: ".dismiss"
 *  options.position     --  String, what CSS 'position' property to use.  Default: 'fixed'
 *  options.autoDismiss  --  Time, in milliseconds, before automatically dimissing the notice.  Default: null
 *
 * @return the jQuery set, so this is a "chainable" operation
 */
jQuery.fn.viewSticky = function(options) {
    options && jQuery.viewSticky(this, options) || jQuery.viewSticky(this, {
        interval: 25,
        downVelocity: 0.15,
        upVelocity: 1.0,
        selector: '.dismiss',
        position: 'fixed',
        autoDismiss: null
     });
    return this;
};

/**
 * $.viewSticky -- Make a DOM node "sticky" along the top of the screen.  See description at viewSticky
 *
 * @param element  DOM node which will become "sticky"
 * @param options  Animation options, see description at viewSticky
 *
 * @return the object which animates the "sticky" element.
 */
jQuery.viewSticky = function(element, options) {
    var element = jQuery(element).get(0);
    return element.viewSticky || (element.viewSticky = new jQuery._viewSticky(element, options));
};

/**
 * _viewSticky -- Constructor for the object that tracks and animates each
 *  "sticky".  Binds a single callback, _animate to the window using setInterval.
 */
jQuery._viewSticky = function(element, options) {
    var sticky = this;
    var el = jQuery(element);

    this.interval = options.interval;
    this.downVelocity = options.downVelocity;
    this.upVelocity = options.upVelocity;
    this.position = options.position;
    
    this.target = el;

    this.startY = -2*el.height();
    this.endY = 0;

    var t = (new Date()).getTime();
    this.startTime = t;

    el.css({position: this.position, top: this.startY+"px"});
    sticky.scrollTop = jQuery(window).scrollTop();

    this._animate = function(sticky) {
        var t = (new Date()).getTime();
        var top =  parseFloat(sticky.target.css('top'));

        sticky._scrollTop = sticky.scrollTop;
        sticky.scrollTop = jQuery(window).scrollTop();
        sticky.scrollDelta = sticky.scrollTop - sticky._scrollTop;

        sticky.endY = 0 + (sticky.position == 'fixed' && sticky.scrollDelta > 0 ? -sticky.scrollDelta : 0) +
         (sticky.position == 'absolute' ? jQuery(window).scrollTop() : 0);
    
        var dy = (sticky.endY - top)*(sticky.endY - top)*(sticky.endY - top)/sticky.interval;
        dy = dy > 0 ? Math.min(dy, (sticky.endY - top)*sticky.downVelocity) : (sticky.endY - top)*sticky.upVelocity;

        sticky.target.css('top', (top+dy)+"px");
    };

    this.dismiss = function (sticky) {
        window.clearInterval(sticky.intervalID);
        sticky.target.fadeOut('slow');
    };

    this.intervalID = window.setInterval(this._animate, this.interval, this);
    
    if (options.autoDismiss)
        window.setTimeout(this.dismiss, options.autoDismiss, this);

    el.find(options.selector).click(function () {
        sticky.dismiss(sticky);
        return false;
    });
    el.show();
};
