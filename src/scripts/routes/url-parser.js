const UrlParser = {
  parseActiveUrlWithCombiner() {
    const url = window.location.hash.slice(1).toLowerCase();
    const splittedUrl = this._urlSplitter(url);
    return this._urlCombiner(splittedUrl);
  },

  parseActiveUrlWithoutCombiner() {
    const url = window.location.hash.slice(1).toLowerCase();
    return this._urlSplitter(url);
  },

  _urlSplitter(url) {
    const urlsSplits = url.split('/');
    return {
      resource: urlsSplits[1] || null,
      id: urlsSplits[2] || null,
      verb: urlsSplits[3] || null,
    };
  },

  _urlCombiner(splittedUrl) {
    const { resource, id, verb } = splittedUrl;
    let combinedUrl = `/${resource || ''}`;

    if (id) {
      combinedUrl += '/:id';
    }

    if (verb) {
      combinedUrl += `/${verb}`;
    }
    
    if (combinedUrl === '/') {
        return '/';
    }
    
    return combinedUrl.replace(/\/$/, '');
  },
};

export const getActiveRoute = () => UrlParser.parseActiveUrlWithCombiner();
export const parseActivePathname = () => UrlParser.parseActiveUrlWithoutCombiner();