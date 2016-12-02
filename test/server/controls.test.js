/* eslint-env jest */

import {registerTestHooks, getBeacons} from './controls';
import {expect} from 'chai';

describe('testServer', () => {
  registerTestHooks();

  it('must have no beacons initially', () => {
    return getBeacons().then(beacons => expect(beacons).to.deep.equal([]));
  });
});
