import Harness from '../test/harness';
import Wizard from './Wizard';
import assert from 'power-assert';
import wizard from '../test/forms/wizardValidationOnPageChanged';
import wizard1 from '../test/forms/wizardValidationAfterPageChanged';

describe('Wizard tests', () => {
  let wizardForm = null;
  it('Should set components errors if they are after page was changed with navigation', (done) => {
      const formElement = document.createElement('div');
      wizardForm = new Wizard(formElement);
      wizardForm.setForm(wizard).then(() => {
        Harness.testErrors(wizardForm, {
          data: {
            a: '1',
            c: '',
            textField: ''
          }
        },
        [{
          component: 'a',
          message: 'a must have at least 4 characters.'
        }], done);
        Harness.clickElement(wizardForm, wizardForm.refs[`${wizardForm.wizardKey}-link`][2]);
        assert.equal(wizardForm.page, 2);
        Harness.clickElement(wizardForm, wizardForm.refs[`${wizardForm.wizardKey}-link`][0]);
        assert.equal(wizardForm.page, 0);
        const aInput = wizardForm.currentPage.getComponent('a');
        assert.equal(aInput.errors.length, 1);
        assert.equal(aInput.errors[0].message, 'a must have at least 4 characters.');
        done();
    })
    .catch((err) => done(err));
  });

  it('Should not set components errors if in readOnly mode', (done) => {
    const formElement = document.createElement('div');
    wizardForm = new Wizard(formElement, { readOnly: true });
    wizardForm.setForm(wizard).then(() => {
      Harness.testSubmission(wizardForm, {
        data: {
          a: '1',
          textField: 'aaa',
          c: '0'
        }
      });

      Harness.clickElement(wizardForm, wizardForm.refs[`${wizardForm.wizardKey}-link`][2]);
      assert.equal(wizardForm.page, 2);
      Harness.clickElement(wizardForm, wizardForm.refs[`${wizardForm.wizardKey}-link`][0]);
      assert.equal(wizardForm.page, 0);
      const aInput = wizardForm.currentPage.getComponent('a');
      assert.equal(aInput.errors.length, 0);
      done();
    });
  });

  it('Should leave components errors if they are after page was changed with navigation and valid value was added in one of the fields', function(done) {
    const formElement = document.createElement('div');
    wizardForm = new Wizard(formElement);
    wizardForm.setForm(wizard1).then(() => {
      Harness.clickElement(wizardForm, wizardForm.refs[`${wizardForm.wizardKey}-link`][1]);
      assert.equal(wizardForm.page, 1);

      Harness.clickElement(wizardForm, wizardForm.refs[`${wizardForm.wizardKey}-link`][0]);
      assert.equal(wizardForm.page, 0);
      assert.equal(wizardForm.errors.length, 2);

      const inputEvent = new Event('input', { bubbles: true, cancelable: true });
      const inputA = formElement.querySelector('input[name="data[a]"]');

      for (let i = 0; i < 5; i++) {
        inputA.value += i;
        inputA.dispatchEvent(inputEvent);
      }

      this.timeout(1000);

      setTimeout(() => {
        assert.equal(wizardForm.errors.length, 1);
        done();
      }, 500);
  })
  .catch((err) => done(err));
});
});
