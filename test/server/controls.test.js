/* eslint-env jest */

import {registerTestServerHooks, getBeacons} from './controls';
import {expect} from 'chai';

describe('testServer', () => {
  registerTestServerHooks();

  it('must have no beacons initially', () => {
    return getBeacons().then(beacons => expect(beacons).to.deep.equal([]));
  });
});
