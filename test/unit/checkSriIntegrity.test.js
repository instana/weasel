import sinon from 'sinon';
import {expect} from 'chai';
import {Beacon} from '@lib/types';
import defaultVars from '@lib/vars';
import {checkforSriIntegrity} from '@lib/commonBeaconProperties';
import {addCommonBeaconProperties} from '@lib/commonBeaconProperties';

describe('Check for Adoption of SRI Integrity', () => {
  let selectStub;

  describe('First Case: SRI Integrity integrated and AutoPageDetection Enabled', () => {
    beforeEach(function () {
      selectStub = sinon.stub(document, 'querySelectorAll');
      //selectStub.returns([{getAttribute: () => 'eum.min.js'}]);
      selectStub.returns([
        {
          src: 'eum.min.js',
          integrity: 'sha384-sha384-SFhpejI7IoveO08v0lEeAwCFG548mevARyiaxEGF4CF7he+9JR3QV1PrPjBj9gNE',
          getAttribute: function (attr) {
            return this[attr];
          }
        }
      ]);
    });
    afterEach(function () {
      selectStub.restore();
    });
    it('check for SRI Integrity, and AutoPageDetection enabled and set the useFeature beacon', function () {
      defaultVars.autoPageDetection = true;
      checkforSriIntegrity();
      expect(selectStub.calledOnceWith('script')).to.be.true;
      const beacon = {};
      addCommonBeaconProperties(beacon);
      expect(beacon.uf).to.equal('sn,sri');
    });
  });

  describe('Second Case: SRI Integrity integrated and AutoPageDetection Disabled', () => {
    beforeEach(function () {
      selectStub = sinon.stub(document, 'querySelectorAll');
      selectStub.returns([
        {
          src: 'eum.min.js',
          integrity: 'sha384-RTiyejI7IoveO08v0lEeAwCFG548mevARyiaxEGF4CF7he+9JR3QV1PrPjBj9gNE',
          getAttribute: function (attr) {
            return this[attr];
          }
        }
      ]);
    });
    afterEach(function () {
      selectStub.restore();
    });
    it('check for SRI Integrity,set the useFeature beacon', function () {
      defaultVars.autoPageDetection = false;
      checkforSriIntegrity();
      expect(selectStub.calledOnceWith('script')).to.be.true;
      const beacon = {};
      addCommonBeaconProperties(beacon);
      expect(beacon.uf).to.equal('sri');
    });
  });

  describe('Third Case: SRI Integrity not integrated and AutoPageDetection Enabled', () => {
    beforeEach(function () {
      selectStub = sinon.stub(document, 'querySelectorAll');
      selectStub.returns([{getAttribute: () => 'eum.min.js'}]);
      selectStub.returns([
        {
          src: 'eum.min.js',
          getAttribute: function (attr) {
            return this[attr];
          }
        }
      ]);
    });
    afterEach(function () {
      selectStub.restore();
    });
    it('should check for autoPageDetection and set the useFeature beacon', function () {
      defaultVars.autoPageDetection = true;
      checkforSriIntegrity();
      expect(selectStub.calledOnceWith('script')).to.be.true;
      const beacon = {};
      addCommonBeaconProperties(beacon);
      expect(beacon.uf).to.equal('sn');
    });
  });

  describe('Fourth Case: SRI Integrity not integrated and AutoPageDetection Disabled', () => {
    beforeEach(function () {
      selectStub = sinon.stub(document, 'querySelectorAll');
      selectStub.returns([{getAttribute: () => 'eum.min.js'}]);
      selectStub.returns([
        {
          src: 'eum.min.js',
          getAttribute: function (attr) {
            return this[attr];
          }
        }
      ]);
    });
    afterEach(function () {
      selectStub.restore();
    });
    it('No useFeature Beacon is generated', function () {
      defaultVars.autoPageDetection = false;
      checkforSriIntegrity();
      expect(selectStub.calledOnceWith('script')).to.be.true;
      const beacon = {};
      addCommonBeaconProperties(beacon);
      expect(beacon.uf).not.exist;
    });
  });
});
