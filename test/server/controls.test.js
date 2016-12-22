/* eslint-env jest */

import {registerTestServerHooks, getBeacons, getAjaxRequests} from './controls';
import {expect} from 'chai';

describe('testServer', () => {
  registerTestServerHooks();

  describe('beacons', () => {
    it('must have no beacons initially', () => {
      return getBeacons().then(beacons => expect(beacons).to.deep.equal([]));
    });
  });

  describe('xhr', () => {
    it('must have no XHR requests initially', () => {
      return getAjaxRequests().then(requests => expect(requests).to.deep.equal([]));
    });
  });
});
