(function() {

    var elems = {
        app:                    document.querySelector('.rs'),
        appBackground:          document.querySelector('.rs-background'),
        backgroundColorInput:   document.querySelector('.rs-backgroundColorInput'),
        hideModalButton:        document.querySelector('.rs-hideModalButton'),
        modal:                  document.querySelector('.rs-modal'),
        scrollbarCheckbox:      document.querySelector('.rs-switch input'),
        scrollbarCheckboxLabel: document.querySelector('.rs-switch-label'),
        sections:               document.querySelectorAll('.rs-section'),
        shareButton:            document.querySelector('.rs-shareButton'),
        shareButtonText:        document.querySelector('.rs-shareButton span span'),
        shareTextarea:          document.querySelector('.rs-shareTextarea'),
        showModalButton:        document.querySelector('.rs-showModalButton'),
        // showUrlButton:          document.querySelector('.rs-showUrlButton'),
        urlInput:               document.querySelector('.rs-urlInput'),
        viewSelect:             document.querySelector('.rs-select select')
    };

    var globalState = {
        url:             getParameterByName('url') || '',
        view:            getParameterByName('view') || 'group',
        showScrollbars:  getParameterByName('scrollbars') || false,
        backgroundColor: getParameterByName('background') || ''
    };

    if (globalState.url) {
        globalState.url = injectHttpProtocol(globalState.url);
    } else {
        elems.urlInput.focus();
    }

    setInitialInputValues();
    showAppropriateSection();
    showMenu();

    function setInitialInputValues() {
        elems.urlInput.value                 = globalState.url;
        elems.viewSelect.value               = globalState.view;
        elems.scrollbarCheckbox.checked      = globalState.showScrollbars;
        elems.backgroundColorInput.value     = globalState.backgroundColor;
        elems.appBackground.style.background = globalState.backgroundColor;
    }

    function showAppropriateSection() {
        for (var i = 0; i < elems.sections.length; i++) {
            elems.sections[i].setAttribute('data-active', 'false');
            elems.sections[i].style.display = 'none';
        }
        document.querySelector('#' + globalState.view).style.display = '';
        document.querySelector('#' + globalState.view).setAttribute('data-active', 'true');
        scaleSectionToViewportWidth();
        injectUrlIntoIframes();
    }

    function scaleSectionToViewportWidth() {
        var viewportWidth = window.innerWidth;
        var viewportHeight = window.innerHeight;

        var viewportWidthScale = viewportWidth / 1440;
        var viewportHeightScale = viewportHeight / 900;

        var scale;

        if (viewportWidthScale > viewportHeightScale) {
            scale = viewportHeightScale;
        } else {
            scale = viewportWidthScale;
        }

        if (globalState.view === 'iphone' || globalState.view === 'ipad') {
            if (viewportWidthScale < viewportHeightScale) {
                scale = viewportHeightScale;
            }
        }
        var visibleSection = document.querySelector('.rs-section[data-active=true]');
        if (visibleSection) {
            visibleSection.style.transform = 'scale(' + scale + ',' + scale + ')';

            var scaledVisibleSectionHeight = visibleSection.getBoundingClientRect().height;
            var targetTop = (viewportHeight - scaledVisibleSectionHeight) / 2;
            visibleSection.style.marginTop = targetTop + 'px';
            
            var scaledVisibleSectionWidth = visibleSection.getBoundingClientRect().width;
            var targetLeft = (viewportWidth - scaledVisibleSectionWidth) / 2;
            visibleSection.style.marginLeft = targetLeft + 'px';
        }
    }

    function injectUrlIntoIframes() {
        if (globalState.url) {
            globalState.url = injectHttpProtocol(globalState.url);
            // only inject into appropriate section so unneeded iframes aren't loaded
            var visibleSection = document.querySelector('.rs-section[data-active=true]');
            var iframes = visibleSection.querySelectorAll('iframe');
            var scrolling = 'yes';
            if (!globalState.showScrollbars) {
                scrolling = 'no';
            }
            for (var i = 0; i < iframes.length; i++) {
                var newIframe = document.createElement('iframe');
                newIframe.src = globalState.url;
                newIframe.scrolling = scrolling;
                newIframe.onload = function(e) {
                    this.setAttribute('data-loaded', 'true');
                };
                iframes[i].parentNode.replaceChild(newIframe, iframes[i]);
            }
        }
    }

    function showMenu() {
        elems.app.classList.add('rs--withMenu');
    }

    function hideMenu() {
        elems.app.classList.remove('rs--withMenu');
    }

    /* event listeners ------------------------- */

    window.addEventListener('resize', function() {
        scaleSectionToViewportWidth();
    });

    elems.hideModalButton.addEventListener('click', function(e) {
        hideMenu();
    });

    elems.showModalButton.addEventListener('click', function(e) {
        showMenu();
    });

    elems.urlInput.addEventListener('keyup', function(e) {
        var currentlyEnteredUrl = e.target.value;

        // . is a loose check for a valid URL
        if (currentlyEnteredUrl.indexOf('.') !== -1) {

            // don't even bother if the URL didn't change
            if (globalState.url !== injectHttpProtocol(currentlyEnteredUrl)) {

                // elems.showUrlButton.disabled = false;

                var shouldInjectUrlIntoIframes = false;

                var isEnterKey = e.keyCode === 13;
                if (isEnterKey) {
                    shouldInjectUrlIntoIframes = true;
                }

                globalState.url = injectHttpProtocol(currentlyEnteredUrl);

                var tld = globalState.url.split('.')[globalState.url.split('.').length - 1];

                var commonTlds = ['com', 'org', 'net', 'int', 'edu', 'gov', 'mil', 'io', 'co', 'uk', 'es'];

                for (var i = 0; i < commonTlds.length; i++) {
                    if (tld.indexOf(commonTlds[i]) === 0) {
                        shouldInjectUrlIntoIframes = true;
                        break;
                    }
                }

                if (shouldInjectUrlIntoIframes) {
                    injectUrlIntoIframes();
                }
            }

        } else {
            // be sure to clear out the prior share value
            elems.shareTextarea.value = '';
            // elems.showUrlButton.disabled = true;
        }
    });

    elems.urlInput.addEventListener('blur', function(e) {
        var currentlyEnteredUrl = e.target.value;
        if (currentlyEnteredUrl.indexOf('.') !== -1) {
            if (globalState.url !== injectHttpProtocol(currentlyEnteredUrl)) {
                globalState.url = injectHttpProtocol(currentlyEnteredUrl);
                injectUrlIntoIframes();
            }
        }
    });

    elems.backgroundColorInput.addEventListener('keyup', function(e) {
        var color = e.target.value;
        globalState.backgroundColor = color;
        elems.appBackground.style.backgroundColor = color;
    });

    // elems.showUrlButton.addEventListener('click', function(e) {
    //     injectUrlIntoIframes();
    // });
    
    elems.shareButton.addEventListener('click', function(e) {

        var targetUrl = window.location.href.split('?')[0];

        if (globalState.url) {
            targetUrl += '?view=' + globalState.view;
            targetUrl += '&url=' + globalState.url;
            targetUrl += '&scrollbars=' + globalState.showScrollbars;
            targetUrl += '&background=' + globalState.backgroundColor;
        }

        elems.shareTextarea.value = targetUrl;
                  
        elems.shareTextarea.select();
        try {
            var successful = document.execCommand('copy');
            elems.shareButtonText.innerHTML = 'Link Copied!';
            setTimeout(function() {
                elems.shareButtonText.innerHTML = 'Share';
            }, 2000);
        } catch (err) {
            elems.shareButtonText.innerHTML = 'Unable to copy :(';
        }
        elems.shareTextarea.blur();   
    });

    elems.viewSelect.addEventListener('change', function() {
        globalState.view = this.value;
        showAppropriateSection();
    });

    elems.scrollbarCheckbox.addEventListener('change', function() {
        globalState.showScrollbars = this.checked;
        injectUrlIntoIframes();
    });

    elems.scrollbarCheckboxLabel.addEventListener('click', function() {
        elems.scrollbarCheckbox.click();
    });

    // don't allow them to type in the copyable area
    elems.shareTextarea.addEventListener('keydown', function(e) {
        if (!e.ctrlKey && !(e.key === 'Meta')) {
            e.preventDefault();
        }
    });   

    /* Utility methods ------------------------- */

    function injectHttpProtocol(url) {
        var noHttpProtocolInUrl = url.indexOf('http') === -1 && url.indexOf('https') === -1;
        if (noHttpProtocolInUrl) {
            url = 'http://' + url;
        }
        return url; 
    }
    
    function getParameterByName(name, url) {
        if (!url) {
            url = window.location.href;
        }
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

})();