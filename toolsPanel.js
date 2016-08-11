//params
var jqueryLoaded = false;
var jqueryOnlineURL = "http://code.jquery.com/jquery-1.12.1.min.js";
var bootStrapLoaded = false;
var bootStrapJSOnlineURL = "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js";
var bootStrapCSSOnlineURL = "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css";
var defaultFontSize = 0;
var runningToolState = 0;//0- to run, 1- succeded, -1 -failed
//params

//docReady pure javascript
window.readyHandlers = [];
window.ready = function ready(handler) {
    window.readyHandlers.push(handler);
    handleState();
};
window.handleState = function handleState() {
    if (['interactive', 'complete'].indexOf(document.readyState) > -1) {
        while (window.readyHandlers.length > 0) {
            (window.readyHandlers.shift())();
        }
    }
};
document.onreadystatechange = window.handleState;
//docReady pure javascript

function RequiredClientSideLibrariesAreLoaded() {
    jqueryLoaded = (typeof jQuery !== 'undefined');
    if (jqueryLoaded) {
        bootStrapLoaded = (typeof jQuery().modal == 'function');
    }

    if (!jqueryLoaded)
        alert("TOOLSPANEL: JQUERY nuk eshte ngarkuar!");
    if (jqueryLoaded) {
        if (!bootStrapLoaded)
            alert("TOOLSPANEL: BOOTSTRAP nuk eshte ngarkuar!");
    }

    return (jqueryLoaded && bootStrapLoaded)
}

ready(function () {
    if (!RequiredClientSideLibrariesAreLoaded()) {
        if (confirm('TOOLSPANEL: Doni te shkarkoni librarite online?')) {
            downloadClientSideLibraries();
        } else {
            return;
        }
    }
    else {
        startToolsPanel();
    }
});

startToolsPanel = function () {
    generateHTMLDiv();
    verticalSegmentedMenu();

    var DELAY = 600, clicks = 0, timer = null;
    $("#toolsPanel > span, #showPanelbtn").click(function () {
        var ele = this;
        runningToolState = 0;
        $('#toolExecuting').css("color", "black");
        showToolRunningIcon(ele);
        clicks++;  //count clicks
        if (clicks === 1) {
            timer = setTimeout(function () {
                executeAction(ele, false);  //perform single-click action
                clicks = 0;             //after action performed, reset counter

            }, DELAY);

        } else {
            clearTimeout(timer);        //prevent single-click action
            executeAction(ele, true);   //perform double-click action
            clicks = 0;                 //after action performed, reset counter
        }
    })
    .on("dblclick", function (e) {
        e.preventDefault();  //cancel system double-click event
    });

    if (readCookie('panelClosed') == null) createCookie('panelClosed', false);
    else {
        if (readCookie('panelClosed') == 'true') {
            $('#showPanelbtn').css({ "right": "-10px" });
            $('#showPanelbtn').show();
            $('#toolsPanel').hide();
        }
    }

    if ($('table td').length > 0)
        defaultFontSize = $('table td').css('font-size').replace("px", "");

    $('[data-toggle="tooltip"]').tooltip();

    $('form').submit(function () {
        try {
            saveFormDataToSession();
        }
        catch (err) {
            console.log("saveFormDataToSession() error: " + err.message);
        }
        finally {
            return;
        }
    });

    $("#toolsPanel, #showPanelbtn").drags();
}

function downloadClientSideLibraries() {
    try {
        //JQUERY
        var headTag = document.getElementsByTagName("head")[0];
        var jqTag = document.createElement('script');
        jqTag.type = 'text/javascript';
        jqTag.src = jqueryOnlineURL;
        jqTag.onload = function () {
            jqueryLoaded = true;
            //BOOTSTRAP
            var bsJSTag = document.createElement('script');
            bsJSTag.type = 'text/javascript';
            bsJSTag.src = bootStrapJSOnlineURL;
            bsJSTag.onload = function () {
                var bsCSSTag = document.createElement('link');
                bsCSSTag.src = bootStrapCSSOnlineURL;
                bsCSSTag.onload = function () {
                    bootStrapLoaded = true;
                    startToolsPanel();
                };
                headTag.appendChild(bsCSSTag);
            };
            headTag.appendChild(bsJSTag);
        };
        headTag.appendChild(jqTag);

    }
    catch (err) {
        alert(err.message);
    }
}

function generateHTMLDiv() {
    //TODO: add dynamically tool(s) in Panel
    var htmlJSContent = '<div id="showPanelbtn" data-toggle="tooltip" data-placement="bottom" title="Hap panelin" style="display: none;" class="transparent_class"></div><div id="toolsPanel" class="transparent_class"><span id="historicalPopulate" currstate="0" data-placement="right" data-toggle="tooltip" title="CLICK: Mbush formen me te dhenat te meparshme nese ka. DOUBLE CLICK: Pastron formen." class="tool transparent_class glyphicon glyphicon-grain"></span><span id="autoPopulate" currstate="0" data-placement="right" data-toggle="tooltip" title="CLICK: Gjeneron te dhena per elementet e formes ne varesi te tipit. DOUBLE CLICK: Pastron formen." class="tool transparent_class glyphicon glyphicon-flash"></span><span id="selectToggle" currstate="0" data-placement="right" data-toggle="tooltip" title="CLICK: Select/Unselect checkbox-et. DOUBLE CLICK: Selectim rastesor." class="tool transparent_class glyphicon glyphicon-check"></span><span id="zoomIn" data-placement="right" data-toggle="tooltip" title="CLICK: Zmadhon te dhenat. DOUBLE CLICK: Madhesi fillestare." class="tool transparent_class glyphicon glyphicon-zoom-in"></span><span id="zoomOut" data-placement="right" data-toggle="tooltip" title="CLICK: Zvogelon te dhenat. DOUBLE CLICK: Madhesi fillestare." class="tool transparent_class glyphicon glyphicon-zoom-out"></span><span id="help" data-placement="right" data-toggle="tooltip" title="Shfaq Help" class="tool transparent_class glyphicon glyphicon glyphicon-question-sign"></span><hr/><span id="closePanel" data-toggle="tooltip" data-placement="right" title="Minimizon panelin" class="tool transparent_class glyphicon glyphicon-off"></span></div><span id="toolExecuting" class="glyphicon glyphicon-hourglass" style="display: none;"></style>';
    var htmlCSSContent = '<style>#toolsPanel, #showPanelbtn {    position: fixed;    top: 20%;    right: 120px;    padding: 10px;    font-family: Arial;    background: #fffea1;    border: 1px solid #fc0;    width: 50px;}#toolsPanel > .tool, #subMenuPanel > .tool, showPanelbtn > .tool {  color: #337ab7;  font-size: 120%;    padding: 2px;    margin: 2px;    border: 1px solid #fc0;}.transparent_class {  /* IE 8 */  -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=50)";  /* IE 5-7 */  filter: alpha(opacity=50);  /* Netscape */  -moz-opacity: 0.5;  /* Safari 1.x */  -khtml-opacity: 0.5;  /* Good browsers */  opacity: 0.5;}#toolsPanel:hover, #toolsPanel > .tool:hover , #showPanelbtn:hover, #showPanelbtn > .tool:hover{   /* IE 8 */  -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=100)";  /* IE 5-7 */  filter: alpha(opacity=100);  /* Netscape */  -moz-opacity: 1;  /* Safari 1.x */  -khtml-opacity: 1;  /* Good browsers */  opacity: 1;  cursor: pointer;}.dropdown-submenu{position:relative;}.dropdown-submenu>.dropdown-menu{top:0;left:100%;margin-top:-6px;margin-left:-1px;-webkit-border-radius:06px6px6px;-moz-border-radius:06px6px6px;border-radius:06px6px6px;}.dropdown-submenu:hover>.dropdown-menu{display:block;}.dropdown-submenu>a:after{display:block;content:"";float:right;width:0;height:0;border-color:transparent;border-style:solid;border-width:5px05px5px;border-left-color:#cccccc;margin-top:5px;margin-right:-10px;}.dropdown-submenu:hover>a:after{border-left-color:#ffffff;}.dropdown-submenu.pull-left{float:none;}.dropdown-submenu.pull-left>.dropdown-menu{left:-100%;margin-left:10px;-webkit-border-radius:6px06px6px;-moz-border-radius:6px06px6px;border-radius:6px06px6px;}#subMenuPanel{position:fixed;top:7%;padding:10px;font-family:Arial;background:#fffea1;border:1px solid #fc0;}#subMenuPanel>a{font-weight:bold;}.sideExplodedMenu{font-size:85%;margin-left:-10px;}#subMenuPanel>ul>li>ul>li{font-size:80%;}.sideExplodedMenu>ulli,.sideExplodedMenuul,.sideExplodedMenuli{margin-left:-15px;}.transparent_class{/*IE8*/-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=50)";/*IE5-7*/filter:alpha(opacity=50);/*Netscape*/-moz-opacity:0.5;/*Safari1.x*/-khtml-opacity:0.5;/*Goodbrowsers*/opacity:0.5;}</style>';
    $(htmlJSContent + htmlCSSContent).appendTo('body');
}

//Auto Populate Functions
function saveFormDataToSession() {
    $("form").find('input:not([type="submit"]):not(:hidden):not(:disabled),select:not(:hidden):not(:disabled)').each(function () {
        var input = $(this);
        var id = input.attr("id");
        if (input.val() != undefined && id != undefined) {
            setToSession(id, input.val());
        }
    });
}

function setToSession(key, value) {
    key += window.location.href;
    sessionStorage.setItem(key, value);
}

function getFromSession(key) {
    key += window.location.href;
    return sessionStorage.getItem(key);
}

function createCookie(name, value, days) {
    var expires;

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = encodeURIComponent(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}
//Auto Populate Functions

function showToolRunningIcon(ele) {
    if (runningToolState == 1)
        return;

    runningToolState = 1;
    var moveHorizontally = 30;
    var moveVertically = 5;
    var top = $(ele).offset().top;
    var left = $(ele).offset().left;
    $('#toolExecuting').css({
        position: 'absolute',
        top: (top + moveVertically) + "px",
        left: (left - moveHorizontally) + "px"
    });
    $('#toolExecuting').show();
}

function closeToolRunningIcon(state) {
    if (state === -1)
        $('#toolExecuting').css("color", "red");
    else
        $('#toolExecuting').css("color", "green");
    $('#toolExecuting').fadeOut("slow", function () {
        runningToolState = state;
    });
}

function executeAction(ele, secondaryAction) {
    try {
        switch ($(ele).attr("id")) {
            case "historicalPopulate":
                historicalPopulate(ele, secondaryAction);
                break;
            case "autoPopulate":
                autoPopulate(ele, secondaryAction);
                break;
            case "selectToggle":
                selectToggleDo(ele, secondaryAction);
                break;
            case "zoomIn":
                zoomDo(ele, secondaryAction, "IN");
                break;
            case "zoomOut":
                zoomDo(ele, secondaryAction, "OUT");
                break;
            case "help":
                break;
            case "closePanel":
                closePanel(ele, secondaryAction);
                break;
            case "showPanelbtn":
                showPanelbtn(ele, secondaryAction);
                break;
            default:
                alert("Tool not implemented! " + ele);
        }
    }
    catch (err) {
        runningToolState = -1;
    }
    finally {
        closeToolRunningIcon(runningToolState);
    }
}

function selectToggleDo(ele, secondaryAction) {
    if (secondaryAction === false) {
        var currState = parseInt($(ele).attr("currState"));
        if ($('td input:checkbox').prop('disabled') === false)
            $('td input:checkbox').prop('checked', currState == 0 ? true : false);
        $(ele).attr("currState", currState == 0 ? "1" : "0");
        return;
    }

    //Secondary Action
    if ($('td input:checkbox').prop('disabled') === false) {
        $('td input:checkbox').prop('checked', false);
        $('td input:checkbox').each(function () {
            $(this).prop('checked', getRandomInt(0, 1) == 0 ? true : false);
        });
    }
}

function zoomDo(ele, secondaryAction, type) {
    var increase = 1;
    if (type == "OUT") increase *= (-1)

    if (secondaryAction === false) {
        if (defaultFontSize == 0)
            defaultFontSize = $('td').css("font-size").replace("px", "");
        if ($('table').length) {
            $('td, th').css("font-size", (parseInt($('td').css("font-size").replace("px", "")) + increase) + "px");
        }
        return;
    }

    if ($('table').length) {
        $('td, th').css("font-size", defaultFontSize + "px");
    }
}

function historicalPopulate(ele, secondaryAction) {
    //aleeert('blaaa'); //to throw exception

    if (secondaryAction === true) {
        $('form').each(function () { this.reset() });
        return;
    }

    try {
        $("form").find('input:not([type="submit"]):not(:hidden):not(:disabled),select:not(:hidden):not(:disabled)').each(function () {
            var input = $(this);
            var id = input.attr("id");
            if (id != undefined) {
                var value = getFromSession('' + id);
                input.val(value);
                input.change();
            }
        });
    }
    catch (err) {
        console.log("historicalPopulate() error: " + err.message);
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function autoPopulate(ele, secondaryAction) {
    if (secondaryAction === true) {
        $('form').each(function () { this.reset() });
        return;
    }

    var startRandomYear = 1900;
    var startEndYear = 2100;
    var dateFormat1 = "DD/MM/YYYY"
    var dateFormat2 = "MM/YYYY";
    var dateFormat3 = "YYYY";
    var randomStrLength = 5;

    function getformatedDate(dtStr, format) {
        if (format == dateFormat1) {
            return dtStr;
        }
        if (format == dateFormat2) {
            return dtStr.substring(3);
        }
        if (format == dateFormat3) {
            return dtStr.substring(6);
        }
    }

    function getDateFormat(input) {
        var dtFormat = dateFormat1;
        if (input.attr('monthonly'))
            dtFormat = dateFormat2;
        if (input.attr('yearonly'))
            dtFormat = dateFormat3;
        return dtFormat;
    }

    function generateValue(input) {
        var tagType = input.get(0).tagName
        var returnValue;
        switch (tagType) {
            case "SELECT":
                var selector = "#" + input.attr('id') + " option:not([value=''])";
                var randomInt = getRandomInt(0, $(selector).length - 1);
                var i = 0;
                $(selector).each(function () {
                    if (i++ == randomInt) {
                        returnValue = this.value;
                    }
                });
                break;
            case "INPUT":
                if (input.attr('data-val-date')) {
                    returnValue = getformatedDate(getRandomDate(new Date(getRandomInt(startRandomYear, startEndYear), getRandomInt(1, 12), getRandomInt(1, 28)),
                                  new Date(getRandomInt(startRandomYear, startEndYear), getRandomInt(1, 12), getRandomInt(1, 28))).toString()
                                  , getDateFormat(input));
                }
                else if (input.attr('min') && input.att('max')) {
                    returnValue = getRandomInt(min, max);
                }
                else {
                    returnValue = getRandomString(randomStrLength);
                }
                break;
            default:
                console.log("autoPopulate / generateValue(input, tagType): tagType is not implemented!" + tagType);
        }
        return returnValue;
    }

    try {
        $("form").find('input:not([type="submit"]):not(:hidden):not(:disabled),select:not(:hidden):not(:disabled)').each(function () {
            var input = $(this);
            input.val(generateValue(input));
            input.change();
        });
    }
    catch (err) {
        console.log("autoPopulate() error: " + err.message);
    }
}

function closePanel(ele, secondaryAction) {
    $("#toolsPanel").slideUp('fast', function () {
        $("#showPanelbtn").show();
        showPanelBtnPositionLeft = $('#showPanelbtn').position().left;
        $("#showPanelbtn").css({ right: $('#showPanelbtn').offset().right })
                     .animate({ "right": "-10px" }, "slow");
        $("#showPanelbtn").unbind().on("click", function () {
            showPanelbtn(ele);
        });
        createCookie('panelClosed', true);
    });
}

function showPanelbtn(ele, secondaryAction) {
    $("#toolsPanel").slideDown('fast');
    $("#showPanelbtn").hide();
    $("#showPanelbtn").animate({ "right": "-10px" }, "slow");
    createCookie('panelClosed', false);
}

function verticalSegmentedMenu() {

    var DELAY = 400, clicks = 0, timer = null;

    showMenu(sessionStorage.getItem('sideExplodedMenu'));
    $(".dropdown-toggle").click(function () {
        clicks++;
        if (clicks === 1) {
            timer = setTimeout(function () {
                clicks = 0;
            }, DELAY);

        } else {
            clearTimeout(timer);
            showMenu($(this).parent().closest('li').html());
            clicks = 0;
        }

    })
    .on("dblclick", function (e) {
        e.preventDefault();
    });

    function showMenu(menu) {
        if (menu != null) {
            $('#subMenuPanel').remove();
            String.prototype.replaceAll = function (search, replacement) {
                var target = this;
                return target.replace(new RegExp(search, 'g'), replacement);
            };
            menu = menu.replaceAll('dropdown-menu', 'sideExplodedMenu');
            menu = menu.replaceAll('dropdown dropdown-submenu', 'decreased-fonts');
            menu = menu.replaceAll('dropdown-toggle', 'dropdownChild')
            menu = menu.replaceAll('<li role="presentation" class="divider"></li>', '');
            closeBtn = "<span id='closeMenu' data-toggle='tooltip' data-placement='bottom' title='' class='tool transparent_class glyphicon glyphicon-off' data-original-title='Mbyll menu'></span>";
            $("<div id='subMenuPanel' class='transparent_class'>" + closeBtn + menu +"</div>").appendTo('body');
            sessionStorage.setItem("sideExplodedMenu", menu);
            bindEvents();
        }
    }

    function bindEvents() {
        clicks1 = 0, timer1 = null;
        $(".dropdownChild").click(function () {
            clicks1++;
            if (clicks1 === 1) {
                timer1 = setTimeout(function () {
                    clicks1 = 0;
                }, DELAY);

            } else {
                clearTimeout(timer1);
                showMenu($(this).parent().closest('li').html());
                clicks1 = 0;
            }

        })
        .on("dblclick", function (e) {
            e.preventDefault();
        });

        $("#subMenuPanel, #closeMenu").hover(
          function () {
              $(this).removeClass("transparent_class");
          },
          function () {
              $(this).addClass("transparent_class");
          }
        );

        $('#closeMenu').click(function () {
            sessionStorage.removeItem("sideExplodedMenu");
            $('#subMenuPanel').remove();
        });
    }
}